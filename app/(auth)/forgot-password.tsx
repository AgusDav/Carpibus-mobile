// Archivo: app/(auth)/forgot-password.tsx

import React, { useState, useCallback } from 'react';
import {
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  View,
  Text,
  TextInput,
  TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { authService } from '@/lib/api/auth';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [error, setError] = useState('');

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async () => {
    // Limpiar errores previos
    setError('');

    // Validar email
    if (!email.trim()) {
      setError('Por favor ingresa tu email');
      return;
    }

    if (!validateEmail(email.trim())) {
      setError('Por favor ingresa un email válido');
      return;
    }

    try {
      setIsLoading(true);

      // Llamar al endpoint de forgot-password
      const response = await authService.forgotPassword(email.trim().toLowerCase());

      // Mostrar mensaje de éxito
      setIsEmailSent(true);
      console.log('Forgot password response:', response.message);

    } catch (error: any) {
      console.error('Forgot password error:', error);
      setError(error.message || 'Error al enviar el email de recuperación');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    router.back(); // Vuelve al login
  };

  const handleTryAgain = () => {
    setIsEmailSent(false);
    setEmail('');
    setError('');
  };

  if (isEmailSent) {
    // Pantalla de confirmación después de enviar el email
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Text style={styles.checkIcon}>✉️</Text>
          </View>

          <Text style={styles.title}>Email Enviado</Text>

          <Text style={styles.subtitle}>
            Si tu correo está registrado, recibirás un enlace para restablecer tu contraseña en breve.
          </Text>

          <Text style={styles.instructions}>
            • Revisa tu bandeja de entrada{'\n'}
            • Verifica la carpeta de spam{'\n'}
            • El enlace expira en 1 hora{'\n'}
            • Si no lo recibes, intenta de nuevo
          </Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleBackToLogin}
            >
              <Text style={styles.primaryButtonText}>Volver al Login</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleTryAgain}
            >
              <Text style={styles.secondaryButtonText}>Intentar con otro email</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Pantalla principal para ingresar el email
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <Text style={styles.lockIcon}>🔒</Text>
            </View>

            <Text style={styles.title}>¿Olvidaste tu contraseña?</Text>

            <Text style={styles.subtitle}>
              No te preocupes. Ingresa tu email y te enviaremos un enlace para restablecerla.
            </Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={[styles.input, error && styles.inputError]}
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (error) setError(''); // Limpiar error al escribir
                }}
                placeholder="tu@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect={false}
                editable={!isLoading}
              />
              {error && <Text style={styles.errorText}>{error}</Text>}
            </View>

            <TouchableOpacity
              style={[styles.submitButton, isLoading && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              <Text style={styles.submitButtonText}>
                {isLoading ? 'Enviando...' : 'Enviar enlace de recuperación'}
              </Text>
            </TouchableOpacity>

            <View style={styles.backContainer}>
              <Text style={styles.backText}>¿Recordaste tu contraseña? </Text>
              <TouchableOpacity onPress={handleBackToLogin}>
                <Text style={styles.backLink}>Volver al login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    padding: 24,
    justifyContent: 'center',
    minHeight: '80%',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  lockIcon: {
    fontSize: 64,
  },
  checkIcon: {
    fontSize: 64,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  instructions: {
    fontSize: 14,
    color: '#666',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginBottom: 32,
    lineHeight: 20,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e1e5e9',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#f9fafb',
    color: '#000',
  },
  inputError: {
    borderColor: '#dc3545',
  },
  errorText: {
    fontSize: 14,
    color: '#dc3545',
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  buttonContainer: {
    gap: 16,
  },
  primaryButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2563eb',
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#2563eb',
    fontSize: 16,
    fontWeight: '600',
  },
  backContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backText: {
    fontSize: 16,
    color: '#666',
  },
  backLink: {
    fontSize: 16,
    color: '#2563eb',
    fontWeight: '600',
  },
});