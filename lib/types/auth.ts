export interface User {
  id: number;
  email: string;
  nombre: string;        // ✅ Cambiar de firstName a nombre
  apellido: string;      // ✅ Cambiar de lastName a apellido
  ci: string;
  telefono: string;      // ✅ Cambiar de phone a telefono
  fechaNac: string;      // ✅ Agregar campo del backend
  rol: string;           // ✅ Cambiar de userType a rol
  tipoCliente?: string;  // ✅ Agregar campo opcional del backend
}

export interface LoginRequest {
  email: string;
  contrasenia: string;   // ✅ Cambiar de password a contrasenia
}

export interface LoginResponse {
  user: User;
  token: string;
  refreshToken?: string;
}

export interface RegisterRequest {
  email: string;
  contrasenia: string;   // ✅ Cambiar de password a contrasenia
  nombre: string;        // ✅ Cambiar de firstName a nombre
  apellido: string;      // ✅ Cambiar de lastName a apellido
  telefono?: number;     // ✅ Cambiar de phone a telefono
  ci: number;            // ✅ Agregar campo obligatorio
  fechaNac: string;      // ✅ Agregar campo obligatorio
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}