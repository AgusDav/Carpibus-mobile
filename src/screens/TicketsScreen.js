import React, { useState, useEffect } from 'react';
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

  // Usar el hook de filtros (igual al web)
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

  // Cargar pasajes (igual al web pero adaptado para móvil)
  useEffect(() => {
    const loadTickets = async () => {
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
    };

    loadTickets();
  }, [user?.id]);

  // Función para recargar pasajes
  const reloadTickets = async () => {
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
  };

  // Formatear fecha para mostrar
  const formatDate = (dateString) => {
    if (!dateString) return 'Fecha no disponible';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-UY', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Formatear hora
  const formatTime = (timeString) => {
    if (!timeString) return '';
    return timeString.substring(0, 5);
  };

  // Renderizar cada pasaje usando estilos centralizados
  const renderTicket = ({ item }) => (
    <TouchableOpacity
      style={globalStyles.card}
      onPress={() => {
        // Navegar a detalle si existe
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
  );

  // Modal de filtros usando estilos centralizados
  const FilterModal = () => (
    <Modal
      visible={showFilters}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowFilters(false)}
    >
      <View style={[globalStyles.container, { paddingTop: insets.top }]}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />

        {/* Header del modal */}
        <View style={[globalStyles.header, globalStyles.row, globalStyles.spaceBetween]}>
          <TouchableOpacity
            onPress={() => setShowFilters(false)}
            style={{ minHeight: 44, minWidth: 44, justifyContent: 'center', alignItems: 'center' }}
          >
            <Text style={[globalStyles.textBody, { color: theme.colors.textSecondary }]}>
              Cancelar
            </Text>
          </TouchableOpacity>
          <Text style={globalStyles.headerTitle}>Filtrar Pasajes</Text>
          <TouchableOpacity
            onPress={clearFilters}
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
        >
          {/* Filtros */}
          <View style={{ marginBottom: 32 }}>
            <Text style={[globalStyles.textHeading3, globalStyles.marginBottomMd]}>
              Filtros
            </Text>

            {/* Origen */}
            <View style={globalStyles.marginBottomMd}>
              <Text style={[globalStyles.textCaption, { fontWeight: '500', marginBottom: 6 }]}>
                Origen:
              </Text>
              <TextInput
                style={globalStyles.input}
                value={filters.origenNombre}
                onChangeText={(text) => updateFilter('origenNombre', text)}
                placeholder="Ej: Montevideo"
                placeholderTextColor={theme.colors.placeholder}
                autoCapitalize="words"
                returnKeyType="next"
              />
            </View>

            {/* Destino */}
            <View style={globalStyles.marginBottomMd}>
              <Text style={[globalStyles.textCaption, { fontWeight: '500', marginBottom: 6 }]}>
                Destino:
              </Text>
              <TextInput
                style={globalStyles.input}
                value={filters.destinoNombre}
                onChangeText={(text) => updateFilter('destinoNombre', text)}
                placeholder="Ej: Colonia"
                placeholderTextColor={theme.colors.placeholder}
                autoCapitalize="words"
                returnKeyType="next"
              />
            </View>

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
            onPress={() => setShowFilters(false)}
          >
            <Text style={globalStyles.buttonText}>
              Mostrar {filterStats.filtered} pasajes
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  // Mostrar loading inicial
  if (isLoading && tickets.length === 0) {
    return <Loading text="Cargando historial de pasajes..." />;
  }

  return (
    <View style={[globalStyles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />

      {/* Header */}
      <View style={[globalStyles.header, globalStyles.row, globalStyles.spaceBetween]}>
        <Text style={globalStyles.headerTitle}>Mis Pasajes Comprados</Text>
        <View style={[globalStyles.row, { alignItems: 'center', gap: 16 }]}>
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

          <TouchableOpacity
            onPress={reloadTickets}
            disabled={isLoading}
            style={{
              minHeight: 44,
              minWidth: 44,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Icon
              name="refresh"
              size={24}
              color={isLoading ? theme.colors.textSecondary : theme.colors.primary}
            />
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