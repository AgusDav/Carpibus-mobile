import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "tu-api-key",
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-proyecto-id",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "123456789",
  appId: "tu-app-id"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar Firebase Cloud Messaging
const messaging = getMessaging(app);

export { messaging };

// Función para solicitar permiso de notificaciones y obtener token
export const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();

    if (permission === 'granted') {
      console.log('Permiso de notificaciones concedido');

      // Obtener token FCM
      const token = await getToken(messaging, {
        vapidKey: 'tu-vapid-key' // Necesitas generar esto en la consola de Firebase
      });

      if (token) {
        console.log('Token FCM obtenido:', token);
        return token;
      } else {
        console.log('No se pudo obtener el token FCM');
        return null;
      }
    } else {
      console.log('Permiso de notificaciones denegado');
      return null;
    }
  } catch (error) {
    console.error('Error al solicitar permiso de notificaciones:', error);
    return null;
  }
};

// Función para escuchar mensajes en primer plano
export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      console.log('Mensaje recibido en primer plano:', payload);
      resolve(payload);
    });
  });