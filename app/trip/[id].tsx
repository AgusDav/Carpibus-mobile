import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  Alert,
  StyleSheet
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { tripsService } from '@/lib/api/trips';
import { useThemeColor } from '@/hooks/useThemeColor';
import { formatters } from '@/lib/utils/formatters';

export default function TripDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [tripDetail, setTripDetail] = useState<any>(null); // ⚠️ Usar any por la respuesta compleja del backend
  const [isLoading, setIsLoading] = useState(true);
  const iconColor = useThemeColor({}, 'icon');
  const tintColor = useThemeColor({}, 'tint');

  useEffect(() => {
    if (id) {
      fetchTripDetail(parseInt(id));
    }
  }, [id]);

  const fetchTripDetail = async (tripId: number) => {
    try {
      setIsLoading(true);
      // ⚠️ El backend devuelve detalles + asientos en un objeto complejo
      const data = await tripsService.getTripById(tripId);
      setTripDetail(data);
    } catch (error: any) {
      Alert.alert('Error', 'No se pudo cargar el detalle del viaje');
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookTrip = () => {
    if (tripDetail) {
      router.push({
        pathname: '/purchase/[tripId]',
        params: { tripId: id! }
      });
    }
  };

  if (isLoading) {
    return <Loading text="Cargando detalle del viaje..." />;
  }

  if (!tripDetail || !tripDetail.viaje) {
    return null;
  }

  const viaje = tripDetail.viaje;
  const asientosDisponibles = tripDetail.asientosDisponibles || 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Card style={styles.headerCard}>
          <ThemedView style={styles.route}>
            <ThemedText style={styles.locationText}>{viaje.origen.nombre}</ThemedText>
            <Ionicons name="arrow-forward" size={24} color={iconColor} />
            <ThemedText style={styles.locationText}>{viaje.destino.nombre}</ThemedText>
          </ThemedView>
          <ThemedText style={[styles.priceText, { color: tintColor }]}>
            {formatters.currency(viaje.precio)}
          </ThemedText>
        </Card>

        <Card style={styles.detailCard}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Información del Viaje</ThemedText>

          <ThemedView style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={20} color={iconColor} />
            <ThemedView style={styles.detailInfo}>
              <ThemedText style={styles.detailLabel}>Fecha de Salida</ThemedText>
              <ThemedText style={styles.detailValue}>
                {formatters.date(viaje.fecha, 'long')}
              </ThemedText>
            </ThemedView>
          </ThemedView>

          <ThemedView style={styles.detailRow}>
            <Ionicons name="time-outline" size={20} color={iconColor} />
            <ThemedView style={styles.detailInfo}>
              <ThemedText style={styles.detailLabel}>Horarios</ThemedText>
              <ThemedText style={styles.detailValue}>
                Salida: {formatters.time(viaje.horaSalida)} - Llegada: {formatters.time(viaje.horaLlegada)}
              </ThemedText>
            </ThemedView>
          </ThemedView>

          <ThemedView style={styles.detailRow}>
            <Ionicons name="location-outline" size={20} color={iconColor} />
            <ThemedView style={styles.detailInfo}>
              <ThemedText style={styles.detailLabel}>Ruta</ThemedText>
              <ThemedText style={styles.detailValue}>
                {viaje.origen.nombre}, {viaje.origen.departamento} → {viaje.destino.nombre}, {viaje.destino.departamento}
              </ThemedText>
            </ThemedView>
          </ThemedView>
        </Card>

        <Card style={styles.detailCard}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Información del Ómnibus</ThemedText>

          <ThemedView style={styles.detailRow}>
            <Ionicons name="bus-outline" size={20} color={iconColor} />
            <ThemedView style={styles.detailInfo}>
              <ThemedText style={styles.detailLabel}>Modelo</ThemedText>
              <ThemedText style={styles.detailValue}>{viaje.omnibus.modelo}</ThemedText>
            </ThemedView>
          </ThemedView>

          <ThemedView style={styles.detailRow}>
            <Ionicons name="card-outline" size={20} color={iconColor} />
            <ThemedView style={styles.detailInfo}>
              <ThemedText style={styles.detailLabel}>Matrícula</ThemedText>
              <ThemedText style={styles.detailValue}>{viaje.omnibus.matricula}</ThemedText>
            </ThemedView>
          </ThemedView>

          <ThemedView style={styles.detailRow}>
            <Ionicons name="person-outline" size={20} color={iconColor} />
            <ThemedView style={styles.detailInfo}>
              <ThemedText style={styles.detailLabel}>Disponibilidad</ThemedText>
              <ThemedText style={[
                styles.detailValue,
                asientosDisponibles < 5 && styles.lowSeats
              ]}>
                {asientosDisponibles} de {viaje.omnibus.capacidad} asientos disponibles
              </ThemedText>
            </ThemedView>
          </ThemedView>
        </Card>
      </ScrollView>

      <ThemedView style={styles.footer}>
        {viaje.ventasCerradas ? (
          <ThemedText style={styles.closedText}>Ventas cerradas para este viaje</ThemedText>
        ) : asientosDisponibles === 0 ? (
          <ThemedText style={styles.soldOutText}>Viaje agotado</ThemedText>
        ) : (
          <Button
            title={`Reservar por ${formatters.currency(viaje.precio)}`}
            onPress={handleBookTrip}
            style={styles.bookButton}
          />
        )}
      </ThemedView>
    </SafeAreaView>
  );
}