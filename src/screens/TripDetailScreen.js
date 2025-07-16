import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../hooks/useTheme';
import { tripsService } from '../api/trips';
import Loading from '../components/Loading';
import { globalStyles } from '../styles/globalStyles';

// Funciones de formateo
const formatCurrency = (amount) => {
  if (!amount) return '$0.00';
  return `$${parseFloat(amount).toFixed(2)}`;
};

const formatDate = (dateString) => {
  if (!dateString) return 'Fecha no disponible';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-UY', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch {
    return 'Fecha no disponible';
  }
};

const formatTime = (timeString) => {
  if (!timeString) return null;
  try {
    const timePart = timeString.includes('T') ?
      timeString.split('T')[1] : timeString;
    return timePart.substring(0, 5); // "10:30:00" -> "10:30"
  } catch {
    return null;
  }
};

export default function TripDetailScreen({ route, navigation }) {
  const { tripId } = route.params;
  const [tripDetail, setTripDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const theme = useTheme();

  useEffect(() => {
    loadTripDetail();
  }, [tripId]);

  const loadTripDetail = async () => {
    try {
      setIsLoading(true);
      setError('');
      const detail = await tripsService.getTripById(tripId);
      console.log('Trip detail received:', JSON.stringify(detail, null, 2));
      setTripDetail(detail);
    } catch (error) {
      console.error('Error loading trip detail:', error);
      setError('Error al cargar el detalle del viaje');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Loading text="Cargando detalle del viaje..." />;
  }

  if (error) {
    return (
      <SafeAreaView style={globalStyles.safeArea}>
        <View style={[globalStyles.centerContent, globalStyles.screenPadding]}>
          <Icon name="alert-circle-outline" size={64} color={theme.colors.error} />
          <Text style={[globalStyles.textHeading2, globalStyles.marginBottomMd, { color: theme.colors.error }]}>
            Error al cargar
          </Text>
          <Text style={[globalStyles.textBody, globalStyles.marginBottomLg, { textAlign: 'center' }]}>
            {error}
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

  if (!tripDetail) {
    return (
      <SafeAreaView style={globalStyles.safeArea}>
        <View style={[globalStyles.centerContent, globalStyles.screenPadding]}>
          <Icon name="alert-circle-outline" size={64} color={theme.colors.error} />
          <Text style={[globalStyles.textHeading2, globalStyles.marginBottomMd, { color: theme.colors.error }]}>
            Viaje no encontrado
          </Text>
          <Text style={[globalStyles.textBody, globalStyles.marginBottomLg, { textAlign: 'center' }]}>
            No se pudo encontrar la información del viaje solicitado
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

  // Mapear la estructura de datos correctamente basándose en la respuesta del backend
  // Adaptado para coincidir con la estructura mostrada en el frontend web
  const viaje = {
    id: tripDetail.id,
    fecha: tripDetail.fecha || tripDetail.fechaHoraSalida,
    horaSalida: tripDetail.horaSalida ||
      (tripDetail.fechaHoraSalida ? new Date(tripDetail.fechaHoraSalida).toLocaleTimeString() : null),
    horaLlegada: tripDetail.horaLlegada ||
      (tripDetail.fechaHoraLlegada ? new Date(tripDetail.fechaHoraLlegada).toLocaleTimeString() : null),
    origen: {
      nombre: tripDetail.origenNombre || tripDetail.origen?.nombre || 'Origen no disponible'
    },
    destino: {
      nombre: tripDetail.destinoNombre || tripDetail.destino?.nombre || 'Destino no disponible'
    },
    precio: tripDetail.precio || 0,
    estado: tripDetail.estado || 'PROGRAMADO',
    omnibus: {
      matricula: tripDetail.omnibusMatricula || tripDetail.omnibus?.matricula || 'No asignado',
      capacidad: tripDetail.capacidadOmnibus || tripDetail.omnibus?.capacidad || 0
    }
  };

  const asientosDisponibles = tripDetail.asientosDisponibles || 0;
  const asientosOcupados = (viaje.omnibus.capacidad || 0) - asientosDisponibles;

  const localStyles = {
    headerCard: {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.primary,
      borderWidth: 1,
    },
    detailRow: {
      alignItems: 'flex-start',
      marginBottom: theme.spacing.md,
    },
    detailInfo: {
      marginLeft: theme.spacing.sm,
      flex: 1,
    },
    statusBadge: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: 16,
      alignSelf: 'flex-start',
    },
    purchaseButton: {
      backgroundColor: theme.colors.primary,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      borderRadius: theme.spacing.sm,
      alignItems: 'center',
    },
    disabledButton: {
      backgroundColor: theme.colors.textSecondary,
    }
  };

  const getStatusColor = (estado) => {
    switch(estado?.toUpperCase()) {
      case 'PROGRAMADO':
        return theme.colors.success;
      case 'EN_VIAJE':
        return theme.colors.warning;
      case 'FINALIZADO':
        return theme.colors.textSecondary;
      case 'CANCELADO':
        return theme.colors.error;
      default:
        return theme.colors.textSecondary;
    }
  };

  const getStatusText = (estado) => {
    switch(estado?.toUpperCase()) {
      case 'PROGRAMADO':
        return 'Programado';
      case 'EN_VIAJE':
        return 'En Viaje';
      case 'FINALIZADO':
        return 'Finalizado';
      case 'CANCELADO':
        return 'Cancelado';
      default:
        return estado || 'Sin estado';
    }
  };

  const canPurchase = () => {
    return viaje.estado?.toUpperCase() === 'PROGRAMADO' && asientosDisponibles > 0;
  };

  const handlePurchase = () => {
    if (!canPurchase()) {
      Alert.alert(
        'No disponible',
        'Este viaje no está disponible para compra en este momento.'
      );
      return;
    }

    navigation.navigate('Purchase', {
      tripDetail: tripDetail,
      tripId: tripDetail.id
    });
  };

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <ScrollView style={globalStyles.container}>
        {/* Header Card con ruta y precio */}
        <View style={[globalStyles.card, localStyles.headerCard]}>
          <View style={[globalStyles.row, globalStyles.centerContent, globalStyles.marginBottomMd]}>
            <Text style={[globalStyles.textHeading2, globalStyles.flex1, { textAlign: 'center' }]}>
              {viaje.origen.nombre}
            </Text>
            <Icon
              name="arrow-forward"
              size={24}
              color={theme.colors.textSecondary}
              style={{ marginHorizontal: theme.spacing.md }}
            />
            <Text style={[globalStyles.textHeading2, globalStyles.flex1, { textAlign: 'center' }]}>
              {viaje.destino.nombre}
            </Text>
          </View>
          <Text style={[globalStyles.textHeading1, { color: theme.colors.primary, textAlign: 'center' }]}>
            {formatCurrency(viaje.precio)}
          </Text>

          {/* Estado del viaje */}
          <View style={{ alignItems: 'center', marginTop: theme.spacing.md }}>
            <View style={[
              localStyles.statusBadge,
              { backgroundColor: getStatusColor(viaje.estado) }
            ]}>
              <Text style={[globalStyles.textSmall, { color: '#fff', fontWeight: '600' }]}>
                {getStatusText(viaje.estado)}
              </Text>
            </View>
          </View>
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
                Salida: {formatTime(viaje.horaSalida) || 'No disponible'}
                {viaje.horaLlegada && ` - Llegada: ${formatTime(viaje.horaLlegada)}`}
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
                {viaje.omnibus.matricula}
                {viaje.omnibus.capacidad > 0 && ` (Capacidad: ${viaje.omnibus.capacidad} asientos)`}
              </Text>
            </View>
          </View>

          {/* Disponibilidad */}
          <View style={[globalStyles.row, localStyles.detailRow]}>
            <Icon name="people-outline" size={20} color={theme.colors.textSecondary} />
            <View style={localStyles.detailInfo}>
              <Text style={globalStyles.textCaption}>Disponibilidad</Text>
              <View style={globalStyles.row}>
                <Text style={[
                  globalStyles.textBody,
                  {
                    color: asientosDisponibles > 0 ?
                      theme.colors.success : theme.colors.error,
                    fontWeight: '600'
                  }
                ]}>
                  {asientosDisponibles} asientos disponibles
                </Text>
                {viaje.omnibus.capacidad > 0 && (
                  <Text style={[globalStyles.textBody, { marginLeft: theme.spacing.sm }]}>
                    de {viaje.omnibus.capacidad}
                  </Text>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* Botón de compra */}
        <View style={globalStyles.card}>
          <TouchableOpacity
            style={[
              localStyles.purchaseButton,
              !canPurchase() && localStyles.disabledButton
            ]}
            onPress={handlePurchase}
            disabled={!canPurchase()}
          >
            <View style={[globalStyles.row, globalStyles.centerContent]}>
              <Icon
                name="ticket-outline"
                size={20}
                color="#fff"
                style={{ marginRight: theme.spacing.sm }}
              />
              <Text style={[globalStyles.buttonText]}>
                {canPurchase() ? 'Comprar Pasaje' : 'No Disponible'}
              </Text>
            </View>
          </TouchableOpacity>

          {!canPurchase() && (
            <Text style={[
              globalStyles.textSmall,
              {
                textAlign: 'center',
                marginTop: theme.spacing.sm,
                color: theme.colors.textSecondary
              }
            ]}>
              {viaje.estado?.toUpperCase() !== 'PROGRAMADO'
                ? 'El viaje no está programado'
                : 'Sin asientos disponibles'}
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}