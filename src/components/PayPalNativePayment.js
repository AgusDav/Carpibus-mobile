// src/components/PayPalNativePayment.js - Solución con WebView
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
      precios
    });
  }, []);

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

      // Usar el endpoint correcto para compra individual
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

  // Función principal para procesar el pago con PayPal Web
  const procesarPagoPayPal = async () => {
    setLoading(true);

    try {
      // 1. Crear orden en PayPal
      const orderData = await crearOrdenPayPal();
      setPaypalOrderId(orderData.id);

      // 2. Construir URL de PayPal para sandbox
      const paypalUrl = `https://www.sandbox.paypal.com/checkoutnow?token=${orderData.id}`;

      console.log('🌐 Navegando a PayPal WebView:', paypalUrl);

      // 3. Navegar al WebView de PayPal
      navigation.navigate('PayPalWebView', {
        paypalUrl,
        orderId: orderData.id,
        onPaymentSuccess: (orderId) => {
          console.log('✅ Payment success callback:', orderId);
          setPaypalOrderId(orderId);
          // Automáticamente verificar el pago después del éxito
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

  // También agregar una opción para usar el navegador externo como fallback
  const procesarPagoExternalBrowser = async () => {
    setLoading(true);

    try {
      // 1. Crear orden en PayPal
      const orderData = await crearOrdenPayPal();
      setPaypalOrderId(orderData.id);

      // 2. Construir URL de PayPal para sandbox
      const paypalUrl = `https://www.sandbox.paypal.com/checkoutnow?token=${orderData.id}`;

      console.log('🌐 Abriendo PayPal en navegador externo:', paypalUrl);

      // 3. Intentar abrir en navegador externo (método mejorado)
      try {
        await Linking.openURL(paypalUrl);
        console.log('✅ PayPal URL abierta exitosamente');

        Alert.alert(
          'PayPal Abierto',
          'PayPal se ha abierto en tu navegador. Después de completar el pago, regresa a la app y presiona "Verificar Pago".',
          [{ text: 'Entendido' }]
        );
      } catch (linkingError) {
        console.error('❌ Error opening PayPal URL:', linkingError);

        // Fallback: mostrar URL para copiar manualmente
        Alert.alert(
          'Abrir PayPal Manualmente',
          `No se pudo abrir PayPal automáticamente.\n\nURL: ${paypalUrl}`,
          [
            {
              text: 'Copiar URL',
              onPress: () => {
                console.log('URL para copiar:', paypalUrl);
                Alert.alert(
                  'URL para PayPal',
                  'Copia esta URL y ábrela en tu navegador para completar el pago.',
                  [{ text: 'OK' }]
                );
              }
            },
            { text: 'Cancelar', style: 'cancel' }
          ]
        );
      }

    } catch (error) {
      console.error('Error en procesarPagoExternalBrowser:', error);
      Alert.alert('Error', error.message || 'No se pudo iniciar el pago');
    } finally {
      setLoading(false);
    }
  };

  // Verificar el estado del pago después de que el usuario regrese
  const verificarPago = async () => {
    if (!paypalOrderId) {
      Alert.alert('Error', 'No hay una orden de PayPal activa');
      return;
    }

    setLoading(true);

    try {
      console.log('🔍 Verificando pago para orden:', paypalOrderId);

      // Capturar el pago usando tu backend
      const captureResponse = await apiClient.post(`/api/paypal/orders/${paypalOrderId}/capture`, {}, true);

      console.log('📨 Respuesta de captura:', captureResponse);

      if (captureResponse.status === 'COMPLETED') {
        // Pago exitoso - extraer el ID de la transacción
        let captureId = null;

        if (captureResponse.purchase_units &&
            captureResponse.purchase_units[0]?.payments?.captures?.[0]?.id) {
          captureId = captureResponse.purchase_units[0].payments.captures[0].id;
        }

        if (!captureId) {
          console.error('No se pudo encontrar capture_id en:', captureResponse);
          throw new Error('No se pudo obtener el ID de la transacción');
        }

        console.log('💳 ID de captura obtenido:', captureId);

        // Registrar compra en tu backend
        await registrarCompraEnBackend(captureId);

        // Mostrar confirmación de éxito
        Alert.alert(
          '¡Pago Exitoso! 🎉',
          `Tu pasaje ha sido comprado correctamente.\n\nViaje: ${tripDetail.ciudadOrigen} → ${tripDetail.ciudadDestino}\nAsiento: ${asientoSeleccionado}\nPrecio: $${precios.precioFinal.toFixed(2)}`,
          [
            {
              text: 'Ver Mis Pasajes',
              // CORREGIDO: Navegación correcta al TabNavigator
              onPress: () => navigation.navigate('Home', { screen: 'Mis Pasajes' }),
              style: 'default'
            },
            {
              text: 'Buscar Más Viajes',
              // CORREGIDO: Navegación correcta al TabNavigator
              onPress: () => navigation.navigate('Home', { screen: 'Viajes' }),
              style: 'cancel'
            }
          ]
        );

        // Limpiar el ID de la orden
        setPaypalOrderId(null);

      } else {
        // Pago no completado
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
              // Simular transacción con ID ficticio
              await registrarCompraEnBackend(`SIM_${Date.now()}`);

              Alert.alert(
                '¡Compra Simulada Exitosa! 🎉',
                `Tu pasaje ha sido comprado (simulado).\n\nViaje: ${tripDetail.ciudadOrigen} → ${tripDetail.ciudadDestino}\nAsiento: ${asientoSeleccionado}\nPrecio: $${precios.precioFinal.toFixed(2)}`,
                [
                  {
                    text: 'Ver Mis Pasajes',
                    // CORREGIDO: Navegación correcta al TabNavigator
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
              <Text style={styles.cityText}>{tripDetail?.ciudadOrigen}</Text>
              <Icon name="arrow-forward" size={20} color="#666" />
              <Text style={styles.cityText}>{tripDetail?.ciudadDestino}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Fecha:</Text>
              <Text style={styles.detailValue}>
                {new Date(tripDetail?.fechaHoraSalida).toLocaleDateString()}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Hora:</Text>
              <Text style={styles.detailValue}>
                {new Date(tripDetail?.fechaHoraSalida).toLocaleTimeString()}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Asiento:</Text>
              <Text style={styles.detailValue}>{asientoSeleccionado}</Text>
            </View>
          </View>
        </View>

        {/* Desglose de precio */}
        <View style={styles.priceCard}>
          <Text style={styles.sectionTitle}>Desglose del Precio</Text>

          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Precio base:</Text>
            <Text style={styles.priceValue}>${precios.precioBase.toFixed(2)}</Text>
          </View>

          {precios.tieneDescuento && (
            <View style={styles.priceRow}>
              <Text style={styles.discountLabel}>Descuento ({user.tipoCliente}):</Text>
              <Text style={styles.discountValue}>-${precios.descuento.toFixed(2)}</Text>
            </View>
          )}

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total a pagar:</Text>
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
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <>
                <Icon name="logo-paypal" size={24} color="#FFF" />
                <Text style={styles.paypalButtonText}>
                  Pagar con PayPal
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* Botón verificar pago (solo visible si hay orden activa) */}
          {paypalOrderId && (
            <TouchableOpacity
              style={[styles.paymentButton, styles.verifyButton]}
              onPress={verificarPago}
              disabled={loading}
            >
              <Icon name="checkmark-circle" size={24} color="#2c5530" />
              <Text style={styles.verifyButtonText}>
                Verificar Pago
              </Text>
            </TouchableOpacity>
          )}

          {/* Botón pago simulado (solo para desarrollo) */}
          <TouchableOpacity
            style={[styles.paymentButton, styles.simulatedButton]}
            onPress={pagoSimulado}
            disabled={loading}
          >
            <Icon name="flask" size={24} color="#666" />
            <Text style={styles.simulatedButtonText}>
              Pago Simulado (Testing)
            </Text>
          </TouchableOpacity>
        </View>

        {/* Información adicional */}
        <View style={styles.infoCard}>
          {paypalOrderId && (
            <View style={styles.orderInfo}>
              <Text style={styles.orderIdLabel}>ID de Orden PayPal:</Text>
              <Text style={styles.orderIdValue}>{paypalOrderId}</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const newStyles = {
  paypalExternalButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#0070ba',
  },
  paypalExternalButtonText: {
    color: '#0070ba',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
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
    fontWeight: 'bold',
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  priceCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  paymentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoCard: {
    backgroundColor: '#e8f4fd',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  tripInfo: {
    marginTop: 8,
  },
  routeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  cityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginHorizontal: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: '#666',
  },
  priceValue: {
    fontSize: 14,
    color: '#333',
  },
  discountLabel: {
    fontSize: 14,
    color: '#e74c3c',
  },
  discountValue: {
    fontSize: 14,
    color: '#e74c3c',
    fontWeight: '500',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c5530',
  },
  paymentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 12,
  },
  paypalButton: {
    backgroundColor: '#0070ba',
  },
  paypalButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  verifyButton: {
    backgroundColor: '#e8f5e8',
    borderWidth: 1,
    borderColor: '#2c5530',
  },
  verifyButtonText: {
    color: '#2c5530',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  simulatedButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  simulatedButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c5530',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#2c5530',
    marginBottom: 4,
  },
  orderInfo: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  orderIdLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  orderIdValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
});

export default PayPalNativePayment;