import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { tripsService } from '../api/trips';
import { globalStyles } from '../styles/globalStyles';
import { useTheme } from '../hooks/useTheme';

// Componentes
import TripCard from '../components/TripCard';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';

export default function TripsScreen({ navigation }) {
  const [trips, setTrips] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentParams, setCurrentParams] = useState({});
  const theme = useTheme();

  useEffect(() => {
    // Cargar viajes al iniciar la pantalla
    searchTrips();

    // DEBUG: Imprimir JWT y datos de usuario
    debugAuth();
  }, []);

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
          console.log('📄 PAYLOAD:', JSON.stringify(payload, null, 2));
        } catch (error) {
          console.error('Error al decodificar JWT:', error);
        }
      }
    } catch (error) {
      console.error('Error en debugAuth:', error);
    }
  };

  const searchTrips = async () => {
    try {
      setIsLoading(true);
      const response = await tripsService.searchTrips(currentParams);
      setTrips(response || []);
    } catch (error) {
      console.error('Error al buscar viajes:', error);
      Alert.alert('Error', 'No se pudieron cargar los viajes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    searchTrips();
  };

  const handleTripPress = (trip) => {
    navigation.navigate('TripDetail', { tripId: trip.id });
  };

  const handleBookPress = (trip) => {
    navigation.navigate('Purchase', { tripId: trip.id });
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
    <SafeAreaView style={globalStyles.safeArea}>
      {/* Header */}
      <View style={[globalStyles.header, globalStyles.row, globalStyles.spaceBetween]}>
        <Text style={globalStyles.headerTitle}>Viajes Disponibles</Text>
        <TouchableOpacity
          style={localStyles.filterButton}
          onPress={() => {/* TODO: Implementar modal de filtros */}}
        >
          <Icon name="filter" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Lista de viajes */}
      <FlatList
        data={trips}
        renderItem={renderTrip}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={globalStyles.screenPadding}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState
              icon="bus-outline"
              title="No hay viajes disponibles"
              description="No se encontraron viajes. Intenta actualizar o cambiar los filtros."
            />
          ) : null
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

// Estilos locales específicos
const localStyles = {
  filterButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 123, 255, 0.1)',
  },
};