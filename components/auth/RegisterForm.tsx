import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity
} from 'react-native';
import { RegisterRequest } from '@/lib/api/auth';

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
    contrasenia: '',
    confirmPassword: '',
    fechaNac: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // ✅ SOLUCIÓN: Handlers optimizados con useCallback
  const updateField = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [errors]);

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }

    if (!formData.apellido.trim()) {
      newErrors.apellido = 'El apellido es requerido';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }

    if (!formData.ci.trim()) {
      newErrors.ci = 'La cédula es requerida';
    } else if (!/^\d{7,8}$/.test(formData.ci)) {
      newErrors.ci = 'La cédula debe tener 7 u 8 dígitos';
    }

    if (!formData.fechaNac.trim()) {
      newErrors.fechaNac = 'La fecha de nacimiento es requerida';
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(formData.fechaNac)) {
      newErrors.fechaNac = 'Formato de fecha inválido (YYYY-MM-DD)';
    }

    if (!formData.contrasenia.trim()) {
      newErrors.contrasenia = 'La contraseña es requerida';
    } else if (formData.contrasenia.length < 8) {
      newErrors.contrasenia = 'La contraseña debe tener al menos 8 caracteres';
    }

    if (formData.contrasenia !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    if (formData.telefono && !/^\d{8,9}$/.test(formData.telefono)) {
      newErrors.telefono = 'El teléfono debe tener 8 o 9 dígitos';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(async () => {
    if (!validateForm()) return;

    try {
      const registerData: RegisterRequest = {
        nombre: formData.nombre.trim(),
        apellido: formData.apellido.trim(),
        email: formData.email.trim().toLowerCase(),
        telefono: formData.telefono ? parseInt(formData.telefono) : undefined,
        ci: parseInt(formData.ci),
        contrasenia: formData.contrasenia,
        fechaNac: formData.fechaNac,
      };

      await onSubmit(registerData);
    } catch (error: any) {
      Alert.alert(
        'Error de registro',
        error.message || 'No se pudo crear la cuenta'
      );
    }
  }, [formData, onSubmit, validateForm]);

  console.log('RegisterForm render'); // Para debug

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Crear Cuenta</Text>
      <Text style={styles.subtitle}>
        Completa tus datos para registrarte
      </Text>

      {/* Nombre */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Nombre *</Text>
        <TextInput
          style={[styles.input, errors.nombre && styles.inputError]}
          value={formData.nombre}
          onChangeText={(value) => updateField('nombre', value)}
          placeholder="Ingresa tu nombre"
          autoCapitalize="words"
        />
        {errors.nombre && <Text style={styles.errorText}>{errors.nombre}</Text>}
      </View>

      {/* Apellido */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Apellido *</Text>
        <TextInput
          style={[styles.input, errors.apellido && styles.inputError]}
          value={formData.apellido}
          onChangeText={(value) => updateField('apellido', value)}
          placeholder="Ingresa tu apellido"
          autoCapitalize="words"
        />
        {errors.apellido && <Text style={styles.errorText}>{errors.apellido}</Text>}
      </View>

      {/* Email */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email *</Text>
        <TextInput
          style={[styles.input, errors.email && styles.inputError]}
          value={formData.email}
          onChangeText={(value) => updateField('email', value)}
          placeholder="ejemplo@correo.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />
        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
      </View>

      {/* Cédula */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Cédula de Identidad *</Text>
        <TextInput
          style={[styles.input, errors.ci && styles.inputError]}
          value={formData.ci}
          onChangeText={(value) => updateField('ci', value.replace(/\D/g, ''))}
          placeholder="12345678 (sin puntos ni guiones)"
          keyboardType="numeric"
        />
        {errors.ci && <Text style={styles.errorText}>{errors.ci}</Text>}
      </View>

      {/* Fecha de nacimiento */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Fecha de Nacimiento *</Text>
        <TextInput
          style={[styles.input, errors.fechaNac && styles.inputError]}
          value={formData.fechaNac}
          onChangeText={(value) => updateField('fechaNac', value)}
          placeholder="YYYY-MM-DD (ej: 1990-05-15)"
        />
        {errors.fechaNac && <Text style={styles.errorText}>{errors.fechaNac}</Text>}
      </View>

      {/* Teléfono */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Teléfono</Text>
        <TextInput
          style={[styles.input, errors.telefono && styles.inputError]}
          value={formData.telefono}
          onChangeText={(value) => updateField('telefono', value.replace(/\D/g, ''))}
          placeholder="099123456 (opcional)"
          keyboardType="phone-pad"
        />
        {errors.telefono && <Text style={styles.errorText}>{errors.telefono}</Text>}
      </View>

      {/* Contraseña */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Contraseña *</Text>
        <TextInput
          style={[styles.input, errors.contrasenia && styles.inputError]}
          value={formData.contrasenia}
          onChangeText={(value) => updateField('contrasenia', value)}
          placeholder="Mínimo 8 caracteres"
          secureTextEntry
        />
        {errors.contrasenia && <Text style={styles.errorText}>{errors.contrasenia}</Text>}
      </View>

      {/* Confirmar contraseña */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Confirmar Contraseña *</Text>
        <TextInput
          style={[styles.input, errors.confirmPassword && styles.inputError]}
          value={formData.confirmPassword}
          onChangeText={(value) => updateField('confirmPassword', value)}
          placeholder="Repite tu contraseña"
          secureTextEntry
        />
        {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
      </View>

      <TouchableOpacity
        style={[styles.registerButton, isLoading && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={isLoading}
      >
        <Text style={styles.registerButtonText}>
          {isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
        </Text>
      </TouchableOpacity>

      <View style={styles.loginContainer}>
        <Text style={styles.loginText}>¿Ya tienes cuenta? </Text>
        <TouchableOpacity onPress={onLogin}>
          <Text style={styles.loginLink}>Inicia Sesión</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    fontWeight: '600',
    marginBottom: 8,
    color: '#000',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e1e5e9',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
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
  registerButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 24,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  loginText: {
    fontSize: 16,
    color: '#666',
  },
  loginLink: {
    fontSize: 16,
    color: '#2563eb',
    fontWeight: '600',
  },
});