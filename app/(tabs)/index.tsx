import React, { useState, useEffect } from 'react';
import {
  FlatList,
  RefreshControl,
  TouchableOpacity,
  StyleSheet,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { TripCard } from '@/components/trips/TripCard';
import { Loading } from '@/components/ui/Loading';
import { EmptyState } from '@/components/ui/EmptyState';
import { ThemedView } from '@/components/ThemedView';
import { useTrips } from '@/hooks/useTrips';
import { Trip, TripSearchParams } from '@/lib/api/trips'; // ⚠️ Importar tipos adaptados
import { useThemeColor } from '@/hooks/useThemeColor';

export default function TripsScreen() {
  const { trips, isLoading, searchTrips } = useTrips();
  const [currentParams, setCurrentParams] = useState<TripSearchParams>({});
  const tintColor = useThemeColor({}, 'tint');

  useEffect(() => {
    // Cargar viajes al iniciar la pantalla
    searchTrips();
  }, []);

  const handleTripPress = (trip: Trip) => {
    router.push({
      pathname: '/trip/[id]',
      params: { id: trip.id.toString() } // ⚠️ Convertir a string
    });
  };

  const handleBookPress = (trip: Trip) => {
    router.push({
      pathname: '/purchase/[tripId]',
      params: { tripId: trip.id.toString() } // ⚠️ Convertir a string
    });
  };

  const handleRefresh = () => {
    searchTrips(currentParams);
  };

  const renderTrip = ({ item }: { item: Trip }) => (
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
      <ThemedView style={styles.header}>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => {/* TODO: Implementar modal de filtros */}}
        >
          <Ionicons name="filter" size={24} color={tintColor} />
        </TouchableOpacity>
      </ThemedView>

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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  filterButton: {
    padding: 8,
  },
  listContainer: {
    paddingVertical: 8,
  },
});