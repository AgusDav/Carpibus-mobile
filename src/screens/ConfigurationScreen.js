import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/client';
import NotificationStatus from '../components/NotificationStatus';

export default function ConfigurationScreen({ navigation }) {
  const { user: contextUser, updateUser } = useAuth();
  const [user, setUser] = useState(contextUser);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [passwordMode, setPasswordMode] = useState(false);
  const [saving, setSaving] = useState(false);

  // Estados para notificaciones
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);
    const [notificationPermission, setNotificationPermission] = useState(null);
    const [checkingNotifications, setCheckingNotifications] = useState(true);

  // Estado para edición de perfil
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    telefono: '',
    email: '',
  });

  // Estado para cambio de contraseña
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  useEffect(() => {
    if (contextUser) {
      setUser(contextUser);
      setFormData({
        nombre: contextUser.nombre || '',
        apellido: contextUser.apellido || '',
        telefono: contextUser.telefono || '',
        email: contextUser.email || '',
      });
    }
  }, [contextUser]);

  // Verificar configuración de notificaciones
    const checkNotificationSettings = async () => {
      try {
        setCheckingNotifications(true);

        // Verificar permisos del sistema
        const hasSystemPermission = await FirebaseService.V();
        setNotificationPermission(hasSystemPermission);

        // Verificar configuración local del usuario
        const localSetting = await AsyncStorage.getItem('notifications_enabled');
        const isLocallyEnabled = localSetting !== null ? JSON.parse(localSetting) : true;

        // Las notificaciones están habilitadas si AMBOS están activos
        setNotificationsEnabled(hasSystemPermission && isLocallyEnabled);
      } catch (error) {
        console.error('Error checking notification settings:', error);
        setNotificationPermission(false);
        setNotificationsEnabled(false);
      } finally {
        setCheckingNotifications(false);
      }
    };

    // Manejar cambio de configuración de notificaciones
    const handleNotificationToggle = async (value) => {
      try {
        if (value) {
          // El usuario quiere habilitar notificaciones
          if (!notificationPermission) {
            // No hay permisos del sistema, pedirlos
            Alert.alert(
              'Permisos Requeridos',
              'Para recibir notificaciones, necesitas habilitar los permisos en la configuración del sistema.',
              [
                { text: 'Cancelar', style: 'cancel' },
                {
                  text: 'Abrir Configuración',
                  onPress: () => openSystemSettings()
                }
              ]
            );
            return;
          }

          // Hay permisos del sistema, habilitar localmente
          await AsyncStorage.setItem('notifications_enabled', JSON.stringify(true));
          setNotificationsEnabled(true);

          // Re-inicializar Firebase para obtener token
          await FirebaseService.initialize();

          Alert.alert(
            'Notificaciones Habilitadas',
            'Ahora recibirás notificaciones importantes sobre tus viajes.'
          );
        } else {
          // El usuario quiere deshabilitar notificaciones
          Alert.alert(
            'Deshabilitar Notificaciones',
            '¿Estás seguro de que quieres deshabilitar las notificaciones? No recibirás recordatorios importantes sobre tus viajes.',
            [
              { text: 'Cancelar', style: 'cancel' },
              {
                text: 'Deshabilitar',
                style: 'destructive',
                onPress: async () => {
                  await AsyncStorage.setItem('notifications_enabled', JSON.stringify(false));
                  setNotificationsEnabled(false);
                  // Opcionalmente, desregistrar el token del backend
                  // await FirebaseService.unregisterToken();
                }
              }
            ]
          );
        }
      } catch (error) {
        console.error('Error toggling notifications:', error);
        Alert.alert('Error', 'No se pudo cambiar la configuración de notificaciones.');
      }
    };

    // Abrir configuración del sistema
    const openSystemSettings = () => {
      if (Platform.OS === 'ios') {
        Linking.openURL('app-settings:');
      } else {
        Linking.openSettings();
      }
    };

  const getCurrentUserProfile = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/user/profile', true);
      return response;
    } catch (error) {
      console.error('Error al obtener perfil:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfile = async (updateData) => {
    try {
      const response = await apiClient.put('/api/user/profile', updateData, true);
      return response;
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      throw error;
    }
  };

  const changePassword = async (passwordData) => {
    try {
      const response = await apiClient.put('/api/user/password', passwordData, true);
      return response;
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      throw error;
    }
  };

  const loadUserData = async () => {
    try {
      const userData = await getCurrentUserProfile();
      setUser(userData);
      updateUser(userData); // Actualizar también el contexto
      setFormData({
        nombre: userData.nombre || '',
        apellido: userData.apellido || '',
        telefono: userData.telefono || '',
        email: userData.email || '',
      });
    } catch (error) {
      console.error('Error al cargar datos del usuario:', error);
      Alert.alert('Error', 'No se pudieron cargar los datos del usuario');
    }
  };

  const handleUpdateProfile = async () => {
    if (!formData.nombre.trim() || !formData.apellido.trim() || !formData.email.trim()) {
      Alert.alert('Error', 'Por favor completa todos los campos obligatorios');
      return;
    }

    setSaving(true);
    try {
      const updatedUser = await updateUserProfile(formData);
      setUser(updatedUser);
      updateUser(updatedUser); // Actualizar el contexto
      setEditMode(false);
      Alert.alert('Éxito', 'Perfil actualizado correctamente');
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      Alert.alert('Error', error.message || 'No se pudo actualizar el perfil');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      Alert.alert('Error', 'Las contraseñas nuevas no coinciden');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      Alert.alert('Error', 'La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }

    setSaving(true);
    try {
      await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setPasswordMode(false);
      Alert.alert('Éxito', 'Contraseña cambiada correctamente');
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      Alert.alert('Error', error.message || 'No se pudo cambiar la contraseña');
    } finally {
      setSaving(false);
    }
  };

  const cancelEdit = () => {
    setFormData({
      nombre: user.nombre || '',
      apellido: user.apellido || '',
      telefono: user.telefono || '',
      email: user.email || '',
    });
    setEditMode(false);
  };

  const cancelPasswordChange = () => {
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setPasswordMode(false);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Configuración</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Cargando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Sección de Datos Personales */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Datos Personales</Text>
            {!editMode && !passwordMode && (
              <TouchableOpacity onPress={() => setEditMode(true)}>
                <Icon name="pencil" size={20} color="#007AFF" />
              </TouchableOpacity>
            )}
          </View>

          {editMode ? (
            <View style={styles.editForm}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nombre *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.nombre}
                  onChangeText={(text) => setFormData({ ...formData, nombre: text })}
                  placeholder="Ingresa tu nombre"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Apellido *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.apellido}
                  onChangeText={(text) => setFormData({ ...formData, apellido: text })}
                  placeholder="Ingresa tu apellido"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Teléfono</Text>
                <TextInput
                  style={styles.input}
                  value={formData.telefono}
                  onChangeText={(text) => setFormData({ ...formData, telefono: text })}
                  placeholder="Ingresa tu teléfono"
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.email}
                  onChangeText={(text) => setFormData({ ...formData, email: text })}
                  placeholder="Ingresa tu email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.buttonGroup}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={cancelEdit}
                  disabled={saving}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.saveButton]}
                  onPress={handleUpdateProfile}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.saveButtonText}>Guardar</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.infoDisplay}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Nombre:</Text>
                <Text style={styles.infoValue}>{user?.nombre}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Apellido:</Text>
                <Text style={styles.infoValue}>{user?.apellido}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Teléfono:</Text>
                <Text style={styles.infoValue}>{user?.telefono || 'No especificado'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Email:</Text>
                <Text style={styles.infoValue}>{user?.email}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Cédula:</Text>
                <Text style={styles.infoValue}>{user?.ci}</Text>
              </View>
              {user?.fechaNac && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Fecha de Nacimiento:</Text>
                  <Text style={styles.infoValue}>
                    {new Date(user.fechaNac).toLocaleDateString('es-UY')}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Sección de Seguridad */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Seguridad</Text>
            {!passwordMode && !editMode && (
              <TouchableOpacity onPress={() => setPasswordMode(true)}>
                <Icon name="key" size={20} color="#007AFF" />
              </TouchableOpacity>
            )}
          </View>

          {passwordMode ? (
            <View style={styles.editForm}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Contraseña Actual *</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    value={passwordData.currentPassword}
                    onChangeText={(text) => setPasswordData({ ...passwordData, currentPassword: text })}
                    placeholder="Contraseña actual"
                    secureTextEntry={!showPasswords.current}
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                  >
                    <Icon name={showPasswords.current ? 'eye-off' : 'eye'} size={20} color="#666" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nueva Contraseña *</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    value={passwordData.newPassword}
                    onChangeText={(text) => setPasswordData({ ...passwordData, newPassword: text })}
                    placeholder="Nueva contraseña (mín. 6 caracteres)"
                    secureTextEntry={!showPasswords.new}
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                  >
                    <Icon name={showPasswords.new ? 'eye-off' : 'eye'} size={20} color="#666" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirmar Nueva Contraseña *</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    value={passwordData.confirmPassword}
                    onChangeText={(text) => setPasswordData({ ...passwordData, confirmPassword: text })}
                    placeholder="Confirma la nueva contraseña"
                    secureTextEntry={!showPasswords.confirm}
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                  >
                    <Icon name={showPasswords.confirm ? 'eye-off' : 'eye'} size={20} color="#666" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.buttonGroup}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={cancelPasswordChange}
                  disabled={saving}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.saveButton]}
                  onPress={handleChangePassword}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.saveButtonText}>Cambiar</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.optionRow}
              onPress={() => setPasswordMode(true)}
              disabled={editMode}
            >
              <Icon name="key-outline" size={24} color="#666" />
              <Text style={styles.optionText}>Cambiar Contraseña</Text>
              <Icon name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  editForm: {
    gap: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
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
    padding: 12,
    fontSize: 16,
  },
  eyeButton: {
    padding: 12,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoDisplay: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '400',
    flex: 1,
    textAlign: 'right',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 16,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  // Estilos para notificaciones
    notificationRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 8,
    },
    notificationInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    notificationTextContainer: {
      marginLeft: 12,
      flex: 1,
    },
    notificationTitle: {
      fontSize: 16,
      fontWeight: '500',
      color: '#333',
    },
    notificationSubtitle: {
      fontSize: 14,
      color: '#666',
      marginTop: 2,
    },
    notificationText: {
      fontSize: 16,
      color: '#666',
      marginLeft: 12,
    },
    permissionStatus: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 12,
      padding: 12,
      backgroundColor: '#f9f9f9',
      borderRadius: 8,
    },
    permissionText: {
      fontSize: 14,
      marginLeft: 8,
      flex: 1,
    },
    settingsButton: {
      backgroundColor: '#EF4444',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 6,
    },
    settingsButtonText: {
      color: '#fff',
      fontSize: 12,
      fontWeight: '500',
    },
});