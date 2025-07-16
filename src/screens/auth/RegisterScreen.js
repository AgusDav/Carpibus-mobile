import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../../context/AuthContext';
import { globalStyles } from '../../styles/globalStyles';
import { useTheme } from '../../hooks/useTheme';

export default function RegisterScreen({ navigation }) {
  const { register, isLoading } = useAuth();
  const theme = useTheme();

  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    ci: '',
    telefono: '',
    email: '',
    fechaNac: '',
    contrasenia: '',
    confirmarContrasenia: '',
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const formatDate = (date) => {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es requerido';
    if (!formData.apellido.trim()) newErrors.apellido = 'El apellido es requerido';
    if (!formData.ci.trim()) newErrors.ci = 'La cédula es requerida';

    // Validar que CI sea numérico
    if (formData.ci && isNaN(parseInt(formData.ci))) {
      newErrors.ci = 'La cédula debe ser un número válido';
    }

    if (!formData.email.trim()) newErrors.email = 'El email es requerido';
    if (!formData.fechaNac.trim()) newErrors.fechaNac = 'La fecha de nacimiento es requerida';
    if (!formData.contrasenia) newErrors.contrasenia = 'La contraseña es requerida';

    // Validar longitud de contraseña
    if (formData.contrasenia.length < 6) {
      newErrors.contrasenia = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (formData.contrasenia !== formData.confirmarContrasenia) {
      newErrors.confirmarContrasenia = 'Las contraseñas no coinciden';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      // Preparar datos igual que en el frontend web
      const { confirmarContrasenia, ...payloadToSubmit } = formData;

      const finalPayload = {
        ...payloadToSubmit,
        nombre: formData.nombre.trim(),
        apellido: formData.apellido.trim(),
        email: formData.email.trim().toLowerCase(),
        ci: formData.ci ? parseInt(formData.ci) : null,
        telefono: formData.telefono ? parseInt(formData.telefono) : null,
        fechaNac: formData.fechaNac, // Ya está en formato YYYY-MM-DD
        contrasenia: formData.contrasenia,
      };

      console.log('Datos finales a enviar:', finalPayload);

      await register(finalPayload);
    } catch (error) {
      console.error('Error en registro:', error);
      Alert.alert('Error de registro', error.message);
    }
  };

  const handleDatePress = () => {
    setShowDatePicker(true);
  };

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <ScrollView
        style={globalStyles.container}
        contentContainerStyle={globalStyles.screenPadding}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={[globalStyles.centerContent, localStyles.headerSection]}>
          <Icon name="person-add" size={48} color={theme.colors.primary} />
          <Text style={[globalStyles.textHeading1, { textAlign: 'center', marginBottom: 8 }]}>
            Crear Cuenta
          </Text>
          <Text style={[globalStyles.textCaption, { textAlign: 'center', marginBottom: 32 }]}>
            Completa todos los campos para registrarte
          </Text>
        </View>

        {/* Nombre */}
        <View style={globalStyles.marginBottomMd}>
          <Text style={[globalStyles.textCaption, { fontWeight: '600', marginBottom: 8 }]}>
            Nombre *
          </Text>
          <TextInput
            style={[globalStyles.input, errors.nombre && globalStyles.inputError]}
            value={formData.nombre}
            onChangeText={(value) => handleInputChange('nombre', value)}
            placeholder="Tu nombre"
            placeholderTextColor={theme.colors.placeholder}
          />
          {errors.nombre && <Text style={globalStyles.textError}>{errors.nombre}</Text>}
        </View>

        {/* Apellido */}
        <View style={globalStyles.marginBottomMd}>
          <Text style={[globalStyles.textCaption, { fontWeight: '600', marginBottom: 8 }]}>
            Apellido *
          </Text>
          <TextInput
            style={[globalStyles.input, errors.apellido && globalStyles.inputError]}
            value={formData.apellido}
            onChangeText={(value) => handleInputChange('apellido', value)}
            placeholder="Tu apellido"
            placeholderTextColor={theme.colors.placeholder}
          />
          {errors.apellido && <Text style={globalStyles.textError}>{errors.apellido}</Text>}
        </View>

        {/* Cédula */}
        <View style={globalStyles.marginBottomMd}>
          <Text style={[globalStyles.textCaption, { fontWeight: '600', marginBottom: 8 }]}>
            Cédula *
          </Text>
          <TextInput
            style={[globalStyles.input, errors.ci && globalStyles.inputError]}
            value={formData.ci}
            onChangeText={(value) => handleInputChange('ci', value)}
            placeholder="12345678"
            placeholderTextColor={theme.colors.placeholder}
            keyboardType="numeric"
          />
          {errors.ci && <Text style={globalStyles.textError}>{errors.ci}</Text>}
        </View>

        {/* Teléfono */}
        <View style={globalStyles.marginBottomMd}>
          <Text style={[globalStyles.textCaption, { fontWeight: '600', marginBottom: 8 }]}>
            Teléfono
          </Text>
          <TextInput
            style={globalStyles.input}
            value={formData.telefono}
            onChangeText={(value) => handleInputChange('telefono', value)}
            placeholder="099123456"
            placeholderTextColor={theme.colors.placeholder}
            keyboardType="phone-pad"
          />
        </View>

        {/* Email */}
        <View style={globalStyles.marginBottomMd}>
          <Text style={[globalStyles.textCaption, { fontWeight: '600', marginBottom: 8 }]}>
            Email *
          </Text>
          <TextInput
            style={[globalStyles.input, errors.email && globalStyles.inputError]}
            value={formData.email}
            onChangeText={(value) => handleInputChange('email', value)}
            placeholder="ejemplo@correo.com"
            placeholderTextColor={theme.colors.placeholder}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {errors.email && <Text style={globalStyles.textError}>{errors.email}</Text>}
        </View>

        {/* Fecha de Nacimiento */}
        <View style={globalStyles.marginBottomMd}>
          <Text style={[globalStyles.textCaption, { fontWeight: '600', marginBottom: 8 }]}>
            Fecha de Nacimiento *
          </Text>
          <TouchableOpacity
            style={[
              localStyles.dateButton,
              errors.fechaNac && { borderColor: theme.colors.error }
            ]}
            onPress={handleDatePress}
          >
            <View style={localStyles.dateButtonContent}>
              <Text style={[
                globalStyles.textBody,
                !formData.fechaNac && { color: theme.colors.placeholder }
              ]}>
                {formData.fechaNac || 'Selecciona tu fecha de nacimiento'}
              </Text>
              <Icon name="calendar" size={24} color={theme.colors.textSecondary} />
            </View>
          </TouchableOpacity>
          {errors.fechaNac && <Text style={globalStyles.textError}>{errors.fechaNac}</Text>}
        </View>

        {/* Contraseña */}
        <View style={globalStyles.marginBottomMd}>
          <Text style={[globalStyles.textCaption, { fontWeight: '600', marginBottom: 8 }]}>
            Contraseña *
          </Text>
          <View style={[
            localStyles.passwordContainer,
            errors.contrasenia && { borderColor: theme.colors.error }
          ]}>
            <TextInput
              style={localStyles.passwordInput}
              value={formData.contrasenia}
              onChangeText={(value) => handleInputChange('contrasenia', value)}
              placeholder="Mínimo 6 caracteres"
              placeholderTextColor={theme.colors.placeholder}
              secureTextEntry={!showPassword}
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

        {/* Confirmar Contraseña */}
        <View style={globalStyles.marginBottomLg}>
          <Text style={[globalStyles.textCaption, { fontWeight: '600', marginBottom: 8 }]}>
            Confirmar Contraseña *
          </Text>
          <View style={[
            localStyles.passwordContainer,
            errors.confirmarContrasenia && { borderColor: theme.colors.error }
          ]}>
            <TextInput
              style={localStyles.passwordInput}
              value={formData.confirmarContrasenia}
              onChangeText={(value) => handleInputChange('confirmarContrasenia', value)}
              placeholder="Confirma tu contraseña"
              placeholderTextColor={theme.colors.placeholder}
              secureTextEntry={!showConfirmPassword}
            />
            <TouchableOpacity
              style={localStyles.eyeButton}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <Icon
                name={showConfirmPassword ? 'eye-off' : 'eye'}
                size={24}
                color={theme.colors.textSecondary}
              />
            </TouchableOpacity>
          </View>
          {errors.confirmarContrasenia && <Text style={globalStyles.textError}>{errors.confirmarContrasenia}</Text>}
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
            {isLoading ? 'Registrando...' : 'Crear Mi Cuenta'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('Login')}
          style={localStyles.linkButton}
        >
          <Text style={[globalStyles.textBody, { color: theme.colors.primary, textAlign: 'center' }]}>
            ¿Ya tienes una cuenta? Inicia sesión aquí
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// Estilos locales específicos
const localStyles = {
  headerSection: {
    marginBottom: 32,
  },
  dateButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
  },
  dateButtonContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  passwordInput: {
    flex: 1,
    padding: 15,
    fontSize: 16,
  },
  eyeButton: {
    padding: 15,
  },
  linkButton: {
    marginTop: 20,
    alignItems: 'center',
  },
};