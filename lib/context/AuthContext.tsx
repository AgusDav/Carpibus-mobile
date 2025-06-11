import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, LoginRequest, RegisterRequest, authService } from '../api/auth';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ✅ LÍNEA CORREGIDA
  const isAuthenticated = !!user;

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const userData = await AsyncStorage.getItem('user_data');

      if (token && userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      await AsyncStorage.multiRemove(['auth_token', 'user_data']);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginRequest) => {
    try {
      setIsLoading(true);
      const response = await authService.login(credentials);

      // Guardar token
      await AsyncStorage.setItem('auth_token', response.token);

      // Crear objeto User desde la respuesta del backend
      const userData: User = {
        id: response.id,
        email: response.email,
        nombre: response.nombre,
        apellido: response.apellido,
        ci: response.ci,
        telefono: response.telefono,
        fechaNac: response.fechaNac,
        rol: response.rol,
        tipoCliente: response.tipoCliente
      };

      // Guardar datos del usuario
      await AsyncStorage.setItem('user_data', JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterRequest) => {
    try {
      setIsLoading(true);
      await authService.register(userData);

      // Después del registro exitoso, hacer login automáticamente
      await login({
        email: userData.email,
        contrasenia: userData.contrasenia
      });
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ LOGOUT CORREGIDO
  const logout = async () => {
    try {
      // Primero limpiar el estado local
      setUser(null);

      // Luego limpiar el storage
      await AsyncStorage.multiRemove(['auth_token', 'user_data']);

      // Llamar al servicio de logout si existe
      await authService.logout();

      console.log('Logout completado exitosamente');
    } catch (error) {
      console.error('Error during logout:', error);
      // Asegurar limpieza local aunque falle el servicio
      setUser(null);
      await AsyncStorage.multiRemove(['auth_token', 'user_data']);
    }
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    AsyncStorage.setItem('user_data', JSON.stringify(updatedUser));
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};