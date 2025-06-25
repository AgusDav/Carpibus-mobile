import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { tripsService } from '../api/trips';
import Loading from '../components/Loading';

const formatDate = (dateString) => {
  if (!dateString) {
    return 'Fecha N/A';
  }

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Fecha inválida';
    }

    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch (error) {
    return 'Fecha inválida';
  }
};

const formatTime = (timeString) => {
  if (!timeString || typeof timeString !== 'string') {
    return '--:--';
  }

  if (timeString.length < 5) {
    return timeString;
  }

  return timeString.substring(0, 5);
};

const formatCurrency = (amount) => {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return '$0';
  }

  return `$${amount.toLocaleString('es-ES')}`;
};

// Función auxiliar para extraer fecha del LocalDateTime
const extractDateFromDateTime = (dateTimeString) => {
  if (!dateTimeString) return null;
  try {
    return dateTimeString.split('T')[0]; // "2024-01-15T10:30:00" -> "2024-01-15"
  } catch {
    return null;
  }
};

// Función auxiliar para extraer hora del LocalDateTime
const extractTimeFromDateTime = (dateTimeString) => {
  if (!dateTimeString) return null;
  try {
    const timePart = dateTimeString.split('T')[1]; // "2024-01-15T10:30:00" -> "10:30:00"
    return timePart ? timePart.substring(0, 5) : null; // "10:30:00" -> "10:30"
  } catch {
    return null;
  }
};

export default function TripDetailScreen({ route, navigation }) {
  const { tripId } = route.params;
  const [tripDetail, setTripDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTripDetail();
  }, [tripId]);

  const loadTripDetail = async () => {
    try {
      setIsLoading(true);
      const detail = await tripsService.getTripById(tripId);
      console.log('Trip detail received:', JSON.stringify(detail, null, 2));
      setTripDetail(detail);
    } catch (error) {
      console.error('Error loading trip detail:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Loading text="Cargando detalle del viaje..." />;
  }

  if (!tripDetail || !tripDetail.viaje) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No se pudo cargar el detalle del viaje</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Volver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Mapear la estructura de ViajeDetalleConAsientosDTO
  const viaje = {
    id: tripDetail.id,
    fecha: tripDetail.fecha, // Este viene como LocalDate
    horaSalida: tripDetail.horaSalida, // Este viene como LocalTime
    horaLlegada: tripDetail.horaLlegada, // Este viene como LocalTime
    origen: { nombre: tripDetail.origenNombre },
    destino: { nombre: tripDetail.destinoNombre },
    precio: tripDetail.precio,
    estado: tripDetail.estado,
    omnibus: {
      matricula: tripDetail.omnibusMatricula,
      capacidad: tripDetail.capacidadOmnibus
    }
  };

  const asientosDisponibles = tripDetail.asientosDisponibles || 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.headerCard}>
          <View style={styles.route}>
            <Text style={styles.locationText}>
              {viaje.origen.nombre}
            </Text>
            <Icon name="arrow-forward" size={24} color="#666" />
            <Text style={styles.locationText}>
              {viaje.destino.nombre}
            </Text>
          </View>
          <Text style={styles.priceText}>
            {formatCurrency(viaje.precio)}
          </Text>
        </View>

        <View style={styles.detailCard}>
          <Text style={styles.sectionTitle}>Información del Viaje</Text>

          <View style={styles.detailRow}>
            <Icon name="calendar-outline" size={20} color="#666" />
            <View style={styles.detailInfo}>
              <Text style={styles.detailLabel}>Fecha de Salida</Text>
              <Text style={styles.detailValue}>
                {formatDate(viaje.fecha)}
              </Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Icon name="time-outline" size={20} color="#666" />
            <View style={styles.detailInfo}>
              <Text style={styles.detailLabel}>Horarios</Text>
              <Text style={styles.detailValue}>
                Salida: {formatTime(viaje.horaSalida)} - Llegada: {formatTime(viaje.horaLlegada)}
              </Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Icon name="location-outline" size={20} color="#666" />
            <View style={styles.detailInfo}>
              <Text style={styles.detailLabel}>Ruta</Text>
              <Text style={styles.detailValue}>
                {viaje.origen.nombre} → {viaje.destino.nombre}
              </Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Icon name="bus-outline" size={20} color="#666" />
            <View style={styles.detailInfo}>
              <Text style={styles.detailLabel}>Ómnibus</Text>
              <Text style={styles.detailValue}>
                {viaje.omnibus.matricula} (Capacidad: {viaje.omnibus.capacidad} asientos)
              </Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Icon name="people-outline" size={20} color="#666" />
            <View style={styles.detailInfo}>
              <Text style={styles.detailLabel}>Disponibilidad</Text>
              <Text style={[
                styles.detailValue,
                { color: asientosDisponibles > 0 ? '#16a34a' : '#dc2626' }
              ]}>
                {asientosDisponibles} asientos disponibles
              </Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Icon name="information-circle-outline" size={20} color="#666" />
            <View style={styles.detailInfo}>
              <Text style={styles.detailLabel}>Estado</Text>
              <Text style={styles.detailValue}>
                {viaje.estado}
              </Text>
            </View>
          </View>
        </View>

        {/* Mostrar información de asientos ocupados si está disponible */}
        {tripDetail.numerosAsientoOcupados && tripDetail.numerosAsientoOcupados.length > 0 && (
          <View style={styles.detailCard}>
            <Text style={styles.sectionTitle}>Asientos Ocupados</Text>
            <Text style={styles.occupiedSeats}>
              {tripDetail.numerosAsientoOcupados.sort((a, b) => a - b).join(', ')}
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Volver</Text>
        </TouchableOpacity>

        {asientosDisponibles > 0 && (
          <TouchableOpacity
            style={styles.bookButton}
            onPress={() => navigation.navigate('Purchase', { tripId: viaje.id })}
          >
            <Text style={styles.bookButtonText}>Reservar Asiento</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#dc2626',
    textAlign: 'center',
    marginBottom: 20,
  },
  headerCard: {
    backgroundColor: '#fff',
    padding: 20,
    margin: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  route: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  priceText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2563eb',
    textAlign: 'center',
  },
  detailCard: {
    backgroundColor: '#fff',
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
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
    color: '#666',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  occupiedSeats: {
    fontSize: 16,
    color: '#dc2626',
    backgroundColor: '#fef2f2',
    padding: 12,
    borderRadius: 8,
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  backButton: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 8,
    flex: 1,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    textAlign: 'center',
  },
  bookButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginLeft: 8,
    flex: 2,
  },
  bookButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
});