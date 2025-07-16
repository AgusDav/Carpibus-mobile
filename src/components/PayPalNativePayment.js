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
import { apiClient } from '../api/client';
import { globalStyles } from '../styles/globalStyles';
import { useTheme } from '../hooks/useTheme';

const PayPalNativePayment = ({ route, navigation }) => {
  const { tripId, asientoSeleccionado, user, tripDetail, precios, reservaExpiraEn } = route.params;
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [paypalOrderId, setPaypalOrderId] = useState(null);
  const [tiempoRestante, setTiempoRestante] = useState("10:00");
  const [reservaExpirada, setReservaExpirada] = useState(false);

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

  // Hook para manejar el temporizador de reserva
  useEffect(() => {
    if (!reservaExpiraEn) {
      setReservaExpirada(true);
      return;
    }

    const interval = setInterval(() => {
      const segundosTotales = Math.round((new Date(reservaExpiraEn) - new Date()) / 1000);
      if (segundosTotales <= 0) {
        setTiempoRestante("00:00");
        setReservaExpirada(true);
        clearInterval(interval);
        Alert.alert(
          'Reserva Expirada',
          'Tu reserva ha expirado. Por favor, selecciona nuevamente tu asiento.',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack()
            }
          ]
        );
      } else {
        const minutos = Math.floor(segundosTotales / 60);
        const segundos = segundosTotales % 60;
        setTiempoRestante(`${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [reservaExpiraEn, navigation]);

  // Función para confirmar compra usando el endpoint existente
  const confirmarCompraEnBackend = async (paypalOrderId) => {
    try {
      setLoading(true);

      console.log('🔄 Confirmando compra en backend con PayPal Order ID:', paypalOrderId);

      // 1. Primero capturar el pago en PayPal para obtener el transaction ID
      const captureDetails = await apiClient.capturarPagoPayPal(paypalOrderId);
      console.log('💰 Captura de PayPal:', captureDetails);

      if (captureDetails.status !== 'COMPLETED') {
        throw new Error('El pago no pudo ser completado en PayPal.');
      }

      // 2. Extraer el transaction ID de la captura
      let transactionId = null;
      if (captureDetails.purchase_units && captureDetails.purchase_units[0]?.payments?.captures?.[0]?.id) {
        transactionId = captureDetails.purchase_units[0].payments.captures[0].id;
      }

      if (!transactionId) {
        throw new Error('No se pudo obtener el ID de la transacción de PayPal.');
      }

      console.log('🆔 Transaction ID obtenido:', transactionId);

      // 3. Confirmar la compra usando el endpoint existente de comprar-multiple
      const compraMultipleDTO = {
        viajeId: tripId,
        clienteId: user.id,
        numerosAsiento: [asientoSeleccionado], // Array con un solo asiento
        paypalTransactionId: transactionId
      };

      console.log('📝 Confirmando compra con DTO:', compraMultipleDTO);

      const confirmarResponse = await apiClient.confirmarCompraPasajes(compraMultipleDTO);

      console.log('✅ Compra confirmada exitosamente:', confirmarResponse);

      // 4. Mostrar éxito y navegar
      Alert.alert(
        '🎉 ¡Compra Exitosa!',
        `Tu pasaje para el asiento ${asientoSeleccionado} ha sido comprado exitosamente. Recibirás los detalles por email.`,
        [
          {
            text: 'Ver Mis Pasajes',
            onPress: () => navigation.navigate('Home', { screen: 'Mis Pasajes' })
          }
        ]
      );

    } catch (error) {
      console.error('❌ Error al confirmar compra:', error);
      Alert.alert(
        'Error',
        error.message || 'Hubo un problema al confirmar tu compra. Contacta soporte si el pago fue descontado.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  // Función principal para procesar pago con PayPal
  const procesarPagoPayPal = async () => {
    if (reservaExpirada) {
      Alert.alert('Reserva Expirada', 'Tu reserva ha expirado. Selecciona nuevamente tu asiento.');
      navigation.goBack();
      return;
    }

    try {
      setLoading(true);

      console.log('🔄 Iniciando proceso de pago PayPal...');

      // 1. Crear orden de pago usando el endpoint existente de PayPal
      const paypalOrder = await apiClient.crearOrdenPayPal(precios.precioFinal);
      console.log('✅ Orden PayPal creada:', paypalOrder);

      if (!paypalOrder.id) {
        throw new Error('No se pudo crear la orden de pago');
      }

      // 2. Extraer approval URL
      const approvalUrl = paypalOrder.links?.find(link => link.rel === 'approve')?.href;

      if (!approvalUrl) {
        throw new Error('No se pudo obtener la URL de aprobación de PayPal');
      }

      setPaypalOrderId(paypalOrder.id);

      // 3. Navegar al WebView de PayPal en lugar de abrir navegador externo
      navigation.navigate('PayPalWebView', {
        paypalUrl: approvalUrl,
        orderId: paypalOrder.id,
        orderData: paypalOrder,
        onPaymentSuccess: (orderId) => {
          console.log('🎉 Pago exitoso detectado:', orderId);
          confirmarCompraEnBackend(orderId);
        },
        onPaymentCancel: () => {
          console.log('❌ Pago cancelado por el usuario');
          Alert.alert('Pago Cancelado', 'Has cancelado el proceso de pago.');
          setPaypalOrderId(null);
        }
      });

    } catch (error) {
      console.error('❌ Error en procesarPagoPayPal:', error);
      Alert.alert('Error', error.message || 'No se pudo iniciar el pago');
      setPaypalOrderId(null);
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
          disabled={loading}
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
        {/* Timer de reserva */}
        {!reservaExpirada && (
          <View style={[globalStyles.card, { backgroundColor: reservaExpirada ? theme.colors.error : theme.colors.primary }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="timer-outline" size={20} color="#fff" />
              <Text style={[globalStyles.textBody, { color: '#fff', marginLeft: 8, fontWeight: '600' }]}>
                Tiempo restante: {tiempoRestante}
              </Text>
            </View>
            <Text style={[globalStyles.textCaption, { color: '#fff', textAlign: 'center', marginTop: 4 }]}>
              Tu asiento está reservado
            </Text>
          </View>
        )}

        {reservaExpirada && (
          <View style={[globalStyles.card, { backgroundColor: theme.colors.error }]}>
            <Text style={[globalStyles.textBody, { color: '#fff', textAlign: 'center', fontWeight: '600' }]}>
              ⏰ Reserva Expirada
            </Text>
            <Text style={[globalStyles.textCaption, { color: '#fff', textAlign: 'center', marginTop: 4 }]}>
              Tu reserva ha expirado. Selecciona nuevamente tu asiento.
            </Text>
          </View>
        )}

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
                {formatDate(tripDetail?.fechaSalida || tripDetail?.fecha)}
              </Text>
            </View>

            <View style={localStyles.detailRow}>
              <Icon name="time-outline" size={16} color={theme.colors.textSecondary} />
              <Text style={[globalStyles.textCaption, localStyles.detailLabel]}>Hora:</Text>
              <Text style={[globalStyles.textBody, localStyles.detailValue]}>
                {formatTime(tripDetail?.horaSalida)}
              </Text>
            </View>

            <View style={localStyles.detailRow}>
              <Icon name="bus-outline" size={16} color={theme.colors.textSecondary} />
              <Text style={[globalStyles.textCaption, localStyles.detailLabel]}>Asiento:</Text>
              <Text style={[globalStyles.textBody, localStyles.detailValue, { fontWeight: '600' }]}>
                #{asientoSeleccionado}
              </Text>
            </View>
          </View>
        </View>

        {/* Detalles de precio */}
        <View style={globalStyles.card}>
          <Text style={[globalStyles.textHeading3, globalStyles.marginBottomMd]}>
            Detalles del Precio
          </Text>

          <View style={localStyles.priceRow}>
            <Text style={globalStyles.textBody}>Precio base:</Text>
            <Text style={globalStyles.textBody}>${precios.precioBase.toFixed(2)}</Text>
          </View>

          {precios.tieneDescuento && (
            <View style={localStyles.priceRow}>
              <Text style={[globalStyles.textBody, { color: theme.colors.success }]}>
                Descuento ({user?.tipoCliente}):
              </Text>
              <Text style={[globalStyles.textBody, { color: theme.colors.success }]}>
                -${precios.descuento.toFixed(2)}
              </Text>
            </View>
          )}

          <View style={localStyles.totalRow}>
            <Text style={[globalStyles.textHeading3, { color: theme.colors.text }]}>Total a pagar:</Text>
            <Text style={[globalStyles.textHeading2, { color: theme.colors.primary }]}>
              ${precios.precioFinal.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Botón de pago */}
        <View style={{ marginTop: 20 }}>
          <TouchableOpacity
            style={[
              localStyles.paymentButton,
              localStyles.paypalButton,
              (loading || reservaExpirada) && { opacity: 0.6 }
            ]}
            onPress={procesarPagoPayPal}
            disabled={loading || reservaExpirada}
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
            • Tu asiento está reservado por 10 minutos{'\n'}
            • Completa el pago antes de que expire la reserva{'\n'}
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