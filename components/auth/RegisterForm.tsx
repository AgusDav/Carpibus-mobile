import React, { useState } from 'react';
import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ThemedText } from '@/components/ThemedText';
import { RegisterRequest } from '@/lib/api/auth';
import { validation } from '@/lib/utils/validation';

interface RegisterFormProps {
  onSubmit: (userData: RegisterRequest) => Promise<void>;
  isLoading: boolean;
  onLogin: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
  onSubmit,
  isLoading,
  onLogin,
}) => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    ci: '',
    contrasenia: '', // ⚠️ Cambio: usar "contrasenia"
    confirmPassword: '',
    fechaNac: '', // ⚠️ Cambio: usar "fechaNac" formato "YYYY-MM-DD"
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!validation.required(formData.nombre)) {
      newErrors.nombre = 'El nombre es requerido';
    }

    if (!validation.required(formData.apellido)) {
      newErrors.apellido = 'El apellido es requerido';
    }

    if (!validation.required(formData.email)) {
      newErrors.email = 'El email es requerido';
    } else if (!validation.email(formData.email)) {
      newErrors.email = 'El email no es válido';
    }

    if (!validation.required(formData.ci)) {
      newErrors.ci = 'La cédula es requerida';
    } else if (!/^\d{7,8}$/.test(formData.ci)) {
      newErrors.ci = 'La cédula debe tener 7 u 8 dígitos';
    }

    if (!validation.required(formData.fechaNac)) {
      newErrors.fechaNac = 'La fecha de nacimiento es requerida';
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(formData.fechaNac)) {
      newErrors.fechaNac = 'Formato de fecha inválido (YYYY-MM-DD)';
    }

    const passwordValidation = validation.password(formData.contrasenia);
    if (!passwordValidation.isValid) {
      newErrors.contrasenia = passwordValidation.message || 'Contraseña inválida';
    }

    if (formData.contrasenia !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    if (formData.telefono && !/^\d{8,9}$/.test(formData.telefono)) {
      newErrors.telefono = 'El teléfono debe tener 8 o 9 dígitos';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const registerData: RegisterRequest = {
        nombre: formData.nombre.trim(),
        apellido: formData.apellido.trim(),
        email: formData.email.trim().toLowerCase(),
        telefono: formData.telefono ? parseInt(formData.telefono) : undefined,
        ci: parseInt(formData.ci), // ⚠️ Backend espera number
        contrasenia: formData.contrasenia, // ⚠️ Usar "contrasenia"
        fechaNac: formData.fechaNac, // ⚠️ Formato "YYYY-MM-DD"
      };

      await onSubmit(registerData);
    } catch (error: any) {
      Alert.alert(
        'Error de registro',
        error.message || 'No se pudo crear la cuenta'
      );
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <ThemedText type="title" style={styles.title}>Crear Cuenta</ThemedText>
      <ThemedText style={styles.subtitle}>
        Completa tus datos para registrarte
      </ThemedText>

      <Input
        label="Nombre"
        placeholder="Ingresa tu nombre"
        value={formData.nombre}
        onChangeText={(value) => updateField('nombre', value)}
        autoCapitalize="words"
        leftIcon="person-outline"
        error={errors.nombre}
        required
      />

      <Input
        label="Apellido"
        placeholder="Ingresa tu apellido"
        value={formData.apellido}
        onChangeText={(value) => updateField('apellido', value)}
        autoCapitalize="words"
        leftIcon="person-outline"
        error={errors.apellido}
        required
      />

      <Input
        label="Email"
        placeholder="ejemplo@correo.com"
        value={formData.email}
        onChangeText={(value) => updateField('email', value)}
        keyboardType="email-address"
        autoCapitalize="none"
        leftIcon="mail-outline"
        error={errors.email}
        required
      />

      <Input
        label="Cédula de Identidad"
        placeholder="12345678 (sin puntos ni guiones)"
        value={formData.ci}
        onChangeText={(value) => updateField('ci', value.replace(/\D/g, ''))} // Solo números
        keyboardType="numeric"
        leftIcon="card-outline"
        error={errors.ci}
        required
      />

      <Input
        label="Fecha de Nacimiento"
        placeholder="YYYY-MM-DD (ej: 1990-05-15)"
        value={formData.fechaNac}
        onChangeText={(value) => updateField('fechaNac', value)}
        leftIcon="calendar-outline"
        error={errors.fechaNac}
        required
      />

      <Input
        label="Teléfono"
        placeholder="099123456 (opcional)"
        value={formData.telefono}
        onChangeText={(value) => updateField('telefono', value.replace(/\D/g, ''))} // Solo números
        keyboardType="phone-pad"
        leftIcon="call-outline"
        error={errors.telefono}
      />

      <Input
        label="Contraseña"
        placeholder="Mínimo 8 caracteres"
        value={formData.contrasenia}
        onChangeText={(value) => updateField('contrasenia', value)}
        secureTextEntry
        leftIcon="lock-closed-outline"
        error={errors.contrasenia}
        required
      />

      <Input
        label="Confirmar Contraseña"
        placeholder="Repite tu contraseña"
        value={formData.confirmPassword}
        onChangeText={(value) => updateField('confirmPassword', value)}
        secureTextEntry
        leftIcon="lock-closed-outline"
        error={errors.confirmPassword}
        required
      />

      <Button
        title="Crear Cuenta"
        onPress={handleSubmit}
        loading={isLoading}
        style={styles.registerButton}
      />

      <View style={styles.loginContainer}>
        <ThemedText style={styles.loginText}>¿Ya tienes cuenta? </ThemedText>
        <Button
          title="Inicia Sesión"
          onPress={onLogin}
          variant="outline"
          size="small"
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  registerButton: {
    marginTop: 8,
    marginBottom: 24,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  loginText: {
    fontSize: 16,
  },
});