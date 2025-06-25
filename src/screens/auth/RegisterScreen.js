import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../../context/AuthContext';

export default function RegisterScreen({ navigation }) {
  const { register, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    ci: '',
    email: '',
    telefono: '',
    fechaNac: '',
    contrasenia: '',
    confirmarContrasenia: '',
  });
  const [errors, setErrors] = useState({});

  // Estados para mostrar/ocultar contraseñas
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es requerido';
    if (!formData.apellido.trim()) newErrors.apellido = 'El apellido es requerido';
    if (!formData.ci.trim()) newErrors.ci = 'La cédula es requerida';
    if (!formData.email.trim()) newErrors.email = 'El email es requerido';
    if (!formData.fechaNac.trim()) newErrors.fechaNac = 'La fecha de nacimiento es requerida';
    if (!formData.contrasenia) newErrors.contrasenia = 'La contraseña es requerida';
    if (formData.contrasenia !== formData.confirmarContrasenia) {
      newErrors.confirmarContrasenia = 'Las contraseñas no coinciden';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      await register({
        nombre: formData.nombre.trim(),
        apellido: formData.apellido.trim(),
        ci: parseInt(formData.ci),
        email: formData.email.trim().toLowerCase(),
        telefono: formData.telefono ? parseInt(formData.telefono) : undefined,
        fechaNac: formData.fechaNac,
        contrasenia: formData.contrasenia,
      });
    } catch (error) {
      Alert.alert('Error de registro', error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Crear Cuenta</Text>
        <Text style={styles.subtitle}>
          Completa todos los campos para registrarte
        </Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Nombre *</Text>
          <TextInput
            style={[styles.input, errors.nombre && styles.inputError]}
            value={formData.nombre}
            onChangeText={(value) => handleInputChange('nombre', value)}
            placeholder="Tu nombre"
          />
          {errors.nombre && <Text style={styles.errorText}>{errors.nombre}</Text>}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Apellido *</Text>
          <TextInput
            style={[styles.input, errors.apellido && styles.inputError]}
            value={formData.apellido}
            onChangeText={(value) => handleInputChange('apellido', value)}
            placeholder="Tu apellido"
          />
          {errors.apellido && <Text style={styles.errorText}>{errors.apellido}</Text>}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Cédula *</Text>
          <TextInput
            style={[styles.input, errors.ci && styles.inputError]}
            value={formData.ci}
            onChangeText={(value) => handleInputChange('ci', value)}
            placeholder="12345678"
            keyboardType="numeric"
          />
          {errors.ci && <Text style={styles.errorText}>{errors.ci}</Text>}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email *</Text>
          <TextInput
            style={[styles.input, errors.email && styles.inputError]}
            value={formData.email}
            onChangeText={(value) => handleInputChange('email', value)}
            placeholder="ejemplo@correo.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Teléfono</Text>
          <TextInput
            style={styles.input}
            value={formData.telefono}
            onChangeText={(value) => handleInputChange('telefono', value)}
            placeholder="099123456"
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Fecha de Nacimiento * (YYYY-MM-DD)</Text>
          <TextInput
            style={[styles.input, errors.fechaNac && styles.inputError]}
            value={formData.fechaNac}
            onChangeText={(value) => handleInputChange('fechaNac', value)}
            placeholder="1990-01-01"
          />
          {errors.fechaNac && <Text style={styles.errorText}>{errors.fechaNac}</Text>}
        </View>

        {/* Contraseña con toggle */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Contraseña *</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={[
                styles.passwordInput,
                errors.contrasenia && styles.inputError
              ]}
              value={formData.contrasenia}
              onChangeText={(value) => handleInputChange('contrasenia', value)}
              placeholder="Tu contraseña"
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Icon
                name={showPassword ? 'eye-off' : 'eye'}
                size={24}
                color="#666"
              />
            </TouchableOpacity>
          </View>
          {errors.contrasenia && <Text style={styles.errorText}>{errors.contrasenia}</Text>}
        </View>

        {/* Confirmar contraseña con toggle */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Confirmar Contraseña *</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={[
                styles.passwordInput,
                errors.confirmarContrasenia && styles.inputError
              ]}
              value={formData.confirmarContrasenia}
              onChangeText={(value) => handleInputChange('confirmarContrasenia', value)}
              placeholder="Confirma tu contraseña"
              secureTextEntry={!showConfirmPassword}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <Icon
                name={showConfirmPassword ? 'eye-off' : 'eye'}
                size={24}
                color="#666"
              />
            </TouchableOpacity>
          </View>
          {errors.confirmarContrasenia && <Text style={styles.errorText}>{errors.confirmarContrasenia}</Text>}
        </View>

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Registrando...' : 'Crear Cuenta'}
          </Text>
        </TouchableOpacity>

        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>¿Ya tienes cuenta? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLink}>Inicia Sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#000',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#000',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  inputError: {
    borderColor: '#e74c3c',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 14,
    marginTop: 4,
  },
  // Estilos para el contenedor de contraseña con toggle
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: 'transparent',
    borderWidth: 0, // Remover el borde del input individual
  },
  eyeButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
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