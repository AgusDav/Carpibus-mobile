import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { authService } from '../../api/auth';
import { globalStyles } from '../../styles/globalStyles';
import { useTheme } from '../../hooks/useTheme';

export default function ForgotPasswordScreen({ navigation }) {
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async () => {
    if (!email.trim()) {
      setError('El email es requerido');
      return;
    }

    if (!validateEmail(email)) {
      setError('Ingresa un email válido');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      await authService.forgotPassword(email.trim().toLowerCase());

      Alert.alert(
        'Email Enviado',
        'Se ha enviado un enlace de recuperación a tu email.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Login'),
          },
        ]
      );
    } catch (error) {
      setError(error.message || 'Error al enviar el email de recuperación');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <View style={[globalStyles.centerContent, globalStyles.screenPadding]}>
        {/* Header con ícono */}
        <View style={[globalStyles.centerContent, localStyles.headerSection]}>
          <View style={localStyles.iconContainer}>
            <Icon name="mail" size={48} color={theme.colors.primary} />
          </View>
          <Text style={[globalStyles.textHeading1, { textAlign: 'center', marginBottom: 8 }]}>
            Recuperar Contraseña
          </Text>
          <Text style={[globalStyles.textCaption, { textAlign: 'center', marginBottom: 32, lineHeight: 20 }]}>
            Ingresa tu email y te enviaremos un enlace para recuperar tu contraseña
          </Text>
        </View>

        {/* Formulario */}
        <View style={localStyles.formContainer}>
          <View style={globalStyles.marginBottomLg}>
            <Text style={[globalStyles.textCaption, { fontWeight: '600', marginBottom: 8 }]}>
              Email
            </Text>
            <TextInput
              style={[
                globalStyles.input,
                error && globalStyles.inputError
              ]}
              value={email}
              onChangeText={(value) => {
                setEmail(value);
                if (error) setError('');
              }}
              placeholder="ejemplo@correo.com"
              placeholderTextColor={theme.colors.placeholder}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
            {error && <Text style={globalStyles.textError}>{error}</Text>}
          </View>

          <TouchableOpacity
            style={[
              globalStyles.buttonPrimary,
              isLoading && { opacity: 0.7 }
            ]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            <Text style={globalStyles.buttonText}>
              {isLoading ? 'Enviando...' : 'Enviar Enlace de Recuperación'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            style={localStyles.linkButton}
          >
            <Text style={[globalStyles.textBody, { color: theme.colors.primary, textAlign: 'center' }]}>
              Volver al inicio de sesión
            </Text>
          </TouchableOpacity>
        </View>

        {/* Información adicional */}
        <View style={localStyles.infoSection}>
          <View style={localStyles.infoCard}>
            <Icon name="information-circle" size={24} color={theme.colors.primary} />
            <View style={localStyles.infoContent}>
              <Text style={[globalStyles.textCaption, { fontWeight: '500', marginBottom: 4 }]}>
                ¿No recibes el email?
              </Text>
              <Text style={[globalStyles.textSmall, { lineHeight: 16 }]}>
                Revisa tu carpeta de spam o correo no deseado. El enlace expira en 24 horas.
              </Text>
            </View>
          </View>

          <View style={localStyles.infoCard}>
            <Icon name="shield-checkmark" size={24} color={theme.colors.success} />
            <View style={localStyles.infoContent}>
              <Text style={[globalStyles.textCaption, { fontWeight: '500', marginBottom: 4 }]}>
                Proceso seguro
              </Text>
              <Text style={[globalStyles.textSmall, { lineHeight: 16 }]}>
                Tu información está protegida y el enlace es de un solo uso.
              </Text>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

// Estilos locales específicos
const localStyles = {
  headerSection: {
    marginBottom: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  formContainer: {
    width: '100%',
    marginBottom: 32,
  },
  linkButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  infoSection: {
    width: '100%',
    marginBottom: 32,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#2563eb',
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  contactSection: {
    width: '100%',
  },
};