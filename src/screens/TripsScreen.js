import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  SafeAreaView,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { tripsService } from '../api/trips';

// Componentes
import TripCard from '../components/TripCard';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';

export default function TripsScreen({ navigation }) {
  const [trips, setTrips] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentParams, setCurrentParams] = useState({});

  useEffect(() => {
    // Cargar viajes al iniciar la pantalla
    searchTrips();

    // DEBUG: Imprimir JWT y datos de usuario
    const debugAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('auth_token');
        const userData = await AsyncStorage.getItem('user_data');

        console.log('=== DEBUG AUTH DATA EN TRIPS SCREEN ===');
        console.log('JWT Token:', token);
        console.log('User Data from AsyncStorage:', userData);

        if (token) {
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            console.log('=== JWT PAYLOAD DECODIFICADO ===');
            console.log(JSON.stringify(payload, null, 2));
            console.log('Token expira:', new Date(payload.exp * 1000).toLocaleString());
            console.log('Authorities:', payload.authorities);
            console.log('User ID:', payload.userId);
            console.log('Nombre:', payload.nombre);
          } catch (e) {
            console.log('Error decodificando JWT:', e);
          }
        } else {
          console.log('❌ NO HAY TOKEN EN ASYNCSTORAGE');
        }
      } catch (error) {
        console.error('Error en debug auth:', error);
      }
    };

    debugAuth();
  }, []);

  const searchTrips = async (params = {}) => {
    try {
      setIsLoading(true);
      setCurrentParams(params);
      const results = await tripsService.searchTrips(params);
      setTrips(results || []);
    } catch (error) {
      console.error('Error searching trips:', error);
      setTrips([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTripPress = (trip) => {
    navigation.navigate('TripDetail', { tripId: trip.id });
  };

  const handleBookPress = (trip) => {
    // ✅ CAMBIO PRINCIPAL: Pasar tanto tripId como tripData
    navigation.navigate('Purchase', {
      tripId: trip.id,
      tripData: trip  // ← Esto es lo que necesitaba agregar
    });
  };

  const handleRefresh = () => {
    searchTrips(currentParams);
  };

  // Función de debug manual
  const debugJWT = async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const userData = await AsyncStorage.getItem('user_data');

      console.log('🔑 TOKEN COMPLETO:', token);
      console.log('👤 USER DATA:', userData);

      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('📄 PAYLOAD:', JSON.stringify(payload, null, 2));

        Alert.alert('JWT Info', `
            Usuario: ${payload.nombre}
            ID: ${payload.userId}
            Rol: ${payload.authorities?.[0]}
            Expira: ${new Date(payload.exp * 1000).toLocaleString()}
        `.trim());
      } else {
        Alert.alert('Error', 'No se encontró token JWT');
      }
    } catch (error) {
      console.error('Error en debugJWT:', error);
      Alert.alert('Error', 'Error al leer JWT: ' + error.message);
    }
  };

  const renderTrip = ({ item }) => (
    <TripCard
      trip={item}
      onPress={() => handleTripPress(item)}
      onBookPress={() => handleBookPress(item)}
    />
  );

  if (isLoading && trips.length === 0) {
    return <Loading text="Cargando viajes..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Viajes Disponibles</Text>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => {/* TODO: Implementar modal de filtros */}}
        >
          <Icon name="filter" size={24} color="#2563eb" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={trips}
        renderItem={renderTrip}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState
              icon="bus-outline"
              title="No hay viajes disponibles"
              description="No se encontraron viajes. Intenta actualizar o cambiar los filtros."
              actionTitle="Actualizar"
              onAction={handleRefresh}
            />
          ) : null
        }
      />

      {/* Botón de debug flotante en la esquina inferior */}
      <TouchableOpacity
        style={styles.debugButtonFloat}
        onPress={debugJWT}
      >
        <Text style={styles.debugButtonText}>🔍</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  debugButton: {
    backgroundColor: '#ff6b6b',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  debugButtonTop: {
    backgroundColor: '#ff6b6b',
    padding: 12,
    borderRadius: 8,
    margin: 16,
    alignItems: 'center',
  },
  debugButtonFloat: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#ff6b6b',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  debugButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 16,
  },
});