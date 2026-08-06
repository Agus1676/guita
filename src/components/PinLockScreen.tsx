import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { triggerLightHaptic, triggerSuccessHaptic, triggerWarningHaptic } from '@/utils/haptics';
import { FontSize, BorderRadius, Spacing } from '@/constants/theme';

export default function PinLockScreen() {
  const { colors } = useTheme();
  const { authenticateBiometrics, verifyPin, isBiometricSupported } = useAuth();
  
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const shakeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    // Attempt biometric auth on mount
    if (Platform.OS !== 'web') {
      authenticateBiometrics();
    }
  }, []);

  const handleKeyPress = (num: string) => {
    if (pin.length < 4) {
      triggerLightHaptic();
      const newPin = pin + num;
      setPin(newPin);
      setErrorMsg('');

      if (newPin.length === 4) {
        setTimeout(() => {
          const success = verifyPin(newPin);
          if (success) {
            triggerSuccessHaptic();
          } else {
            triggerWarningHaptic();
            triggerShake();
            setErrorMsg('PIN incorrecto. Intentalo de nuevo.');
            setPin('');
          }
        }, 150);
      }
    }
  };

  const handleDelete = () => {
    if (pin.length > 0) {
      triggerLightHaptic();
      setPin(pin.slice(0, -1));
      setErrorMsg('');
    }
  };

  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <LinearGradient
          colors={['#6C63FF', '#9F7AEA']}
          style={styles.logoBadge}
        >
          <Ionicons name="lock-closed" size={32} color="#FFF" />
        </LinearGradient>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Seguridad Guita</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Ingresá tu PIN de 4 dígitos o usa Face ID
        </Text>
      </View>

      {/* PIN Dots Indicator */}
      <Animated.View style={[styles.dotsRow, { transform: [{ translateX: shakeAnim }] }]}>
        {[0, 1, 2, 3].map((index) => {
          const isFilled = pin.length > index;
          return (
            <View
              key={index}
              style={[
                styles.dot,
                {
                  backgroundColor: isFilled ? colors.primary : 'transparent',
                  borderColor: isFilled ? colors.primary : colors.border,
                },
              ]}
            />
          );
        })}
      </Animated.View>

      {errorMsg ? (
        <Text style={styles.errorText}>{errorMsg}</Text>
      ) : (
        <Text style={[styles.hintText, { color: colors.textTertiary }]}>PIN por defecto: 1234</Text>
      )}

      {/* Custom Keypad */}
      <View style={styles.keypadContainer}>
        {[['1', '2', '3'], ['4', '5', '6'], ['7', '8', '9']].map((row, rIdx) => (
          <View key={rIdx} style={styles.keypadRow}>
            {row.map((num) => (
              <TouchableOpacity
                key={num}
                style={[styles.keyBtn, { backgroundColor: colors.surface }]}
                onPress={() => handleKeyPress(num)}
              >
                <Text style={[styles.keyText, { color: colors.textPrimary }]}>{num}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}

        <View style={styles.keypadRow}>
          {/* Biometrics Trigger Button */}
          <TouchableOpacity
            style={[styles.keyBtn, { backgroundColor: colors.surface }]}
            onPress={() => authenticateBiometrics()}
          >
            <Ionicons name="scan-outline" size={26} color={colors.primary} />
          </TouchableOpacity>

          {/* Zero Button */}
          <TouchableOpacity
            style={[styles.keyBtn, { backgroundColor: colors.surface }]}
            onPress={() => handleKeyPress('0')}
          >
            <Text style={[styles.keyText, { color: colors.textPrimary }]}>0</Text>
          </TouchableOpacity>

          {/* Delete Button */}
          <TouchableOpacity
            style={[styles.keyBtn, { backgroundColor: colors.surface }]}
            onPress={handleDelete}
          >
            <Ionicons name="backspace-outline" size={26} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'space-between', padding: 24 },
  header: { alignItems: 'center', marginTop: 40 },
  logoBadge: { width: 68, height: 68, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 24, fontWeight: '800' },
  subtitle: { fontSize: FontSize.sm, marginTop: 6, textAlign: 'center' },

  dotsRow: { flexDirection: 'row', justifyContent: 'center', marginVertical: 30 },
  dot: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, marginHorizontal: 12 },
  errorText: { color: '#FF6B6B', fontSize: 13, fontWeight: '600', textAlign: 'center', marginBottom: 20 },
  hintText: { fontSize: 12, textAlign: 'center', marginBottom: 20 },

  keypadContainer: { paddingBottom: 20 },
  keypadRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 16 },
  keyBtn: { width: 72, height: 72, borderRadius: 36, justifyContent: 'center', alignItems: 'center' },
  keyText: { fontSize: 28, fontWeight: '600' },
});
