import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { tripsService } from '../api/trips';
import Loading from '../components/Loading';
import { globalStyles } from '../styles/globalStyles';
import { useTheme } from '../hooks/useTheme';

// Función helper para formatear moneda
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-UY', {
    style: 'currency',
    currency: 'UYU',
    minimumFractionDigits: 0,
  }).format(amount);
};

// Función helper para formatear fecha
const formatDate = (dateString) => {
  try {
    return new Date(dateString).toLocaleDateString('es-UY', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch {
    return dateString;
  }
};

// Función helper para formatear hora
const formatTime = (timeString) => {
  try {
    const timePart = timeString?.split('T')[1] || timeString;
    return timePart ? timePart.substring(0, 5) : null; // "10:30:00" -> "10:30"
  } catch {
    return null;
  }
};

export default function TripDetailScreen({ route, navigation }) {
  const { tripId } = route.params;
  const [tripDetail, setTripDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const theme = useTheme();

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
      <SafeAreaView style={globalStyles.safeArea}>
        <View style={[globalStyles.centerContent, globalStyles.screenPadding]}>
          <Icon name="alert-circle-outline" size={64} color={theme.colors.error} />
          <Text style={[globalStyles.textHeading2, globalStyles.marginBottomMd, { color: theme.colors.error }]}>
            Error al cargar
          </Text>
          <Text style={[globalStyles.textBody, globalStyles.marginBottomLg, { textAlign: 'center' }]}>
            No se pudo cargar el detalle del viaje
          </Text>
          <TouchableOpacity
            style={globalStyles.buttonSecondary}
            onPress={() => navigation.goBack()}
          >
            <Text style={globalStyles.buttonTextSecondary}>Volver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Mapear la estructura de ViajeDetalleConAsientosDTO
  const viaje = {
    id: tripDetail.id,
    fecha: tripDetail.fecha,
    horaSalida: tripDetail.horaSalida,
    horaLlegada: tripDetail.horaLlegada,
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
    <SafeAreaView style={globalStyles.safeArea}>
      <ScrollView style={globalStyles.container}>
        {/* Header Card con ruta y precio */}
        <View style={[globalStyles.card, localStyles.headerCard]}>
          <View style={[globalStyles.row, globalStyles.centerContent, globalStyles.marginBottomMd]}>
            <Text style={[globalStyles.textHeading2, globalStyles.flex1, { textAlign: 'center' }]}>
              {viaje.origen.nombre}
            </Text>
            <Icon name="arrow-forward" size={24} color={theme.colors.textSecondary} style={{ marginHorizontal: theme.spacing.md }} />
            <Text style={[globalStyles.textHeading2, globalStyles.flex1, { textAlign: 'center' }]}>
              {viaje.destino.nombre}
            </Text>
          </View>
          <Text style={[globalStyles.textHeading1, { color: theme.colors.primary, textAlign: 'center' }]}>
            {formatCurrency(viaje.precio)}
          </Text>
        </View>

        {/* Información del viaje */}
        <View style={globalStyles.card}>
          <Text style={[globalStyles.textHeading3, globalStyles.marginBottomMd]}>
            Información del Viaje
          </Text>

          {/* Fecha de salida */}
          <View style={[globalStyles.row, localStyles.detailRow]}>
            <Icon name="calendar-outline" size={20} color={theme.colors.textSecondary} />
            <View style={localStyles.detailInfo}>
              <Text style={globalStyles.textCaption}>Fecha de Salida</Text>
              <Text style={globalStyles.textBody}>
                {formatDate(viaje.fecha)}
              </Text>
            </View>
          </View>

          {/* Horarios */}
          <View style={[globalStyles.row, localStyles.detailRow]}>
            <Icon name="time-outline" size={20} color={theme.colors.textSecondary} />
            <View style={localStyles.detailInfo}>
              <Text style={globalStyles.textCaption}>Horarios</Text>
              <Text style={globalStyles.textBody}>
                Salida: {formatTime(viaje.horaSalida)} - Llegada: {formatTime(viaje.horaLlegada)}
              </Text>
            </View>
          </View>

          {/* Ruta */}
          <View style={[globalStyles.row, localStyles.detailRow]}>
            <Icon name="location-outline" size={20} color={theme.colors.textSecondary} />
            <View style={localStyles.detailInfo}>
              <Text style={globalStyles.textCaption}>Ruta</Text>
              <Text style={globalStyles.textBody}>
                {viaje.origen.nombre} → {viaje.destino.nombre}
              </Text>
            </View>
          </View>

          {/* Ómnibus */}
          <View style={[globalStyles.row, localStyles.detailRow]}>
            <Icon name="bus-outline" size={20} color={theme.colors.textSecondary} />
            <View style={localStyles.detailInfo}>
              <Text style={globalStyles.textCaption}>Ómnibus</Text>
              <Text style={globalStyles.textBody}>
                {viaje.omnibus.matricula} (Capacidad: {viaje.omnibus.capacidad} asientos)
              </Text>
            </View>
          </View>

          {/* Disponibilidad */}
          <View style={[globalStyles.row, localStyles.detailRow]}>
            <Icon name="people-outline" size={20} color={theme.colors.textSecondary} />
            <View style={localStyles.detailInfo}>
              <Text style={globalStyles.textCaption}>Disponibilidad</Text>
              <Text style={[
                globalStyles.textBody,
                {
                  color: asientosDisponibles > 0 ? theme.colors.success : theme.colors.error,
                  fontWeight: '600'
                }
              ]}>
                {asientosDisponibles} asientos disponibles
              </Text>
            </View>
          </View>

          {/* Estado */}
          <View style={[globalStyles.row, localStyles.detailRow]}>
            <Icon name="information-circle-outline" size={20} color={theme.colors.textSecondary} />
            <View style={localStyles.detailInfo}>
              <Text style={globalStyles.textCaption}>Estado</Text>
              <Text style={globalStyles.textBody}>
                {viaje.estado}
              </Text>
            </View>
          </View>
        </View>

        {/* Asientos ocupados */}
        {tripDetail.numerosAsientoOcupados && tripDetail.numerosAsientoOcupados.length > 0 && (
          <View style={globalStyles.card}>
            <Text style={[globalStyles.textHeading3, globalStyles.marginBottomMd]}>
              Asientos Ocupados
            </Text>
            <View style={localStyles.occupiedSeatsContainer}>
              <Text style={[globalStyles.textBody, { color: theme.colors.error, textAlign: 'center' }]}>
                {tripDetail.numerosAsientoOcupados.sort((a, b) => a - b).join(', ')}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Footer con botones */}
      <View style={localStyles.footer}>
        <TouchableOpacity
          style={[globalStyles.buttonSecondary, globalStyles.flex1, { marginRight: theme.spacing.sm }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={globalStyles.buttonTextSecondary}>Volver</Text>
        </TouchableOpacity>

        {asientosDisponibles > 0 && (
          <TouchableOpacity
            style={[globalStyles.buttonPrimary, { flex: 2 }]}
            onPress={() => navigation.navigate('Purchase', { tripId: viaje.id })}
          >
            <Text style={globalStyles.buttonText}>Reservar Asiento</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

// Estilos locales específicos
const localStyles = {
  headerCard: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  detailRow: {
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  detailInfo: {
    flex: 1,
    marginLeft: 12,
  },
  occupiedSeatsContainer: {
    backgroundColor: '#fef2f2',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
};