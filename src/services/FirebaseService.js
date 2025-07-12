import messaging from '@react-native-firebase/messaging';
import { Alert, Platform, PermissionsAndroid } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from '../api/client';

class FirebaseService {
  constructor() {
    this.isInitialized = false;
    this.currentToken = null;
  }

  // Inicializar Firebase Messaging
  async initialize() {
    if (this.isInitialized) {
      return;
    }

    try {
      // Solicitar permisos
      const hasPermission = await this.requestPermission();

      if (hasPermission) {
        // Obtener token FCM
        await this.getFCMToken();

        // Configurar listeners
        this.setupMessageListeners();

        this.isInitialized = true;
        console.log('🔥 Firebase Service inicializado correctamente');
      } else {
        console.log('⚠️ Permisos de notificación denegados');
      }
    } catch (error) {
      console.error('❌ Error al inicializar Firebase Service:', error);
    }
  }

  // Solicitar permisos de notificación
  async requestPermission() {
    try {
      if (Platform.OS === 'android' && Platform.Version >= 33) {
        // Android 13+ requiere permiso específico
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );

        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Permiso de notificaciones denegado en Android 13+');
          return false;
        }
      }

      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (!enabled) {
        // Mostrar alerta explicativa
        Alert.alert(
          'Notificaciones',
          'Para recibir recordatorios importantes sobre tus viajes, por favor habilita las notificaciones en la configuración de la app.',
          [
            { text: 'Más tarde', style: 'cancel' },
            { text: 'Configuración', onPress: () => this.openAppSettings() }
          ]
        );
      }

      return enabled;
    } catch (error) {
      console.error('Error al solicitar permisos:', error);
      return false;
    }
  }

  // Obtener token FCM
  async getFCMToken() {
    try {
      // Verificar si ya tenemos un token guardado
      const savedToken = await AsyncStorage.getItem('fcm_token');
      const currentToken = await messaging().getToken();

      this.currentToken = currentToken;

      // Si el token cambió, actualizarlo en el backend
      if (savedToken !== currentToken) {
        await this.registerTokenWithBackend(currentToken);
        await AsyncStorage.setItem('fcm_token', currentToken);
        console.log('🔑 Token FCM actualizado:', currentToken.substring(0, 20) + '...');
      } else {
        console.log('🔑 Token FCM ya está actualizado');
      }

      // Listener para cuando el token se actualice
      messaging().onTokenRefresh(async (newToken) => {
        this.currentToken = newToken;
        await this.registerTokenWithBackend(newToken);
        await AsyncStorage.setItem('fcm_token', newToken);
        console.log('🔄 Token FCM renovado:', newToken.substring(0, 20) + '...');
      });

    } catch (error) {
      console.error('Error al obtener token FCM:', error);
    }
  }

  // Registrar token en el backend
  async registerTokenWithBackend(token) {
    try {
      await apiClient.put('/api/cliente/fcm-token', { token }, true);
      console.log('✅ Token FCM registrado en el backend');
    } catch (error) {
      console.error('❌ Error al registrar token FCM en backend:', error);

      // Si hay error de autenticación, no es crítico
      if (error.message.includes('Sesión expirada')) {
        console.log('ℹ️ Se registrará el token cuando el usuario inicie sesión');
      }
    }
  }

  // Limpiar token del backend (al hacer logout)
  async clearTokenFromBackend() {
    try {
      if (this.currentToken) {
        await apiClient.delete('/api/cliente/fcm-token', true);
        console.log('🗑️ Token FCM limpiado del backend');
      }

      await AsyncStorage.removeItem('fcm_token');
      this.currentToken = null;

    } catch (error) {
      console.error('Error al limpiar token FCM:', error);
      // Limpiar localmente aunque falle el backend
      await AsyncStorage.removeItem('fcm_token');
      this.currentToken = null;
    }
  }

  // Configurar listeners de mensajes
  setupMessageListeners() {
    // Mensaje recibido cuando la app está en primer plano
    messaging().onMessage(async (remoteMessage) => {
      console.log('📱 Notificación recibida en primer plano:', remoteMessage);

      // Mostrar alerta local ya que las notificaciones no se muestran automáticamente en primer plano
      this.showForegroundNotification(remoteMessage);
    });

    // Mensaje que abrió la app (usuario hizo tap en notificación)
    messaging().onNotificationOpenedApp((remoteMessage) => {
      console.log('🚀 App abierta por notificación:', remoteMessage);
      this.handleNotificationTap(remoteMessage);
    });

    // Verificar si la app se abrió desde una notificación (app estaba cerrada)
    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage) {
          console.log('🎯 App iniciada por notificación:', remoteMessage);
          this.handleNotificationTap(remoteMessage);
        }
      });
  }

  // Mostrar notificación cuando la app está en primer plano
  showForegroundNotification(remoteMessage) {
    const { notification, data } = remoteMessage;

    Alert.alert(
      notification?.title || 'Notificación',
      notification?.body || 'Tienes una nueva notificación',
      [
        { text: 'Cerrar', style: 'cancel' },
        {
          text: 'Ver',
          onPress: () => this.handleNotificationTap(remoteMessage)
        }
      ]
    );
  }

  // Manejar tap en notificación
  handleNotificationTap(remoteMessage) {
    const { data } = remoteMessage;

    if (!data) return;

    // Importar navigation de forma dinámica para evitar referencias circulares
    import('./NavigationService').then(({ NavigationService }) => {
      switch (data.type) {
        case 'VENTAS_CERRADAS':
          // Navegar a la pantalla de pasajes
          NavigationService.navigate('Mis Pasajes');
          break;
        case 'DEVOLUCION_PASAJE':
          // Navegar a la pantalla de pasajes
          NavigationService.navigate('Mis Pasajes');
          break;
        default:
          // Navegar a la pantalla principal
          NavigationService.navigate('Home');
      }
    });
  }

  // Abrir configuración de la app
  openAppSettings() {
    if (Platform.OS === 'ios') {
      // iOS: abrir configuración de la app
      import('react-native').then(({ Linking }) => {
        Linking.openURL('app-settings:');
      });
    } else {
      // Android: abrir configuración de notificaciones
      import('react-native').then(({ Linking }) => {
        Linking.openSettings();
      });
    }
  }

  // Verificar si las notificaciones están habilitadas
  async isNotificationEnabled() {
    try {
      const authStatus = await messaging().hasPermission();
      return authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
             authStatus === messaging.AuthorizationStatus.PROVISIONAL;
    } catch (error) {
      console.error('Error al verificar permisos de notificación:', error);
      return false;
    }
  }

  // Re-registrar token (útil después del login)
  async refreshToken() {
    if (this.currentToken) {
      await this.registerTokenWithBackend(this.currentToken);
    } else {
      await this.getFCMToken();
    }
  }
}

export default new FirebaseService();