import React, { useState, useCallback, memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import DatePicker from './DatePicker';
import { globalStyles } from '../styles/globalStyles';

// Componente InputWithDropdown optimizado y memorizado
const InputWithDropdown = memo(({
  label,
  value,
  placeholder,
  options,
  onSelect,
  theme
}) => {
  const [showDropdown, setShowDropdown] = useState(false);

  const handleToggleDropdown = useCallback(() => {
    setShowDropdown(prev => !prev);
  }, []);

  const handleSelectOption = useCallback((option) => {
    onSelect(option);
    setShowDropdown(false);
  }, [onSelect]);

  const handleClearSelection = useCallback(() => {
    onSelect('');
    setShowDropdown(false);
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
          }
        ]}
        onPress={handleToggleDropdown}
        activeOpacity={0.7}
      >
        <Text style={[
          globalStyles.textBody,
          { color: value ? theme.colors.text : theme.colors.placeholder }
        ]}>
          {value || placeholder}
        </Text>
        <Icon
          name={showDropdown ? "chevron-up" : "chevron-down"}
          size={20}
          color={theme.colors.textSecondary}
        />
      </TouchableOpacity>

      {showDropdown && options.length > 0 && (
        <View style={{
          backgroundColor: '#fff',
          borderWidth: 1,
          borderColor: '#e5e7eb',
          borderRadius: 8,
          marginTop: 4,
          maxHeight: 200,
          elevation: 3,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          zIndex: 1000,
        }}>
          <ScrollView
            style={{ maxHeight: 200 }}
            nestedScrollEnabled={true}
            showsVerticalScrollIndicator={false}
          >
            {value && (
              <TouchableOpacity
                style={{
                  padding: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: '#f3f4f6',
                }}
                onPress={handleClearSelection}
                activeOpacity={0.7}
              >
                <Text style={[globalStyles.textBody, { color: theme.colors.textSecondary, fontStyle: 'italic' }]}>
                  Limpiar selección
                </Text>
              </TouchableOpacity>
            )}
            {options.map((option, index) => (
              <TouchableOpacity
                key={`${option}-${index}`}
                style={{
                  padding: 12,
                  borderBottomWidth: index < options.length - 1 ? 1 : 0,
                  borderBottomColor: '#f3f4f6',
                  backgroundColor: value === option ? '#f0f9ff' : 'transparent',
                }}
                onPress={() => handleSelectOption(option)}
                activeOpacity={0.7}
              >
                <Text style={[
                  globalStyles.textBody,
                  { color: value === option ? theme.colors.primary : theme.colors.text }
                ]}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
});

// Componente SortOption memorizado
const SortOption = memo(({
  option,
  index,
  isSelected,
  onPress,
  getSortIndicator,
  theme
}) => (
  <TouchableOpacity
    style={[
      globalStyles.listItem,
      index === 0 && globalStyles.listItemFirst,
      index === 3 && globalStyles.listItemLast,
      isSelected && { backgroundColor: theme.colors.primary + '10' }
    ]}
    onPress={() => onPress(option.key)}
    activeOpacity={0.7}
  >
    <View style={[globalStyles.row, { gap: 12 }]}>
      <Icon
        name={option.icon}
        size={20}
        color={isSelected ? theme.colors.primary : theme.colors.textSecondary}
      />
      <Text style={[
        globalStyles.textBody,
        { flex: 1 },
        isSelected && { color: theme.colors.primary, fontWeight: '600' }
      ]}>
        {option.label}{getSortIndicator(option.key)}
      </Text>
    </View>
  </TouchableOpacity>
));

// Componente principal FilterModal
const FilterModal = memo(({
  visible,
  onClose,
  filters,
  filterStats,
  hasActiveFilters,
  uniqueOptions,
  updateFilter,
  toggleSort,
  clearFilters,
  getSortIndicator,
  theme,
  insets
}) => {
  // Handlers optimizados con useCallback
  const handleOrigenSelect = useCallback((origen) => {
    updateFilter('origenNombre', origen);
  }, [updateFilter]);

  const handleDestinoSelect = useCallback((destino) => {
    updateFilter('destinoNombre', destino);
  }, [updateFilter]);

  const handleDateChange = useCallback((field) => (date) => {
    updateFilter(field, date);
  }, [updateFilter]);

  const handleClearFilters = useCallback(() => {
    clearFilters();
  }, [clearFilters]);

  const handleSortToggle = useCallback((sortKey) => {
    toggleSort(sortKey);
  }, [toggleSort]);

  // Opciones de ordenamiento estáticas
  const sortOptions = [
    { key: 'fechaViaje', label: 'Fecha del Viaje', icon: 'calendar-outline' },
    { key: 'origenViaje', label: 'Origen', icon: 'location-outline' },
    { key: 'destinoViaje', label: 'Destino', icon: 'location-outline' },
    { key: 'precio', label: 'Precio', icon: 'cash-outline' },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[globalStyles.container, { paddingTop: insets.top }]}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />

        {/* Header del modal */}
        <View style={[globalStyles.header, globalStyles.row, globalStyles.spaceBetween]}>
          <TouchableOpacity
            onPress={onClose}
            style={{ minHeight: 44, minWidth: 44, justifyContent: 'center', alignItems: 'center' }}
            activeOpacity={0.7}
          >
            <Text style={[globalStyles.textBody, { color: theme.colors.textSecondary }]}>
              Cancelar
            </Text>
          </TouchableOpacity>
          <Text style={globalStyles.headerTitle}>Filtrar Pasajes</Text>
          <TouchableOpacity
            onPress={handleClearFilters}
            style={{ minHeight: 44, minWidth: 44, justifyContent: 'center', alignItems: 'center' }}
            activeOpacity={0.7}
          >
            <Text style={[globalStyles.textBody, { color: theme.colors.error, fontWeight: '600' }]}>
              Limpiar
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={globalStyles.screenPadding}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Filtros */}
          <View style={{ marginBottom: 32 }}>
            <Text style={[globalStyles.textHeading3, globalStyles.marginBottomMd]}>
              Filtros
            </Text>

            {/* Origen con dropdown */}
            <InputWithDropdown
              label="Origen:"
              value={filters.origenNombre}
              placeholder="Seleccionar origen"
              options={uniqueOptions.origenes}
              onSelect={handleOrigenSelect}
              theme={theme}
            />

            {/* Destino con dropdown */}
            <InputWithDropdown
              label="Destino:"
              value={filters.destinoNombre}
              placeholder="Seleccionar destino"
              options={uniqueOptions.destinos}
              onSelect={handleDestinoSelect}
              theme={theme}
            />

            {/* Fecha Desde */}
            <DatePicker
              label="Fecha Desde:"
              value={filters.fechaDesde}
              onDateChange={handleDateChange('fechaDesde')}
              placeholder="Seleccionar fecha desde"
              maximumDate={filters.fechaHasta ? new Date(filters.fechaHasta) : null}
            />

            {/* Fecha Hasta */}
            <DatePicker
              label="Fecha Hasta:"
              value={filters.fechaHasta}
              onDateChange={handleDateChange('fechaHasta')}
              placeholder="Seleccionar fecha hasta"
              minimumDate={filters.fechaDesde ? new Date(filters.fechaDesde) : null}
            />
          </View>

          {/* Ordenamiento */}
          <View style={{ marginBottom: 32 }}>
            <Text style={[globalStyles.textHeading3, globalStyles.marginBottomMd]}>
              Ordenar por
            </Text>

            {sortOptions.map((option, index) => (
              <SortOption
                key={option.key}
                option={option}
                index={index}
                isSelected={filters.sortBy === option.key}
                onPress={handleSortToggle}
                getSortIndicator={getSortIndicator}
                theme={theme}
              />
            ))}
          </View>

          {/* Resumen de resultados */}
          <View style={{ marginBottom: 32 }}>
            <Text style={[globalStyles.textHeading3, globalStyles.marginBottomMd]}>
              Resultados
            </Text>
            <View style={{
              backgroundColor: '#f8fafc',
              padding: 16,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: '#e5e7eb',
            }}>
              <Text style={[globalStyles.textBody, { fontWeight: '500', marginBottom: 4 }]}>
                Se mostrarán {filterStats.filtered} de {filterStats.total} pasajes
              </Text>
              {hasActiveFilters && filterStats.hidden > 0 && (
                <Text style={[globalStyles.textSmall, { color: theme.colors.textSecondary }]}>
                  ({filterStats.hidden} pasajes ocultos por los filtros)
                </Text>
              )}
            </View>
          </View>
        </ScrollView>

        {/* Footer del modal */}
        <View style={{
          padding: 20,
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
          backgroundColor: '#fff',
        }}>
          <TouchableOpacity
            style={globalStyles.buttonPrimary}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Text style={globalStyles.buttonText}>
              Mostrar {filterStats.filtered} pasajes
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
});

FilterModal.displayName = 'FilterModal';
InputWithDropdown.displayName = 'InputWithDropdown';
SortOption.displayName = 'SortOption';

export default FilterModal;