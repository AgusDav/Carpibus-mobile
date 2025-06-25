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

export default function TripCard({ trip, onPress, onBookPress }) {
  // Debug: Ver la estructura real de los datos
  console.log('TripCard received trip:', JSON.stringify(trip, null, 2));
  console.log('Matrícula específica:', trip.matriculaOmnibus);
  console.log('Todos los campos que empiezan con "matric":', Object.keys(trip).filter(key => key.toLowerCase().includes('matric')));
  console.log('Todos los campos que empiezan con "omnibus":', Object.keys(trip).filter(key => key.toLowerCase().includes('omnibus')));

  // Mapear campos del backend al frontend
  const mappedTrip = {
    id: trip.id,

    // Extraer fecha de fechaSalida (LocalDateTime)
    fecha: extractDateFromDateTime(trip.fechaSalida),

    // Extraer horas de los LocalDateTime
    horaSalida: extractTimeFromDateTime(trip.fechaSalida),
    horaLlegada: extractTimeFromDateTime(trip.fechaLlegada),

    // Usar los nombres directos que vienen del backend
    origen: { nombre: trip.origenNombre || 'Origen N/A' },
    destino: { nombre: trip.destinoNombre || 'Destino N/A' },

    // Crear objeto omnibus con diferentes posibles nombres de campos
    omnibus: {
      matricula: trip.matriculaOmnibus || trip.omnibusMatricula || trip.matricula || 'Matrícula N/A',
      capacidad: trip.capacidadOmnibus || trip.omnibusCapacidad || trip.capacidad || 0
    },
    precio: trip.precio || 0,

    // Calcular asientos disponibles correctamente
    asientosDisponibles: (trip.capacidadOmnibus || 0) - (trip.asientosVendidos || 0),
    estado: trip.estado,

    // Para compatibilidad con funciones existentes
    ventasCerradas: trip.estado === 'CANCELADO' || trip.estado === 'COMPLETADO'
  };

  const isAvailable = mappedTrip.asientosDisponibles > 0 && !mappedTrip.ventasCerradas;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.route}>
          <Text style={styles.locationText}>
            {mappedTrip.origen.nombre}
          </Text>
          <Icon name="arrow-forward" size={20} color="#666" style={styles.arrow} />
          <Text style={styles.locationText}>
            {mappedTrip.destino.nombre}
          </Text>
        </View>
        <Text style={styles.priceText}>
          {formatCurrency(mappedTrip.precio)}
        </Text>
      </View>

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Icon name="calendar-outline" size={16} color="#666" />
          <Text style={styles.detailText}>
            {formatDate(mappedTrip.fecha)}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Icon name="time-outline" size={16} color="#666" />
          <Text style={styles.detailText}>
            {formatTime(mappedTrip.horaSalida)} - {formatTime(mappedTrip.horaLlegada)}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Icon name="bus-outline" size={16} color="#666" />
          <Text style={styles.detailText}>
            {mappedTrip.omnibus.modelo} - {mappedTrip.omnibus.matricula}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Icon name="people-outline" size={16} color="#666" />
          <Text style={styles.detailText}>
            {mappedTrip.asientosDisponibles} asientos disponibles
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
            {isAvailable ? 'Reservar' : 'No disponible'}
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
    marginVertical: 8,
    marginHorizontal: 16,
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
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  arrow: {
    marginHorizontal: 8,
  },
  priceText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2563eb',
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
    color: '#666',
    marginLeft: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailButton: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
  },
  detailButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    textAlign: 'center',
  },
  bookButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
  },
  bookButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
  bookButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
  bookButtonTextDisabled: {
    color: '#9ca3af',
  },
});