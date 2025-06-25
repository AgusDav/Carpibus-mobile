import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../api/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

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

  const login = async (credentials) => {
    try {
      setIsLoading(true);
      const response = await authService.login(credentials);

      // Guardar token
      await AsyncStorage.setItem('auth_token', response.token);

      // Crear objeto User desde la respuesta del backend
      const userData = {
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

  const register = async (userData) => {
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

  const logout = async () => {
    try {
      console.log('Iniciando logout...');

      // Primero limpiar el estado local
      setUser(null);

      // Luego limpiar el storage
      await AsyncStorage.multiRemove(['auth_token', 'user_data']);

      console.log('Logout completado');

      // También llamar al servicio de logout si existe
      await authService.logout();

    } catch (error) {
      console.error('Error logging out:', error);
      // Aunque haya error, asegurar que el estado se limpie
      setUser(null);
      try {
        await AsyncStorage.multiRemove(['auth_token', 'user_data']);
      } catch (storageError) {
        console.error('Error clearing storage:', storageError);
      }
    }
  };

  const updateUser = async (updatedUserData) => {
    try {
      // Actualizar el estado local
      setUser(updatedUserData);

      // Actualizar el storage
      await AsyncStorage.setItem('user_data', JSON.stringify(updatedUserData));
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        login,
        register,
        logout,
        updateUser,
      }}
    >
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