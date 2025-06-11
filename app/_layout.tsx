import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { AuthProvider } from '@/lib/context/AuthContext';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        {/* Pantalla inicial que maneja la redirección */}
        <Stack.Screen name="index" />

        {/* Pantallas de autenticación */}
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

        {/* Pantallas principales */}
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
        {/* Pantalla 404 */}
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