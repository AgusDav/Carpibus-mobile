import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../hooks/useTheme';
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
    return timePart.substring(0, 5);
  } catch {
    return null;
  }
};

const getStatusColor = (estado) => {
  switch (estado) {
    case 'VENDIDO':
      return '#4CAF50'; // Verde
    case 'RESERVADO':
      return '#FF9800'; // Naranja
    case 'CANCELADO':
      return '#F44336'; // Rojo
    default:
      return '#9E9E9E'; // Gris
  }
};

const getStatusText = (estado) => {
  switch (estado) {
    case 'VENDIDO':
      return 'Confirmado';
    case 'RESERVADO':
      return 'Reservado';
    case 'CANCELADO':
      return 'Cancelado';
    default:
      return estado;
  }
};

export default function TicketDetailScreen({ route, navigation }) {
  const { ticket } = route.params;
  const theme = useTheme();

  const localStyles = {
    headerCard: {
      backgroundColor: theme.colors.surface,
      marginBottom: theme.spacing.md,
    },
    statusBadge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      alignSelf: 'center',
    },
    detailRow: {
      alignItems: 'flex-start',
      marginBottom: theme.spacing.md,
    },
    detailInfo: {
      flex: 1,
      marginLeft: theme.spacing.sm,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
    },
    ticketNumber: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.primary,
    }
  };

  return (
    <ScrollView style={globalStyles.container}>
        {/* Header Card con ruta y precio */}
        <View style={[globalStyles.card, localStyles.headerCard]}>
          {/* Ruta */}
          <View style={[globalStyles.row, globalStyles.centerContent, globalStyles.marginBottomMd]}>
            <Text style={[globalStyles.textHeading2, globalStyles.flex1, { textAlign: 'center' }]}>
              {ticket.origenViaje}
            </Text>
            <Icon
              name="arrow-forward"
              size={24}
              color={theme.colors.textSecondary}
              style={{ marginHorizontal: theme.spacing.md }}
            />
            <Text style={[globalStyles.textHeading2, globalStyles.flex1, { textAlign: 'center' }]}>
              {ticket.destinoViaje}
            </Text>
          </View>

          {/* Precio */}
          <Text style={[globalStyles.textHeading1, { color: theme.colors.primary, textAlign: 'center' }]}>
            {formatCurrency(ticket.precio)}
          </Text>

          {/* Estado del ticket y número de ticket */}
          <View style={[globalStyles.row, globalStyles.spaceBetween, { marginTop: theme.spacing.md, alignItems: 'center' }]}>
            {/* Estado del ticket - Izquierda */}
            <View style={[globalStyles.row, { alignItems: 'center' }]}>
              <Text style={[globalStyles.textCaption, { marginRight: theme.spacing.sm }]}>
                Estado del pasaje:
              </Text>
              <View style={[
                localStyles.statusBadge,
                { backgroundColor: getStatusColor(ticket.estado) }
              ]}>
                <Text style={[globalStyles.textSmall, { color: '#fff', fontWeight: '600' }]}>
                  {getStatusText(ticket.estado)}
                </Text>
              </View>
            </View>

            {/* Identificador del ticket - Derecha */}
            <View style={[globalStyles.row, { alignItems: 'center' }]}>
              <Text style={[globalStyles.textCaption, { marginRight: theme.spacing.sm }]}>
                ID del pasaje:
              </Text>
              <Text style={localStyles.ticketNumber}>
                #{ticket.id}
              </Text>
            </View>
          </View>
        </View>

        {/* Información del viaje */}
        <View style={globalStyles.card}>
          <Text style={localStyles.sectionTitle}>
            Información del Viaje
          </Text>

          {/* Fecha del viaje */}
          <View style={[globalStyles.row, localStyles.detailRow]}>
            <Icon name="calendar-outline" size={20} color={theme.colors.textSecondary} />
            <View style={localStyles.detailInfo}>
              <Text style={globalStyles.textCaption}>Fecha del Viaje</Text>
              <Text style={globalStyles.textBody}>
                {formatDate(ticket.fechaViaje)}
              </Text>
            </View>
          </View>

          {/* Horario de salida */}
          <View style={[globalStyles.row, localStyles.detailRow]}>
            <Icon name="time-outline" size={20} color={theme.colors.textSecondary} />
            <View style={localStyles.detailInfo}>
              <Text style={globalStyles.textCaption}>Horario de Salida</Text>
              <Text style={globalStyles.textBody}>
                {formatTime(ticket.horaSalidaViaje) || 'No disponible'}
              </Text>
            </View>
          </View>

          {/* Número de asiento */}
          <View style={[globalStyles.row, localStyles.detailRow]}>
            <Icon name="car-outline" size={20} color={theme.colors.textSecondary} />
            <View style={localStyles.detailInfo}>
              <Text style={globalStyles.textCaption}>Asiento</Text>
              <Text style={globalStyles.textBody}>
                Asiento N° {ticket.numeroAsiento}
              </Text>
            </View>
          </View>

          {/* Ómnibus */}
          <View style={[globalStyles.row, localStyles.detailRow]}>
            <Icon name="bus-outline" size={20} color={theme.colors.textSecondary} />
            <View style={localStyles.detailInfo}>
              <Text style={globalStyles.textCaption}>Ómnibus</Text>
              <Text style={globalStyles.textBody}>
                {ticket.omnibusMatricula}
              </Text>
            </View>
          </View>
        </View>

        {/* Información del cliente */}
        <View style={globalStyles.card}>
          <Text style={localStyles.sectionTitle}>
            Información del Pasajero
          </Text>

          {/* Nombre del cliente */}
          <View style={[globalStyles.row, localStyles.detailRow]}>
            <Icon name="person-outline" size={20} color={theme.colors.textSecondary} />
            <View style={localStyles.detailInfo}>
              <Text style={globalStyles.textCaption}>Nombre</Text>
              <Text style={globalStyles.textBody}>
                {ticket.clienteNombre}
              </Text>
            </View>
          </View>

          {/* Email del cliente */}
          <View style={[globalStyles.row, localStyles.detailRow]}>
            <Icon name="mail-outline" size={20} color={theme.colors.textSecondary} />
            <View style={localStyles.detailInfo}>
              <Text style={globalStyles.textCaption}>Email</Text>
              <Text style={globalStyles.textBody}>
                {ticket.clienteEmail}
              </Text>
            </View>
          </View>

          {/* Fecha de reserva */}
          {ticket.fechaReserva && (
            <View style={[globalStyles.row, localStyles.detailRow]}>
              <Icon name="bookmark-outline" size={20} color={theme.colors.textSecondary} />
              <View style={localStyles.detailInfo}>
                <Text style={globalStyles.textCaption}>Fecha de Reserva</Text>
                <Text style={globalStyles.textBody}>
                  {formatDate(ticket.fechaReserva)}
                </Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
  );
}