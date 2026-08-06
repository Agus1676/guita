import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/context/ThemeContext';
import { useUser } from '@/context/UserContext';
import { FontSize, BorderRadius, Spacing } from '@/constants/theme';

export default function AuthModal() {
  const { colors } = useTheme();
  const { login } = useUser();

  const [mode, setMode] = useState<'login' | 'register'>('register');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const finalName = name.trim() || 'Aguss';
    const finalEmail = email.trim() || 'aguss@guita.app';
    await login(finalName, finalEmail);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          
          {/* Logo & Welcome */}
          <View style={styles.header}>
            <LinearGradient
              colors={['#6C63FF', '#9F7AEA']}
              style={styles.logoBadge}
            >
              <Ionicons name="wallet" size={40} color="#FFF" />
            </LinearGradient>
            <Text style={[styles.title, { color: colors.textPrimary }]}>Guita</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {mode === 'register' 
                ? 'Creá tu cuenta para sincronizar tus finanzas' 
                : '¡Hola de nuevo! Ingresá a tu cuenta'}
            </Text>
          </View>

          {/* Mode Switcher */}
          <View style={[styles.tabContainer, { backgroundColor: colors.surface }]}>
            <TouchableOpacity 
              style={[styles.tabBtn, mode === 'register' && { backgroundColor: colors.primary }]}
              onPress={() => setMode('register')}
            >
              <Text style={[styles.tabText, { color: mode === 'register' ? '#FFF' : colors.textSecondary }]}>
                Crear Cuenta
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.tabBtn, mode === 'login' && { backgroundColor: colors.primary }]}
              onPress={() => setMode('login')}
            >
              <Text style={[styles.tabText, { color: mode === 'login' ? '#FFF' : colors.textSecondary }]}>
                Iniciar Sesión
              </Text>
            </TouchableOpacity>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {mode === 'register' && (
              <View style={styles.inputWrapper}>
                <Text style={[styles.label, { color: colors.textPrimary }]}>Nombre completo</Text>
                <View style={[styles.inputBox, { backgroundColor: colors.surface }]}>
                  <Ionicons name="person-outline" size={20} color={colors.textSecondary} />
                  <TextInput
                    style={[styles.input, { color: colors.textPrimary }]}
                    placeholder="Ej: Aguss"
                    placeholderTextColor={colors.textTertiary}
                    value={name}
                    onChangeText={setName}
                  />
                </View>
              </View>
            )}

            <View style={styles.inputWrapper}>
              <Text style={[styles.label, { color: colors.textPrimary }]}>Correo electrónico</Text>
              <View style={[styles.inputBox, { backgroundColor: colors.surface }]}>
                <Ionicons name="mail-outline" size={20} color={colors.textSecondary} />
                <TextInput
                  style={[styles.input, { color: colors.textPrimary }]}
                  placeholder="usuario@gmail.com"
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
            </View>

            <View style={styles.inputWrapper}>
              <Text style={[styles.label, { color: colors.textPrimary }]}>Contraseña</Text>
              <View style={[styles.inputBox, { backgroundColor: colors.surface }]}>
                <Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} />
                <TextInput
                  style={[styles.input, { color: colors.textPrimary }]}
                  placeholder="••••••••"
                  placeholderTextColor={colors.textTertiary}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons 
                    name={showPassword ? "eye-off-outline" : "eye-outline"} 
                    size={20} 
                    color={colors.textSecondary} 
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity onPress={handleSubmit} style={styles.submitBtnWrapper}>
              <LinearGradient
                colors={['#6C63FF', '#9F7AEA']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={styles.submitBtn}
              >
                <Text style={styles.submitBtnText}>
                  {mode === 'register' ? 'Crear Cuenta Gratis' : 'Iniciar Sesión'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Social Logins */}
            <View style={styles.dividerRow}>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <Text style={[styles.dividerText, { color: colors.textTertiary }]}>O CONTINUÁ CON</Text>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
            </View>

            <View style={styles.socialRow}>
              <TouchableOpacity onPress={handleSubmit} style={[styles.socialBtn, { backgroundColor: colors.surface }]}>
                <Ionicons name="logo-apple" size={22} color={colors.textPrimary} />
                <Text style={[styles.socialBtnText, { color: colors.textPrimary }]}>Apple</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleSubmit} style={[styles.socialBtn, { backgroundColor: colors.surface }]}>
                <Ionicons name="logo-google" size={22} color="#EA4335" />
                <Text style={[styles.socialBtnText, { color: colors.textPrimary }]}>Google</Text>
              </TouchableOpacity>
            </View>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 24, flexGrow: 1, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 28 },
  logoBadge: { width: 80, height: 80, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 32, fontWeight: '800' },
  subtitle: { fontSize: FontSize.md, textAlign: 'center', marginTop: 8 },

  tabContainer: { flexDirection: 'row', borderRadius: 100, padding: 4, marginBottom: 24 },
  tabBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 100 },
  tabText: { fontSize: FontSize.md, fontWeight: '600' },

  form: { width: '100%' },
  inputWrapper: { marginBottom: 16 },
  label: { fontSize: FontSize.sm, fontWeight: '600', marginBottom: 8 },
  inputBox: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, height: 52, borderRadius: BorderRadius.lg },
  input: { flex: 1, marginLeft: 12, fontSize: FontSize.md },

  submitBtnWrapper: { borderRadius: BorderRadius.lg, overflow: 'hidden', marginTop: 12 },
  submitBtn: { paddingVertical: 16, alignItems: 'center' },
  submitBtnText: { color: '#FFF', fontSize: FontSize.md, fontWeight: '700' },

  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 24 },
  divider: { flex: 1, height: 1 },
  dividerText: { marginHorizontal: 12, fontSize: 10, fontWeight: '700' },

  socialRow: { flexDirection: 'row', justifyContent: 'space-between' },
  socialBtn: { flex: 0.48, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 48, borderRadius: BorderRadius.lg },
  socialBtnText: { marginLeft: 8, fontSize: FontSize.md, fontWeight: '600' },
});
