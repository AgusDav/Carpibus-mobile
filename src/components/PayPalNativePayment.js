// PayPalNativePayment.js - Versión corregida con debug de autenticación
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/client';

const PayPalNativePayment = ({ route, navigation }) => {
  const { tripId, asientoSeleccionado, user } = route.params;
  const [loading, setLoading] = useState(false);
  const [tripDetail, setTripDetail] = useState(null);

  useEffect(() => {
    loadTripData();
    // Debug token al cargar el componente
    debugAuthToken();
  }, []);

  // Función para debuggear el token
  const debugAuthToken = async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const userData = await AsyncStorage.getItem('user_data');

      console.log('🔍 DEBUG AUTH en PayPal Component:');
      console.log('Token presente:', token ? 'SÍ' : 'NO');
      console.log('User data:', userData ? 'SÍ' : 'NO');

      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const now = Date.now() / 1000;
          console.log('Token expira en:', new Date(payload.exp * 1000).toLocaleString());
          console.log('Token expirado:', payload.exp < now ? 'SÍ' : 'NO');
          console.log('Authorities:', payload.authorities);
        } catch (e) {
          console.log('Error decodificando token:', e);
        }
      }
    } catch (error) {
      console.error('Error en debug auth:', error);
    }
  };

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
  // PASO 1: Crear orden PayPal con mejor debug
  // ========================================
  const createPayPalOrder = async () => {
    try {
      console.log('🚀 Creando orden PayPal con monto:', precios.precioFinal);
      console.log('👤 Usuario ID:', user.id);

      // Debug del token antes de hacer la request
      const token = await AsyncStorage.getItem('auth_token');
      console.log('🔑 Token presente para PayPal request:', token ? 'SÍ' : 'NO');

      if (!token) {
        throw new Error('No hay token de autenticación. Por favor, inicia sesión nuevamente.');
      }

      const requestBody = { amount: precios.precioFinal };
      console.log('📤 Request body:', requestBody);

      // CAMBIO: Usar el endpoint correcto (agregar /api al inicio)
      const response = await apiClient.post('/api/paypal/orders', requestBody, true);
      console.log('✅ Orden PayPal creada exitosamente:', response);

      return response;

    } catch (error) {
      console.error('💥 Error creating PayPal order:', error);

      // Mejorar el manejo de errores específicos
      if (error.message.includes('Sesión expirada') || error.message.includes('401')) {
        // Token expirado - limpiar datos y redirigir al login
        await AsyncStorage.multiRemove(['auth_token', 'user_data']);
        Alert.alert(
          'Sesión Expirada',
          'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Login')
            }
          ]
        );
        throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
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
      // Verificar autenticación antes de proceder
      await debugAuthToken();

      // 1. Crear orden usando tu backend
      const orderData = await createPayPalOrder();

      // 2. Construir URL de PayPal correcta para sandbox
      // Para sandbox, usamos la URL de sandbox de PayPal
      const paypalUrl = `https://www.sandbox.paypal.com/checkoutnow?token=${orderData.id}`;

      console.log('Abriendo PayPal URL:', paypalUrl);

      // 3. Configurar listener para el retorno
      setupReturnListener(orderData.id);

      // 4. Intentar abrir PayPal con múltiples métodos
      try {
        const canOpen = await Linking.canOpenURL(paypalUrl);
        console.log('¿Se puede abrir la URL?', canOpen);

        if (canOpen) {
          await Linking.openURL(paypalUrl);
          console.log('URL abierta exitosamente');
        } else {
          // Si no se puede abrir directamente, intentar con el navegador por defecto
          console.log('Intentando abrir con openURL directamente...');
          await Linking.openURL(paypalUrl);
        }
      } catch (linkingError) {
        console.error('Error específico de Linking:', linkingError);

        // Como último recurso, intentar con una URL más simple
        const fallbackUrl = `https://sandbox.paypal.com/checkoutnow?token=${orderData.id}`;
        console.log('Intentando URL alternativa:', fallbackUrl);

        try {
          await Linking.openURL(fallbackUrl);
        } catch (fallbackError) {
          console.error('Error con URL alternativa:', fallbackError);
          throw new Error('No se puede abrir PayPal. Verifica que tengas un navegador instalado.');
        }
      }

    } catch (error) {
      console.error('PayPal payment error:', error);
      Alert.alert('Error', error.message || 'Error al iniciar el pago');
      setLoading(false);
    }
  };

  // ========================================
  // PASO 3: Manejar retorno desde PayPal (versión simplificada)
  // ========================================
  const setupReturnListener = (orderId) => {
    // En lugar de usar deep links complejos, usamos un timeout
    // y le damos la opción al usuario de confirmar si completó el pago

    setTimeout(() => {
      setLoading(false);

      Alert.alert(
        'Verificar Pago',
        '¿Completaste el pago en PayPal?',
        [
          {
            text: 'No, cancelé',
            style: 'cancel',
            onPress: handlePaymentCancel
          },
          {
            text: 'Sí, pagué',
            onPress: () => handlePaymentSuccess(orderId)
          }
        ]
      );
    }, 10000); // 10 segundos para que el usuario complete el pago
  };

  // ========================================
  // PASO 4: Capturar pago y registrar compra
  // ========================================
  const handlePaymentSuccess = async (orderId) => {
    try {
      console.log('Procesando pago exitoso para orden:', orderId);

      // Verificar token antes de capturar
      const token = await AsyncStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
      }

      // 1. Capturar pago usando apiClient
      const captureResponse = await apiClient.post(`/api/paypal/orders/${orderId}/capture`, {}, true);
      console.log('Respuesta de captura PayPal:', captureResponse);

      if (captureResponse.status !== 'COMPLETED') {
        throw new Error('El pago no pudo ser completado en PayPal');
      }

      // 2. Extraer el ID de la transacción
      let captureId = null;
      if (captureResponse.purchase_units && captureResponse.purchase_units[0]?.payments?.captures?.[0]?.id) {
        captureId = captureResponse.purchase_units[0].payments.captures[0].id;
      }

      if (!captureId) {
        console.error('No se pudo encontrar capture_id en:', captureResponse);
        throw new Error('No se pudo obtener el ID de la transacción');
      }

      console.log('ID de captura obtenido:', captureId);

      // 3. Registrar compra en tu backend
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
            onPress: () => navigation.navigate('TripsScreen')
          }
        ]
      );

    } catch (error) {
      console.error('Error processing payment success:', error);

      // Si es error de autenticación, redirigir al login
      if (error.message.includes('Sesión expirada') || error.message.includes('401')) {
        await AsyncStorage.multiRemove(['auth_token', 'user_data']);
        Alert.alert(
          'Sesión Expirada',
          'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Login')
            }
          ]
        );
      } else {
        Alert.alert(
          'Error al confirmar pago',
          'Hubo un problema al confirmar tu pago. Si el dinero fue debitado, contacta soporte.'
        );
      }
    }
  };

  const handlePaymentCancel = () => {
    Alert.alert(
      'Pago Cancelado',
      'El pago fue cancelado. Puedes intentar nuevamente.'
    );
  };

  // ========================================
  // PASO 5: Registrar compra
  // ========================================
  const registrarCompraEnBackend = async (paypalTransactionId) => {
    try {
      const compraData = {
        viajeId: parseInt(tripId),
        clienteId: user.id,
        numeroAsiento: asientoSeleccionado,
        paypalTransactionId: paypalTransactionId
      };

      console.log('Registrando compra:', compraData);

      // Usar endpoint correcto con /api
      const response = await apiClient.post('/api/vendedor/pasajes/comprar', compraData, true);

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
    return <Loading />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pago con PayPal</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        {/* Información del viaje */}
        <View style={styles.tripInfo}>
          <Text style={styles.sectionTitle}>Información del Viaje</Text>
          <Text style={styles.tripDetail}>Origen: {tripDetail.origen}</Text>
          <Text style={styles.tripDetail}>Destino: {tripDetail.destino}</Text>
          <Text style={styles.tripDetail}>Fecha: {tripDetail.fecha}</Text>
          <Text style={styles.tripDetail}>Hora: {tripDetail.hora}</Text>
          <Text style={styles.tripDetail}>Asiento: {asientoSeleccionado}</Text>
        </View>

        {/* Información de precios */}
        <View style={styles.priceInfo}>
          <Text style={styles.sectionTitle}>Detalles del Precio</Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Precio base:</Text>
            <Text style={styles.priceValue}>${precios.precioBase.toFixed(2)}</Text>
          </View>

          {precios.tieneDescuento && (
            <>
              <View style={styles.priceRow}>
                <Text style={styles.discountLabel}>Descuento ({user?.tipoCliente}):</Text>
                <Text style={styles.discountValue}>-${precios.descuento.toFixed(2)}</Text>
              </View>
              <View style={styles.divider} />
            </>
          )}

          <View style={styles.priceRow}>
            <Text style={styles.totalLabel}>Total a pagar:</Text>
            <Text style={styles.totalValue}>${precios.precioFinal.toFixed(2)}</Text>
          </View>
        </View>

        {/* Botón de pago */}
        <TouchableOpacity
          style={[styles.payButton, loading && styles.payButtonDisabled]}
          onPress={openPayPalPayment}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Icon name="logo-paypal" size={24} color="#FFF" style={styles.paypalIcon} />
              <Text style={styles.payButtonText}>Pagar con PayPal</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Información adicional */}
        <View style={styles.infoBox}>
          <Icon name="information-circle" size={20} color="#007BFF" />
          <Text style={styles.infoText}>
            Serás redirigido a PayPal para completar el pago de forma segura.
          </Text>
        </View>
      </View>
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
    padding: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  tripInfo: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  tripDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  priceInfo: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: '#666',
  },
  priceValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  discountLabel: {
    fontSize: 14,
    color: '#28A745',
  },
  discountValue: {
    fontSize: 14,
    color: '#28A745',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007BFF',
  },
  payButton: {
    backgroundColor: '#0070BA',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  payButtonDisabled: {
    backgroundColor: '#A0A0A0',
  },
  paypalIcon: {
    marginRight: 8,
  },
  payButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007BFF',
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
    lineHeight: 16,
  },
});

export default PayPalNativePayment;