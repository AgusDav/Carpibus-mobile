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
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../context/AuthContext';
import { ticketsService } from '../api/tickets';
import EmptyState from '../components/EmptyState';
import Loading from '../components/Loading';

export default function TicketsScreen({ navigation }) {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadTickets();
    }
  }, [user]);

  const loadTickets = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      const userTickets = await ticketsService.getUserTickets(user.id);
      setTickets(userTickets || []);
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

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-UY', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  const formatTime = (timeString) => {
    try {
      // Asumiendo que viene en formato HH:mm:ss
      return timeString?.substring(0, 5) || '';
    } catch (error) {
      return timeString || '';
    }
  };

  const getStatusColor = (estado) => {
    switch (estado) {
      case 'VENDIDO':
        return '#10b981'; // Verde
      case 'DEVUELTO':
        return '#ef4444'; // Rojo
      case 'RESERVADO':
        return '#f59e0b'; // Amarillo
      default:
        return '#6b7280'; // Gris
    }
  };

  const getStatusText = (estado) => {
    switch (estado) {
      case 'VENDIDO':
        return 'Confirmado';
      case 'DEVUELTO':
        return 'Devuelto';
      case 'RESERVADO':
        return 'Reservado';
      default:
        return estado;
    }
  };

  const renderTicket = ({ item }) => (
    <TouchableOpacity style={styles.ticketCard}>
      <View style={styles.ticketHeader}>
        <Text style={styles.ticketRoute}>
          {item.origenViaje} → {item.destinoViaje}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.estado) }]}>
          <Text style={styles.statusText}>{getStatusText(item.estado)}</Text>
        </View>
      </View>

      <View style={styles.ticketDetails}>
        <View style={styles.detailRow}>
          <Icon name="calendar-outline" size={16} color="#666" />
          <Text style={styles.detailText}>
            {formatDate(item.fechaViaje)} - {formatTime(item.horaViaje)}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Icon name="person-outline" size={16} color="#666" />
          <Text style={styles.detailText}>
            Asiento: {item.numeroAsiento}
          </Text>
        </View>

        {item.omnibusPatente && (
          <View style={styles.detailRow}>
            <Icon name="bus-outline" size={16} color="#666" />
            <Text style={styles.detailText}>
              Ómnibus: {item.omnibusPatente}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.ticketFooter}>
        <Text style={styles.ticketPrice}>${item.precio}</Text>
        {item.fechaCompra && (
          <Text style={styles.purchaseDate}>
            Comprado: {formatDate(item.fechaCompra)}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  if (isLoading && tickets.length === 0) {
    return <Loading text="Cargando pasajes..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mis Pasajes</Text>
        <TouchableOpacity onPress={loadTickets} disabled={isLoading}>
          <Icon
            name="refresh"
            size={24}
            color={isLoading ? "#ccc" : "#2563eb"}
          />
        </TouchableOpacity>
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
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  ticketRoute: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  ticketDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  ticketFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  ticketPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2563eb',
  },
  purchaseDate: {
    fontSize: 12,
    color: '#999',
  },
});