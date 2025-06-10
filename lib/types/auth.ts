export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  documentNumber: string;
  userType: 'CLIENTE' | 'VENDEDOR' | 'ADMINISTRADOR';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  refreshToken?: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  documentNumber: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}