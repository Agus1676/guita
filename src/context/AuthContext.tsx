import React, { createContext, useContext, useState, useEffect } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import PinLockScreen from '@/components/PinLockScreen';

const PIN_STORAGE_KEY = 'guita_user_pin_v1';

interface AuthContextType {
  isAuthenticated: boolean;
  isBiometricSupported: boolean;
  hasPinSet: boolean;
  savedPin: string | null;
  authenticateBiometrics: () => Promise<boolean>;
  verifyPin: (inputPin: string) => boolean;
  savePin: (newPin: string) => Promise<void>;
  clearPin: () => Promise<void>;
  setIsAuthenticated: (val: boolean) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(Platform.OS === 'web');
  const [isBiometricSupported, setIsBiometricSupported] = useState<boolean>(false);
  const [savedPin, setSavedPin] = useState<string | null>(null);

  useEffect(() => {
    async function checkSecurity() {
      if (Platform.OS === 'web') {
        setIsAuthenticated(true);
        return;
      }

      try {
        const compatible = await LocalAuthentication.hasHardwareAsync();
        const enrolled = await LocalAuthentication.isEnrolledAsync();
        setIsBiometricSupported(compatible && enrolled);

        const storedPin = await AsyncStorage.getItem(PIN_STORAGE_KEY);
        if (storedPin) {
          setSavedPin(storedPin);
        }
      } catch (e) {
        console.error('Error checking authentication hardware', e);
      }
    }
    checkSecurity();
  }, []);

  const authenticateBiometrics = async (): Promise<boolean> => {
    if (Platform.OS === 'web') {
      setIsAuthenticated(true);
      return true;
    }

    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Ingresá a Guita con Face ID / Touch ID',
        fallbackLabel: 'Usar PIN de Seguridad',
        cancelLabel: 'Cancelar',
        disableDeviceFallback: false,
      });

      if (result.success) {
        setIsAuthenticated(true);
        return true;
      }
    } catch (e) {
      console.error('Biometric auth error', e);
    }
    return false;
  };

  const verifyPin = (inputPin: string): boolean => {
    if (savedPin && inputPin === savedPin) {
      setIsAuthenticated(true);
      return true;
    }
    // Default PIN fallback if not set: "1234"
    if (!savedPin && inputPin === '1234') {
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const savePin = async (newPin: string) => {
    setSavedPin(newPin);
    await AsyncStorage.setItem(PIN_STORAGE_KEY, newPin);
  };

  const clearPin = async () => {
    setSavedPin(null);
    await AsyncStorage.removeItem(PIN_STORAGE_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isBiometricSupported,
        hasPinSet: !!savedPin,
        savedPin,
        authenticateBiometrics,
        verifyPin,
        savePin,
        clearPin,
        setIsAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export function BiometricGate({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <PinLockScreen />;
  }

  return <>{children}</>;
}
