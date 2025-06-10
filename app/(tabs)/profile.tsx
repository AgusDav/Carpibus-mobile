import React from 'react';
import {
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useAuth } from '@/lib/context/AuthContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import { formatters } from '@/lib/utils/formatters';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const tintColor = useThemeColor({}, 'tint');
  const iconColor = useThemeColor({}, 'icon');

  const handleEditProfile = () => {
    router.push('/profile/edit');
  };

  const handleChangePassword = () => {
    router.push('/profile/change-password');
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: () => logout(),
        },
      ]
    );
  };

  const ProfileItem = ({
    icon,
    title,
    subtitle,
    onPress,
    showArrow = true
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    showArrow?: boolean;
  }) => (
    <TouchableOpacity onPress={onPress} disabled={!onPress}>
      <Card style={styles.profileItem}>
        <ThemedView style={styles.profileItemContent}>
          <Ionicons name={icon} size={24} color={tintColor} />
          <ThemedView style={styles.profileItemText}>
            <ThemedText style={styles.profileItemTitle}>{title}</ThemedText>
            {subtitle && <ThemedText style={styles.profileItemSubtitle}>{subtitle}</ThemedText>}
          </ThemedView>
          {showArrow && onPress && (
            <Ionicons name="chevron-forward" size={20} color={iconColor} />
          )}
        </ThemedView>
      </Card>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <ThemedView style={styles.header}>
          <ThemedView style={styles.avatar}>
            <Ionicons name="person" size={40} color={tintColor} />
          </ThemedView>
          <ThemedText type="title" style={styles.userName}>
            {user?.firstName} {user?.lastName}
          </ThemedText>
          <ThemedText style={styles.userEmail}>{user?.email}</ThemedText>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Información Personal</ThemedText>

          <ProfileItem
            icon="person-outline"
            title="Datos Personales"
            subtitle="Editar nombre, teléfono y otros datos"
            onPress={handleEditProfile}
          />

          <ProfileItem
            icon="card-outline"
            title="Documento"
            subtitle={user?.documentNumber}
            showArrow={false}
          />

          <ProfileItem
            icon="call-outline"
            title="Teléfono"
            subtitle={user?.phone || 'No configurado'}
            showArrow={false}
          />

          <ProfileItem
            icon="calendar-outline"
            title="Miembro desde"
            subtitle={user?.createdAt ? formatters.date(user.createdAt, 'long') : '-'}
            showArrow={false}
          />
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Seguridad</ThemedText>

          <ProfileItem
            icon="lock-closed-outline"
            title="Cambiar Contraseña"
            subtitle="Actualizar tu contraseña"
            onPress={handleChangePassword}
          />
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Aplicación</ThemedText>

          <ProfileItem
            icon="help-circle-outline"
            title="Ayuda y Soporte"
            subtitle="Obtener ayuda"
            onPress={() => {/* TODO: Implementar */}}
          />

          <ProfileItem
            icon="information-circle-outline"
            title="Acerca de"
            subtitle="Versión 1.0.0"
            onPress={() => {/* TODO: Implementar */}}
          />
        </ThemedView>

        <ThemedView style={styles.logoutSection}>
          <Button
            title="Cerrar Sesión"
            onPress={handleLogout}
            variant="danger"
            style={styles.logoutButton}
          />
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  userName: {
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    marginBottom: 12,
    marginHorizontal: 16,
  },
  profileItem: {
    marginHorizontal: 16,
    marginVertical: 4,
  },
  profileItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileItemText: {
    flex: 1,
    marginLeft: 16,
  },
  profileItemTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  profileItemSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  logoutSection: {
    padding: 24,
    marginTop: 32,
  },
  logoutButton: {
    width: '100%',
  },
  listContainer: {
    paddingVertical: 8,
  },
});