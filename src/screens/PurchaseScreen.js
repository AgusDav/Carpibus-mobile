// src/screens/PurchaseScreen.js - Versión mejorada con interfaz visual
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

    // Navegar al componente PayPal nativo con todos los datos necesarios
    navigation.navigate('PayPalNativePayment', {
      tripId,
      asientoSeleccionado,
      user,
      tripDetail,
      precios
    });
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
          disabled={estaOcupado}
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Seleccionar Asiento</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {/* Información del viaje */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información del Viaje</Text>

          <View style={styles.infoRow}>
            <Icon name="location" size={20} color="#666" />
            <Text style={styles.infoText}>
              {tripDetail?.origenNombre || tripDetail?.ciudadOrigen} → {tripDetail?.destinoNombre || tripDetail?.ciudadDestino}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Icon name="calendar" size={20} color="#666" />
            <Text style={styles.infoText}>
              {formatDate(tripDetail?.fecha || tripDetail?.fechaHoraSalida)}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Icon name="time" size={20} color="#666" />
            <Text style={styles.infoText}>
              Salida: {formatTime(tripDetail?.horaSalida) || new Date(tripDetail?.fechaHoraSalida).toLocaleTimeString()}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Icon name="bus" size={20} color="#666" />
            <Text style={styles.infoText}>
              {tripDetail?.omnibusMatricula || tripDetail?.busAsignado?.matricula || 'Ómnibus asignado'}
            </Text>
          </View>
        </View>

        {/* Selección de asientos */}
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
              <View style={styles.priceRow}>
                <Text style={[styles.priceLabel, styles.discountText]}>
                  Descuento ({user?.tipoCliente}):
                </Text>
                <Text style={[styles.priceValue, styles.discountText]}>
                  -${precios.descuento.toFixed(2)}
                </Text>
              </View>
            )}

            <View style={[styles.priceRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total a pagar:</Text>
              <Text style={styles.totalValue}>${precios.precioFinal.toFixed(2)}</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Botón de continuar */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            !asientoSeleccionado && styles.continueButtonDisabled
          ]}
          onPress={handleContinuarPago}
          disabled={!asientoSeleccionado}
        >
          <Text style={styles.continueButtonText}>
            {asientoSeleccionado ? 'Continuar al Pago' : 'Selecciona un asiento'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
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
  backButton: {
    padding: 8,
  },
  placeholder: {
    width: 40,
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
});