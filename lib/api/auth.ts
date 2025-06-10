import { apiClient } from './client';

// Tipos basados en el backend real
export interface LoginRequest {
  email: string;
  contrasenia: string; // ⚠️ Nota: el backend usa "contrasenia", no "password"
}

export interface RegisterRequest {
  nombre: string;
  apellido: string;
  ci: number;
  contrasenia: string;
  email: string;
  telefono?: number;
  fechaNac: string; // Formato: "YYYY-MM-DD"
}

export interface AuthResponse {
  token: string;
  id: number;
  email: string;
  rol: string; // "CLIENTE", "VENDEDOR", "ADMINISTRADOR"
  nombre: string;
  apellido: string;
  ci: string;
  telefono: string;
  fechaNac: string;
  tipoCliente?: string; // Solo para clientes
}

export interface User {
  id: number;
  email: string;
  nombre: string;
  apellido: string;
  ci: string;
  telefono: string;
  fechaNac: string;
  rol: string;
  tipoCliente?: string;
}

export const authService = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/api/auth/login', credentials, false);
    return response;
  },

  async register(userData: RegisterRequest): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>('/api/auth/register', userData, false);
    return response;
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>('/api/auth/forgot-password', { email }, false);
    return response;
  },

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>('/api/auth/reset-password', {
      token,
      newPassword
    }, false);
    return response;
  },

  // ⚠️ Nota: No hay endpoint específico para obtener usuario actual
  // Usaremos los datos del login guardados en AsyncStorage
  async getCurrentUser(): Promise<User | null> {
    try {
      const userData = await AsyncStorage.getItem('user_data');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },

  async logout(): Promise<void> {
    // El backend no tiene endpoint de logout, solo limpiamos el storage local
    await AsyncStorage.multiRemove(['auth_token', 'user_data']);
  }
};