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
import { usersService, ChangePasswordRequest } from '@/lib/api/users';

export default function ChangePasswordScreen() {
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
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

    if (!formData.currentPassword) {
      newErrors.currentPassword = 'La contraseña actual es requerida';
    }

    if (!formData.newPassword) {
      newErrors.newPassword = 'La nueva contraseña es requerida';
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'La nueva contraseña debe tener al menos 8 caracteres';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirma la nueva contraseña';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    if (formData.currentPassword === formData.newPassword) {
      newErrors.newPassword = 'La nueva contraseña debe ser diferente a la actual';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setIsLoading(true);

      const passwordData: ChangePasswordRequest = {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      };

      await usersService.changePassword(passwordData);

      Alert.alert(
        'Éxito',
        'Contraseña cambiada correctamente',
        [{ text: 'OK', onPress: () => router.back() }]
      );

      // Limpiar formulario
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

    } catch (error: any) {
      Alert.alert(
        'Error',
        error.message || 'No se pudo cambiar la contraseña'
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
            <Text style={styles.title}>Cambiar Contraseña</Text>
            <Text style={styles.subtitle}>
              Ingresa tu contraseña actual y la nueva contraseña
            </Text>

            {/* Contraseña actual */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Contraseña Actual *</Text>
              <TextInput
                style={[styles.input, errors.currentPassword && styles.inputError]}
                value={formData.currentPassword}
                onChangeText={(value) => updateField('currentPassword', value)}
                placeholder="Tu contraseña actual"
                secureTextEntry
                autoComplete="password"
              />
              {errors.currentPassword && (
                <Text style={styles.errorText}>{errors.currentPassword}</Text>
              )}
            </View>

            {/* Nueva contraseña */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Nueva Contraseña *</Text>
              <TextInput
                style={[styles.input, errors.newPassword && styles.inputError]}
                value={formData.newPassword}
                onChangeText={(value) => updateField('newPassword', value)}
                placeholder="Mínimo 8 caracteres"
                secureTextEntry
                autoComplete="new-password"
              />
              {errors.newPassword && (
                <Text style={styles.errorText}>{errors.newPassword}</Text>
              )}
            </View>

            {/* Confirmar nueva contraseña */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Confirmar Nueva Contraseña *</Text>
              <TextInput
                style={[styles.input, errors.confirmPassword && styles.inputError]}
                value={formData.confirmPassword}
                onChangeText={(value) => updateField('confirmPassword', value)}
                placeholder="Repite la nueva contraseña"
                secureTextEntry
                autoComplete="new-password"
              />
              {errors.confirmPassword && (
                <Text style={styles.errorText}>{errors.confirmPassword}</Text>
              )}
            </View>

            {/* Mensaje de ayuda */}
            <View style={styles.helpContainer}>
              <Text style={styles.helpText}>
                • La contraseña debe tener al menos 8 caracteres{'\n'}
                • Debe ser diferente a tu contraseña actual{'\n'}
                • Se recomienda usar letras, números y símbolos
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.changeButton, isLoading && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              <Text style={styles.changeButtonText}>
                {isLoading ? 'Cambiando...' : 'Cambiar Contraseña'}
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
    lineHeight: 24,
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
  helpContainer: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  helpText: {
    fontSize: 14,
    color: '#6c757d',
    lineHeight: 20,
  },
  changeButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  changeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});