import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Linking,
  Platform
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import FirebaseService from '../services/FirebaseService';

const NotificationStatus = () => {
  const [notificationStatus, setNotificationStatus] = useState('checking');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkNotificationStatus();
  }, []);

  const checkNotificationStatus = async () => {
    try {
      const isEnabled = await FirebaseService.isNotificationEnabled();
      setNotificationStatus(isEnabled ? 'enabled' : 'disabled');
    } catch (error) {
      console.error('Error checking notification status:', error);
      setNotificationStatus('error');
    }
  };

  const handleEnableNotifications = async () => {
    setIsLoading(true);
    try {
      await FirebaseService.initialize();
      setTimeout(() => {
        checkNotificationStatus();
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error enabling notifications:', error);
      setIsLoading(false);
      Alert.alert(
        'Error',
        'No se pudieron habilitar las notificaciones. Intenta nuevamente.'
      );
    }
  };

  const openSettings = () => {
    Alert.alert(
      'Habilitar Notificaciones',
      'Para recibir notificaciones importantes sobre tus viajes, ve a Configuración > Notificaciones y habilita las notificaciones para esta app.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Abrir Configuración',
          onPress: () => {
            if (Platform.OS === 'ios') {
              Linking.openURL('app-settings:');
            } else {
              Linking.openSettings();
            }
          }
        }
      ]
    );
  };

  const getStatusConfig = () => {
    switch (notificationStatus) {
      case 'enabled':
        return {
          icon: 'notifications',
          color: '#10B981',
          bgColor: '#D1FAE5',
          title: 'Notificaciones habilitadas',
          subtitle: 'Recibirás avisos importantes sobre tus viajes',
          showButton: false
        };
      case 'disabled':
        return {
          icon: 'notifications-off',
          color: '#F59E0B',
          bgColor: '#FEF3C7',
          title: 'Notificaciones deshabilitadas',
          subtitle: 'Habilítalas para recibir recordatorios importantes',
          showButton: true,
          buttonText: 'Habilitar',
          buttonAction: handleEnableNotifications
        };
      case 'error':
        return {
          icon: 'alert-circle',
          color: '#EF4444',
          bgColor: '#FEE2E2',
          title: 'Error en notificaciones',
          subtitle: 'Ve a configuración para habilitarlas manualmente',
          showButton: true,
          buttonText: 'Configuración',
          buttonAction: openSettings
        };
      default:
        return {
          icon: 'time',
          color: '#6B7280',
          bgColor: '#F3F4F6',
          title: 'Verificando notificaciones...',
          subtitle: 'Espera un momento',
          showButton: false
        };
    }
  };

  const config = getStatusConfig();

  return (
    <View style={[styles.container, { backgroundColor: config.bgColor }]}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Icon
            name={config.icon}
            size={24}
            color={config.color}
          />
        </View>

        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: config.color }]}>
            {config.title}
          </Text>
          <Text style={styles.subtitle}>
            {config.subtitle}
          </Text>
        </View>

        {config.showButton && (
          <TouchableOpacity
            style={[styles.button, { backgroundColor: config.color }]}
            onPress={config.buttonAction}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Cargando...' : config.buttonText}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 16,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 18,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 12,
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default NotificationStatus;