import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Alert, Text, TextInput, TouchableOpacity } from 'react-native';
import { LoginRequest } from '@/lib/api/auth';

interface LoginFormProps {
  onSubmit: (credentials: LoginRequest) => Promise<void>;
  isLoading: boolean;
  onForgotPassword: () => void;
  onRegister: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSubmit,
  isLoading,
  onForgotPassword,
  onRegister,
}) => {
  const [formData, setFormData] = useState({
    email: '',
    contrasenia: '',
  });
  const [errors, setErrors] = useState<{ email?: string; contrasenia?: string }>({});

  // ✅ Handlers optimizados con useCallback
  const handleEmailChange = useCallback((value: string) => {
    console.log('Email change:', value); // Para debug
    setFormData(prev => ({ ...prev, email: value }));
    if (errors.email) {
      setErrors(prev => ({ ...prev, email: '' }));
    }
  }, [errors.email]);

  const handlePasswordChange = useCallback((value: string) => {
    console.log('Password change:', value); // Para debug
    setFormData(prev => ({ ...prev, contrasenia: value }));
    if (errors.contrasenia) {
      setErrors(prev => ({ ...prev, contrasenia: '' }));
    }
  }, [errors.contrasenia]);

  const validateForm = useCallback(() => {
    const newErrors: { email?: string; contrasenia?: string } = {};

    if (!formData.email) {
      newErrors.email = 'El email es requerido';
    }

    if (!formData.contrasenia) {
      newErrors.contrasenia = 'La contraseña es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData.email, formData.contrasenia]);

  const handleSubmit = useCallback(async () => {
    if (!validateForm()) return;

    try {
      await onSubmit({
        email: formData.email.trim().toLowerCase(),
        contrasenia: formData.contrasenia
      });
    } catch (error: any) {
      Alert.alert(
        'Error de autenticación',
        error.message || 'Credenciales incorrectas'
      );
    }
  }, [formData.email, formData.contrasenia, onSubmit, validateForm]);

  console.log('LoginForm render'); // Para debug

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Iniciar Sesión</Text>
      <Text style={styles.subtitle}>
        Ingresa tus credenciales para acceder a tu cuenta
      </Text>

      {/* Email Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email *</Text>
        <TextInput
          style={[styles.input, errors.email && styles.inputError]}
          placeholder="ejemplo@correo.com"
          value={formData.email}
          onChangeText={handleEmailChange}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />
        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
      </View>

      {/* Password Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Contraseña *</Text>
        <TextInput
          style={[styles.input, errors.contrasenia && styles.inputError]}
          placeholder="Ingresa tu contraseña"
          value={formData.contrasenia}
          onChangeText={handlePasswordChange}
          secureTextEntry
          autoComplete="password"
        />
        {errors.contrasenia && <Text style={styles.errorText}>{errors.contrasenia}</Text>}
      </View>

      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? 'Cargando...' : 'Iniciar Sesión'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={onForgotPassword} style={styles.linkButton}>
        <Text style={styles.linkText}>¿Olvidaste tu contraseña?</Text>
      </TouchableOpacity>

      <View style={styles.registerContainer}>
        <Text style={styles.registerText}>¿No tienes cuenta? </Text>
        <TouchableOpacity onPress={onRegister}>
          <Text style={styles.linkText}>Regístrate</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#000',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
    color: '#666',
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#000',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e1e5e9',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
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
  button: {
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  linkButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  linkText: {
    color: '#2563eb',
    fontSize: 16,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  registerText: {
    fontSize: 16,
    color: '#666',
  },
});