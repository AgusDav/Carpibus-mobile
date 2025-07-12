import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://web-production-2443c.up.railway.app';

class ApiClient {
  async get(endpoint, requiresAuth = false) {
    return this.request(endpoint, 'GET', null, requiresAuth);
  }

  async post(endpoint, data, requiresAuth = false) {
    return this.request(endpoint, 'POST', data, requiresAuth);
  }

  async put(endpoint, data, requiresAuth = false) {
    return this.request(endpoint, 'PUT', data, requiresAuth);
  }

  async delete(endpoint, requiresAuth = false) {
    return this.request(endpoint, 'DELETE', null, requiresAuth);
  }

  async request(endpoint, method, data, requiresAuth) {
    const url = `${BASE_URL}${endpoint}`;

    const headers = {
      'Content-Type': 'application/json',
    };

    // Agregar token de autenticación si es requerido
    if (requiresAuth) {
      const token = await AsyncStorage.getItem('auth_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    const config = {
      method,
      headers,
    };

    if (data && (method === 'POST' || method === 'PUT')) {
      config.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, config);

      // Verificar si la respuesta es exitosa
      if (!response.ok) {
        if (response.status === 401) {
          // Token expirado o inválido
          await AsyncStorage.multiRemove(['auth_token', 'user_data']);
          throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
        }

        const errorData = await response.text();
        let errorMessage = 'Error en la solicitud';

        try {
          const parsedError = JSON.parse(errorData);
          errorMessage = parsedError.message || parsedError.error || errorMessage;
        } catch {
          errorMessage = errorData || errorMessage;
        }

        throw new Error(errorMessage);
      }

      // Intentar parsear como JSON
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      } else {
        // Si no es JSON, devolver texto
        return await response.text();
      }
    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('Network request failed')) {
        throw new Error('Error de conexión. Verifica tu conexión a internet.');
      }
      throw error;
    }
  }

    async updateFCMToken(token) {
        return this.put('/api/cliente/fcm-token', { token }, true);
    }

    async clearFCMToken() {
        return this.delete('/api/cliente/fcm-token', true);
    }
}

export const apiClient = new ApiClient();