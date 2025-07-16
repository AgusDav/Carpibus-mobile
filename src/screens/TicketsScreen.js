import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Modal,
  TextInput,
  ScrollView,
  Alert,
  StatusBar,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../context/AuthContext';
import { ticketsService } from '../api/tickets';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';
import DatePicker from '../components/DatePicker';
import { useTicketsFilters } from '../hooks/useTicketsFilters';
import { globalStyles } from '../styles/globalStyles';
import { useTheme } from '../hooks/useTheme';

export default function TicketsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const theme = useTheme();
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Estados para manejo de dropdowns - OPTIMIZACIÓN: Separados del hook
  const [showOrigenDropdown, setShowOrigenDropdown] = useState(false);
  const [showDestinoDropdown, setShowDestinoDropdown] = useState(false);

  // Usar el hook de filtros optimizado
  const {
    filters,
    filteredAndSortedTickets,
    filterStats,
    uniqueOptions,
    updateFilter,
    toggleSort,
    clearFilters,
    getSortIndicator,
    hasActiveFilters,
    formatters,
  } = useTicketsFilters(tickets);

  // OPTIMIZACIÓN: useCallback para funciones que pasan como props
  const loadTickets = useCallback(async () => {
    if (!user?.id) return;

    setIsLoading(true);
    setError('');
    try {
      const response = await ticketsService.getUserTickets(user.id);
      setTickets(response || []);
    } catch (err) {
      console.error("Error al obtener historial de pasajes:", err);
      setError(err.response?.data?.message || "No se pudo cargar el historial de pasajes.");
      setTickets([]);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  // OPTIMIZACIÓN: useCallback para recargar
  const reloadTickets = useCallback(async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      setError('');
      const response = await ticketsService.getUserTickets(user.id);
      setTickets(response || []);
    } catch (err) {
      console.error("Error al recargar pasajes:", err);
      setError(err.response?.data?.message || "Error al recargar los pasajes.");
      Alert.alert('Error', 'No se pudieron recargar los pasajes');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // OPTIMIZACIÓN: useCallback para formatters
  const formatDate = useCallback((dateString) => {
    if (!dateString) return 'Fecha no disponible';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-UY', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }, []);

  const formatTime = useCallback((timeString) => {
    if (!timeString) return '';
    return timeString.substring(0, 5);
  }, []);

  // OPTIMIZACIÓN: useCallback para renderTicket
  const renderTicket = useCallback(({ item }) => (
    <TouchableOpacity
      style={globalStyles.card}
      onPress={() => {
        if (navigation.navigate) {
          navigation.navigate('TicketDetail', { ticket: item });
        }
      }}
      activeOpacity={0.7}
    >
      {/* Header del ticket */}
      <View style={[globalStyles.row, globalStyles.spaceBetween, globalStyles.marginBottomSm]}>
        <View style={[globalStyles.row, globalStyles.flex1, { marginRight: 12 }]}>
          <Icon name="location" size={16} color={theme.colors.textSecondary} />
          <Text style={[globalStyles.textBody, { marginLeft: 6, flex: 1, fontWeight: '600' }]} numberOfLines={1}>
            {item.origenViaje} → {item.destinoViaje}
          </Text>
        </View>
        <Text style={[globalStyles.textHeading3, { color: theme.colors.success }]}>
          ${item.precio}
        </Text>
      </View>

      {/* Detalles del ticket */}
      <View style={globalStyles.marginBottomSm}>
        <View style={[globalStyles.row, { marginBottom: 6 }]}>
          <Icon name="calendar-outline" size={16} color={theme.colors.textSecondary} />
          <Text style={[globalStyles.textCaption, { marginLeft: 8, flex: 1 }]}>
            {formatDate(item.fechaViaje)}
            {item.horaViaje && ` - ${formatTime(item.horaViaje)}`}
          </Text>
        </View>

        <View style={[globalStyles.row, { marginBottom: 6 }]}>
          <Icon name="person-outline" size={16} color={theme.colors.textSecondary} />
          <Text style={[globalStyles.textCaption, { marginLeft: 8, flex: 1 }]}>
            Asiento: {item.numeroAsiento || 'No asignado'}
          </Text>
        </View>

        {item.omnibusPatente && (
          <View style={globalStyles.row}>
            <Icon name="bus-outline" size={16} color={theme.colors.textSecondary} />
            <Text style={[globalStyles.textCaption, { marginLeft: 8, flex: 1 }]}>
              Ómnibus: {item.omnibusPatente}
            </Text>
          </View>
        )}
      </View>

      {/* Footer con ícono de flecha */}
      <View style={[globalStyles.row, globalStyles.spaceBetween, {
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#f3f4f6',
      }]}>
        <Text style={globalStyles.textSmall}>Ver detalles</Text>
        <Icon name="chevron-forward" size={16} color={theme.colors.textSecondary} />
      </View>
    </TouchableOpacity>
  ), [navigation, theme.colors, formatDate, formatTime]);

  // SOLUCIÓN: useCallback para handlers de selección
  const handleOrigenSelect = useCallback((origen) => {
    updateFilter('origenNombre', origen);
    setShowOrigenDropdown(false);
  }, [updateFilter]);

  const handleDestinoSelect = useCallback((destino) => {
    updateFilter('destinoNombre', destino);
    setShowDestinoDropdown(false);
  }, [updateFilter]);

  // SOLUCIÓN: useCallback para cerrar modal
  const closeFiltersModal = useCallback(() => {
    setShowFilters(false);
    setShowOrigenDropdown(false);
    setShowDestinoDropdown(false);
  }, []);

  // SOLUCIÓN: useCallback para limpiar filtros
  const handleClearFilters = useCallback(() => {
    clearFilters();
    setShowOrigenDropdown(false);
    setShowDestinoDropdown(false);
  }, [clearFilters]);

  // Componente para input con dropdown optimizado
  const InputWithDropdown = useCallback(({
    label,
    value,
    placeholder,
    options,
    onSelect,
    showDropdown,
    setShowDropdown
  }) => (
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
        onPress={() => setShowDropdown(!showDropdown)}
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
          >
            {value && (
              <TouchableOpacity
                style={{
                  padding: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: '#f3f4f6',
                }}
                onPress={(e) => {
                  e.stopPropagation();
                  onSelect('');
                }}
                activeOpacity={0.7}
              >
                <Text style={[globalStyles.textBody, { color: theme.colors.textSecondary, fontStyle: 'italic' }]}>
                  Limpiar selección
                </Text>
              </TouchableOpacity>
            )}
            {options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={{
                  padding: 12,
                  borderBottomWidth: index < options.length - 1 ? 1 : 0,
                  borderBottomColor: '#f3f4f6',
                  backgroundColor: value === option ? '#f0f9ff' : 'transparent',
                }}
                onPress={(e) => {
                  e.stopPropagation();
                  onSelect(option);
                }}
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
  ), [theme.colors]);

  // Modal de filtros optimizado
  const FilterModal = useCallback(() => (
    <Modal
      visible={showFilters}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={closeFiltersModal}
    >
      <View style={[globalStyles.container, { paddingTop: insets.top }]}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />

        {/* Header del modal */}
        <View style={[globalStyles.header, globalStyles.row, globalStyles.spaceBetween]}>
          <TouchableOpacity
            onPress={closeFiltersModal}
            style={{ minHeight: 44, minWidth: 44, justifyContent: 'center', alignItems: 'center' }}
          >
            <Text style={[globalStyles.textBody, { color: theme.colors.textSecondary }]}>
              Cancelar
            </Text>
          </TouchableOpacity>
          <Text style={globalStyles.headerTitle}>Filtrar Pasajes</Text>
          <TouchableOpacity
            onPress={handleClearFilters}
            style={{ minHeight: 44, minWidth: 44, justifyContent: 'center', alignItems: 'center' }}
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
          onTouchStart={() => {
            setShowOrigenDropdown(false);
            setShowDestinoDropdown(false);
          }}
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
              showDropdown={showOrigenDropdown}
              setShowDropdown={setShowOrigenDropdown}
            />

            {/* Destino con dropdown */}
            <InputWithDropdown
              label="Destino:"
              value={filters.destinoNombre}
              placeholder="Seleccionar destino"
              options={uniqueOptions.destinos}
              onSelect={handleDestinoSelect}
              showDropdown={showDestinoDropdown}
              setShowDropdown={setShowDestinoDropdown}
            />

            {/* Fecha Desde */}
            <DatePicker
              label="Fecha Desde:"
              value={filters.fechaDesde}
              onDateChange={(date) => updateFilter('fechaDesde', date)}
              placeholder="Seleccionar fecha desde"
              maximumDate={filters.fechaHasta ? new Date(filters.fechaHasta) : null}
            />

            {/* Fecha Hasta */}
            <DatePicker
              label="Fecha Hasta:"
              value={filters.fechaHasta}
              onDateChange={(date) => updateFilter('fechaHasta', date)}
              placeholder="Seleccionar fecha hasta"
              minimumDate={filters.fechaDesde ? new Date(filters.fechaDesde) : null}
            />
          </View>

          {/* Ordenamiento */}
          <View style={{ marginBottom: 32 }}>
            <Text style={[globalStyles.textHeading3, globalStyles.marginBottomMd]}>
              Ordenar por
            </Text>

            {[
              { key: 'fechaViaje', label: 'Fecha del Viaje', icon: 'calendar-outline' },
              { key: 'origenViaje', label: 'Origen', icon: 'location-outline' },
              { key: 'destinoViaje', label: 'Destino', icon: 'location-outline' },
              { key: 'precio', label: 'Precio', icon: 'cash-outline' },
            ].map((option, index) => (
              <TouchableOpacity
                key={option.key}
                style={[
                  globalStyles.listItem,
                  index === 0 && globalStyles.listItemFirst,
                  index === 3 && globalStyles.listItemLast,
                  filters.sortBy === option.key && { backgroundColor: theme.colors.primary + '10' }
                ]}
                onPress={() => toggleSort(option.key)}
              >
                <View style={[globalStyles.row, { gap: 12 }]}>
                  <Icon
                    name={option.icon}
                    size={20}
                    color={filters.sortBy === option.key ? theme.colors.primary : theme.colors.textSecondary}
                  />
                  <Text style={[
                    globalStyles.textBody,
                    { flex: 1 },
                    filters.sortBy === option.key && { color: theme.colors.primary, fontWeight: '600' }
                  ]}>
                    {option.label}{getSortIndicator(option.key)}
                  </Text>
                </View>
              </TouchableOpacity>
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
            onPress={closeFiltersModal}
          >
            <Text style={globalStyles.buttonText}>
              Mostrar {filterStats.filtered} pasajes
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  ), [showFilters, filters, filterStats, hasActiveFilters, uniqueOptions, theme.colors, insets.top, closeFiltersModal, handleClearFilters, handleOrigenSelect, handleDestinoSelect, showOrigenDropdown, showDestinoDropdown, updateFilter, toggleSort, getSortIndicator, InputWithDropdown]);

  // Mostrar loading inicial
  if (isLoading && tickets.length === 0) {
    return <Loading text="Cargando historial de pasajes..." />;
  }

  return (
    <View style={[globalStyles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />

      <View style={[globalStyles.header, globalStyles.row, globalStyles.spaceBetween]}>
        <Text style={globalStyles.headerTitle}>Mis Pasajes</Text>
        <View style={[globalStyles.row, { alignItems: 'center' }]}>
          <TouchableOpacity
            style={[
              {
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: hasActiveFilters ? theme.colors.primary : 'rgba(37, 99, 235, 0.1)',
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 8,
                gap: 6,
                minHeight: 44,
                minWidth: 44,
              }
            ]}
            onPress={() => setShowFilters(true)}
          >
            <Icon
              name="filter-outline"
              size={20}
              color={hasActiveFilters ? "#fff" : theme.colors.primary}
            />
            <Text style={{
              color: hasActiveFilters ? "#fff" : theme.colors.primary,
              fontSize: 14,
              fontWeight: '500',
            }}>
              Filtros
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Información de filtros activos */}
      {hasActiveFilters && (
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 20,
          paddingVertical: 12,
          backgroundColor: '#fef3c7',
          borderBottomWidth: 1,
          borderBottomColor: '#f59e0b',
        }}>
          <Text style={{
            color: '#92400e',
            fontSize: 14,
            fontWeight: '500',
          }}>
            Mostrando {filterStats.filtered} de {filterStats.total} pasajes
          </Text>
          <TouchableOpacity onPress={clearFilters}>
            <Text style={{
              color: '#f59e0b',
              fontSize: 14,
              fontWeight: '600',
            }}>
              Limpiar filtros
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Mensaje de error */}
      {error && (
        <View style={{
          backgroundColor: '#fef2f2',
          margin: 20,
          padding: 16,
          borderRadius: 8,
          borderLeftWidth: 4,
          borderLeftColor: '#ef4444',
        }}>
          <Text style={[globalStyles.textCaption, { color: theme.colors.error, marginBottom: 8 }]}>
            {error}
          </Text>
          <TouchableOpacity onPress={reloadTickets} style={{ alignSelf: 'flex-start' }}>
            <Text style={[globalStyles.textCaption, { color: theme.colors.primary, fontWeight: '600' }]}>
              Reintentar
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Lista de pasajes */}
      <FlatList
        data={filteredAndSortedTickets}
        renderItem={renderTicket}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        contentContainerStyle={globalStyles.screenPadding}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={reloadTickets}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState
              icon="ticket-outline"
              title={tickets.length === 0 ? "No tienes pasajes" : "No se encontraron pasajes"}
              description={
                tickets.length === 0
                  ? "Aún no has comprado ningún pasaje. ¡Explora nuestros viajes disponibles!"
                  : "No se encontraron pasajes con los filtros aplicados. Prueba modificando los criterios de búsqueda."
              }
              actionText={tickets.length === 0 ? "Buscar Viajes" : "Modificar Filtros"}
              onActionPress={
                tickets.length === 0
                  ? () => navigation.navigate('Search')
                  : () => setShowFilters(true)
              }
            />
          ) : null
        }
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        showsVerticalScrollIndicator={false}
      />

      <FilterModal />
    </View>
  );
}