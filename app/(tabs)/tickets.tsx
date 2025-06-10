import React, { useState, useEffect } from 'react';
import {
  FlatList,
  RefreshControl,
  Alert,
  StyleSheet
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Loading } from '@/components/ui/Loading';
import { EmptyState } from '@/components/ui/EmptyState';
import { useTickets } from '@/hooks/useTickets';
import { Ticket } from '@/lib/api/tickets';

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