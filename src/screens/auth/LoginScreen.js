import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../../context/AuthContext';
import { globalStyles } from '../../styles/globalStyles';
import { useTheme } from '../../hooks/useTheme';

export default function LoginScreen({ navigation }) {
  const { login, isLoading } = useAuth();
  const theme = useTheme();
  const [formData, setFormData] = useState({
    email: '',
    contrasenia: '',
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const handleEmailChange = (value) => {
    setFormData(prev => ({ ...prev, email: value }));
    if (errors.email) {
      setErrors(prev => ({ ...prev, email: '' }));
    }
  };

  const handlePasswordChange = (value) => {
    setFormData(prev => ({ ...prev, contrasenia: value }));
    if (errors.contrasenia) {
      setErrors(prev => ({ ...prev, contrasenia: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'El email es requerido';
    }

    if (!formData.contrasenia) {
      newErrors.contrasenia = 'La contraseña es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      await login({
        email: formData.email.trim().toLowerCase(),
        contrasenia: formData.contrasenia
      });
    } catch (error) {
      Alert.alert(
        'Error de autenticación',
        'Credenciales incorrectas'
      );
    }
  };

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <KeyboardAvoidingView
        style={globalStyles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={[globalStyles.centerContent, globalStyles.screenPadding]}>
          {/* Logo/Header */}
          <View style={[globalStyles.centerContent, localStyles.logoSection]}>
            <Image
              source={require('../../assets/images/logo.png')}
              style={localStyles.logo}
              resizeMode="contain"
            />

            <Text style={[globalStyles.textHeading1, { color: theme.colors.primary, textAlign: 'center' }]}>
              Carpibus
            </Text>
          </View>

          <Text style={[globalStyles.textHeading2, { textAlign: 'center', marginBottom: 8 }]}>
            Iniciar Sesión
          </Text>
          <Text style={[globalStyles.textCaption, { textAlign: 'center', marginBottom: 32 }]}>
            Ingresa tus credenciales para acceder a tu cuenta
          </Text>

          {/* Email Input - Ancho completo */}
          <View style={[globalStyles.marginBottomMd, localStyles.fullWidthContainer]}>
            <Text style={[globalStyles.textCaption, { fontWeight: '600', marginBottom: 8 }]}>
              Email *
            </Text>
            <TextInput
              style={[
                globalStyles.input,
                localStyles.fullWidthInput,
                errors.email && globalStyles.inputError
              ]}
              placeholder="ejemplo@correo.com"
              placeholderTextColor={theme.colors.placeholder}
              value={formData.email}
              onChangeText={handleEmailChange}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
            {errors.email && <Text style={globalStyles.textError}>{errors.email}</Text>}
          </View>

          {/* Password Input con toggle - Ancho completo */}
          <View style={[globalStyles.marginBottomLg, localStyles.fullWidthContainer]}>
            <Text style={[globalStyles.textCaption, { fontWeight: '600', marginBottom: 8 }]}>
              Contraseña *
            </Text>
            <View style={[
              localStyles.passwordContainer,
              localStyles.fullWidthInput,
              errors.contrasenia && { borderColor: theme.colors.error }
            ]}>
              <TextInput
                style={localStyles.passwordInput}
                placeholder="Ingresa tu contraseña"
                placeholderTextColor={theme.colors.placeholder}
                value={formData.contrasenia}
                onChangeText={handlePasswordChange}
                secureTextEntry={!showPassword}
                autoComplete="password"
              />
              <TouchableOpacity
                style={localStyles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Icon
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={24}
                  color={theme.colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
            {errors.contrasenia && <Text style={globalStyles.textError}>{errors.contrasenia}</Text>}
          </View>

          <TouchableOpacity
            style={[
              globalStyles.buttonPrimary,
              localStyles.fullWidthButton,
              isLoading && { opacity: 0.7 }
            ]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            <Text style={globalStyles.buttonText}>
              {isLoading ? 'Cargando...' : 'Iniciar Sesión'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('ForgotPassword')}
            style={localStyles.linkButton}
          >
            <Text style={[globalStyles.textBody, { color: theme.colors.primary }]}>
              ¿Olvidaste tu contraseña?
            </Text>
          </TouchableOpacity>

          <View style={localStyles.registerContainer}>
            <Text style={globalStyles.textBody}>¿No tienes cuenta? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={[globalStyles.textBody, { color: theme.colors.primary, fontWeight: '600' }]}>
                Regístrate
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Estilos locales específicos
const localStyles = {
  logoSection: {
    marginBottom: 32,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 16,
  },
  fullWidthContainer: {
    width: '100%',
  },
  fullWidthInput: {
    width: '100%',
  },
  fullWidthButton: {
    width: '100%',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  eyeButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  linkButton: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 20,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
};