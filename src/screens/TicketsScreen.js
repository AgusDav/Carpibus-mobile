import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import EmptyState from '../components/EmptyState';
import Loading from '../components/Loading';

export default function TicketsScreen({ navigation }) {
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      setIsLoading(true);
      // TODO: Implementar llamada al API para obtener pasajes del usuario
      // const userTickets = await ticketsService.getUserTickets();
      // setTickets(userTickets);
      setTickets([]); // Temporal - lista vacía
    } catch (error) {
      console.error('Error loading tickets:', error);
      setTickets([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToTrips = () => {
    navigation.navigate('Viajes');
  };

  const renderTicket = ({ item }) => (
    <TouchableOpacity style={styles.ticketCard}>
      <Text style={styles.ticketRoute}>
        {item.origen} → {item.destino}
      </Text>
      <Text style={styles.ticketDetails}>
        {item.fecha} - {item.hora}
      </Text>
      <Text style={styles.ticketDetails}>
        Asiento: {item.asiento} | Ómnibus: {item.omnibus}
      </Text>
      <Text style={styles.ticketPrice}>${item.precio}</Text>
    </TouchableOpacity>
  );

  if (isLoading && tickets.length === 0) {
    return <Loading text="Cargando pasajes..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mis Pasajes</Text>
      </View>

      <FlatList
        data={tickets}
        renderItem={renderTicket}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={loadTickets} />
        }
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState
              icon="ticket-outline"
              title="No tienes pasajes"
              description="Aún no has comprado ningún pasaje. ¡Explora nuestros viajes disponibles!"
              actionTitle="Ver Viajes"
              onAction={handleGoToTrips}
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
  listContainer: {
    padding: 16,
  },
  ticketCard: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  ticketRoute: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#000',
  },
  ticketDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  ticketPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2563eb',
    marginBottom: 8,
  },
});