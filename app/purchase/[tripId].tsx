import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  Alert,
  StyleSheet
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Loading } from '@/components/ui/Loading';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useTickets } from '@/hooks/useTickets';
import { usePayPal } from '@/hooks/usePayPal';
import { useAuth } from '@/lib/context/AuthContext';
import { tripsService } from '@/lib/api/trips';
import { formatters } from '@/lib/utils/formatters';

export default function PurchaseScreen() {
  const { tripId } = useLocalSearchParams<{ tripId: string }>();
  const { user } = useAuth();
  const { purchaseTicket } = useTickets();
  const { createOrder, captureOrder } = usePayPal();

  const [tripDetail, setTripDetail] = useState<any>(null);
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);

  useEffect(() => {
    if (tripId) {
      fetchTripDetail(parseInt(tripId));
    }
  }, [tripId]);

  const fetchTripDetail = async (id: number) => {
    try {
      setIsLoading(true);
      const data = await tripsService.getTripById(id);
      setTripDetail(data);
    } catch (error: any) {
      Alert.alert('Error', 'No se pudo cargar el viaje');
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  const handleSeatSelect = (seatNumber: number) => {
    setSelectedSeat(seatNumber);
  };

  const handlePurchase = async () => {
    if (!tripDetail || !selectedSeat || !user) {
      Alert.alert('Error', 'Datos incompletos para la compra');
      return;
    }

    try {
      setIsPurchasing(true);

      // 1. Crear orden en PayPal
      const paypalOrder = await createOrder(tripDetail.viaje.precio);

      // 2. Aquí normalmente abrirías PayPal WebView
      // Por simplicidad, simulamos aprobación automática

      // 3. Capturar pago
      const captureResult = await captureOrder(paypalOrder.id);

      if (captureResult.status === 'COMPLETED') {
        // 4. Comprar el pasaje en nuestro backend
        const purchaseData = {
          viajeId: parseInt(tripId!),
          clienteId: user.id,
          numeroAsiento: selectedSeat
        };

        const ticket = await purchaseTicket(purchaseData);

        Alert.alert(
          'Compra Exitosa',
          `Tu pasaje ha sido comprado correctamente.\nAsiento: ${selectedSeat}\nTotal: ${formatters.currency(tripDetail.viaje.precio)}`,
          [
            {
              text: 'Ver Mis Pasajes',
              onPress: () => router.replace('/(tabs)/tickets'),
            },
          ]
        );
      }
    } catch (error: any) {
      Alert.alert('Error de Compra', error.message || 'No se pudo procesar la compra');
    } finally {
      setIsPurchasing(false);
    }
  };

  if (isLoading) {
    return <Loading text="Cargando información del viaje..." />;
  }

  if (!tripDetail) {
    return null;
  }

  const viaje = tripDetail.viaje;
  const asientosDisponibles = tripDetail.asientosDisponibles || [];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Card style={styles.tripCard}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Resumen del Viaje</ThemedText>

          <ThemedView style={styles.tripInfo}>
            <ThemedText style={styles.routeText}>
              {viaje.origen.nombre} → {viaje.destino.nombre}
            </ThemedText>
            <ThemedText style={styles.dateText}>
              {formatters.date(viaje.fecha, 'long')} - {formatters.time(viaje.horaSalida)}
            </ThemedText>
            <ThemedText style={styles.busText}>
              {viaje.omnibus.modelo} ({viaje.omnibus.matricula})
            </ThemedText>
          </ThemedView>
        </Card>

        <Card style={styles.seatCard}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Seleccionar Asiento</ThemedText>

          <ThemedView style={styles.seatsContainer}>
            {asientosDisponibles.map((seatNumber: number) => (
              <Button
                key={seatNumber}
                title={seatNumber.toString()}
                onPress={() => handleSeatSelect(seatNumber)}
                variant={selectedSeat === seatNumber ? 'primary' : 'outline'}
                size="small"
                style={styles.seatButton}
              />
            ))}
          </ThemedView>

          {selectedSeat && (
            <ThemedText style={styles.selectedSeatText}>
              Asiento seleccionado: {selectedSeat}
            </ThemedText>
          )}
        </Card>

        <Card style={styles.priceCard}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Resumen de Precios</ThemedText>

          <ThemedView style={styles.priceRow}>
            <ThemedText style={styles.priceLabel}>Precio del pasaje:</ThemedText>
            <ThemedText style={styles.priceValue}>
              {formatters.currency(viaje.precio)}
            </ThemedText>
          </ThemedView>

          <ThemedView style={[styles.priceRow, styles.totalRow]}>
            <ThemedText style={styles.totalLabel}>Total:</ThemedText>
            <ThemedText style={styles.totalValue}>
              {formatters.currency(viaje.precio)}
            </ThemedText>
          </ThemedView>
        </Card>
      </ScrollView>

      <ThemedView style={styles.footer}>
        <Button
          title={`Comprar por ${formatters.currency(viaje.precio)}`}
          onPress={handlePurchase}
          loading={isPurchasing}
          disabled={!selectedSeat}
          style={styles.purchaseButton}
        />
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  tripCard: {
    margin: 16,
  },
  seatCard: {
    margin: 16,
    marginTop: 0,
  },
  priceCard: {
    margin: 16,
    marginTop: 0,
  },
  headerCard: {
    margin: 16,
    alignItems: 'center',
  },
  detailCard: {
    margin: 16,
    marginTop: 0,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  tripInfo: {
    alignItems: 'center',
  },
  routeText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  dateText: {
    fontSize: 16,
    marginBottom: 4,
  },
  busText: {
    fontSize: 14,
  },
  route: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  locationText: {
    fontSize: 20,
    fontWeight: '600',
    marginHorizontal: 12,
  },
  priceText: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  detailInfo: {
    flex: 1,
    marginLeft: 12,
  },
  detailLabel: {
    fontSize: 14,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  lowSeats: {
    color: '#dc3545',
  },
  seatsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  seatButton: {
    minWidth: 50,
  },
  selectedSeatText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 16,
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e1e5e9',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e1e5e9',
  },
  purchaseButton: {
    width: '100%',
  },
  bookButton: {
    width: '100%',
  },
  closedText: {
    fontSize: 16,
    color: '#dc3545',
    fontWeight: '500',
    textAlign: 'center',
  },
  soldOutText: {
    fontSize: 16,
    color: '#6c757d',
    fontWeight: '500',
    textAlign: 'center',
  },
  listContainer: {
    paddingVertical: 8,
  },
  ticketCard: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  ticketRoute: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  ticketDetails: {
    fontSize: 14,
    marginBottom: 4,
  },
  ticketPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
});