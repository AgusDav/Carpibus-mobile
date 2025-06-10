import React from 'react';
import { StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LoginForm } from '@/components/auth/LoginForm';
import { useAuth } from '@/lib/context/AuthContext';
import { ThemedView } from '@/components/ThemedView';

export default function LoginScreen() {
  const { login, isLoading } = useAuth();

  const handleLogin = async (credentials: any) => {
    await login(credentials);
    router.replace('/(tabs)');
  };

  const handleForgotPassword = () => {
    router.push('/(auth)/forgot-password');
  };

  const handleRegister = () => {
    router.push('/(auth)/register');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ThemedView style={styles.content}>
          <LoginForm
            onSubmit={handleLogin}
            isLoading={isLoading}
            onForgotPassword={handleForgotPassword}
            onRegister={handleRegister}
          />
        </ThemedView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
});