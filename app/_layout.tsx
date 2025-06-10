import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { AuthProvider, useAuth } from '@/lib/context/AuthContext';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { isAuthenticated, isLoading } = useAuth();

  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded && !isLoading) {
      SplashScreen.hideAsync();
    }
  }, [loaded, isLoading]);

  if (!loaded || isLoading) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          // Pantallas de autenticación - cuando no está logueado
          <>
            <Stack.Screen name="(auth)/login" />
            <Stack.Screen name="(auth)/register" />
            <Stack.Screen
              name="(auth)/forgot-password"
              options={{
                headerShown: true,
                title: 'Recuperar Contraseña',
                headerBackTitleVisible: false,
              }}
            />
          </>
        ) : (
          // Pantallas principales - cuando está logueado
          <>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen
              name="trip/[id]"
              options={{
                headerShown: true,
                title: 'Detalle del Viaje',
                headerBackTitleVisible: false,
              }}
            />
            <Stack.Screen
              name="purchase/[tripId]"
              options={{
                headerShown: true,
                title: 'Comprar Pasaje',
                headerBackTitleVisible: false,
              }}
            />
            <Stack.Screen
              name="profile/edit"
              options={{
                headerShown: true,
                title: 'Editar Perfil',
                headerBackTitleVisible: false,
              }}
            />
            <Stack.Screen
              name="profile/change-password"
              options={{
                headerShown: true,
                title: 'Cambiar Contraseña',
                headerBackTitleVisible: false,
              }}
            />
          </>
        )}
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}