// PurchaseScreen.js - Actualizado para usar PayPal nativo
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/client';

export default function PurchaseScreen({ route, navigation }) {
  const { tripId } = route.params;
  const { user } = useAuth();

  const [tripDetail, setTripDetail] = useState(null);
  const [asientosOcupados, setAsientosOcupados] = useState([]);
  const [asientoSeleccionado, setAsientoSeleccionado] = useState(null);
  const [loading, setLoading] = useState(true);

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

  const handleContinuarPago = () => {
    if (!asientoSeleccionado) {
      Alert.alert('Error', 'Por favor selecciona un asiento');
      return;
    }

    // Navegar al componente PayPal nativo
    navigation.navigate('PayPalNativePayment', {
      tripId,
      asientoSeleccionado,
      user,
      tripDetail,
      precios
    });
  };

  // Opción de pago simulado para testing
  const handleSimulatedPayment = async () => {
    if (!asientoSeleccionado) {
      Alert.alert('Error', 'Por favor selecciona un asiento');
      return;
    }

    Alert.alert(
      'Pago Simulado',
      '¿Confirmas la compra? (Pago simulado para testing)',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Confirmar', onPress: procesarPagoSimulado }
      ]
    );
  };

  const procesarPagoSimulado = async () => {
    try {
      const compraData = {
        viajeId: parseInt(tripId),
        clienteId: user.id,
        numeroAsiento: asientoSeleccionado
        // Sin paypalTransactionId para pago simulado
      };

      const response = await apiClient.post('/vendedor/pasajes/comprar', compraData, true);

      Alert.alert('¡Éxito!', 'Tu pasaje ha sido comprado exitosamente (pago simulado)');
      navigation.navigate('Mis Pasajes');

    } catch (error) {
      console.error('Error al comprar pasaje:', error);
      Alert.alert(
        'Error en la compra',
        error.response?.data?.message || error.message || 'No se pudo procesar la compra. Intenta nuevamente.'
      );
    }
  };

  const renderAsiento = (numeroAsiento) => {
    const isOcupado = asientosOcupados.includes(numeroAsiento);
    const isSeleccionado = asientoSeleccionado === numeroAsiento;

    return (
      <TouchableOpacity
        key={numeroAsiento}
        style={[
          styles.asiento,
          isOcupado && styles.asientoOcupado,
          isSeleccionado && styles.asientoSeleccionado,
        ]}
        disabled={isOcupado}
        onPress={() => setAsientoSeleccionado(numeroAsiento)}
      >
        <Text style={[
          styles.asientoText,
          isOcupado && styles.asientoOcupadoText,
          isSeleccionado && styles.asientoSeleccionadoText,
        ]}>
          {numeroAsiento}
        </Text>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Cargando información del viaje...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!tripDetail) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No se pudo cargar la información del viaje</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadTripData}>
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
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
        <Text style={styles.headerTitle}>Comprar Pasaje</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Información del viaje */}
        <View style={styles.tripInfo}>
          <Text style={styles.tripTitle}>
            {tripDetail.origenNombre} → {tripDetail.destinoNombre}
          </Text>
          <Text style={styles.tripDate}>
            {new Date(tripDetail.fecha).toLocaleDateString()}
          </Text>
          <Text style={styles.tripTime}>
            Salida: {tripDetail.horaSalida}
          </Text>
          <Text style={styles.tripPrice}>Precio: ${tripDetail.precio}</Text>
        </View>

        {/* Selección de asientos */}
        <View style={styles.seatsSection}>
          <Text style={styles.sectionTitle}>Selecciona tu asiento</Text>
          <View style={styles.seatsContainer}>
            {Array.from({ length: tripDetail.capacidadOmnibus }, (_, i) => i + 1).map(renderAsiento)}
          </View>

          {/* Leyenda */}
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendIcon, styles.asientoDisponible]} />
              <Text style={styles.legendText}>Disponible</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendIcon, styles.asientoOcupado]} />
              <Text style={styles.legendText}>Ocupado</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendIcon, styles.asientoSeleccionado]} />
              <Text style={styles.legendText}>Seleccionado</Text>
            </View>
          </View>
        </View>

        {/* Resumen de precio */}
        {asientoSeleccionado && (
          <View style={styles.summary}>
            <Text style={styles.summaryTitle}>Resumen de compra</Text>
            <Text style={styles.summaryItem}>Asiento: {asientoSeleccionado}</Text>
            <Text style={styles.summaryItem}>Precio base: ${precios.precioBase.toFixed(2)}</Text>

            {precios.tieneDescuento && (
              <Text style={[styles.summaryItem, styles.discountText]}>
                Descuento ({user?.tipoCliente}): -${precios.descuento.toFixed(2)}
              </Text>
            )}

            <Text style={styles.summaryTotal}>
              Total: ${precios.precioFinal.toFixed(2)}
            </Text>
          </View>
        )}

        {/* Opciones de pago */}
        {asientoSeleccionado && (
          <View style={styles.paymentOptions}>
            <Text style={styles.sectionTitle}>Métodos de Pago</Text>

            <TouchableOpacity
              style={styles.paypalButton}
              onPress={handleContinuarPago}
            >
              <Icon name="logo-paypal" size={24} color="#fff" />
              <Text style={styles.paypalButtonText}>Pagar con PayPal</Text>
            </TouchableOpacity>

            <View style={styles.divider}>
              <Text style={styles.dividerText}>O</Text>
            </View>

            <TouchableOpacity
              style={styles.simulatedButton}
              onPress={handleSimulatedPayment}
            >
              <Icon name="card" size={20} color="#666" />
              <Text style={styles.simulatedButtonText}>Pago Simulado (Testing)</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Botón de acción flotante */}
      {!asientoSeleccionado && (
        <View style={styles.footer}>
          <Text style={styles.footerText}>Selecciona un asiento para continuar</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

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
  tripInfo: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  tripTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  tripDate: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  tripTime: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  tripPrice: {
    fontSize: 18,
    fontWeight: '600',
    color: '#007AFF',
  },
  seatsSection: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  seatsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  asiento: {
    width: '18%',
    aspectRatio: 1,
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#90caf9',
  },
  asientoOcupado: {
    backgroundColor: '#ffcdd2',
    borderColor: '#ef9a9a',
  },
  asientoSeleccionado: {
    backgroundColor: '#c8e6c9',
    borderColor: '#4caf50',
  },
  asientoDisponible: {
    backgroundColor: '#e3f2fd',
    borderColor: '#90caf9',
  },
  asientoText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1976d2',
  },
  asientoOcupadoText: {
    color: '#c62828',
  },
  asientoSeleccionadoText: {
    color: '#2e7d32',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendIcon: {
    width: 16,
    height: 16,
    borderRadius: 4,
    marginRight: 8,
    borderWidth: 1,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
  summary: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  summaryItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  discountText: {
    color: '#4CAF50',
  },
  summaryTotal: {
    fontSize: 18,
    fontWeight: '600',
    color: '#007AFF',
    marginTop: 8,
  },
  paymentOptions: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  paypalButton: {
    backgroundColor: '#0070ba',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    gap: 8,
    marginBottom: 16,
  },
  paypalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    alignItems: 'center',
    marginVertical: 16,
  },
  dividerText: {
    fontSize: 14,
    color: '#666',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
  },
  simulatedButton: {
    backgroundColor: '#f8f9fa',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    gap: 8,
  },
  simulatedButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  footer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    alignItems: 'center',
  },
  footerText: {
    color: '#666',
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});