import React, { useState, useCallback, memo, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import DatePicker from './DatePicker';
import { globalStyles } from '../styles/globalStyles';

const { height: screenHeight } = Dimensions.get('window');

// Componente Dropdown puro para origen/destino
const LocationDropdown = memo(({
  label,
  value = '',
  placeholder,
  options = [],
  onSelect,
  theme,
  icon = "location-outline"
}) => {
  const [showModal, setShowModal] = useState(false);

  const handleToggleModal = useCallback(() => {
    setShowModal(prev => !prev);
  }, []);

  const handleSelectOption = useCallback((option) => {
    onSelect(option);
    setShowModal(false);
  }, [onSelect]);

  const handleClearSelection = useCallback(() => {
    onSelect('');
    setShowModal(false);
  }, [onSelect]);

  return (
    <View style={globalStyles.marginBottomMd}>
      <Text style={[globalStyles.textCaption, { fontWeight: '500', marginBottom: 6 }]}>
        {label}
      </Text>

      <TouchableOpacity
        style={[
          globalStyles.input,
          {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            minHeight: 50,
          }
        ]}
        onPress={handleToggleModal}
        activeOpacity={0.7}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <Icon
            name={icon}
            size={20}
            color={theme.colors.textSecondary}
            style={{ marginRight: 8 }}
          />
          <Text style={[
            globalStyles.textBody,
            {
              flex: 1,
              color: value ? theme.colors.text : theme.colors.placeholder
            }
          ]}>
            {value || placeholder}
          </Text>
        </View>

        <Icon
          name="chevron-down"
          size={20}
          color={theme.colors.textSecondary}
        />
      </TouchableOpacity>

      <Modal
        visible={showModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        {/* Fondo semitransparente que se puede tocar para cerrar */}
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 20,
          }}
          activeOpacity={1}
          onPress={() => setShowModal(false)} // Cerrar al tocar afuera
        >
          {/* Contenedor del modal que NO se cierra al tocarlo */}
          <TouchableOpacity
            style={{
              backgroundColor: '#fff',
              borderRadius: 12,
              maxHeight: screenHeight * 0.6, // Máximo 60% de la pantalla
              width: '100%',
              maxWidth: 400, // Límite de ancho en tablets
              elevation: 5,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
            }}
            activeOpacity={1} // No cerrar al tocar el contenido
          >
            {/* Header del modal */}
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: 16,
              borderBottomWidth: 1,
              borderBottomColor: '#e5e7eb',
            }}>
              <Text style={[globalStyles.textHeading3]}>
                {label}
              </Text>
              <TouchableOpacity
                onPress={() => setShowModal(false)}
                style={{
                  padding: 4,
                  borderRadius: 20,
                  backgroundColor: '#f3f4f6',
                }}
              >
                <Icon name="close" size={20} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Lista scrolleable de opciones - AQUÍ ya no hay conflicto */}
            <ScrollView
              style={{ maxHeight: screenHeight * 0.4 }}
              showsVerticalScrollIndicator={true}
            >
              {/* Opción para limpiar selección */}
              {value && (
                <TouchableOpacity
                  style={{
                    padding: 16,
                    borderBottomWidth: 1,
                    borderBottomColor: '#f3f4f6',
                    backgroundColor: '#f9fafb',
                  }}
                  onPress={handleClearSelection}
                  activeOpacity={0.7}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Icon name="close-circle" size={20} color={theme.colors.textSecondary} />
                    <Text style={[
                      globalStyles.textBody,
                      {
                        marginLeft: 12,
                        color: theme.colors.textSecondary,
                        fontStyle: 'italic'
                      }
                    ]}>
                      Limpiar selección
                    </Text>
                  </View>
                </TouchableOpacity>
              )}

              {/* Opciones de localidades */}
              {options.map((option, index) => (
                <TouchableOpacity
                  key={`${option}-${index}`}
                  style={{
                    padding: 16,
                    borderBottomWidth: index < options.length - 1 ? 1 : 0,
                    borderBottomColor: '#f3f4f6',
                    backgroundColor: value === option ? '#f0f9ff' : 'transparent',
                  }}
                  onPress={() => handleSelectOption(option)}
                  activeOpacity={0.7}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Icon
                      name="location"
                      size={20}
                      color={value === option ? theme.colors.primary : theme.colors.textSecondary}
                    />
                    <Text style={[
                      globalStyles.textBody,
                      {
                        marginLeft: 12,
                        color: value === option ? theme.colors.primary : theme.colors.text,
                        fontWeight: value === option ? '600' : '400'
                      }
                    ]}>
                      {option}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
});

// Componente principal TripSearchForm
const TripSearchForm = memo(({
  onSearch,
  availableLocations = { origenes: [], destinos: [] },
  isLoading = false,
  theme,
  initialValues = {}
}) => {
  const [searchParams, setSearchParams] = useState({
    origen: initialValues.origen || '',
    destino: initialValues.destino || '',
    fecha: initialValues.fecha || '',
    pasajeros: initialValues.pasajeros || 1,
    ...initialValues
  });

  const updateParam = useCallback((field, value) => {
    setSearchParams(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleSearch = useCallback(() => {
    // Validaciones
    if (!searchParams.origen.trim()) {
      Alert.alert('Error', 'Por favor selecciona una ciudad de origen');
      return;
    }

    if (!searchParams.destino.trim()) {
      Alert.alert('Error', 'Por favor selecciona una ciudad de destino');
      return;
    }

    if (searchParams.origen.toLowerCase() === searchParams.destino.toLowerCase()) {
      Alert.alert('Error', 'El origen y destino no pueden ser la misma ciudad');
      return;
    }

    if (!searchParams.fecha) {
      Alert.alert('Error', 'Por favor selecciona una fecha de viaje');
      return;
    }

    if (!searchParams.pasajeros || searchParams.pasajeros < 1) {
      Alert.alert('Error', 'El número de pasajeros debe ser al menos 1');
      return;
    }

    // Validar que la fecha no sea pasada
    const fechaSeleccionada = new Date(searchParams.fecha);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    if (fechaSeleccionada < hoy) {
      Alert.alert('Error', 'No puedes buscar viajes en fechas pasadas');
      return;
    }

    onSearch(searchParams);
  }, [searchParams, onSearch]);

  const handleSwapLocations = useCallback(() => {
    setSearchParams(prev => ({
      ...prev,
      origen: prev.destino,
      destino: prev.origen,
    }));
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchParams({
      origen: '',
      destino: '',
      fecha: '',
      pasajeros: 1,
    });
  }, []);

  const isSearchValid = searchParams.origen && searchParams.destino && searchParams.fecha && searchParams.pasajeros;
  const hasFiltersActive = searchParams.origen || searchParams.destino || searchParams.fecha || searchParams.pasajeros > 1;

  return (
    <View style={{
      backgroundColor: '#fff',
      margin: 16,
      padding: 20,
      borderRadius: 12,
      ...theme.shadows?.md,
      elevation: 3,
    }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Origen */}
        <LocationDropdown
          label="¿Desde dónde viajas?"
          value={searchParams.origen}
          placeholder="Seleccionar ciudad de origen"
          options={availableLocations?.origenes || []}
          onSelect={(valor) => updateParam('origen', valor)}
          theme={theme}
          icon="location"
        />

        {/* Botón para intercambiar origen y destino */}
        <View style={{ alignItems: 'center', marginVertical: 8 }}>
          <TouchableOpacity
            onPress={handleSwapLocations}
            style={{
              backgroundColor: theme.colors.primary + '15',
              borderRadius: 20,
              padding: 8,
            }}
            activeOpacity={0.7}
            disabled={!searchParams.origen && !searchParams.destino}
          >
            <Icon
              name="swap-vertical"
              size={20}
              color={theme.colors.primary}
            />
          </TouchableOpacity>
        </View>

        {/* Destino */}
        <LocationDropdown
          label="¿A dónde quieres ir?"
          value={searchParams.destino}
          placeholder="Seleccionar ciudad de destino"
          options={availableLocations?.destinos || []}
          onSelect={(valor) => updateParam('destino', valor)}
          theme={theme}
          icon="location"
        />

        {/* Fecha */}
        <DatePicker
          label="¿Cuándo quieres viajar?"
          value={searchParams.fecha}
          onDateChange={(date) => updateParam('fecha', date)}
          placeholder="Seleccionar fecha de viaje"
          minimumDate={new Date()} // No permitir fechas pasadas
        />

        {/* Número de asientos mínimos disponibles */}
        <View style={globalStyles.marginBottomMd}>
          <Text style={[globalStyles.textCaption, { fontWeight: '500', marginBottom: 6 }]}>
            ¿Cuántos asientos necesitas?
          </Text>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: '#d1d5db',
            borderRadius: 8,
            backgroundColor: '#fff',
            paddingHorizontal: 12,
            minHeight: 50,
          }}>
            <Icon
              name="people-outline"
              size={20}
              color={theme.colors.textSecondary}
              style={{ marginRight: 8 }}
            />

            <TouchableOpacity
              onPress={() => updateParam('pasajeros', Math.max(1, searchParams.pasajeros - 1))}
              style={{
                backgroundColor: theme.colors.primary + '15',
                borderRadius: 6,
                width: 32,
                height: 32,
                justifyContent: 'center',
                alignItems: 'center',
              }}
              disabled={searchParams.pasajeros <= 1}
              activeOpacity={0.7}
            >
              <Icon
                name="remove"
                size={16}
                color={searchParams.pasajeros <= 1 ? theme.colors.textSecondary : theme.colors.primary}
              />
            </TouchableOpacity>

            <Text style={[
              globalStyles.textBody,
              {
                flex: 1,
                textAlign: 'center',
                fontWeight: '600',
                fontSize: 16
              }
            ]}>
              {searchParams.pasajeros} {searchParams.pasajeros === 1 ? 'asiento' : 'asientos'}
            </Text>

            <TouchableOpacity
              onPress={() => updateParam('pasajeros', Math.min(50, searchParams.pasajeros + 1))}
              style={{
                backgroundColor: theme.colors.primary + '15',
                borderRadius: 6,
                width: 32,
                height: 32,
                justifyContent: 'center',
                alignItems: 'center',
              }}
              disabled={searchParams.pasajeros >= 50}
              activeOpacity={0.7}
            >
              <Icon
                name="add"
                size={16}
                color={searchParams.pasajeros >= 50 ? theme.colors.textSecondary : theme.colors.primary}
              />
            </TouchableOpacity>
          </View>

          <Text style={[globalStyles.textSmall, { color: theme.colors.textSecondary, marginTop: 4, fontStyle: 'italic' }]}>
            Solo se mostrarán viajes con al menos {searchParams.pasajeros} asientos disponibles
          </Text>
        </View>

        {/* Fila de botones: Limpiar y Buscar */}
        <View style={{
          flexDirection: 'row',
          gap: 12,
          marginTop: 20,
        }}>
          {/* Botón de limpiar - Solo se muestra si hay filtros activos */}
          {hasFiltersActive && (
            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: theme.colors.error + '10',
                borderWidth: 1,
                borderColor: theme.colors.error + '30',
                borderRadius: 8,
                paddingVertical: 14,
                paddingHorizontal: 16,
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 8,
              }}
              onPress={handleClearSearch}
              activeOpacity={0.7}
            >
              <Icon name="close-circle" size={18} color={theme.colors.error} />
              <Text style={[
                globalStyles.textBody,
                {
                  color: theme.colors.error,
                  fontWeight: '600'
                }
              ]}>
                Limpiar
              </Text>
            </TouchableOpacity>
          )}

          {/* Botón de búsqueda */}
          <TouchableOpacity
            style={[
              globalStyles.buttonPrimary,
              {
                flex: hasFiltersActive ? 2 : 1, // Más ancho cuando hay botón de limpiar
                opacity: isSearchValid && !isLoading ? 1 : 0.6,
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 8,
              }
            ]}
            onPress={handleSearch}
            disabled={!isSearchValid || isLoading}
            activeOpacity={0.7}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Icon name="search" size={20} color="#fff" />
            )}
            <Text style={[
              globalStyles.buttonText,
              { opacity: isLoading ? 0.7 : 1 }
            ]}>
              {isLoading ? 'Buscando...' : 'Buscar Viajes'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
});

TripSearchForm.displayName = 'TripSearchForm';
LocationDropdown.displayName = 'LocationDropdown';

export default TripSearchForm;