import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../context/AuthContext';

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro que deseas cerrar sesión?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: logout,
        },
      ]
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No especificado';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mi Perfil</Text>
      </View>

      <View style={styles.content}>
        {/* Información del usuario */}
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Icon name="person" size={48} color="#2563eb" />
          </View>
          <Text style={styles.userName}>
            {user?.nombre} {user?.apellido}
          </Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
          <Text style={styles.userRole}>{user?.rol}</Text>
        </View>

        {/* Detalles del perfil */}
        <View style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>Información Personal</Text>

          <View style={styles.detailRow}>
            <Icon name="card-outline" size={20} color="#666" />
            <View style={styles.detailInfo}>
              <Text style={styles.detailLabel}>Cédula</Text>
              <Text style={styles.detailValue}>{user?.ci || 'No especificado'}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Icon name="call-outline" size={20} color="#666" />
            <View style={styles.detailInfo}>
              <Text style={styles.detailLabel}>Teléfono</Text>
              <Text style={styles.detailValue}>{user?.telefono || 'No especificado'}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Icon name="calendar-outline" size={20} color="#666" />
            <View style={styles.detailInfo}>
              <Text style={styles.detailLabel}>Fecha de Nacimiento</Text>
              <Text style={styles.detailValue}>{formatDate(user?.fechaNac)}</Text>
            </View>
          </View>

          {user?.tipoCliente && (
            <View style={styles.detailRow}>
              <Icon name="star-outline" size={20} color="#666" />
              <View style={styles.detailInfo}>
                <Text style={styles.detailLabel}>Tipo de Cliente</Text>
                <Text style={styles.detailValue}>{user.tipoCliente}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Opciones */}
        <View style={styles.optionsSection}>
          <TouchableOpacity style={styles.optionRow}>
            <Icon name="settings-outline" size={24} color="#666" />
            <Text style={styles.optionText}>Configuración</Text>
            <Icon name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionRow}>
            <Icon name="help-circle-outline" size={24} color="#666" />
            <Text style={styles.optionText}>Ayuda</Text>
            <Icon name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionRow}>
            <Icon name="information-circle-outline" size={24} color="#666" />
            <Text style={styles.optionText}>Acerca de</Text>
            <Icon name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Botón de logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Icon name="log-out-outline" size={24} color="#e74c3c" />
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  userInfo: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f8ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  detailsSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailInfo: {
    marginLeft: 12,
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },
  optionsSection: {
    marginBottom: 32,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  optionText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#000',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e74c3c',
  },
  logoutText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#e74c3c',
    fontWeight: '600',
  },
});