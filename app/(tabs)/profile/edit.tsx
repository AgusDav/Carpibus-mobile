import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Alert,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '@/lib/context/AuthContext';
import { usersService, UpdateProfileRequest } from '@/lib/api/users';

export default function EditProfileScreen() {
  const { user, updateUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    nombre: user?.nombre || '',
    apellido: user?.apellido || '',
    email: user?.email || '',
    telefono: user?.telefono || '',
    ci: user?.ci || '',
    fechaNac: user?.fechaNac || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateField = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [errors]);

  const validateForm = () => {
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

    if (formData.ci && !/^\d{7,8}$/.test(formData.ci)) {
      newErrors.ci = 'La cédula debe tener 7 u 8 dígitos';
    }

    if (formData.telefono && !/^\d{8,9}$/.test(formData.telefono)) {
      newErrors.telefono = 'El teléfono debe tener 8 o 9 dígitos';
    }

    if (formData.fechaNac && !/^\d{4}-\d{2}-\d{2}$/.test(formData.fechaNac)) {
      newErrors.fechaNac = 'Formato de fecha inválido (YYYY-MM-DD)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setIsLoading(true);

      const updateData: UpdateProfileRequest = {
        nombre: formData.nombre.trim(),
        apellido: formData.apellido.trim(),
        email: formData.email.trim().toLowerCase(),
        telefono: formData.telefono.trim() || undefined,
        ci: formData.ci.trim() || undefined,
        fechaNac: formData.fechaNac.trim() || undefined,
      };

      const updatedUser = await usersService.updateProfile(updateData);

      // Actualizar el usuario en el contexto
      updateUser(updatedUser);

      Alert.alert(
        'Éxito',
        'Perfil actualizado correctamente',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.message || 'No se pudo actualizar el perfil'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <Text style={styles.title}>Editar Perfil</Text>
            <Text style={styles.subtitle}>Actualiza tu información personal</Text>

            {/* Nombre */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Nombre *</Text>
              <TextInput
                style={[styles.input, errors.nombre && styles.inputError]}
                value={formData.nombre}
                onChangeText={(value) => updateField('nombre', value)}
                placeholder="Tu nombre"
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
                placeholder="Tu apellido"
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
                placeholder="tu@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            {/* Cédula */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Cédula de Identidad</Text>
              <TextInput
                style={[styles.input, errors.ci && styles.inputError]}
                value={formData.ci}
                onChangeText={(value) => updateField('ci', value.replace(/\D/g, ''))}
                placeholder="12345678"
                keyboardType="numeric"
              />
              {errors.ci && <Text style={styles.errorText}>{errors.ci}</Text>}
            </View>

            {/* Teléfono */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Teléfono</Text>
              <TextInput
                style={[styles.input, errors.telefono && styles.inputError]}
                value={formData.telefono}
                onChangeText={(value) => updateField('telefono', value.replace(/\D/g, ''))}
                placeholder="099123456"
                keyboardType="phone-pad"
              />
              {errors.telefono && <Text style={styles.errorText}>{errors.telefono}</Text>}
            </View>

            {/* Fecha de nacimiento */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Fecha de Nacimiento</Text>
              <TextInput
                style={[styles.input, errors.fechaNac && styles.inputError]}
                value={formData.fechaNac}
                onChangeText={(value) => updateField('fechaNac', value)}
                placeholder="YYYY-MM-DD (ej: 1990-05-15)"
              />
              {errors.fechaNac && <Text style={styles.errorText}>{errors.fechaNac}</Text>}
            </View>

            <TouchableOpacity
              style={[styles.saveButton, isLoading && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              <Text style={styles.saveButtonText}>
                {isLoading ? 'Guardando...' : 'Guardar Cambios'}
              </Text>
            </TouchableOpacity>
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
  content: {
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 20,
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
  saveButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});