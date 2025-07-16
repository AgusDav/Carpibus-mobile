import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../context/AuthContext';
import { ticketsService } from '../api/tickets';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';
import FilterModal from '../components/FilterModal'; // Nuevo componente separado
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

  // Callbacks para el FilterModal
  const handleFiltersClose = useCallback(() => {
    setShowFilters(false);
  }, []);

  const handleFiltersOpen = useCallback(() => {
    setShowFilters(true);
  }, []);

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
            onPress={handleFiltersOpen}
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
                  : handleFiltersOpen
              }
            />
          ) : null
        }
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        showsVerticalScrollIndicator={false}
      />

      {/* Modal de filtros como componente separado */}
      <FilterModal
        visible={showFilters}
        onClose={handleFiltersClose}
        filters={filters}
        filterStats={filterStats}
        hasActiveFilters={hasActiveFilters}
        uniqueOptions={uniqueOptions}
        updateFilter={updateFilter}
        toggleSort={toggleSort}
        clearFilters={clearFilters}
        getSortIndicator={getSortIndicator}
        theme={theme}
        insets={insets}
      />
    </View>
  );
}