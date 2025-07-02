// PayPalNativePayment.js - Usando token igual que PurchaseScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/client';

const PayPalNativePayment = ({ route, navigation }) => {
  const { tripId, asientoSeleccionado, user } = route.params;
  const [loading, setLoading] = useState(false);
  const [tripDetail, setTripDetail] = useState(null);

  useEffect(() => {
    loadTripData();
  }, []);

  const loadTripData = async () => {
    try {
      const response = await apiClient.get(`/api/vendedor/viajes/${tripId}/detalles-asientos`, true);
      setTripDetail(response);
    } catch (error) {
      console.error('Error loading trip data:', error);
      Alert.alert('Error', 'No se pudo cargar la información del viaje');
      navigation.goBack();
    }
  };

  // Calcular precio con descuentos
  const calcularPrecio = () => {
    const precioBase = parseFloat(tripDetail?.precio || 0);
    const esElegibleParaDescuento = user?.tipoCliente === 'JUBILADO' || user?.tipoCliente === 'ESTUDIANTE';

    if (esElegibleParaDescuento) {
      const descuento = precioBase * 0.20;
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

  // ========================================
  // PASO 1: Crear orden PayPal usando tu backend
  // ========================================
  const createPayPalOrder = async () => {
    try {
      console.log('🚀 Creando orden PayPal con monto:', precios.precioFinal);
      console.log('👤 Usuario ID:', user.id);

      const requestBody = { amount: precios.precioFinal };
      console.log('📤 Request body:', requestBody);

      // USAR APICLIENT IGUAL QUE EN PURCHASESCREEN
      const response = await apiClient.post('/paypal/orders', requestBody, true);
      console.log('✅ Orden PayPal creada exitosamente:', response);

      return response;

    } catch (error) {
      console.error('💥 Error creating PayPal order:', error);

      if (error.message.includes('Error en la solicitud')) {
        throw new Error('Error de autenticación. Por favor, inicia sesión nuevamente.');
      } else if (error.message.includes('Network request failed')) {
        throw new Error('Error de conexión. Verifica tu conexión a internet.');
      } else {
        throw new Error(`Error al crear orden PayPal: ${error.message}`);
      }
    }
  };

  // ========================================
  // PASO 2: Abrir PayPal en navegador
  // ========================================
  const openPayPalPayment = async () => {
    setLoading(true);

    try {
      // 1. Crear orden usando tu backend
      const orderData = await createPayPalOrder();

      // 2. Construir URL de PayPal con parámetros adicionales
      const paypalUrl = `https://www.paypal.com/checkoutnow?token=${orderData.id}&useraction=commit&flow=minified`;

      console.log('Abriendo PayPal URL:', paypalUrl);

      // 3. Configurar listener para el retorno
      setupReturnListener(orderData.id);

      // 4. Abrir PayPal
      const canOpen = await Linking.canOpenURL(paypalUrl);
      if (canOpen) {
        await Linking.openURL(paypalUrl);
      } else {
        throw new Error('No se puede abrir PayPal');
      }

    } catch (error) {
      console.error('PayPal payment error:', error);
      Alert.alert('Error', error.message || 'Error al iniciar el pago');
      setLoading(false);
    }
  };

  // ========================================
  // PASO 3: Manejar retorno desde PayPal
  // ========================================
  const setupReturnListener = (orderId) => {
    let hasHandled = false; // Evitar múltiples procesamientos

    const handleDeepLink = async (event) => {
      if (hasHandled) return;

      const { url } = event;
      console.log('Deep link received:', url);

      // Remover listener
      Linking.removeEventListener('url', handleDeepLink);
      hasHandled = true;

      if (url.includes('payment-success') || url.includes('success')) {
        await handlePaymentSuccess(orderId);
      } else if (url.includes('payment-cancel') || url.includes('cancel')) {
        handlePaymentCancel();
      } else {
        // Si no es claro el resultado, verificar el estado
        await checkPaymentStatus(orderId);
      }

      setLoading(false);
    };

    // Configurar listener
    Linking.addEventListener('url', handleDeepLink);

    // Timeout de seguridad
    setTimeout(() => {
      if (!hasHandled) {
        Linking.removeEventListener('url', handleDeepLink);
        setLoading(false);

        Alert.alert(
          'Tiempo agotado',
          '¿Completaste el pago en PayPal?',
          [
            { text: 'No, cancelar', style: 'cancel' },
            { text: 'Sí, verificar', onPress: () => checkPaymentStatus(orderId) }
          ]
        );
      }
    }, 300000); // 5 minutos
  };

  // ========================================
  // PASO 4: Capturar pago y registrar compra
  // ========================================
  const handlePaymentSuccess = async (orderId) => {
    try {
      console.log('Procesando pago exitoso para orden:', orderId);

      // 1. Capturar pago usando apiClient (igual que PurchaseScreen)
      const captureResponse = await apiClient.post(`/paypal/orders/${orderId}/capture`, {}, true);
      console.log('Respuesta de captura PayPal:', captureResponse);

      if (captureResponse.status !== 'COMPLETED') {
        throw new Error('El pago no pudo ser completado en PayPal');
      }

      // 2. Extraer el ID de la transacción (igual que en tu web)
      let captureId = null;
      if (captureResponse.purchase_units && captureResponse.purchase_units[0]?.payments?.captures?.[0]?.id) {
        captureId = captureResponse.purchase_units[0].payments.captures[0].id;
      }

      if (!captureId) {
        console.error('No se pudo encontrar capture_id en:', captureResponse);
        throw new Error('No se pudo obtener el ID de la transacción');
      }

      console.log('ID de captura obtenido:', captureId);

      // 3. Registrar compra en tu backend (usando apiClient igual que PurchaseScreen)
      await registrarCompraEnBackend(captureId);

      // 4. Mostrar confirmación
      Alert.alert(
        '¡Pago Exitoso!',
        'Tu pasaje ha sido comprado correctamente',
        [
          {
            text: 'Ver Mis Pasajes',
            onPress: () => navigation.navigate('Mis Pasajes')
          },
          {
            text: 'Buscar Más Viajes',
            onPress: () => navigation.navigate('Viajes')
          }
        ]
      );

    } catch (error) {
      console.error('Error processing payment success:', error);
      Alert.alert(
        'Error al confirmar pago',
        'Hubo un problema al confirmar tu pago. Si el dinero fue debitado, contacta soporte.'
      );
    }
  };

  const handlePaymentCancel = () => {
    Alert.alert(
      'Pago Cancelado',
      'El pago fue cancelado. Puedes intentar nuevamente.'
    );
  };

  // ========================================
  // PASO 5: Registrar compra (usando apiClient igual que PurchaseScreen)
  // ========================================
  const registrarCompraEnBackend = async (paypalTransactionId) => {
    try {
      // Usar apiClient igual que en PurchaseScreen.js
      const compraData = {
        viajeId: parseInt(tripId),
        clienteId: user.id,
        numeroAsiento: asientoSeleccionado,
        paypalTransactionId: paypalTransactionId
      };

      console.log('Registrando compra:', compraData);

      // USAR APICLIENT IGUAL QUE EN PURCHASESCREEN
      const response = await apiClient.post('/vendedor/pasajes/comprar', compraData, true);

      console.log('Compra registrada exitosamente:', response);
      return response;
    } catch (error) {
      console.error('Error registering purchase:', error);
      throw error;
    }
  };

  // Verificar estado del pago
  const checkPaymentStatus = async (orderId) => {
    try {
      setLoading(true);
      await handlePaymentSuccess(orderId);
    } catch (error) {
      console.error('Error checking payment status:', error);
      Alert.alert(
        'Error',
        'No se pudo verificar el estado del pago. Intenta más tarde.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (!tripDetail) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Cargando información del viaje...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pago con PayPal</Text>
      </View>

      <View style={styles.content}>
        {/* Resumen del pedido */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumen del Pedido</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Ruta:</Text>
            <Text style={styles.summaryValue}>
              {tripDetail.origenNombre} → {tripDetail.destinoNombre}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Asiento:</Text>
            <Text style={styles.summaryValue}>{asientoSeleccionado}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Precio base:</Text>
            <Text style={styles.summaryValue}>${precios.precioBase.toFixed(2)}</Text>
          </View>

          {precios.tieneDescuento && (
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, styles.discountText]}>
                Descuento ({user?.tipoCliente}):
              </Text>
              <Text style={[styles.summaryValue, styles.discountText]}>
                -${precios.descuento.toFixed(2)}
              </Text>
            </View>
          )}

          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total a pagar:</Text>
            <Text style={styles.totalValue}>${precios.precioFinal.toFixed(2)}</Text>
          </View>
        </View>

        {/* Información de PayPal */}
        <View style={styles.section}>
          <View style={styles.paypalInfo}>
            <Icon name="logo-paypal" size={60} color="#0070ba" />
            <Text style={styles.paypalTitle}>Pagar con PayPal</Text>
            <Text style={styles.paypalDescription}>
              Serás redirigido a PayPal para completar tu pago de forma segura.
              La app se reabrirá automáticamente cuando termines.
            </Text>
          </View>
        </View>

        {/* Pasos del proceso */}
        <View style={styles.section}>
          <Text style={styles.stepsTitle}>Cómo funciona:</Text>
          <View style={styles.step}>
            <Text style={styles.stepNumber}>1</Text>
            <Text style={styles.stepText}>Se abrirá PayPal en tu navegador</Text>
          </View>
          <View style={styles.step}>
            <Text style={styles.stepNumber}>2</Text>
            <Text style={styles.stepText}>Inicia sesión y confirma el pago</Text>
          </View>
          <View style={styles.step}>
            <Text style={styles.stepNumber}>3</Text>
            <Text style={styles.stepText}>Regresarás automáticamente a la app</Text>
          </View>
        </View>

        {/* Información de seguridad */}
        <View style={styles.securityInfo}>
          <Icon name="shield-checkmark" size={20} color="#4CAF50" />
          <Text style={styles.securityText}>
            Pago protegido por PayPal - Misma seguridad que la web
          </Text>
        </View>
      </View>

      {/* Botón de pago */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.payButton, loading && styles.payButtonDisabled]}
          onPress={openPayPalPayment}
          disabled={loading}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color="#fff" />
              <Text style={styles.loadingText}>Abriendo PayPal...</Text>
            </View>
          ) : (
            <Text style={styles.payButtonText}>
              Pagar ${precios.precioFinal.toFixed(2)} con PayPal
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 16,
    color: '#333',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  summaryLabel: {
    fontSize: 16,
    color: '#333',
  },
  summaryValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  discountText: {
    color: '#4CAF50',
  },
  totalRow: {
    borderBottomWidth: 0,
    borderTopWidth: 2,
    borderTopColor: '#e0e0e0',
    paddingTop: 12,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#007AFF',
  },
  paypalInfo: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  paypalTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#0070ba',
    marginTop: 12,
    marginBottom: 12,
  },
  paypalDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  stepsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#0070ba',
    color: '#fff',
    textAlign: 'center',
    lineHeight: 24,
    fontSize: 12,
    fontWeight: '600',
    marginRight: 12,
  },
  stepText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  securityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  securityText: {
    fontSize: 14,
    color: '#666',
  },
  footer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  payButton: {
    backgroundColor: '#0070ba',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  payButtonDisabled: {
    backgroundColor: '#ccc',
  },
  payButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default PayPalNativePayment;