// src/components/PayPalNativePayment.js - Versión corregida con información completa del ómnibus
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/client';

const PayPalNativePayment = ({ route, navigation }) => {
  const { tripId, asientoSeleccionado, user, tripDetail, precios } = route.params;
  const [loading, setLoading] = useState(false);
  const [paypalOrderId, setPaypalOrderId] = useState(null);

  useEffect(() => {
    console.log('PayPal Component loaded with params:', {
      tripId,
      asientoSeleccionado,
      user: user?.id,
      tripDetail,
      precios
    });
  }, []);

  // Funciones auxiliares para formateo
  const formatDate = (dateInput) => {
    if (!dateInput) return '';

    try {
      // Si es un LocalDateTime, extraer solo la fecha
      if (typeof dateInput === 'string' && dateInput.includes('T')) {
        const datePart = dateInput.split('T')[0]; // "2024-01-15T10:30:00" -> "2024-01-15"
        const date = new Date(datePart + 'T00:00:00'); // Evitar problemas de zona horaria
        if (isNaN(date.getTime())) return dateInput;

        return date.toLocaleDateString('es-ES', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      }

      // Si es solo fecha (LocalDate)
      if (typeof dateInput === 'string' && dateInput.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const date = new Date(dateInput + 'T00:00:00');
        if (isNaN(date.getTime())) return dateInput;

        return date.toLocaleDateString('es-ES', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      }

      // Intentar como fecha normal
      const date = new Date(dateInput);
      if (isNaN(date.getTime())) return dateInput;

      return date.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateInput;
    }
  };

  const formatTime = (timeInput) => {
    if (!timeInput) return '';

    try {
      // Si es un LocalDateTime, extraer solo la hora
      if (typeof timeInput === 'string' && timeInput.includes('T')) {
        const timePart = timeInput.split('T')[1]; // "2024-01-15T10:30:00" -> "10:30:00"
        return timePart ? timePart.substring(0, 5) : ''; // "10:30:00" -> "10:30"
      }

      // Si es solo hora (LocalTime) como "10:30:00" o "10:30"
      if (typeof timeInput === 'string') {
        // Si ya tiene formato HH:MM, devolverlo tal como está
        if (timeInput.match(/^\d{1,2}:\d{2}$/)) {
          return timeInput;
        }
        // Si tiene formato HH:MM:SS, quitar los segundos
        if (timeInput.match(/^\d{1,2}:\d{2}:\d{2}$/)) {
          return timeInput.substring(0, 5);
        }
        // Si es más largo, intentar extraer los primeros 5 caracteres
        if (timeInput.length >= 5) {
          return timeInput.substring(0, 5);
        }
        return timeInput;
      }

      // Si es un objeto Date
      if (timeInput instanceof Date) {
        return timeInput.toLocaleTimeString('es-ES', {
          hour: '2-digit',
          minute: '2-digit'
        });
      }

      return timeInput;
    } catch {
      return timeInput?.toString() || '';
    }
  };

  // Registrar la compra en tu backend después del pago exitoso
  const registrarCompraEnBackend = async (paypalTransactionId) => {
    try {
      console.log('📤 Registrando compra en backend...');

      const datosCompra = {
        viajeId: tripId,
        clienteId: user.id,
        numeroAsiento: asientoSeleccionado,
        paypalTransactionId: paypalTransactionId
      };

      console.log('Datos de compra:', datosCompra);

      const response = await apiClient.post('/api/vendedor/pasajes/comprar', datosCompra, true);

      console.log('✅ Compra registrada exitosamente:', response);
      return response;
    } catch (error) {
      console.error('💥 Error registrando compra:', error);
      throw error;
    }
  };

  // Crear orden PayPal usando tu backend
  const crearOrdenPayPal = async () => {
    try {
      console.log('🎯 Creando orden PayPal...');

      const requestBody = { amount: precios.precioFinal };
      console.log('📤 Request body:', requestBody);

      const response = await apiClient.post('/api/paypal/orders', requestBody, true);
      console.log('✅ Orden PayPal creada exitosamente:', response);

      return response;
    } catch (error) {
      console.error('💥 Error creating PayPal order:', error);

      if (error.message.includes('Sesión expirada') || error.message.includes('401')) {
        await AsyncStorage.multiRemove(['auth_token', 'user_data']);
        Alert.alert(
          'Sesión Expirada',
          'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
          [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
        );
        throw new Error('Sesión expirada');
      }

      throw error;
    }
  };

  // Verificar el estado del pago en PayPal
  const verificarPago = async () => {
    if (!paypalOrderId) {
      Alert.alert('Error', 'No hay una orden PayPal para verificar');
      return;
    }

    setLoading(true);

    try {
      console.log('🔍 Verificando pago para orden:', paypalOrderId);

      const captureResponse = await apiClient.get(`/api/paypal/orders/${paypalOrderId}/capture`, true);
      console.log('📦 Respuesta de captura:', captureResponse);

      if (captureResponse.status === 'COMPLETED') {
        console.log('✅ Pago verificado como completado');

        let captureId = null;
        if (captureResponse.purchase_units?.[0]?.payments?.captures?.[0]?.id) {
          captureId = captureResponse.purchase_units[0].payments.captures[0].id;
        }

        if (!captureId) {
          console.error('No se pudo encontrar capture_id en:', captureResponse);
          throw new Error('No se pudo obtener el ID de la transacción');
        }

        console.log('💳 ID de captura obtenido:', captureId);

        await registrarCompraEnBackend(captureId);

        Alert.alert(
          '¡Pago Exitoso! 🎉',
          `Tu pasaje ha sido comprado correctamente.\n\nViaje: ${tripDetail?.ciudadOrigen || tripDetail?.origenNombre} → ${tripDetail?.ciudadDestino || tripDetail?.destinoNombre}\nAsiento: ${asientoSeleccionado}\nPrecio: $${precios.precioFinal.toFixed(2)}`,
          [
            {
              text: 'Ver Mis Pasajes',
              onPress: () => navigation.navigate('Home', { screen: 'Mis Pasajes' }),
              style: 'default'
            },
            {
              text: 'Buscar Más Viajes',
              onPress: () => navigation.navigate('Home', { screen: 'Viajes' }),
              style: 'cancel'
            }
          ]
        );

        setPaypalOrderId(null);

      } else {
        Alert.alert(
          'Pago Pendiente',
          'El pago aún no ha sido completado. Si ya realizaste el pago, espera unos momentos y vuelve a verificar.',
          [
            { text: 'Verificar de Nuevo', onPress: verificarPago },
            { text: 'Cancelar', style: 'cancel' }
          ]
        );
      }

    } catch (error) {
      console.error('Error verificando pago:', error);

      if (error.message.includes('Sesión expirada') || error.message.includes('401')) {
        await AsyncStorage.multiRemove(['auth_token', 'user_data']);
        Alert.alert(
          'Sesión Expirada',
          'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
          [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
        );
      } else {
        Alert.alert(
          'Error',
          'Hubo un problema verificando tu pago. Si el dinero fue debitado, contacta soporte.',
          [
            { text: 'Reintentar', onPress: verificarPago },
            { text: 'Cancelar', style: 'cancel' }
          ]
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Función principal para procesar el pago con PayPal Web
  const procesarPagoPayPal = async () => {
    setLoading(true);

    try {
      const orderData = await crearOrdenPayPal();
      setPaypalOrderId(orderData.id);

      const paypalUrl = `https://www.sandbox.paypal.com/checkoutnow?token=${orderData.id}`;

      console.log('🌐 Navegando a PayPal WebView:', paypalUrl);

      navigation.navigate('PayPalWebView', {
        paypalUrl,
        orderId: orderData.id,
        onPaymentSuccess: (orderId) => {
          console.log('✅ Payment success callback:', orderId);
          setPaypalOrderId(orderId);
          setTimeout(() => {
            verificarPago();
          }, 1000);
        },
        onPaymentCancel: () => {
          console.log('❌ Payment cancelled callback');
          Alert.alert('Pago Cancelado', 'El pago fue cancelado por el usuario.');
          setPaypalOrderId(null);
        }
      });

    } catch (error) {
      console.error('Error en procesarPagoPayPal:', error);
      Alert.alert('Error', error.message || 'No se pudo iniciar el pago');
    } finally {
      setLoading(false);
    }
  };

  // Pago simulado para testing
  const pagoSimulado = async () => {
    Alert.alert(
      'Pago Simulado',
      '¿Confirmas la compra simulada? (Solo para testing)',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            setLoading(true);
            try {
              await registrarCompraEnBackend(`SIM_${Date.now()}`);

              Alert.alert(
                '¡Compra Simulada Exitosa! 🎉',
                `Tu pasaje ha sido comprado (simulado).\n\nViaje: ${tripDetail?.ciudadOrigen || tripDetail?.origenNombre} → ${tripDetail?.ciudadDestino || tripDetail?.destinoNombre}\nAsiento: ${asientoSeleccionado}\nPrecio: $${precios.precioFinal.toFixed(2)}`,
                [
                  {
                    text: 'Ver Mis Pasajes',
                    onPress: () => navigation.navigate('Home', { screen: 'Mis Pasajes' })
                  }
                ]
              );
            } catch (error) {
              Alert.alert('Error', 'No se pudo procesar la compra simulada');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Confirmar Pago</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {/* Resumen del viaje */}
        <View style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>Resumen del Viaje</Text>

          <View style={styles.tripInfo}>
            <View style={styles.routeInfo}>
              <Text style={styles.cityText}>
                {tripDetail?.ciudadOrigen || tripDetail?.origenNombre || 'Origen'}
              </Text>
              <Icon name="arrow-forward" size={20} color="#666" />
              <Text style={styles.cityText}>
                {tripDetail?.ciudadDestino || tripDetail?.destinoNombre || 'Destino'}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Icon name="calendar-outline" size={16} color="#666" />
              <Text style={styles.detailLabel}>Fecha:</Text>
              <Text style={styles.detailValue}>
                {formatDate(
                  tripDetail?.fechaHoraSalida ||
                  tripDetail?.fecha ||
                  tripDetail?.fechaSalida
                )}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Icon name="time-outline" size={16} color="#666" />
              <Text style={styles.detailLabel}>Hora salida:</Text>
              <Text style={styles.detailValue}>
                {formatTime(
                  tripDetail?.fechaHoraSalida ||
                  tripDetail?.horaSalida ||
                  tripDetail?.fechaSalida
                )}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Icon name="time-outline" size={16} color="#666" />
              <Text style={styles.detailLabel}>Hora llegada:</Text>
              <Text style={styles.detailValue}>
                {formatTime(
                  tripDetail?.fechaHoraLlegada ||
                  tripDetail?.horaLlegada ||
                  tripDetail?.fechaLlegada
                ) || 'No disponible'}
              </Text>
            </View>

            {/* Información del ómnibus */}
            {(tripDetail?.omnibusMatricula || tripDetail?.matriculaOmnibus) && (
              <View style={styles.detailRow}>
                <Icon name="bus-outline" size={16} color="#666" />
                <Text style={styles.detailLabel}>Matrícula:</Text>
                <Text style={styles.detailValue}>
                  {tripDetail?.omnibusMatricula || tripDetail?.matriculaOmnibus}
                </Text>
              </View>
            )}

            <View style={styles.detailRow}>
              <Icon name="person-outline" size={16} color="#666" />
              <Text style={styles.detailLabel}>Asiento:</Text>
              <Text style={styles.detailValue}>{asientoSeleccionado}</Text>
            </View>
          </View>
        </View>

        {/* Desglose de precio */}
        <View style={styles.priceCard}>
          <Text style={styles.sectionTitle}>Desglose del Precio</Text>

          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Precio base</Text>
            <Text style={styles.priceValue}>${precios.precioBase.toFixed(2)}</Text>
          </View>

          {precios.tieneDescuento && (
            <View style={styles.priceRow}>
              <Text style={styles.discountLabel}>Descuento ({user.tipoCliente}):</Text>
              <Text style={styles.discountValue}>-${precios.descuento.toFixed(2)}</Text>
            </View>
          )}

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total a pagar</Text>
            <Text style={styles.totalValue}>${precios.precioFinal.toFixed(2)}</Text>
          </View>
        </View>

        {/* Métodos de pago */}
        <View style={styles.paymentCard}>
          <Text style={styles.sectionTitle}>Métodos de Pago</Text>

          {/* Botón PayPal WebView (Recomendado) */}
          <TouchableOpacity
            style={[styles.paymentButton, styles.paypalButton]}
            onPress={procesarPagoPayPal}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Icon name="logo-paypal" size={20} color="#fff" />
                <Text style={styles.paymentButtonText}>Pagar con PayPal</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Botón de verificar pago (si hay una orden pendiente) */}
          {paypalOrderId && (
            <TouchableOpacity
              style={[styles.paymentButton, styles.verifyButton]}
              onPress={verificarPago}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Icon name="checkmark-circle-outline" size={20} color="#fff" />
                  <Text style={styles.paymentButtonText}>Verificar Pago</Text>
                </>
              )}
            </TouchableOpacity>
          )}

          {/* Botón de pago simulado para testing */}
          <TouchableOpacity
            style={[styles.paymentButton, styles.simulatedButton]}
            onPress={pagoSimulado}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Icon name="flask-outline" size={20} color="#fff" />
                <Text style={styles.paymentButtonText}>Pago Simulado (Testing)</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Información adicional */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Información Importante</Text>
          <Text style={styles.infoText}>
            • Tu asiento quedará reservado durante el proceso de pago{'\n'}
            • El pasaje será enviado por email tras confirmar el pago{'\n'}
            • Presenta tu pasaje al conductor antes del viaje{'\n'}
            • Las cancelaciones deben realizarse con al menos 2 horas de anticipación
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
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
  cityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c5530',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    minWidth: 100,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    flex: 1,
  },
  priceCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: '#666',
  },
  priceValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  discountLabel: {
    fontSize: 14,
    color: '#16a34a',
  },
  discountValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#16a34a',
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
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c5530',
  },
  paymentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
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
  verifyButton: {
    backgroundColor: '#16a34a',
  },
  simulatedButton: {
    backgroundColor: '#6b7280',
  },
  paymentButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default PayPalNativePayment;