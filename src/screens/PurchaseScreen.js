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

// Importar PayPal oficial - compatible con React Native
import { PayPalScriptProvider, PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';

export default function PurchaseScreen({ route, navigation }) {
  const { tripId } = route.params;
  const { user } = useAuth();

  const [tripDetail, setTripDetail] = useState(null);
  const [asientosOcupados, setAsientosOcupados] = useState([]);
  const [asientoSeleccionado, setAsientoSeleccionado] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentStep, setPaymentStep] = useState('selection'); // 'selection', 'payment', 'success'
  const [compraExitosa, setCompraExitosa] = useState(null);

  // URL base del backend - misma que usas en web
  const API_URL = 'https://web-production-2443c.up.railway.app';

  // Configuración de PayPal - mismo client-id que en web
  const initialPayPalOptions = {
    "client-id": "AclKeFueUT6hu_vNmKjHR4MEfn7vyF3J3mzk8DxkkM0y_Gc9DyD2250fCktw_Tt8h3Qu8--U8EDWEc7u",
    currency: "USD",
    intent: "capture",
  };

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

  const handleContinuarAPago = () => {
    if (!asientoSeleccionado) {
      Alert.alert('Error', 'Por favor selecciona un asiento');
      return;
    }
    setPaymentStep('payment');
  };

  const handleSeleccionarAsiento = (numeroAsiento) => {
    if (asientosOcupados.includes(numeroAsiento)) return;
    setAsientoSeleccionado(prevSeleccionado =>
      prevSeleccionado === numeroAsiento ? null : numeroAsiento
    );
  };

  // Componente PayPal interno con hooks
  const PayPalPaymentComponent = () => {
    const [{ isPending }] = usePayPalScriptReducer();

    // Función para crear orden en PayPal
    const createOrder = async () => {
      try {
        const response = await fetch(`${API_URL}/api/paypal/orders`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: precios.precioFinal.toFixed(2) })
        });

        const orderData = await response.json();

        if (!response.ok) {
          throw new Error(orderData.message || 'Error al crear la orden en PayPal');
        }

        return orderData.id;
      } catch (error) {
        console.error('Error creating PayPal order:', error);
        Alert.alert('Error', 'No se pudo crear la orden de pago');
        throw error;
      }
    };

    // Función para aprobar pago
    const onApprove = async (data) => {
      try {
        // 1. Capturar el pago en PayPal
        const captureResponse = await fetch(`${API_URL}/api/paypal/orders/${data.orderID}/capture`, {
          method: 'POST'
        });

        const captureData = await captureResponse.json();

        if (!captureResponse.ok || captureData.status !== 'COMPLETED') {
          throw new Error(captureData.message || 'El pago no pudo ser completado');
        }

        // 2. Extraer el ID de captura
        let captureId = null;
        if (captureData.purchase_units?.[0]?.payments?.captures?.[0]?.id) {
          captureId = captureData.purchase_units[0].payments.captures[0].id;
        }

        if (!captureId) {
          throw new Error('No se pudo obtener el ID de la transacción');
        }

        console.log('PayPal capture ID:', captureId);

        // 3. Registrar la compra en el backend
        const compraData = {
          viajeId: parseInt(tripId),
          clienteId: user.id,
          numeroAsiento: asientoSeleccionado,
          paypalTransactionId: captureId
        };

        const response = await apiClient.post('/api/vendedor/pasajes/comprar', compraData, true);

        console.log('Compra registrada:', response);
        setCompraExitosa(response);
        setPaymentStep('success');

        Alert.alert('¡Éxito!', 'Tu pasaje ha sido comprado exitosamente');

      } catch (error) {
        console.error('Error al aprobar pago:', error);
        Alert.alert(
          'Error en el pago',
          error.message || 'No se pudo procesar el pago. Intenta nuevamente.'
        );
      }
    };

    // Función para manejar errores
    const onError = (err) => {
      console.error('PayPal error:', err);
      Alert.alert('Error', 'Ocurrió un error con el pago o la operación fue cancelada');
    };

    if (isPending) {
      return (
        <View style={styles.paypalLoadingContainer}>
          <ActivityIndicator size="large" color="#0070ba" />
          <Text style={styles.paypalLoadingText}>Cargando PayPal...</Text>
        </View>
      );
    }

    return (
      <View style={styles.paypalContainer}>
        <PayPalButtons
          style={{
            layout: "vertical",
            color: "blue",
            shape: "rect",
            label: "pay"
          }}
          createOrder={createOrder}
          onApprove={onApprove}
          onError={onError}
        />
      </View>
    );
  };

  // Opción de pago simulado para testing
  const handleSimulatedPayment = async () => {
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

      const response = await apiClient.post('/api/vendedor/pasajes/comprar', compraData, true);

      setCompraExitosa(response);
      setPaymentStep('success');

      Alert.alert('¡Éxito!', 'Tu pasaje ha sido comprado exitosamente (pago simulado)');

    } catch (error) {
      console.error('Error al comprar pasaje:', error);
      Alert.alert(
        'Error en la compra',
        error.message || 'No se pudo procesar la compra. Intenta nuevamente.'
      );
    }
  };

  const renderAsientos = () => {
    if (!tripDetail?.capacidadOmnibus) return null;

    const capacidad = tripDetail.capacidadOmnibus;
    let asientosVisuales = [];

    for (let i = 1; i <= capacidad; i++) {
      const estaOcupado = asientosOcupados.includes(i);
      const estaSeleccionado = asientoSeleccionado === i;

      let estilo = [styles.asiento];
      if (estaOcupado) {
        estilo.push(styles.asientoOcupado);
      } else if (estaSeleccionado) {
        estilo.push(styles.asientoSeleccionado);
      } else {
        estilo.push(styles.asientoDisponible);
      }

      asientosVisuales.push(
        <TouchableOpacity
          key={i}
          style={estilo}
          onPress={() => handleSeleccionarAsiento(i)}
          disabled={estaOcupado || paymentStep !== 'selection'}
        >
          <Text style={styles.asientoTexto}>{i}</Text>
        </TouchableOpacity>
      );
    }

    // Organizar en filas de 4 asientos (2 + pasillo + 2)
    const filas = [];
    for (let i = 0; i < asientosVisuales.length; i += 4) {
      filas.push(
        <View key={`fila-${i/4}`} style={styles.filaAsientos}>
          <View style={styles.ladoIzquierdo}>
            {asientosVisuales.slice(i, i + 2)}
          </View>
          <View style={styles.pasillo} />
          <View style={styles.ladoDerecho}>
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
    } catch {
      return dateString;
    }
  };

  const formatTime = (timeString) => {
    try {
      return timeString?.substring(0, 5) || '';
    } catch {
      return timeString || '';
    }
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

  // Pantalla de éxito
  if (paymentStep === 'success' && compraExitosa) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.content}>
          <View style={styles.successContainer}>
            <Icon name="checkmark-circle" size={80} color="#4CAF50" />
            <Text style={styles.successTitle}>¡Compra Exitosa!</Text>

            <View style={styles.ticketInfo}>
              <Text style={styles.ticketTitle}>Detalles de tu Pasaje</Text>

              <View style={styles.ticketRow}>
                <Text style={styles.ticketLabel}>Pasaje ID:</Text>
                <Text style={styles.ticketValue}>{compraExitosa.id}</Text>
              </View>

              <View style={styles.ticketRow}>
                <Text style={styles.ticketLabel}>Ruta:</Text>
                <Text style={styles.ticketValue}>
                  {compraExitosa.origenViaje} → {compraExitosa.destinoViaje}
                </Text>
              </View>

              <View style={styles.ticketRow}>
                <Text style={styles.ticketLabel}>Fecha:</Text>
                <Text style={styles.ticketValue}>
                  {formatDate(compraExitosa.fechaViaje)}
                </Text>
              </View>

              <View style={styles.ticketRow}>
                <Text style={styles.ticketLabel}>Asiento:</Text>
                <Text style={styles.ticketValue}>
                  {String(compraExitosa.numeroAsiento).padStart(2, '0')}
                </Text>
              </View>

              <View style={styles.ticketRow}>
                <Text style={styles.ticketLabel}>Precio:</Text>
                <Text style={[styles.ticketValue, styles.precio]}>
                  ${parseFloat(compraExitosa.precio).toFixed(2)}
                </Text>
              </View>
            </View>

            <View style={styles.buttonGroup}>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => navigation.navigate('Mis Pasajes')}
              >
                <Text style={styles.secondaryButtonText}>Ver Mis Pasajes</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => navigation.navigate('Viajes')}
              >
                <Text style={styles.primaryButtonText}>Buscar Otros Viajes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <PayPalScriptProvider options={initialPayPalOptions}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => {
            if (paymentStep === 'payment') {
              setPaymentStep('selection');
            } else {
              navigation.goBack();
            }
          }}>
            <Icon name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {paymentStep === 'selection' ? 'Seleccionar Asiento' : 'Confirmar Pago'}
          </Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.content}>
          {/* Información del viaje */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Información del Viaje</Text>

            <View style={styles.infoRow}>
              <Icon name="location" size={20} color="#666" />
              <Text style={styles.infoText}>
                {tripDetail?.origenNombre} → {tripDetail?.destinoNombre}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Icon name="calendar" size={20} color="#666" />
              <Text style={styles.infoText}>
                {formatDate(tripDetail?.fecha)}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Icon name="time" size={20} color="#666" />
              <Text style={styles.infoText}>
                Salida: {formatTime(tripDetail?.horaSalida)}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Icon name="bus" size={20} color="#666" />
              <Text style={styles.infoText}>
                {tripDetail?.omnibusMatricula}
              </Text>
            </View>
          </View>

          {/* Selección de asientos - Solo mostrar si estamos en paso de selección */}
          {paymentStep === 'selection' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Selecciona tu Asiento</Text>

              {/* Leyenda */}
              <View style={styles.leyenda}>
                <View style={styles.leyendaItem}>
                  <View style={[styles.leyendaColor, styles.asientoDisponible]} />
                  <Text style={styles.leyendaTexto}>Disponible</Text>
                </View>
                <View style={styles.leyendaItem}>
                  <View style={[styles.leyendaColor, styles.asientoSeleccionado]} />
                  <Text style={styles.leyendaTexto}>Seleccionado</Text>
                </View>
                <View style={styles.leyendaItem}>
                  <View style={[styles.leyendaColor, styles.asientoOcupado]} />
                  <Text style={styles.leyendaTexto}>Ocupado</Text>
                </View>
              </View>

              {/* Mapa de asientos */}
              <View style={styles.omnibusContainer}>
                <Text style={styles.frenteTexto}>Frente del ómnibus</Text>
                <View style={styles.mapaAsientos}>
                  {renderAsientos()}
                </View>
              </View>
            </View>
          )}

          {/* Resumen de precio */}
          {asientoSeleccionado && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Resumen de Compra</Text>

              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Asiento seleccionado:</Text>
                <Text style={styles.priceValue}>{asientoSeleccionado}</Text>
              </View>

              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Precio base:</Text>
                <Text style={styles.priceValue}>${precios.precioBase.toFixed(2)}</Text>
              </View>

              {precios.tieneDescuento && (
                <>
                  <View style={styles.priceRow}>
                    <Text style={[styles.priceLabel, styles.discountText]}>
                      Descuento ({user?.tipoCliente}):
                    </Text>
                    <Text style={[styles.priceValue, styles.discountText]}>
                      -${precios.descuento.toFixed(2)}
                    </Text>
                  </View>
                </>
              )}

              <View style={[styles.priceRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total a pagar:</Text>
                <Text style={styles.totalValue}>${precios.precioFinal.toFixed(2)}</Text>
              </View>
            </View>
          )}

          {/* PayPal Payment - Solo mostrar en paso de pago */}
          {paymentStep === 'payment' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Método de Pago</Text>

              <PayPalPaymentComponent />

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

        {/* Botón de acción */}
        {paymentStep === 'selection' && (
          <View style={styles.footer}>
            <TouchableOpacity
              style={[
                styles.continueButton,
                !asientoSeleccionado && styles.continueButtonDisabled
              ]}
              onPress={handleContinuarAPago}
              disabled={!asientoSeleccionado}
            >
              <Text style={styles.continueButtonText}>
                {asientoSeleccionado ? 'Continuar al Pago' : 'Selecciona un asiento'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </PayPalScriptProvider>
  );
}

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
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  content: {
    flex: 1,
    padding: 16,
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
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  infoText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
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
  leyendaTexto: {
    fontSize: 12,
    color: '#666',
  },
  omnibusContainer: {
    alignItems: 'center',
  },
  frenteTexto: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
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
  asientoDisponible: {
    backgroundColor: '#4CAF50',
    borderColor: '#45a049',
  },
  asientoSeleccionado: {
    backgroundColor: '#007AFF',
    borderColor: '#0056b3',
  },
  asientoOcupado: {
    backgroundColor: '#f44336',
    borderColor: '#d32f2f',
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
  priceLabel: {
    fontSize: 16,
    color: '#333',
  },
  priceValue: {
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
  paypalContainer: {
    marginBottom: 16,
  },
  paypalLoadingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  paypalLoadingText: {
    marginTop: 8,
    fontSize: 14,
    color: '#0070ba',
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
  },
  continueButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  continueButtonDisabled: {
    backgroundColor: '#ccc',
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  successContainer: {
    alignItems: 'center',
    padding: 20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#4CAF50',
    marginTop: 16,
    marginBottom: 32,
  },
  ticketInfo: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  ticketTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  ticketRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  ticketLabel: {
    fontSize: 14,
    color: '#666',
  },
  ticketValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  precio: {
    fontWeight: '600',
    color: '#007AFF',
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  secondaryButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
});