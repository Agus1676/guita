import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';
import { DatabaseProvider } from '@/context/DatabaseContext';
import { AuthProvider, BiometricGate } from '@/context/AuthContext';
import { UserProvider } from '@/context/UserContext';
import { ToastProvider } from '@/context/ToastContext';
import SQLiteWrapper from '@/components/SQLiteWrapper';
import { View, ActivityIndicator } from 'react-native';
import { Suspense } from 'react';

function RootNavigation() {
  const { isDark } = useTheme();
  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <BiometricGate>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
        </Stack>
      </BiometricGate>
    </>
  );
}

function LoadingScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0A0A0F' }}>
      <ActivityIndicator size="large" color="#6C63FF" />
    </View>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <UserProvider>
        <ToastProvider>
          <AuthProvider>
            <Suspense fallback={<LoadingScreen />}>
              <SQLiteWrapper>
                <DatabaseProvider>
                  <RootNavigation />
                </DatabaseProvider>
              </SQLiteWrapper>
            </Suspense>
          </AuthProvider>
        </ToastProvider>
      </UserProvider>
    </ThemeProvider>
  );
}
