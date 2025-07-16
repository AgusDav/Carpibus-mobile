import { apiClient } from './client';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const authService = {
  async login(credentials) {
    const response = await apiClient.post('/api/auth/login', credentials, false);
    return response;
  },

  async register(userData) {
    const response = await apiClient.post('/api/auth/register', userData, false);
    return response;
  },

  async forgotPassword(email) {
    const response = await apiClient.post('/api/auth/forgot-password', { email }, false);
    return response;
  },

  async resetPassword(token, newPassword) {
    const response = await apiClient.post('/api/auth/reset-password', {
      token,
      newPassword
    }, false);
    return response;
  },

  async getCurrentUser() {
    try {
      const userData = await AsyncStorage.getItem('user_data');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },

  async logout() {
    // El backend no tiene endpoint de logout, solo limpiamos el storage local
    await AsyncStorage.multiRemove(['auth_token', 'user_data']);
  }
};