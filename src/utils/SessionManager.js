// src/utils/SessionManager.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

class SessionManager {
  constructor() {
    this.checkInterval = null;
    this.navigation = null;
    this.logoutCallback = null;
    this.isCheckingExpiration = false;
    this.hasShownExpirationAlert = false;
  }

  // 🔥 CONFIGURAR NAVEGACIÓN
  setNavigation(navigation) {
    this.navigation = navigation;
    console.log('🔧 Navegación configurada en SessionManager');
  }

  // 🔥 CONFIGURAR CALLBACK DE LOGOUT DEL CONTEXT
  setLogoutCallback(logoutFunction) {
    this.logoutCallback = logoutFunction;
    console.log('🔧 Callback de logout configurado');
  }

  async isTokenExpired() {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (!token) return true;

      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;

      return payload.exp < currentTime;
    } catch (error) {
      console.error('Error verificando expiración del token:', error);
      return true;
    }
  }

  // 🔥 LOGOUT MEJORADO QUE USA EL CONTEXT
  async performLogout() {
    try {
      console.log('🚪 Realizando logout por expiración de sesión...');

      // Resetear flags
      this.hasShownExpirationAlert = false;
      this.stopSessionCheck();

      // 🔥 USAR EL LOGOUT DEL CONTEXT SI ESTÁ DISPONIBLE
      if (this.logoutCallback) {
        console.log('📞 Llamando logout del AuthContext...');
        this.logoutCallback();
      } else {
        // Fallback: limpiar tokens manualmente
        console.log('🔄 Fallback: limpiando tokens manualmente...');
        await AsyncStorage.multiRemove(['auth_token', 'user_data']);

        // Navegar al login si tenemos navegación
        if (this.navigation) {
          this.navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          });
        }
      }
    } catch (error) {
      console.error('Error durante logout:', error);
    }
  }

  showSessionExpiredAlert() {
    if (this.hasShownExpirationAlert) return;

    this.hasShownExpirationAlert = true;

    Alert.alert(
      '⏰ Sesión Expirada',
      'Tu sesión ha expirado. Por favor inicia sesión nuevamente.',
      [
        {
          text: 'Iniciar Sesión',
          onPress: () => {
            this.performLogout();
          },
          style: 'default'
        }
      ],
      {
        cancelable: false
      }
    );
  }

  async checkSessionStatus() {
    if (this.isCheckingExpiration) return;

    try {
      this.isCheckingExpiration = true;

      const isExpired = await this.isTokenExpired();

      if (isExpired) {
        console.log('❌ Token expirado detectado en verificación periódica');
        this.showSessionExpiredAlert();
      }
    } catch (error) {
      console.error('Error verificando estado de sesión:', error);
    } finally {
      this.isCheckingExpiration = false;
    }
  }

  startSessionCheck() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    console.log('🔄 Iniciando verificación de sesión cada 15 segundos...');

    // Verificar inmediatamente
    this.checkSessionStatus();

    // Verificar cada 15 segundos
    this.checkInterval = setInterval(() => {
      this.checkSessionStatus();
    }, 15000);
  }

  stopSessionCheck() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
      console.log('⏹️ Verificación de sesión detenida');
    }
  }

  // 🔥 INTERCEPTOR PARA RESPUESTAS DE API (403 Y 401)
  handleApiResponse(response) {
    return response.json().then(data => {
      // Manejar errores de autenticación
      if (response.status === 403 || response.status === 401) {
        const errorMessage = data.error || data.message || '';
        const isTokenError =
          errorMessage.includes('TOKEN_EXPIRED') ||
          errorMessage.includes('expirado') ||
          errorMessage.includes('expired') ||
          errorMessage.includes('Forbidden') ||
          response.status === 403; // Asumir que 403 = token expirado

        if (isTokenError) {
          console.log(`❌ Token expirado detectado en respuesta ${response.status}`);
          this.showSessionExpiredAlert();
          return Promise.reject(new Error('TOKEN_EXPIRED'));
        }
      }

      if (!response.ok) {
        return Promise.reject(new Error(data.message || 'Error en la petición'));
      }

      return data;
    }).catch(error => {
      // Si no se puede parsear como JSON, manejar el error de estado
      if (response.status === 403 || response.status === 401) {
        console.log(`❌ Token expirado detectado en respuesta ${response.status} (sin JSON)`);
        this.showSessionExpiredAlert();
        return Promise.reject(new Error('TOKEN_EXPIRED'));
      }
      throw error;
    });
  }

  // 🔥 VERIFICAR ANTES DE OPERACIONES CRÍTICAS
  async verifySessionBeforeAction(actionName = 'acción') {
    const isExpired = await this.isTokenExpired();
    if (isExpired) {
      console.log(`❌ Token expirado antes de ${actionName}`);
      this.showSessionExpiredAlert();
      return false;
    }
    return true;
  }

  async debugTokenInfo() {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (!token) {
        console.log('❌ No hay token almacenado');
        return;
      }

      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      const timeRemaining = (payload.exp - currentTime) * 1000;

      console.log('🔍 DEBUG TOKEN:');
      console.log(`   Usuario: ${payload.nombre || payload.sub}`);
      console.log(`   Emitido: ${new Date(payload.iat * 1000).toLocaleString()}`);
      console.log(`   Expira: ${new Date(payload.exp * 1000).toLocaleString()}`);
      console.log(`   Tiempo restante: ${Math.round(timeRemaining / 60000)} minutos`);
      console.log(`   Estado: ${timeRemaining > 0 ? '✅ Válido' : '❌ Expirado'}`);

      // También mostrar en alerta para debug visual
      if (__DEV__) {
        Alert.alert(
          '🔍 Debug Token',
          `Usuario: ${payload.nombre || payload.sub}\n` +
          `Expira: ${new Date(payload.exp * 1000).toLocaleString()}\n` +
          `Tiempo restante: ${Math.round(timeRemaining / 60000)} min\n` +
          `Estado: ${timeRemaining > 0 ? '✅ Válido' : '❌ Expirado'}`
        );
      }
    } catch (error) {
      console.error('Error en debug token:', error);
    }
  }
}

export default new SessionManager();