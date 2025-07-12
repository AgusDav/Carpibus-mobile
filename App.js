import React, { useEffect, useRef } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';

// Context
import { AuthProvider, useAuth } from './src/context/AuthContext';

// 🔥 IMPORTAR SessionManager
import SessionManager from './src/utils/SessionManager';

// 🔥 IMPORTAR Firebase Service y Navigation Service
import FirebaseService from './src/services/FirebaseService';
import { NavigationService } from './src/services/NavigationService';

// Screens
import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';
import ForgotPasswordScreen from './src/screens/auth/ForgotPasswordScreen';
import TripsScreen from './src/screens/TripsScreen';
import TicketsScreen from './src/screens/TicketsScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import TripDetailScreen from './src/screens/TripDetailScreen';
import PurchaseScreen from './src/screens/PurchaseScreen';
import ConfigurationScreen from './src/screens/ConfigurationScreen';
import HelpScreen from './src/screens/HelpScreen';
import AboutScreen from './src/screens/AboutScreen';
import PayPalNativePayment from './src/components/PayPalNativePayment';
import PayPalWebView from './src/components/PayPalWebView';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Viajes') {
            iconName = focused ? 'bus' : 'bus-outline';
          } else if (route.name === 'Mis Pasajes') {
            iconName = focused ? 'ticket' : 'ticket-outline';
          } else if (route.name === 'Perfil') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2c5530',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="Viajes"
        component={TripsScreen}
        options={{ title: 'Buscar Viajes' }}
      />
      <Tab.Screen
        name="Mis Pasajes"
        component={TicketsScreen}
        options={{ title: 'Mis Pasajes' }}
      />
      <Tab.Screen
        name="Perfil"
        component={ProfileScreen}
        options={{ title: 'Mi Perfil' }}
      />
    </Tab.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right'
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
}

function MainStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right'
      }}
    >
      <Stack.Screen name="Home" component={TabNavigator} />
      <Stack.Screen
        name="TripDetail"
        component={TripDetailScreen}
        options={{
          headerShown: true,
          title: 'Detalles del Viaje',
          headerStyle: { backgroundColor: '#2c5530' },
          headerTintColor: '#fff',
        }}
      />
      <Stack.Screen
        name="Purchase"
        component={PurchaseScreen}
        options={{
          headerShown: false,
          title: 'Comprar Pasaje'
        }}
      />
      <Stack.Screen
        name="PayPalNativePayment"
        component={PayPalNativePayment}
        options={{
          headerShown: false,
          title: 'Pago con PayPal',
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="Configuration"
        component={ConfigurationScreen}
        options={{
          headerShown: true,
          title: 'Configuración',
          headerStyle: { backgroundColor: '#2c5530' },
          headerTintColor: '#fff',
        }}
      />
      <Stack.Screen
        name="Help"
        component={HelpScreen}
        options={{
          headerShown: true,
          title: 'Ayuda',
          headerStyle: { backgroundColor: '#2c5530' },
          headerTintColor: '#fff',
        }}
      />
      <Stack.Screen
        name="About"
        component={AboutScreen}
        options={{
          headerShown: true,
          title: 'Acerca de',
          headerStyle: { backgroundColor: '#2c5530' },
          headerTintColor: '#fff',
        }}
      />
      <Stack.Screen
        name="PayPalWebView"
        component={PayPalWebView}
        options={{
          headerShown: false,
          gestureEnabled: false,
          title: 'Pago PayPal'
        }}
      />
    </Stack.Navigator>
  );
}

function AppNavigator() {
  const { isAuthenticated, loading, logout } = useAuth();
  const navigationRef = useRef();

  // 🔥 CONFIGURAR SessionManager Y Firebase CUANDO EL USUARIO ESTÉ AUTENTICADO
  useEffect(() => {
    if (isAuthenticated && navigationRef.current) {
      console.log('🔧 Configurando SessionManager globalmente...');

      // Configurar navegación
      SessionManager.setNavigation(navigationRef.current);
      NavigationService.setNavigator(navigationRef.current);

      // Configurar callback de logout personalizado
      SessionManager.setLogoutCallback(logout);

      // Iniciar verificación de sesión
      SessionManager.startSessionCheck();

      // 🔥 INICIALIZAR Firebase Service
      console.log('🔥 Inicializando Firebase Service...');
      FirebaseService.initialize();

      // Cleanup al desmontar o cuando cambie el estado de autenticación
      return () => {
        SessionManager.stopSessionCheck();
      };
    } else if (!isAuthenticated) {
      // Detener verificación si no está autenticado
      SessionManager.stopSessionCheck();

      // 🔥 LIMPIAR token FCM al hacer logout
      console.log('🗑️ Limpiando token FCM por logout...');
      FirebaseService.clearTokenFromBackend();
    }
  }, [isAuthenticated, logout]);

  // 🔥 EFECTO ADICIONAL PARA RE-REGISTRAR TOKEN DESPUÉS DEL LOGIN
  useEffect(() => {
    if (isAuthenticated) {
      // Dar tiempo para que se configure la autenticación
      const timer = setTimeout(() => {
        console.log('🔄 Re-registrando token FCM después del login...');
        FirebaseService.refreshToken();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isAuthenticated]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2c5530" />
      </View>
    );
  }

  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={() => {
        // 🔥 ASEGURAR QUE SessionManager Y NavigationService SE CONFIGUREN CUANDO LA NAVEGACIÓN ESTÉ LISTA
        if (isAuthenticated) {
          SessionManager.setNavigation(navigationRef.current);
          NavigationService.setNavigator(navigationRef.current);
          console.log('📱 Navegación lista, servicios configurados');
        }
      }}
    >
      {isAuthenticated ? <MainStack /> : <AuthStack />}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
});