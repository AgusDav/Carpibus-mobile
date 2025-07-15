import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { apiClient } from '../api/client';
import { globalStyles } from '../styles/globalStyles';
import { useTheme } from '../hooks/useTheme';

const PayPalNativePayment = ({ route, navigation }) => {
  const { tripId, asientoSeleccionado, user, tripDetail, precios } = route.params;
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [paypalOrderId, setPaypalOrderId] = useState(null);

  // Funciones de formateo
  const formatDate = (dateString) => {
    if (!dateString) return 'No disponible';
    try {
      return new Date(dateString).toLocaleDateString('es-UY', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (error) {
      return dateString;
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'No disponible';
    try {
      if (timeString.includes('T')) {
        return new Date(timeString).toLocaleTimeString('es-UY', {
          hour: '2-digit',
          minute: '2-digit',
        });
      }
      return timeString.substring(0, 5);
    } catch (error) {
      return timeString;
    }
  };

  // Función para registrar compra en backend
  const registrarCompraEnBackend = async (paypalOrderId) => {
    try {
      const response = await apiClient.post('/api/cliente/compra-paypal/confirmar', {
        paypalOrderId,
        tripId,
        asientoSeleccionado,
        userId: user.id,
        precioFinal: precios.precioFinal,
      }, true);

      console.log('✅ Compra registrada exitosamente:', response);
      return response;
    } catch (error) {
      console.error('❌ Error al registrar compra:', error);
      throw error;
    }
  };

  // Función principal para procesar pago con PayPal
  const procesarPagoPayPal = async () => {
    try {
      setLoading(true);

      // 1. Crear orden de pago en el backend
      const orderResponse = await apiClient.post('/api/cliente/compra-paypal/crear-orden', {
        tripId,
        asientoSeleccionado,
        userId: user.id,
        precioFinal: precios.precioFinal,
      }, true);

      console.log('✅ Orden PayPal creada:', orderResponse);

      if (!orderResponse?.paypalOrderId || !orderResponse?.approvalUrl) {
        throw new Error('No se pudo crear la orden de pago');
      }

      const { paypalOrderId, approvalUrl } = orderResponse;
      setPaypalOrderId(paypalOrderId);

      // 2. Abrir PayPal en navegador o WebView
      const supported = await Linking.canOpenURL(approvalUrl);
      if (supported) {
        await Linking.openURL(approvalUrl);

        // 3. Escuchar cuando regrese de PayPal
        Linking.addEventListener('url', async (event) => {
          const { url } = event;
          console.log('🔗 URL recibida:', url);

          if (url.includes('success') && url.includes(paypalOrderId)) {
            try {
              setLoading(true);
              await registrarCompraEnBackend(paypalOrderId);

              Alert.alert(
                '¡Compra Exitosa! 🎉',
                `Tu pasaje ha sido comprado.\n\nViaje: ${tripDetail?.ciudadOrigen || tripDetail?.origenNombre} → ${tripDetail?.ciudadDestino || tripDetail?.destinoNombre}\nAsiento: ${asientoSeleccionado}\nPrecio: $${precios.precioFinal.toFixed(2)}`,
                [
                  {
                    text: 'Ver Mis Pasajes',
                    onPress: () => navigation.navigate('Home', { screen: 'Mis Pasajes' })
                  }
                ]
              );
            } catch (error) {
              Alert.alert('Error', 'El pago fue exitoso pero hubo un problema al registrar tu pasaje. Contacta soporte.');
            } finally {
              setLoading(false);
            }
          } else if (url.includes('cancel')) {
            Alert.alert('Pago Cancelado', 'Has cancelado el proceso de pago.');
            setLoading(false);
          }

          // Limpiar listener
          setPaypalOrderId(null);
        });

      } else {
        // Fallback: usar WebView interno
        navigation.navigate('PayPalWebView', {
          paypalUrl: approvalUrl,
          paypalOrderId,
          onPaymentSuccess: async () => {
            try {
              await registrarCompraEnBackend(paypalOrderId);
              Alert.alert('¡Compra Exitosa! 🎉', 'Tu pasaje ha sido comprado.');
              navigation.navigate('Home', { screen: 'Mis Pasajes' });
            } catch (error) {
              Alert.alert('Error', 'Problema al procesar la compra');
            }
          },
          onPaymentCancel: () => {
            Alert.alert('Pago Cancelado', 'Has cancelado el proceso de pago.');
          }
        });
      }

    } catch (error) {
      console.error('Error en procesarPagoPayPal:', error);
      Alert.alert('Error', error.message || 'No se pudo iniciar el pago');
    } finally {
      setLoading(false);
    }
  };

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
        <Text style={globalStyles.headerTitle}>Confirmar Pago</Text>
        <View style={localStyles.placeholder} />
      </View>

      <ScrollView
        style={globalStyles.container}
        contentContainerStyle={globalStyles.screenPadding}
      >
        {/* Resumen del viaje */}
        <View style={globalStyles.card}>
          <Text style={[globalStyles.textHeading3, globalStyles.marginBottomMd]}>
            Resumen del Viaje
          </Text>

          <View style={localStyles.tripInfo}>
            <View style={localStyles.routeInfo}>
              <Text style={[globalStyles.textHeading3, { color: theme.colors.primary }]}>
                {tripDetail?.ciudadOrigen || tripDetail?.origenNombre || 'Origen'}
              </Text>
              <Icon name="arrow-forward" size={20} color={theme.colors.textSecondary} />
              <Text style={[globalStyles.textHeading3, { color: theme.colors.primary }]}>
                {tripDetail?.ciudadDestino || tripDetail?.destinoNombre || 'Destino'}
              </Text>
            </View>

            <View style={localStyles.detailRow}>
              <Icon name="calendar-outline" size={16} color={theme.colors.textSecondary} />
              <Text style={[globalStyles.textCaption, localStyles.detailLabel]}>Fecha:</Text>
              <Text style={[globalStyles.textBody, localStyles.detailValue]}>
                {formatDate(
                  tripDetail?.fechaHoraSalida ||
                  tripDetail?.fecha ||
                  tripDetail?.fechaSalida
                )}
              </Text>
            </View>

            <View style={localStyles.detailRow}>
              <Icon name="time-outline" size={16} color={theme.colors.textSecondary} />
              <Text style={[globalStyles.textCaption, localStyles.detailLabel]}>Hora salida:</Text>
              <Text style={[globalStyles.textBody, localStyles.detailValue]}>
                {formatTime(
                  tripDetail?.fechaHoraSalida ||
                  tripDetail?.horaSalida ||
                  tripDetail?.fechaSalida
                )}
              </Text>
            </View>

            <View style={localStyles.detailRow}>
              <Icon name="time-outline" size={16} color={theme.colors.textSecondary} />
              <Text style={[globalStyles.textCaption, localStyles.detailLabel]}>Hora llegada:</Text>
              <Text style={[globalStyles.textBody, localStyles.detailValue]}>
                {formatTime(
                  tripDetail?.fechaHoraLlegada ||
                  tripDetail?.horaLlegada ||
                  tripDetail?.fechaLlegada
                ) || 'No disponible'}
              </Text>
            </View>

            {/* Información del ómnibus */}
            {(tripDetail?.omnibusMatricula || tripDetail?.matriculaOmnibus) && (
              <View style={localStyles.detailRow}>
                <Icon name="bus-outline" size={16} color={theme.colors.textSecondary} />
                <Text style={[globalStyles.textCaption, localStyles.detailLabel]}>Matrícula:</Text>
                <Text style={[globalStyles.textBody, localStyles.detailValue]}>
                  {tripDetail?.omnibusMatricula || tripDetail?.matriculaOmnibus}
                </Text>
              </View>
            )}

            <View style={localStyles.detailRow}>
              <Icon name="person-outline" size={16} color={theme.colors.textSecondary} />
              <Text style={[globalStyles.textCaption, localStyles.detailLabel]}>Asiento:</Text>
              <Text style={[globalStyles.textBody, localStyles.detailValue]}>{asientoSeleccionado}</Text>
            </View>
          </View>
        </View>

        {/* Desglose de precio */}
        <View style={globalStyles.card}>
          <Text style={[globalStyles.textHeading3, globalStyles.marginBottomMd]}>
            Desglose del Precio
          </Text>

          <View style={localStyles.priceRow}>
            <Text style={globalStyles.textCaption}>Precio base</Text>
            <Text style={[globalStyles.textBody, { fontWeight: '500' }]}>${precios.precioBase.toFixed(2)}</Text>
          </View>

          {precios.tieneDescuento && (
            <View style={localStyles.priceRow}>
              <Text style={[globalStyles.textCaption, { color: theme.colors.success }]}>
                Descuento ({user.tipoCliente}):
              </Text>
              <Text style={[globalStyles.textBody, { fontWeight: '500', color: theme.colors.success }]}>
                -${precios.descuento.toFixed(2)}
              </Text>
            </View>
          )}

          <View style={localStyles.totalRow}>
            <Text style={[globalStyles.textHeading3, { color: theme.colors.text }]}>Total a pagar</Text>
            <Text style={[globalStyles.textHeading2, { color: theme.colors.primary }]}>${precios.precioFinal.toFixed(2)}</Text>
          </View>
        </View>

        {/* Métodos de pago */}
        <View style={globalStyles.card}>
          <Text style={[globalStyles.textHeading3, globalStyles.marginBottomMd]}>
            Métodos de Pago
          </Text>

          {/* Botón PayPal */}
          <TouchableOpacity
            style={[localStyles.paymentButton, localStyles.paypalButton]}
            onPress={procesarPagoPayPal}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Icon name="logo-paypal" size={20} color="#fff" />
                <Text style={localStyles.paymentButtonText}>Pagar con PayPal</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Información adicional */}
        <View style={[globalStyles.card, { backgroundColor: theme.colors.background }]}>
          <Text style={[globalStyles.textHeading3, globalStyles.marginBottomMd]}>
            Información Importante
          </Text>
          <Text style={[globalStyles.textCaption, { lineHeight: 20 }]}>
            • Tu asiento quedará reservado durante el proceso de pago{'\n'}
            • El pasaje será enviado por email tras confirmar el pago{'\n'}
            • Presenta tu pasaje al conductor antes del viaje{'\n'}
            • Las cancelaciones deben realizarse con al menos 24 horas de anticipación
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Estilos locales específicos
const localStyles = {
  backButton: {
    padding: 8,
  },
  placeholder: {
    width: 40,
  },
  tripInfo: {
    gap: 12,
  },
  routeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailLabel: {
    minWidth: 100,
  },
  detailValue: {
    flex: 1,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  paymentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 12,
    gap: 8,
  },
  paypalButton: {
    backgroundColor: '#0070ba',
  },
  paymentButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
};

export default PayPalNativePayment;