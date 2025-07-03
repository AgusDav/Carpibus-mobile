// App.js - Navegación actualizada para PayPal
import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';

// Context
import { AuthProvider, useAuth } from './src/context/AuthContext';

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
          gestureEnabled: false, // Evitar que el usuario pueda volver con gestos durante el pago
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
    </Stack.Navigator>
  );
}

function AppNavigator() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2c5530" />
      </View>
    );
  }

  return (
    <NavigationContainer>
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