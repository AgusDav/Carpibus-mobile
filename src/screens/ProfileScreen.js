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
import { globalStyles } from '../styles/globalStyles';
import { useTheme } from '../hooks/useTheme';

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuth();
  const theme = useTheme();

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
    <ScrollView style={globalStyles.container}>
      {/* Header del perfil */}
      <View style={[globalStyles.card, localStyles.profileHeader]}>
        <View style={localStyles.avatarContainer}>
          <Icon name="person" size={40} color={theme.colors.primary} />
        </View>
        <Text style={globalStyles.textHeading2}>{user?.nombre} {user?.apellido}</Text>
        <Text style={globalStyles.textCaption}>{user?.email}</Text>
      </View>

      {/* Componente de estado de notificaciones */}
      <NotificationStatus />

      {/* Información del usuario */}
      <View style={globalStyles.card}>
        <Text style={[globalStyles.textHeading3, globalStyles.marginBottomMd]}>
          Información Personal
        </Text>

        <View style={localStyles.infoRow}>
          <Text style={globalStyles.textCaption}>Nombre completo</Text>
          <Text style={globalStyles.textBody}>
            {user?.nombre} {user?.apellido}
          </Text>
        </View>

        <View style={localStyles.infoRow}>
          <Text style={globalStyles.textCaption}>Email</Text>
          <Text style={globalStyles.textBody}>{user?.email}</Text>
        </View>

        <View style={localStyles.infoRow}>
          <Text style={globalStyles.textCaption}>Cédula</Text>
          <Text style={globalStyles.textBody}>
            {user?.cedula || 'No especificada'}
          </Text>
        </View>

        <View style={localStyles.infoRow}>
          <Text style={globalStyles.textCaption}>Teléfono</Text>
          <Text style={globalStyles.textBody}>
            {user?.telefono || 'No especificado'}
          </Text>
        </View>
      </View>

      {/* Menú de opciones */}
      <View style={globalStyles.card}>
        <Text style={[globalStyles.textHeading3, globalStyles.marginBottomMd]}>
          Opciones
        </Text>

        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[
              globalStyles.listItem,
              index === 0 && globalStyles.listItemFirst,
              index === menuItems.length - 1 && globalStyles.listItemLast,
              item.danger && { backgroundColor: theme.colors.error + '10' }
            ]}
            onPress={item.onPress}
          >
            <View style={[globalStyles.row, globalStyles.spaceBetween]}>
              <View style={globalStyles.row}>
                <Icon
                  name={item.icon}
                  size={24}
                  color={item.danger ? theme.colors.error : theme.colors.text}
                  style={{ marginRight: theme.spacing.md }}
                />
                <View>
                  <Text style={[
                    globalStyles.textBody,
                    item.danger && { color: theme.colors.error }
                  ]}>
                    {item.title}
                  </Text>
                  <Text style={globalStyles.textCaption}>
                    {item.subtitle}
                  </Text>
                </View>
              </View>
              <Icon
                name="chevron-forward"
                size={20}
                color={theme.colors.textSecondary}
              />
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

// Estilos locales específicos que no están en globalStyles
const localStyles = StyleSheet.create({
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f8ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoRow: {
    marginBottom: 16,
  },
});