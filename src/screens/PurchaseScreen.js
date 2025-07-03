// src/screens/PurchaseScreen.js - Actualizado con navegación mejorada a PayPal
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

  // Función para renderizar la grilla de asientos
  const renderSeatGrid = () => {
    const totalSeats = tripDetail?.busAsignado?.capacidad || 40;
    const seats = [];

    for (let i = 1; i <= totalSeats; i++) {
      const isOccupied = asientosOcupados.includes(i);
      const isSelected = asientoSeleccionado === i;

      seats.push(
        <TouchableOpacity
          key={i}
          style={[
            styles.seat,
            isOccupied && styles.seatOccupied,
            isSelected && styles.seatSelected,
          ]}
          onPress={() => !isOccupied && setAsientoSeleccionado(i)}
          disabled={isOccupied}
        >
          <Text style={[
            styles.seatText,
            isOccupied && styles.seatTextOccupied,
            isSelected && styles.seatTextSelected,
          ]}>
            {i}
          </Text>
        </TouchableOpacity>
      );
    }

    return seats;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2c5530" />
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
        <View style={styles.tripInfoCard}>
          <Text style={styles.sectionTitle}>Información del Viaje</Text>

          <View style={styles.routeContainer}>
            <Text style={styles.cityText}>{tripDetail?.ciudadOrigen}</Text>
            <Icon name="arrow-forward" size={20} color="#666" style={styles.arrowIcon} />
            <Text style={styles.cityText}>{tripDetail?.ciudadDestino}</Text>
          </View>

          <View style={styles.detailsContainer}>
            <View style={styles.detailRow}>
              <Icon name="calendar" size={16} color="#666" />
              <Text style={styles.detailText}>
                {new Date(tripDetail?.fechaHoraSalida).toLocaleDateString()}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Icon name="time" size={16} color="#666" />
              <Text style={styles.detailText}>
                {new Date(tripDetail?.fechaHoraSalida).toLocaleTimeString()}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Icon name="bus" size={16} color="#666" />
              <Text style={styles.detailText}>
                {tripDetail?.busAsignado?.modelo} - {tripDetail?.busAsignado?.patente}
              </Text>
            </View>
          </View>
        </View>

        {/* Selección de asientos */}
        <View style={styles.seatsCard}>
          <Text style={styles.sectionTitle}>Selecciona tu Asiento</Text>

          {/* Leyenda */}
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendSeat, styles.seatAvailable]} />
              <Text style={styles.legendText}>Disponible</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendSeat, styles.seatOccupied]} />
              <Text style={styles.legendText}>Ocupado</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendSeat, styles.seatSelected]} />
              <Text style={styles.legendText}>Seleccionado</Text>
            </View>
          </View>

          {/* Grilla de asientos */}
          <View style={styles.seatGrid}>
            {renderSeatGrid()}
          </View>
        </View>

        {/* Resumen de precio */}
        <View style={styles.priceCard}>
          <Text style={styles.sectionTitle}>Resumen del Precio</Text>

          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Precio base:</Text>
            <Text style={styles.priceValue}>${precios.precioBase.toFixed(2)}</Text>
          </View>

          {precios.tieneDescuento && (
            <View style={styles.priceRow}>
              <Text style={styles.discountLabel}>
                Descuento ({user?.tipoCliente}):
              </Text>
              <Text style={styles.discountValue}>-${precios.descuento.toFixed(2)}</Text>
            </View>
          )}

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total a pagar:</Text>
            <Text style={styles.totalValue}>${precios.precioFinal.toFixed(2)}</Text>
          </View>
        </View>
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
          <Text style={[
            styles.continueButtonText,
            !asientoSeleccionado && styles.continueButtonTextDisabled
          ]}>
            {asientoSeleccionado
              ? `Continuar con Asiento ${asientoSeleccionado}`
              : 'Selecciona un asiento'
            }
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
  content: {
    flex: 1,
    padding: 16,
  },
  tripInfoCard: {
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
  seatsCard: {
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  routeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  cityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  arrowIcon: {
    marginHorizontal: 12,
  },
  detailsContainer: {
    marginTop: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    paddingVertical: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendSeat: {
    width: 16,
    height: 16,
    borderRadius: 4,
    marginRight: 4,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
  seatGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  seat: {
    width: '18%',
    aspectRatio: 1,
    backgroundColor: '#e8f5e8',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#c8e6c9',
  },
  seatAvailable: {
    backgroundColor: '#e8f5e8',
    borderColor: '#c8e6c9',
  },
  seatOccupied: {
    backgroundColor: '#ffebee',
    borderColor: '#ffcdd2',
  },
  seatSelected: {
    backgroundColor: '#2c5530',
    borderColor: '#2c5530',
  },
  seatText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  seatTextOccupied: {
    color: '#e53935',
  },
  seatTextSelected: {
    color: '#fff',
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
  footer: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  continueButton: {
    backgroundColor: '#2c5530',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  continueButtonDisabled: {
    backgroundColor: '#ccc',
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  continueButtonTextDisabled: {
    color: '#999',
  },
});