import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { tripsService } from '../api/trips'; // Asegúrate de que esta ruta sea correcta
import { globalStyles } from '../styles/globalStyles';
import { useTheme } from '../hooks/useTheme';

// Componentes
import TripCard from '../components/TripCard';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';
import TripSearchForm from '../components/TripSearchForm';

export default function TripsScreen({ navigation }) {
  const [trips, setTrips] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [currentSearchParams, setCurrentSearchParams] = useState({});
  const [availableLocations, setAvailableLocations] = useState({
    origenes: [],
    destinos: []
  });

  // Guardar las localidades completas para obtener los IDs
  const [allLocalidades, setAllLocalidades] = useState([]);

  const theme = useTheme();

  useEffect(() => {
    // Cargar ubicaciones disponibles al iniciar
    loadAvailableLocations();

    // DEBUG: Imprimir JWT y datos de usuario
    debugAuth();
  }, []);

  const debugAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const userData = await AsyncStorage.getItem('user_data');

      console.log('=== DEBUG AUTH DATA EN TRIPS SCREEN ===');
      console.log('JWT Token:', token);
      console.log('User Data from AsyncStorage:', userData);

      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          console.log('📄 PAYLOAD:', JSON.stringify(payload, null, 2));
        } catch (error) {
          console.error('Error al decodificar JWT:', error);
        }
      }
    } catch (error) {
      console.error('Error en debugAuth:', error);
    }
  };

  const loadAvailableLocations = useCallback(async () => {
    try {
      console.log('🌍 Cargando localidades disponibles...');

      // Usar el método que ya está implementado en trips.js
      const localidades = await tripsService.getAvailableLocations();
      console.log('📍 Localidades recibidas del servicio:', localidades);

      // Procesar las localidades para extraer solo los nombres
      if (localidades && Array.isArray(localidades)) {
        // Guardar las localidades completas para obtener IDs después
        setAllLocalidades(localidades);

        const nombresLocalidades = localidades
          .map(localidad => localidad.nombre)
          .filter(nombre => nombre && nombre.trim() !== '') // Filtrar nombres vacíos
          .sort(); // Ordenar alfabéticamente

        const ubicaciones = {
          origenes: nombresLocalidades,
          destinos: nombresLocalidades // Las mismas localidades para origen y destino
        };

        console.log('✅ Ubicaciones procesadas:', ubicaciones);
        setAvailableLocations(ubicaciones);
      } else {
        console.warn('⚠️ Las localidades recibidas no son un array válido');
        setAvailableLocations({ origenes: [], destinos: [] });
        setAllLocalidades([]);
      }
    } catch (error) {
      console.error('❌ Error al cargar ubicaciones:', error);

      // Fallback con ubicaciones hardcodeadas para testing
      const fallbackLocations = {
        origenes: [
          'Montevideo', 'Punta del Este', 'Colonia del Sacramento',
          'Salto', 'Rivera', 'Tacuarembó', 'Paysandú', 'Maldonado',
          'Canelones', 'Mercedes', 'Minas', 'Rocha'
        ],
        destinos: [
          'Montevideo', 'Punta del Este', 'Colonia del Sacramento',
          'Salto', 'Rivera', 'Tacuarembó', 'Paysandú', 'Maldonado',
          'Canelones', 'Mercedes', 'Minas', 'Rocha'
        ]
      };

      console.log('🔄 Usando ubicaciones fallback:', fallbackLocations);
      setAvailableLocations(fallbackLocations);
      setAllLocalidades([]);
    }
  }, []);

  const searchTrips = useCallback(async (searchParams) => {
    try {
      setIsLoading(true);
      setCurrentSearchParams(searchParams);

      console.log('🔍 Buscando viajes con parámetros:', searchParams);

      // Función helper para obtener ID de localidad por nombre
      const getLocalidadId = (nombre) => {
        const localidad = allLocalidades.find(loc => loc.nombre === nombre);
        return localidad ? localidad.id : null;
      };

      // Convertir nombres a IDs para el backend
      const origenId = getLocalidadId(searchParams.origen);
      const destinoId = getLocalidadId(searchParams.destino);

      if (!origenId) {
        throw new Error(`No se encontró el ID para la localidad de origen: ${searchParams.origen}`);
      }

      if (!destinoId) {
        throw new Error(`No se encontró el ID para la localidad de destino: ${searchParams.destino}`);
      }

      // Preparar criterios según el DTO del backend
      const criteriosBusqueda = {
        origenId: origenId,
        destinoId: destinoId,
        fecha: searchParams.fecha, // formato YYYY-MM-DD
        pasajeros: searchParams.pasajeros || 1, // usar pasajeros como mínimo de asientos
      };

      // Agregar fechaHasta si se especifica
      if (searchParams.fechaHasta) {
        criteriosBusqueda.fechaHasta = searchParams.fechaHasta;
      }

      console.log('📋 Criterios de búsqueda enviados al backend:', criteriosBusqueda);

      // Llamar al servicio con los criterios correctos
      const response = await tripsService.searchTrips(criteriosBusqueda);

      setTrips(response || []);
      setHasSearched(true);
    } catch (error) {
      console.error('Error al buscar viajes:', error);
      Alert.alert(
        'Error',
        error.message || 'No se pudieron buscar los viajes. Intenta nuevamente.'
      );
      setTrips([]);
    } finally {
      setIsLoading(false);
    }
  }, [allLocalidades, formatDate]);

  const handleRefresh = useCallback(() => {
    if (hasSearched && Object.keys(currentSearchParams).length > 0) {
      searchTrips(currentSearchParams);
    }
  }, [hasSearched, currentSearchParams, searchTrips]);

  const handleTripPress = useCallback((trip) => {
    navigation.navigate('TripDetail', { tripId: trip.id });
  }, [navigation]);

  const handleBookPress = useCallback((trip) => {
    navigation.navigate('Purchase', { tripId: trip.id });
  }, [navigation]);

  const renderTrip = useCallback(({ item }) => (
    <TripCard
      trip={item}
      onPress={() => handleTripPress(item)}
      onBookPress={() => handleBookPress(item)}
    />
  ), [handleTripPress, handleBookPress]);

  const formatDate = useCallback((dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-UY', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }, []);

  const renderHeader = useCallback(() => (
    <View>
      {/* Formulario de búsqueda */}
      <TripSearchForm
        onSearch={searchTrips}
        availableLocations={availableLocations}
        isLoading={isLoading}
        theme={theme}
        initialValues={currentSearchParams}
      />

      {/* Separador visual */}
      {hasSearched && trips.length > 0 && (
        <View style={{
          marginHorizontal: 16,
          marginBottom: 16,
        }}>
          <Text style={[globalStyles.textHeading3, { color: theme.colors.text }]}>
            Viajes Disponibles
          </Text>
        </View>
      )}
    </View>
  ), [
    searchTrips,
    availableLocations,
    isLoading,
    theme,
    currentSearchParams,
    hasSearched,
    trips.length,
    formatDate
  ]);

  if (isLoading && !hasSearched) {
    return <Loading text="Cargando ubicaciones..." />;
  }

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      {/* Header simple */}
      <View style={[globalStyles.header]}>
        <Text style={globalStyles.headerTitle}>Buscar Viajes</Text>
      </View>

      <FlatList
        data={trips}
        renderItem={renderTrip}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        ListHeaderComponent={renderHeader}
        refreshControl={
          <RefreshControl
            refreshing={isLoading && hasSearched}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
        ListEmptyComponent={
          hasSearched && !isLoading ? (
            <View style={{ paddingHorizontal: 16 }}>
              <EmptyState
                icon="bus-outline"
                title="No se encontraron viajes"
                description={`No hay viajes disponibles de ${currentSearchParams.origen || 'origen'} a ${currentSearchParams.destino || 'destino'} desde la fecha seleccionada. Prueba con otras fechas o rutas.`}
                actionText="Buscar otros viajes"
                onActionPress={() => {
                  // Scroll hacia arriba para mostrar el formulario
                  // o limpiar la búsqueda actual
                  setHasSearched(false);
                  setTrips([]);
                  setCurrentSearchParams({});
                }}
              />
            </View>
          ) : !hasSearched && !isLoading ? (
            <View style={{ paddingHorizontal: 16 }}>
              <EmptyState
                icon="search-outline"
                title="¡Encuentra tu viaje ideal!"
                description="Usa el formulario de arriba para buscar viajes entre diferentes ciudades. Selecciona origen, destino y fecha para comenzar."
                actionText=""
                onActionPress={() => {}}
              />
            </View>
          ) : null
        }
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        contentContainerStyle={{
          paddingBottom: 20,
          flexGrow: 1
        }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}