import React from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Ticket } from '@/lib/types/ticket';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { formatters } from '@/lib/utils/formatters';

interface TicketCardProps {
  ticket: Ticket;
  onPress: () => void;
  onCancel?: (ticketId: string) => Promise<void>;
  showActions?: boolean;
}

export const TicketCard: React.FC<TicketCardProps> = ({
  ticket,
  onPress,
  onCancel,
  showActions = true,
}) => {
  const iconColor = useThemeColor({}, 'icon');
  const tintColor = useThemeColor({}, 'tint');

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'CANCELLED':
        return 'danger';
      case 'USED':
        return 'default';
      default:
        return 'info';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'Activo';
      case 'CANCELLED':
        return 'Cancelado';
      case 'USED':
        return 'Usado';
      default:
        return status;
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancelar Pasaje',
      '¿Estás seguro de que quieres cancelar este pasaje? Esta acción no se puede deshacer.',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Sí, cancelar',
          style: 'destructive',
          onPress: () => onCancel?.(ticket.id),
        },
      ]
    );
  };

  const canCancel = ticket.status === 'ACTIVE' &&
    new Date(ticket.trip.departureDate) > new Date();

  return (
    <TouchableOpacity onPress={onPress}>
      <Card style={styles.container}>
        <View style={styles.header}>
          <View style={styles.route}>
            <ThemedText style={styles.locationText}>{ticket.trip.originLocation.name}</ThemedText>
            <Ionicons name="arrow-forward" size={16} color={iconColor} />
            <ThemedText style={styles.locationText}>{ticket.trip.destinationLocation.name}</ThemedText>
          </View>
          <Badge
            text={getStatusText(ticket.status)}
            variant={getStatusVariant(ticket.status)}
          />
        </View>

        <View style={styles.passengerInfo}>
          <ThemedText style={styles.passengerName}>
            {ticket.passenger.firstName} {ticket.passenger.lastName}
          </ThemedText>
          <ThemedText style={styles.documentText}>Doc: {ticket.passenger.documentNumber}</ThemedText>
        </View>

        <View style={styles.details}>
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={16} color={iconColor} />
            <ThemedText style={styles.detailText}>
              {formatters.date(ticket.trip.departureDate, 'long')}
            </ThemedText>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={16} color={iconColor} />
            <ThemedText style={styles.detailText}>
              {formatters.time(ticket.trip.departureTime)} - {formatters.time(ticket.trip.arrivalTime)}
            </ThemedText>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="airplane-outline" size={16} color={iconColor} />
            <ThemedText style={styles.detailText}>Asiento {ticket.seatNumber}</ThemedText>
          </View>

          <View style={styles.priceRow}>
            <View>
              {ticket.discountApplied && (
                <ThemedText style={styles.originalPrice}>
                  {formatters.currency(ticket.originalPrice)}
                </ThemedText>
              )}
              <ThemedText style={[styles.finalPrice, { color: tintColor }]}>
                {formatters.currency(ticket.finalPrice)}
              </ThemedText>
            </View>
            {ticket.discountApplied && (
              <ThemedText style={styles.discountText}>
                {ticket.discountApplied.name} (-{ticket.discountApplied.percentage}%)
              </ThemedText>
            )}
          </View>
        </View>

        {showActions && canCancel && onCancel && (
          <View style={styles.actions}>
            <Button
              title="Cancelar"
              onPress={handleCancel}
              variant="danger"
              size="small"
              style={styles.cancelButton}
            />
          </View>
        )}
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
    marginBottom: 12,
  },
  route: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  locationText: {
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 4,
  },
  passengerInfo: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  passengerName: {
    fontSize: 16,
    fontWeight: '600',
  },
  documentText: {
    fontSize: 14,
    marginTop: 2,
  },
  details: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    fontSize: 14,
    marginLeft: 8,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  originalPrice: {
    fontSize: 14,
    textDecorationLine: 'line-through',
  },
  finalPrice: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  discountText: {
    fontSize: 12,
    color: '#28a745',
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cancelButton: {
    minWidth: 100,
  },
});