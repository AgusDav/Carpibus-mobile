import React, { useState, useEffect } from 'react';
import {
  FlatList,
  RefreshControl,
  Alert,
  StyleSheet,
  TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Loading } from '@/components/ui/Loading';
import { EmptyState } from '@/components/ui/EmptyState';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useTickets } from '@/hooks/useTickets';
import { Ticket } from '@/lib/api/tickets';
import { ThemedText } from '@/components/ThemedText';

export default function TicketsScreen() {
  const {
    tickets,
    isLoading,
    fetchTickets
  } = useTickets();

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleTicketPress = (ticket: Ticket) => {
    // TODO: Implementar detalle del ticket si es necesario
    Alert.alert(
      'Detalle del Pasaje',
      `Viaje: ${ticket.origenViaje} → ${ticket.destinoViaje}\nAsiento: ${ticket.numeroAsiento}\nEstado: ${ticket.estado}`
    );
  };

  const handleRefresh = () => {
    fetchTickets();
  };

  const handleGoToTrips = () => {
    router.push('/(tabs)/');
  };

  const renderTicket = ({ item }: { item: Ticket }) => (
    // TODO: Crear TicketCard adaptado al backend real
    <TouchableOpacity onPress={() => handleTicketPress(item)}>
      <Card style={styles.ticketCard}>
        <ThemedText style={styles.ticketRoute}>
          {item.origenViaje} → {item.destinoViaje}
        </ThemedText>
        <ThemedText style={styles.ticketDetails}>
          Fecha: {item.fechaViaje} | Asiento: {item.numeroAsiento}
        </ThemedText>
        <ThemedText style={styles.ticketPrice}>
          ${item.precio}
        </ThemedText>
        <Badge
          text={item.estado}
          variant={item.estado === 'VENDIDO' ? 'success' : item.estado === 'CANCELADO' ? 'danger' : 'default'}
        />
      </Card>
    </TouchableOpacity>
  );

  if (isLoading && tickets.length === 0) {
    return <Loading text="Cargando tus pasajes..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={tickets}
        renderItem={renderTicket}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />
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
  listContainer: {
    padding: 16,
  },
  ticketCard: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
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