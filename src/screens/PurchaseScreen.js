import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/client';
import { globalStyles } from '../styles/globalStyles';
import { useTheme } from '../hooks/useTheme';

export default function PurchaseScreen({ route, navigation }) {
  const { tripId } = route.params;
  const { user } = useAuth();
  const theme = useTheme();

  const [tripDetail, setTripDetail] = useState(null);
  const [asientosOcupados, setAsientosOcupados] = useState([]);
  const [asientoSeleccionado, setAsientoSeleccionado] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reserving, setReserving] = useState(false);

  useEffect(() => {
    loadTripData();
  }, [tripId]);

  const loadTripData = async () => {
    try {
      setLoading(true);

      const [tripResponse, asientosResponse] = await Promise.all([
        apiClient.get(`/api/vendedor/viajes/${tripId}/detalles-asientos`, true),
        apiClient.get(`/api/vendedor/viajes/${tripId}/asientos-ocupados`, true)
      ]);

      setTripDetail(tripResponse);
      setAsientosOcupados(asientosResponse || []);
    } catch (error) {
      console.error('Error loading trip data:', error);
      Alert.alert('Error', 'No se pudo cargar la información del viaje');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  // Calcular precio con descuentos según tipo de cliente
  const calcularPrecio = () => {
    const precioBase = parseFloat(tripDetail?.precio || 0);
    const esElegibleParaDescuento = user?.tipoCliente === 'JUBILADO' || user?.tipoCliente === 'ESTUDIANTE';

    if (esElegibleParaDescuento) {
      const descuento = precioBase * 0.20; // 20% de descuento
      const precioFinal = precioBase - descuento;
      return {
        precioBase,
        descuento,
        precioFinal,
        tieneDescuento: true
      };
    }

    return {
      precioBase,
      descuento: 0,
      precioFinal: precioBase,
      tieneDescuento: false
    };
  };

  const precios = calcularPrecio();

  // Función para reservar asiento temporalmente
  const reservarAsientoTemporalmente = async (asiento) => {
    try {
      setReserving(true);

      const reservaDTO = {
        viajeId: tripId,
        clienteId: user.id,
        numerosAsiento: [asiento] // Array con un solo asiento
      };

      console.log('🔄 Reservando asiento temporalmente:', reservaDTO);

      const response = await apiClient.reservarAsientosTemporalmente(reservaDTO);

      console.log('✅ Asiento reservado temporalmente:', response);

      // Recargar los asientos ocupados para reflejar la reserva
      const asientosResponse = await apiClient.get(`/api/vendedor/viajes/${tripId}/asientos-ocupados`, true);
      setAsientosOcupados(asientosResponse || []);

      return response;
    } catch (error) {
      console.error('❌ Error al reservar asiento:', error);

      const errorMessage = error.response?.data?.message || "Ocurrió un error al procesar su solicitud.";
      Alert.alert('Error', errorMessage);

      // Si el error indica que el asiento fue ocupado, recargar datos
      if (errorMessage.toLowerCase().includes("no está disponible")) {
        loadTripData();
      }

      throw error;
    } finally {
      setReserving(false);
    }
  };

  const handleContinuarPago = async () => {
    if (!asientoSeleccionado) {
      Alert.alert('Error', 'Por favor selecciona un asiento');
      return;
    }

    try {
      // Primero reservar el asiento temporalmente
      const reservaResponse = await reservarAsientoTemporalmente(asientoSeleccionado);

      // Navegar al componente PayPal nativo con todos los datos necesarios
      navigation.navigate('PayPalNativePayment', {
        tripId,
        asientoSeleccionado,
        user,
        tripDetail,
        precios,
        reservaExpiraEn: reservaResponse.expiracion // Pasar la fecha de expiración
      });
    } catch (error) {
      // El error ya fue manejado en reservarAsientoTemporalmente
      console.error('Error en handleContinuarPago:', error);
    }
  };

  const handleSeleccionarAsiento = (numeroAsiento) => {
    if (asientosOcupados.includes(numeroAsiento)) return;
    setAsientoSeleccionado(prevSeleccionado =>
      prevSeleccionado === numeroAsiento ? null : numeroAsiento
    );
  };

  // Función mejorada para renderizar asientos con mejor layout
  const renderAsientos = () => {
    if (!tripDetail?.busAsignado?.capacidad && !tripDetail?.capacidadOmnibus) return null;

    const capacidad = tripDetail?.busAsignado?.capacidad || tripDetail?.capacidadOmnibus || 40;
    let asientosVisuales = [];

    for (let i = 1; i <= capacidad; i++) {
      const estaOcupado = asientosOcupados.includes(i);
      const estaSeleccionado = asientoSeleccionado === i;

      let estilo = [localStyles.asiento];
      let colorFondo, colorBorde;

      if (estaOcupado) {
        colorFondo = theme.colors.error;
        colorBorde = theme.colors.error;
      } else if (estaSeleccionado) {
        colorFondo = theme.colors.primary;
        colorBorde = theme.colors.primary;
      } else {
        colorFondo = theme.colors.success;
        colorBorde = theme.colors.success;
      }

      asientosVisuales.push(
        <TouchableOpacity
          key={i}
          style={[estilo, { backgroundColor: colorFondo, borderColor: colorBorde }]}
          onPress={() => handleSeleccionarAsiento(i)}
          disabled={estaOcupado}
        >
          <Text style={localStyles.asientoTexto}>{i}</Text>
        </TouchableOpacity>
      );
    }

    // Organizar en filas de 4 asientos (2 + pasillo + 2)
    const filas = [];
    for (let i = 0; i < asientosVisuales.length; i += 4) {
      filas.push(
        <View key={`fila-${i/4}`} style={localStyles.filaAsientos}>
          <View style={localStyles.ladoIzquierdo}>
            {asientosVisuales.slice(i, i + 2)}
          </View>
          <View style={localStyles.pasillo} />
          <View style={localStyles.ladoDerecho}>
            {asientosVisuales.slice(i + 2, i + 4)}
          </View>
        </View>
      );
    }

    return filas;
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('es-UY', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  const formatTime = (timeString) => {
    try {
      if (timeString.includes('T')) {
        return new Date(timeString).toLocaleTimeString('es-UY', {
          hour: '2-digit',
          minute: '2-digit'
        });
      }
      return timeString.substring(0, 5);
    } catch (error) {
      return timeString;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={globalStyles.safeArea}>
        <View style={[globalStyles.container, globalStyles.centerContent]}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[globalStyles.textBody, { marginTop: 16 }]}>
            Cargando información del viaje...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      {/* Header */}
      <View style={[globalStyles.header, globalStyles.row, globalStyles.spaceBetween]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={localStyles.backButton}
        >
          <Icon name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={globalStyles.headerTitle}>Seleccionar Asiento</Text>
        <View style={localStyles.placeholder} />
      </View>

      <ScrollView
        style={globalStyles.container}
        contentContainerStyle={globalStyles.screenPadding}
      >
        {/* Información del viaje */}
        <View style={globalStyles.card}>
          <Text style={[globalStyles.textHeading3, globalStyles.marginBottomMd]}>
            Información del Viaje
          </Text>

          <View style={localStyles.infoRow}>
            <Icon name="location-outline" size={20} color={theme.colors.textSecondary} />
            <View style={localStyles.infoText}>
              <Text style={globalStyles.textBody}>
                {tripDetail?.ciudadOrigen || tripDetail?.origenNombre || 'Origen'} → {tripDetail?.ciudadDestino || tripDetail?.destinoNombre || 'Destino'}
              </Text>
            </View>
          </View>

          <View style={localStyles.infoRow}>
            <Icon name="calendar-outline" size={20} color={theme.colors.textSecondary} />
            <View style={localStyles.infoText}>
              <Text style={globalStyles.textBody}>
                {formatDate(tripDetail?.fechaSalida || tripDetail?.fecha)}
              </Text>
            </View>
          </View>

          <View style={localStyles.infoRow}>
            <Icon name="time-outline" size={20} color={theme.colors.textSecondary} />
            <View style={localStyles.infoText}>
              <Text style={globalStyles.textBody}>
                {formatTime(tripDetail?.horaSalida)}
              </Text>
            </View>
          </View>

          <View style={localStyles.infoRow}>
            <Icon name="card-outline" size={20} color={theme.colors.textSecondary} />
            <View style={localStyles.infoText}>
              <Text style={globalStyles.textBody}>
                Precio: ${precios.precioBase.toFixed(2)}
                {precios.tieneDescuento && (
                  <Text style={{ color: theme.colors.success }}>
                    {' '}(Descuento {user?.tipoCliente}: -${precios.descuento.toFixed(2)})
                  </Text>
                )}
              </Text>
            </View>
          </View>
        </View>

        {/* Leyenda de asientos */}
        <View style={globalStyles.card}>
          <Text style={[globalStyles.textHeading3, globalStyles.marginBottomMd]}>
            Leyenda
          </Text>

          <View style={localStyles.leyenda}>
            <View style={localStyles.leyendaItem}>
              <View style={[localStyles.leyendaColor, { backgroundColor: theme.colors.success }]} />
              <Text style={globalStyles.textCaption}>Libre</Text>
            </View>
            <View style={localStyles.leyendaItem}>
              <View style={[localStyles.leyendaColor, { backgroundColor: theme.colors.primary }]} />
              <Text style={globalStyles.textCaption}>Seleccionado</Text>
            </View>
            <View style={localStyles.leyendaItem}>
              <View style={[localStyles.leyendaColor, { backgroundColor: theme.colors.error }]} />
              <Text style={globalStyles.textCaption}>Ocupado</Text>
            </View>
          </View>
        </View>

        {/* Mapa de asientos */}
        <View style={globalStyles.card}>
          <Text style={[globalStyles.textHeading3, globalStyles.marginBottomMd]}>
            Seleccionar Asiento
          </Text>

          <View style={localStyles.omnibusContainer}>
            <Text style={[globalStyles.textCaption, { textAlign: 'center', marginBottom: 16 }]}>
              Frente del ómnibus
            </Text>
            <View style={localStyles.mapaAsientos}>
              {renderAsientos()}
            </View>
          </View>
        </View>

        {/* Resumen de precio */}
        {asientoSeleccionado && (
          <View style={globalStyles.card}>
            <Text style={[globalStyles.textHeading3, globalStyles.marginBottomMd]}>
              Resumen de Compra
            </Text>

            <View style={localStyles.priceRow}>
              <Text style={globalStyles.textBody}>Asiento seleccionado:</Text>
              <Text style={[globalStyles.textBody, { fontWeight: '600' }]}>{asientoSeleccionado}</Text>
            </View>

            <View style={localStyles.priceRow}>
              <Text style={globalStyles.textBody}>Precio base:</Text>
              <Text style={[globalStyles.textBody, { fontWeight: '500' }]}>${precios.precioBase.toFixed(2)}</Text>
            </View>

            {precios.tieneDescuento && (
              <View style={localStyles.priceRow}>
                <Text style={[globalStyles.textBody, { color: theme.colors.success }]}>
                  Descuento ({user?.tipoCliente}):
                </Text>
                <Text style={[globalStyles.textBody, { color: theme.colors.success, fontWeight: '500' }]}>
                  -${precios.descuento.toFixed(2)}
                </Text>
              </View>
            )}

            <View style={[localStyles.priceRow, localStyles.totalRow]}>
              <Text style={[globalStyles.textHeading3, { color: theme.colors.text }]}>Total a pagar:</Text>
              <Text style={[globalStyles.textHeading2, { color: theme.colors.primary }]}>${precios.precioFinal.toFixed(2)}</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Botón de continuar */}
      <View style={localStyles.footer}>
        <TouchableOpacity
          style={[
            asientoSeleccionado ? globalStyles.buttonPrimary : globalStyles.buttonSecondary,
            !asientoSeleccionado && { backgroundColor: theme.colors.textSecondary },
            reserving && { opacity: 0.7 }
          ]}
          onPress={handleContinuarPago}
          disabled={!asientoSeleccionado || reserving}
        >
          {reserving ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <ActivityIndicator color="#fff" size="small" />
              <Text style={[globalStyles.buttonText, { color: '#fff' }]}>
                Reservando...
              </Text>
            </View>
          ) : (
            <Text style={[
              asientoSeleccionado ? globalStyles.buttonText : globalStyles.buttonTextSecondary,
              !asientoSeleccionado && { color: '#fff' }
            ]}>
              {asientoSeleccionado ? 'Continuar al Pago' : 'Selecciona un asiento'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// Estilos locales específicos
const localStyles = {
  backButton: {
    padding: 8,
  },
  placeholder: {
    width: 40,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
  },
  leyenda: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  leyendaItem: {
    alignItems: 'center',
    gap: 8,
  },
  leyendaColor: {
    width: 20,
    height: 20,
    borderRadius: 4,
  },
  omnibusContainer: {
    alignItems: 'center',
  },
  mapaAsientos: {
    alignItems: 'center',
    gap: 8,
  },
  filaAsientos: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 8,
  },
  ladoIzquierdo: {
    flexDirection: 'row',
    gap: 8,
  },
  ladoDerecho: {
    flexDirection: 'row',
    gap: 8,
  },
  pasillo: {
    width: 20,
  },
  asiento: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  asientoTexto: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  totalRow: {
    borderBottomWidth: 0,
    borderTopWidth: 2,
    borderTopColor: '#e0e0e0',
    paddingTop: 12,
    marginTop: 8,
  },
  footer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
};