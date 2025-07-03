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
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';
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

  // Estado para el selector de fecha
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Función para manejar el cambio de fecha
  const handleDateChange = (event, date) => {
    setShowDatePicker(Platform.OS === 'ios');

    if (date) {
      setSelectedDate(date);
      // Convertir a formato YYYY-MM-DD para el backend
      const formattedDate = formatDateForBackend(date);
      handleInputChange('fechaNac', formattedDate);
    }
  };

  // Formatear fecha para mostrar al usuario
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return 'Seleccionar fecha de nacimiento';

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Fecha inválida';
    }
  };

  // Formatear fecha para el backend (YYYY-MM-DD)
  const formatDateForBackend = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Abrir selector de fecha
  const openDatePicker = () => {
    // Si ya hay una fecha seleccionada, usarla como inicial
    if (formData.fechaNac) {
      try {
        setSelectedDate(new Date(formData.fechaNac));
      } catch {
        setSelectedDate(new Date());
      }
    }
    setShowDatePicker(true);
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
            placeholder="12345678 (sin puntos ni guiones)"
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
            placeholder="tu@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Teléfono</Text>
          <TextInput
            style={[styles.input, errors.telefono && styles.inputError]}
            value={formData.telefono}
            onChangeText={(value) => handleInputChange('telefono', value)}
            placeholder="099123456"
            keyboardType="phone-pad"
          />
          {errors.telefono && <Text style={styles.errorText}>{errors.telefono}</Text>}
        </View>

        {/* Selector de fecha con calendario */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Fecha de Nacimiento *</Text>
          <TouchableOpacity
            style={[styles.dateButton, errors.fechaNac && styles.inputError]}
            onPress={openDatePicker}
          >
            <View style={styles.dateButtonContent}>
              <Text style={[
                styles.dateButtonText,
                !formData.fechaNac && styles.placeholderText
              ]}>
                {formatDateForDisplay(formData.fechaNac)}
              </Text>
              <Icon
                name="calendar-outline"
                size={24}
                color={formData.fechaNac ? "#007bff" : "#666"}
              />
            </View>
          </TouchableOpacity>
          {errors.fechaNac && <Text style={styles.errorText}>{errors.fechaNac}</Text>}
        </View>

        {/* DateTimePicker - se muestra cuando showDatePicker es true */}
        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDateChange}
            maximumDate={new Date()} // No permitir fechas futuras
            minimumDate={new Date(1900, 0, 1)} // Desde el año 1900
          />
        )}

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
              placeholder="Mínimo 6 caracteres"
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
              placeholder="Vuelve a escribir la contraseña"
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
            {isLoading ? 'Registrando...' : 'Crear Mi Cuenta'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('Login')}
          style={styles.linkButton}
        >
          <Text style={styles.linkText}>
            ¿Ya tienes una cuenta? Inicia sesión aquí
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
  },
  inputError: {
    borderColor: '#ff6b6b',
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 14,
    marginTop: 5,
  },

  // Estilos para el selector de fecha
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
  dateButtonText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  placeholderText: {
    color: '#999',
  },

  // Estilos para contraseñas
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

  // Estilos para botones
  button: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  linkButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  linkText: {
    color: '#007bff',
    fontSize: 16,
  },
});