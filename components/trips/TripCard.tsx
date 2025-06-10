import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Trip } from '@/lib/api/trips'; // ⚠️ Importar del API adaptado
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { formatters } from '@/lib/utils/formatters';

interface TripCardProps {
  trip: Trip;
  onPress: () => void;
  onBookPress: () => void;
}

export const TripCard: React.FC<TripCardProps> = ({
  trip,
  onPress,
  onBookPress
}) => {
  const iconColor = useThemeColor({}, 'icon');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');

  return (
    <TouchableOpacity onPress={onPress}>
      <Card style={styles.container}>
        <View style={styles.header}>
          <View style={styles.route}>
            <ThemedText style={styles.locationText}>{trip.origen.nombre}</ThemedText>
            <Ionicons name="arrow-forward" size={20} color={iconColor} />
            <ThemedText style={styles.locationText}>{trip.destino.nombre}</ThemedText>
          </View>
          <ThemedText style={[styles.priceText, { color: tintColor }]}>
            {formatters.currency(trip.precio)}
          </ThemedText>
        </View>

        <View style={styles.details}>
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={16} color={iconColor} />
            <ThemedText style={styles.detailText}>
              {formatters.date(trip.fecha, 'short')}
            </ThemedText>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={16} color={iconColor} />
            <ThemedText style={styles.detailText}>
              {formatters.time(trip.horaSalida)} - {formatters.time(trip.horaLlegada)}
            </ThemedText>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="bus-outline" size={16} color={iconColor} />
            <ThemedText style={styles.detailText}>
              {trip.omnibus.modelo} - {trip.omnibus.matricula}
            </ThemedText>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="person-outline" size={16} color={iconColor} />
            <ThemedText style={[
              styles.detailText,
              trip.asientosDisponibles < 5 && styles.lowSeats
            ]}>
              {trip.asientosDisponibles} asientos disponibles
            </ThemedText>
          </View>
        </View>

        <View style={styles.footer}>
          {trip.ventasCerradas ? (
            <ThemedText style={styles.closedText}>Ventas cerradas</ThemedText>
          ) : trip.asientosDisponibles === 0 ? (
            <ThemedText style={styles.soldOutText}>Agotado</ThemedText>
          ) : (
            <Button
              title="Reservar"
              onPress={onBookPress}
              size="medium"
              style={styles.bookButton}
            />
          )}
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  route: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  locationText: {
    fontSize: 18,
    fontWeight: '600',
    marginHorizontal: 8,
  },
  priceText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  details: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    marginLeft: 8,
  },
  lowSeats: {
    color: '#dc3545',
    fontWeight: '500',
  },
  footer: {
    alignItems: 'flex-end',
  },
  bookButton: {
    minWidth: 120,
  },
  closedText: {
    fontSize: 14,
    color: '#dc3545',
    fontWeight: '500',
  },
  soldOutText: {
    fontSize: 14,
    color: '#6c757d',
    fontWeight: '500',
  },
});