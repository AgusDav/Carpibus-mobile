import { Redirect } from 'expo-router';
import { useAuth } from '@/lib/context/AuthContext';
import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();

  // Agrega logs para debug
  useEffect(() => {
    console.log('Index - isAuthenticated:', isAuthenticated, 'isLoading:', isLoading);
  }, [isAuthenticated, isLoading]);

  // Mostrar loading mientras se verifica el estado de autenticación
  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  // Redirigir según el estado de autenticación
  if (isAuthenticated) {
    // Si está autenticado, ir a las tabs principales
    return <Redirect href="/(tabs)" />;
  } else {
    // Si no está autenticado, ir al login
    return <Redirect href="/(auth)/login" />;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});