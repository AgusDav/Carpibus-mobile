import { apiClient } from './client';

export interface UpdateProfileRequest {
  nombre: string;
  apellido: string;
  email: string;
  telefono?: number;
}

export const usersService = {
  async updateProfile(profileData: UpdateProfileRequest): Promise<User> {
    const response = await apiClient.put<User>('/api/user/profile', profileData, true);
    return response;
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    const response = await apiClient.put<{ message: string }>(
      '/api/user/password',
      {
        currentPassword,
        newPassword
      },
      true
    );
    return response;
  }
};