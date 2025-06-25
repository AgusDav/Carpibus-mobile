import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
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
    navigation.navigate('Purchase', { tripId: trip.id });
  };

  const handleRefresh = () => {
    searchTrips(currentParams);
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
  filterButton: {
    padding: 8,
  },
  listContainer: {
    padding: 16,
  },
});