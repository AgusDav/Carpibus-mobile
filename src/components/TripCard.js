import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

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
      weekday: 'short',
      year: 'numeric',
      month: 'short',
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

  return timeString.substring(0, 5); // "HH:MM:SS" -> "HH:MM"
};

const formatCurrency = (amount) => {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return '$0';
  }

  return `${amount.toLocaleString('es-ES')}`;
};

export default function TripCard({ trip, onPress, onBookPress }) {
  // Debug: Ver la estructura real de los datos
  console.log('TripCard received trip:', JSON.stringify(trip, null, 2));

  const isAvailable = trip.asientosDisponibles > 0 && !trip.ventasCerradas;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.route}>
          <Text style={styles.locationText}>
            {trip.origen?.nombre || 'Origen N/A'}
          </Text>
          <Icon name="arrow-forward" size={20} color="#666" style={styles.arrow} />
          <Text style={styles.locationText}>
            {trip.destino?.nombre || 'Destino N/A'}
          </Text>
        </View>
        <Text style={styles.priceText}>
          {formatCurrency(trip.precio)}
        </Text>
      </View>

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Icon name="calendar-outline" size={16} color="#666" />
          <Text style={styles.detailText}>
            {formatDate(trip.fecha)}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Icon name="time-outline" size={16} color="#666" />
          <Text style={styles.detailText}>
            {formatTime(trip.horaSalida)} - {formatTime(trip.horaLlegada)}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Icon name="bus-outline" size={16} color="#666" />
          <Text style={styles.detailText}>
            {trip.omnibus?.modelo || 'Modelo N/A'} - {trip.omnibus?.matricula || 'Matrícula N/A'}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Icon name="people-outline" size={16} color="#666" />
          <Text style={styles.detailText}>
            {trip.asientosDisponibles || 0} asientos disponibles
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.detailButton} onPress={onPress}>
          <Text style={styles.detailButtonText}>Ver Detalles</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.bookButton,
            !isAvailable && styles.bookButtonDisabled
          ]}
          onPress={isAvailable ? onBookPress : null}
          disabled={!isAvailable}
        >
          <Text style={[
            styles.bookButtonText,
            !isAvailable && styles.bookButtonTextDisabled
          ]}>
            {isAvailable ? 'Comprar' : 'No Disponible'}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  arrow: {
    marginHorizontal: 8,
  },
  priceText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2563eb',
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
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  detailButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2563eb',
    alignItems: 'center',
  },
  detailButtonText: {
    color: '#2563eb',
    fontSize: 14,
    fontWeight: '600',
  },
  bookButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#2563eb',
    alignItems: 'center',
  },
  bookButtonDisabled: {
    backgroundColor: '#e9ecef',
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  bookButtonTextDisabled: {
    color: '#666',
  },
});