// src/screens/ProfileScreen.js - Ejemplo de cómo integrar NotificationStatus
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../context/AuthContext';
import NotificationStatus from '../components/NotificationStatus';

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuth();

  const menuItems = [
    {
      icon: 'settings-outline',
      title: 'Configuración',
      subtitle: 'Ajustes de la aplicación',
      onPress: () => navigation.navigate('Configuration'),
    },
    {
      icon: 'help-circle-outline',
      title: 'Ayuda',
      subtitle: 'Centro de ayuda y soporte',
      onPress: () => navigation.navigate('Help'),
    },
    {
      icon: 'information-circle-outline',
      title: 'Acerca de',
      subtitle: 'Información de la aplicación',
      onPress: () => navigation.navigate('About'),
    },
    {
      icon: 'log-out-outline',
      title: 'Cerrar Sesión',
      subtitle: 'Salir de tu cuenta',
      onPress: logout,
      danger: true,
    },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Header del perfil */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Icon name="person" size={40} color="#2c5530" />
        </View>
        <Text style={styles.userName}>{user?.nombre} {user?.apellido}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
      </View>

      {/* 🔥 COMPONENTE DE ESTADO DE NOTIFICACIONES */}
      <NotificationStatus />

      {/* Información del usuario */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Información Personal</Text>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Nombre completo</Text>
            <Text style={styles.infoValue}>
              {user?.nombre} {user?.apellido}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{user?.email}</Text>
          </View>

          {user?.ci && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Cédula</Text>
              <Text style={styles.infoValue}>{user.ci}</Text>
            </View>
          )}

          {user?.telefono && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Teléfono</Text>
              <Text style={styles.infoValue}>{user.telefono}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Menú de opciones */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Opciones</Text>

        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.menuItem,
              item.danger && styles.dangerItem
            ]}
            onPress={item.onPress}
          >
            <Icon
              name={item.icon}
              size={24}
              color={item.danger ? '#EF4444' : '#6B7280'}
              style={styles.menuIcon}
            />
            <View style={styles.menuContent}>
              <Text style={[
                styles.menuTitle,
                item.danger && styles.dangerText
              ]}>
                {item.title}
              </Text>
              <Text style={styles.menuSubtitle}>
                {item.subtitle}
              </Text>
            </View>
            <Icon
              name="chevron-forward"
              size={20}
              color="#C1C1C1"
            />
          </TouchableOpacity>
        ))}
      </View>

      {/* Información sobre notificaciones */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Acerca de las Notificaciones</Text>

        <View style={styles.notificationInfo}>
          <View style={styles.notificationItem}>
            <Icon name="checkmark-circle" size={20} color="#10B981" />
            <Text style={styles.notificationText}>
              Cierre de ventas 1 hora antes del viaje
            </Text>
          </View>

          <View style={styles.notificationItem}>
            <Icon name="checkmark-circle" size={20} color="#10B981" />
            <Text style={styles.notificationText}>
              Recordatorios de hora de partida
            </Text>
          </View>

          <View style={styles.notificationItem}>
            <Icon name="checkmark-circle" size={20} color="#10B981" />
            <Text style={styles.notificationText}>
              Confirmaciones de compra y devolución
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: 'white',
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#6B7280',
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
    marginHorizontal: 16,
  },
  infoCard: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  infoLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '600',
  },
  menuItem: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  dangerItem: {
    borderColor: '#FEE2E2',
    borderWidth: 1,
  },
  menuIcon: {
    marginRight: 12,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  dangerText: {
    color: '#EF4444',
  },
  menuSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  notificationInfo: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  notificationText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 8,
    flex: 1,
  },
});