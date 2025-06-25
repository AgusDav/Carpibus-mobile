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
        </View>
      </SafeAreaView>
    );
  }

  const viaje = tripDetail.viaje;
  const asientosDisponibles = tripDetail.asientosDisponibles || 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.headerCard}>
          <View style={styles.route}>
            <Text style={styles.locationText}>
              {viaje.origen?.nombre || 'Origen N/A'}
            </Text>
            <Icon name="arrow-forward" size={24} color="#666" />
            <Text style={styles.locationText}>
              {viaje.destino?.nombre || 'Destino N/A'}
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
                {viaje.origen?.nombre || 'N/A'}, {viaje.origen?.departamento || 'N/A'} → {viaje.destino?.nombre || 'N/A'}, {viaje.destino?.departamento || 'N/A'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.detailCard}>
          <Text style={styles.sectionTitle}>Información del Ómnibus</Text>

          <View style={styles.detailRow}>
            <Icon name="bus-outline" size={20} color="#666" />
            <View style={styles.detailInfo}>
              <Text style={styles.detailLabel}>Modelo</Text>
              <Text style={styles.detailValue}>
                {viaje.omnibus?.modelo || 'Modelo N/A'}
              </Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Icon name="card-outline" size={20} color="#666" />
            <View style={styles.detailInfo}>
              <Text style={styles.detailLabel}>Matrícula</Text>
              <Text style={styles.detailValue}>
                {viaje.omnibus?.matricula || 'Matrícula N/A'}
              </Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Icon name="people-outline" size={20} color="#666" />
            <View style={styles.detailInfo}>
              <Text style={styles.detailLabel}>Capacidad</Text>
              <Text style={styles.detailValue}>
                {viaje.omnibus?.capacidad || 0} asientos
              </Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Icon name="checkmark-circle-outline" size={20} color="#27ae60" />
            <View style={styles.detailInfo}>
              <Text style={styles.detailLabel}>Asientos Disponibles</Text>
              <Text style={[styles.detailValue, { color: '#27ae60' }]}>
                {asientosDisponibles} disponibles
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {asientosDisponibles > 0 && !viaje.ventasCerradas && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.bookButton}
            onPress={() => navigation.navigate('Purchase', { tripId: viaje.id })}
          >
            <Text style={styles.bookButtonText}>Comprar Pasaje</Text>
          </TouchableOpacity>
        </View>
      )}
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
    color: '#e74c3c',
    textAlign: 'center',
  },
  headerCard: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  route: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  locationText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginHorizontal: 8,
  },
  priceText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2563eb',
    textAlign: 'center',
  },
  detailCard: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  detailInfo: {
    marginLeft: 12,
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },
  footer: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  bookButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});