import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { Animated, View, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from './ThemeContext';
import { triggerLightHaptic, triggerSuccessHaptic, triggerWarningHaptic } from '@/utils/haptics';

export type ToastType = 'success' | 'info' | 'warning' | 'error';

interface ToastConfig {
  message: string;
  type?: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const { colors } = useTheme();
  const [toast, setToast] = useState<ToastConfig | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(-60)).current;

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    setToast({ message, type });

    if (type === 'success') triggerSuccessHaptic();
    else if (type === 'warning' || type === 'error') triggerWarningHaptic();
    else triggerLightHaptic();

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(translateYAnim, {
        toValue: Platform.OS === 'ios' ? 50 : 20,
        tension: 80,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(translateYAnim, {
          toValue: -60,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setToast(null);
      });
    }, 2600);
  }, [fadeAnim, translateYAnim]);

  const getIconAndColor = (type?: ToastType) => {
    switch (type) {
      case 'success':
        return { icon: 'checkmark-circle', color: '#00D09C' };
      case 'warning':
        return { icon: 'warning', color: '#F59E0B' };
      case 'error':
        return { icon: 'alert-circle', color: '#FF6B6B' };
      default:
        return { icon: 'information-circle', color: '#6C63FF' };
    }
  };

  const { icon, color } = getIconAndColor(toast?.type);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {toast && (
        <Animated.View
          style={[
            styles.toastContainer,
            {
              backgroundColor: colors.surfaceElevated,
              borderColor: colors.border,
              opacity: fadeAnim,
              transform: [{ translateY: translateYAnim }],
            },
          ]}
        >
          <Ionicons name={icon as any} size={22} color={color} style={{ marginRight: 10 }} />
          <Text style={[styles.toastText, { color: colors.textPrimary }]}>
            {toast.message}
          </Text>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 100,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
    zIndex: 9999,
  },
  toastText: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
});
