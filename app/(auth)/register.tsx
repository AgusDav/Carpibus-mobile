import React from 'react';
import { StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { useAuth } from '@/lib/context/AuthContext';
import { ThemedView } from '@/components/ThemedView';

export default function RegisterScreen() {
  const { register, isLoading } = useAuth();

  const handleRegister = async (userData: any) => {
    await register(userData);
    router.replace('/(tabs)');
  };

  const handleLogin = () => {
    router.push('/(auth)/login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ThemedView style={styles.content}>
          <RegisterForm
            onSubmit={handleRegister}
            isLoading={isLoading}
            onLogin={handleLogin}
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
  },
});