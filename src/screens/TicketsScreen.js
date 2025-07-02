import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Modal,
  TextInput,
  ScrollView,
  Alert,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../context/AuthContext';
import { ticketsService } from '../api/tickets';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';
import DatePicker from '../components/DatePicker';
import QuickFilters from '../components/QuickFilters';
import { useTicketsFilters } from '../hooks/useTicketsFilters';

export default function TicketsScreen({ navigation }) {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  // Usar el hook personalizado para filtros
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
    applyPreset,
  } = useTicketsFilters(tickets);

  // Cargar pasajes - Usando tu estructura original que funciona
  const loadTickets = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      setError(null);

      // Tu estructura original que funcionaba
      const userTickets = await ticketsService.getUserTickets(user.id);
      setTickets(userTickets || []);

    } catch (err) {
      console.error('Error loading tickets:', err);
      const errorMessage = err.response?.data?.message || 'Error al cargar los pasajes';
      setError(errorMessage);
      setTickets([]); // Limpiar tickets en caso de error

      // Mostrar alerta solo si es un error crítico
      if (err.response?.status >= 500) {
        Alert.alert(
          'Error del Servidor',
          'Ocurrió un problema en el servidor. Por favor intenta más tarde.',
          [{ text: 'OK' }]
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Solo cargar cuando cambie el user.id
    if (user?.id) {
      loadTickets();
    }
  }, [user?.id]); // No incluir loadTickets para evitar loops

  // Manejar aplicación de presets
  const handlePresetApply = (presetId) => {
    applyPreset(presetId);
  };

  // Manejar filtros personalizados
  const handleCustomFilter = (action) => {
    switch (action) {
      case 'clear':
        clearFilters();
        break;
      case 'advanced':
        setShowFilters(true);
        break;
      default:
        break;
    }
  };

  // Obtener color del estado del pasaje (basado en la fecha)
  const getTicketStatusColor = (fechaViaje) => {
    if (!fechaViaje) return '#6b7280';

    const today = new Date();
    const ticketDate = new Date(fechaViaje);
    today.setHours(0, 0, 0, 0);
    ticketDate.setHours(0, 0, 0, 0);

    if (ticketDate < today) {
      return '#059669'; // Verde para pasajes pasados (viajes realizados)
    } else if (ticketDate.getTime() === today.getTime()) {
      return '#dc2626'; // Rojo para viajes de hoy
    } else {
      return '#2563eb'; // Azul para viajes futuros
    }
  };

  // Obtener etiqueta del estado del pasaje
  const getTicketStatusLabel = (fechaViaje) => {
    if (!fechaViaje) return 'Sin fecha';

    const today = new Date();
    const ticketDate = new Date(fechaViaje);
    today.setHours(0, 0, 0, 0);
    ticketDate.setHours(0, 0, 0, 0);

    if (ticketDate < today) {
      return 'Realizado';
    } else if (ticketDate.getTime() === today.getTime()) {
      return 'Hoy';
    } else {
      const diffTime = ticketDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) return 'Mañana';
      if (diffDays <= 7) return `En ${diffDays} días`;
      return 'Futuro';
    }
  };

  // Renderizar ticket
  const renderTicket = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.ticketCard,
        { borderLeftColor: getTicketStatusColor(item.fechaViaje), borderLeftWidth: 4 }
      ]}
      onPress={() => {
        // Navegar a detalle del ticket si existe la pantalla
        if (navigation.navigate) {
          navigation.navigate('TicketDetail', { ticket: item });
        }
      }}
      activeOpacity={0.7}
    >
      {/* Header del ticket */}
      <View style={styles.ticketHeader}>
        <View style={styles.routeInfo}>
          <Icon name="location" size={16} color="#666" />
          <Text style={styles.routeText} numberOfLines={1}>
            {item.origenViaje} → {item.destinoViaje}
          </Text>
        </View>

        <View style={styles.ticketPriceContainer}>
          <Text style={styles.ticketPrice}>{formatters.currency(item.precio)}</Text>
          <View style={[
            styles.statusBadge,
            { backgroundColor: getTicketStatusColor(item.fechaViaje) }
          ]}>
            <Text style={styles.statusText}>
              {getTicketStatusLabel(item.fechaViaje)}
            </Text>
          </View>
        </View>
      </View>

      {/* Detalles del ticket */}
      <View style={styles.ticketDetails}>
        <View style={styles.detailRow}>
          <Icon name="calendar-outline" size={16} color="#666" />
          <Text style={styles.detailText}>
            {formatters.date(item.fechaViaje)}
            {item.horaViaje && ` - ${formatters.time(item.horaViaje)}`}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Icon name="person-outline" size={16} color="#666" />
          <Text style={styles.detailText}>
            Asiento: {item.numeroAsiento || 'No asignado'}
          </Text>
        </View>

        {item.omnibusPatente && (
          <View style={styles.detailRow}>
            <Icon name="bus-outline" size={16} color="#666" />
            <Text style={styles.detailText}>
              Ómnibus: {item.omnibusPatente}
            </Text>
          </View>
        )}
      </View>

      {/* Footer del ticket */}
      <View style={styles.ticketFooter}>
        <View style={styles.footerLeft}>
          {item.fechaCompra && (
            <Text style={styles.purchaseDate}>
              Comprado: {formatters.date(item.fechaCompra)}
            </Text>
          )}
        </View>

        <View style={styles.footerRight}>
          <Icon name="chevron-forward" size={16} color="#ccc" />
        </View>
      </View>
    </TouchableOpacity>
  );

  // Modal de filtros avanzados
  const FilterModal = () => (
    <Modal
      visible={showFilters}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowFilters(false)}
    >
      <SafeAreaView style={styles.modalContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />

        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowFilters(false)}>
            <Text style={styles.cancelButton}>Cancelar</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Filtros Avanzados</Text>
          <TouchableOpacity onPress={clearFilters}>
            <Text style={styles.clearButton}>Limpiar</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.modalContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Filtros de búsqueda */}
          <View style={styles.filterSection}>
            <Text style={styles.sectionTitle}>Filtros de Búsqueda</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Origen:</Text>
              <TextInput
                style={styles.textInput}
                value={filters.origenNombre}
                onChangeText={(text) => updateFilter('origenNombre', text)}
                placeholder="Buscar por ciudad de origen..."
                placeholderTextColor="#999"
                autoCapitalize="words"
                returnKeyType="next"
                clearButtonMode="while-editing"
              />
              {uniqueOptions.origenes.length > 0 && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.suggestionsContainer}
                  contentContainerStyle={styles.suggestionsContent}
                >
                  {uniqueOptions.origenes.slice(0, 5).map((origen) => (
                    <TouchableOpacity
                      key={origen}
                      style={styles.suggestionButton}
                      onPress={() => updateFilter('origenNombre', origen)}
                    >
                      <Text style={styles.suggestionText}>{origen}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Destino:</Text>
              <TextInput
                style={styles.textInput}
                value={filters.destinoNombre}
                onChangeText={(text) => updateFilter('destinoNombre', text)}
                placeholder="Buscar por ciudad de destino..."
                placeholderTextColor="#999"
                autoCapitalize="words"
                returnKeyType="next"
                clearButtonMode="while-editing"
              />
              {uniqueOptions.destinos.length > 0 && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.suggestionsContainer}
                  contentContainerStyle={styles.suggestionsContent}
                >
                  {uniqueOptions.destinos.slice(0, 5).map((destino) => (
                    <TouchableOpacity
                      key={destino}
                      style={styles.suggestionButton}
                      onPress={() => updateFilter('destinoNombre', destino)}
                    >
                      <Text style={styles.suggestionText}>{destino}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>

            <DatePicker
              label="Fecha Desde:"
              value={filters.fechaDesde}
              onDateChange={(date) => updateFilter('fechaDesde', date)}
              placeholder="Seleccionar fecha de inicio"
              maximumDate={filters.fechaHasta ? new Date(filters.fechaHasta) : null}
            />

            <DatePicker
              label="Fecha Hasta:"
              value={filters.fechaHasta}
              onDateChange={(date) => updateFilter('fechaHasta', date)}
              placeholder="Seleccionar fecha de fin"
              minimumDate={filters.fechaDesde ? new Date(filters.fechaDesde) : null}
            />
          </View>

          {/* Ordenamiento */}
          <View style={styles.filterSection}>
            <Text style={styles.sectionTitle}>Ordenar por</Text>

            {[
              { key: 'fechaViaje', label: 'Fecha del Viaje', icon: 'calendar-outline' },
              { key: 'origenViaje', label: 'Origen', icon: 'location-outline' },
              { key: 'destinoViaje', label: 'Destino', icon: 'location-outline' },
              { key: 'precio', label: 'Precio', icon: 'cash-outline' },
              { key: 'fechaCompra', label: 'Fecha de Compra', icon: 'time-outline' },
              { key: 'numeroAsiento', label: 'Número de Asiento', icon: 'person-outline' }
            ].map((option) => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.sortOption,
                  filters.sortBy === option.key && styles.sortOptionActive
                ]}
                onPress={() => toggleSort(option.key)}
              >
                <View style={styles.sortOptionContent}>
                  <Icon
                    name={option.icon}
                    size={20}
                    color={filters.sortBy === option.key ? '#2563eb' : '#666'}
                  />
                  <Text style={[
                    styles.sortOptionText,
                    filters.sortBy === option.key && styles.sortOptionTextActive
                  ]}>
                    {option.label}{getSortIndicator(option.key)}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Vista previa de resultados */}
          <View style={styles.filterSection}>
            <Text style={styles.sectionTitle}>Vista Previa</Text>
            <View style={styles.resultsPreview}>
              <View style={styles.previewRow}>
                <Icon name="document-text-outline" size={20} color="#6b7280" />
                <Text style={styles.resultsText}>
                  Se mostrarán {filterStats.filtered} de {filterStats.total} pasajes
                </Text>
              </View>

              {hasActiveFilters && (
                <View style={styles.previewRow}>
                  <Icon name="eye-off-outline" size={20} color="#ef4444" />
                  <Text style={styles.hiddenText}>
                    {filterStats.hidden} pasajes ocultos por los filtros
                  </Text>
                </View>
              )}

              <View style={styles.previewRow}>
                <Icon name="funnel-outline" size={20} color="#2563eb" />
                <Text style={styles.orderText}>
                  Ordenados por {filters.sortBy === 'fechaViaje' ? 'fecha del viaje' :
                                filters.sortBy === 'origenViaje' ? 'origen' :
                                filters.sortBy === 'destinoViaje' ? 'destino' :
                                filters.sortBy === 'precio' ? 'precio' :
                                filters.sortBy === 'fechaCompra' ? 'fecha de compra' :
                                filters.sortBy === 'numeroAsiento' ? 'número de asiento' : filters.sortBy}
                  {` (${filters.sortDir === 'asc' ? 'ascendente' : 'descendente'})`}
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>

        <View style={styles.modalFooter}>
          <TouchableOpacity
            style={styles.applyButton}
            onPress={() => setShowFilters(false)}
          >
            <Text style={styles.applyButtonText}>
              Aplicar Filtros ({filterStats.filtered})
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );

  // Renderizar estado de carga
  if (isLoading && tickets.length === 0) {
    return <Loading text="Cargando pasajes..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mis Pasajes</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              hasActiveFilters && styles.filterButtonActive
            ]}
            onPress={() => setShowFilters(true)}
          >
            <Icon
              name={hasActiveFilters ? "filter" : "filter-outline"}
              size={20}
              color={hasActiveFilters ? "#fff" : "#2563eb"}
            />
            <Text style={[
              styles.filterButtonText,
              hasActiveFilters && styles.filterButtonTextActive
            ]}>
              Filtros
            </Text>
            {hasActiveFilters && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>●</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={loadTickets} disabled={isLoading}>
            <Icon
              name="refresh"
              size={24}
              color={isLoading ? "#ccc" : "#2563eb"}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Filtros rápidos */}
      <QuickFilters
        onPresetApply={handlePresetApply}
        onCustomFilter={handleCustomFilter}
        activeFilters={filters}
        stats={filterStats}
      />

      {/* Mensaje de error */}
      {error && (
        <View style={styles.errorContainer}>
          <View style={styles.errorContent}>
            <Icon name="alert-circle-outline" size={20} color="#dc2626" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
          <TouchableOpacity onPress={loadTickets} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Lista de pasajes */}
      <FlatList
        data={filteredAndSortedTickets}
        renderItem={renderTicket}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={loadTickets}
            colors={['#2563eb']}
            tintColor="#2563eb"
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
                  : "Prueba modificando los filtros de búsqueda para ver más resultados."
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
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        showsVerticalScrollIndicator={false}
      />

      <FilterModal />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
    position: 'relative',
  },
  filterButtonActive: {
    backgroundColor: '#2563eb',
  },
  filterButtonText: {
    color: '#2563eb',
    fontSize: 14,
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#ef4444',
    borderRadius: 6,
    width: 12,
    height: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: 'bold',
  },
  errorContainer: {
    backgroundColor: '#fef2f2',
    margin: 20,
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
  },
  errorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    flex: 1,
  },
  retryButton: {
    alignSelf: 'flex-start',
  },
  retryButtonText: {
    color: '#2563eb',
    fontSize: 14,
    fontWeight: '600',
  },
  listContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  ticketCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  routeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  routeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginLeft: 6,
    flex: 1,
  },
  ticketPriceContainer: {
    alignItems: 'flex-end',
  },
  ticketPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#059669',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  ticketDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 8,
    flex: 1,
  },
  ticketFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  footerLeft: {
    flex: 1,
  },
  footerRight: {
    marginLeft: 12,
  },
  purchaseDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#fff',
    elevation: 2,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  cancelButton: {
    color: '#6b7280',
    fontSize: 16,
  },
  clearButton: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  filterSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 6,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#1f2937',
  },
  suggestionsContainer: {
    marginTop: 8,
  },
  suggestionsContent: {
    paddingRight: 20,
    gap: 8,
  },
  suggestionButton: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  suggestionText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  sortOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  sortOptionActive: {
    backgroundColor: '#eff6ff',
    borderColor: '#2563eb',
  },
  sortOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sortOptionText: {
    fontSize: 16,
    color: '#6b7280',
    flex: 1,
  },
  sortOptionTextActive: {
    color: '#2563eb',
    fontWeight: '600',
  },
  resultsPreview: {
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  resultsText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  hiddenText: {
    fontSize: 14,
    color: '#dc2626',
  },
  orderText: {
    fontSize: 14,
    color: '#2563eb',
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  applyButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});