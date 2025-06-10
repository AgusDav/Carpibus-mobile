import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { LoginRequest } from '@/lib/api/auth';
import { validation } from '@/lib/utils/validation';

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
  const [email, setEmail] = useState('');
  const [contrasenia, setContrasenia] = useState(''); // ⚠️ Cambio: usar "contrasenia"
  const [errors, setErrors] = useState<{ email?: string; contrasenia?: string }>({});

  const validateForm = () => {
    const newErrors: { email?: string; contrasenia?: string } = {};

    if (!validation.required(email)) {
      newErrors.email = 'El email es requerido';
    } else if (!validation.email(email)) {
      newErrors.email = 'El email no es válido';
    }

    if (!validation.required(contrasenia)) {
      newErrors.contrasenia = 'La contraseña es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      await onSubmit({
        email: email.trim().toLowerCase(),
        contrasenia // ⚠️ Usar "contrasenia" como espera el backend
      });
    } catch (error: any) {
      Alert.alert(
        'Error de autenticación',
        error.message || 'Credenciales incorrectas'
      );
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>Iniciar Sesión</ThemedText>
      <ThemedText style={styles.subtitle}>
        Ingresa tus credenciales para acceder a tu cuenta
      </ThemedText>

      <Input
        label="Email"
        placeholder="ejemplo@correo.com"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        leftIcon="mail-outline"
        error={errors.email}
        required
      />

      <Input
        label="Contraseña"
        placeholder="Ingresa tu contraseña"
        value={contrasenia}
        onChangeText={setContrasenia} // ⚠️ Cambio: usar contrasenia
        secureTextEntry
        autoComplete="password"
        leftIcon="lock-closed-outline"
        error={errors.contrasenia} // ⚠️ Cambio: usar contrasenia
        required
      />

      <Button
        title="Iniciar Sesión"
        onPress={handleSubmit}
        loading={isLoading}
        style={styles.loginButton}
      />

      <Button
        title="¿Olvidaste tu contraseña?"
        onPress={onForgotPassword}
        variant="outline"
        style={styles.forgotButton}
      />

      <View style={styles.registerContainer}>
        <ThemedText style={styles.registerText}>¿No tienes cuenta? </ThemedText>
        <Button
          title="Regístrate"
          onPress={onRegister}
          variant="outline"
          size="small"
        />
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  loginButton: {
    marginTop: 8,
  },
  forgotButton: {
    marginTop: 16,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  registerText: {
    fontSize: 16,
  },
});