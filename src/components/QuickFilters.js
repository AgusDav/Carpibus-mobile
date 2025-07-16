import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

export default function QuickFilters({
  onPresetApply,
  onCustomFilter,
  activeFilters = {},
  stats = {}
}) {

  const presets = [
    {
      id: 'today',
      label: 'Hoy',
      icon: 'today-outline',
      color: '#dc2626',
      description: 'Viajes de hoy'
    },
    {
      id: 'thisWeek',
      label: 'Esta Semana',
      icon: 'calendar-outline',
      color: '#2563eb',
      description: 'Próximos 7 días'
    },
    {
      id: 'thisMonth',
      label: 'Este Mes',
      icon: 'calendar-number-outline',
      color: '#059669',
      description: 'Mes actual'
    },
    {
      id: 'recent',
      label: 'Recientes',
      icon: 'time-outline',
      color: '#7c3aed',
      description: 'Ordenar por compra'
    },
    {
      id: 'expensive',
      label: 'Más Caros',
      icon: 'cash-outline',
      color: '#ea580c',
      description: 'Ordenar por precio'
    }
  ];

  const customFilters = [
    {
      id: 'clearAll',
      label: 'Limpiar Todo',
      icon: 'refresh-outline',
      color: '#6b7280',
      action: () => onCustomFilter('clear')
    },
    {
      id: 'advanced',
      label: 'Avanzados',
      icon: 'options-outline',
      color: '#1f2937',
      action: () => onCustomFilter('advanced')
    }
  ];

  const PresetButton = ({ preset }) => (
    <TouchableOpacity
      style={styles.presetButton}
      onPress={() => onPresetApply(preset.id)}
    >
      <View style={[styles.presetIcon, { backgroundColor: `${preset.color}20` }]}>
        <Icon name={preset.icon} size={20} color={preset.color} />
      </View>
      <Text style={styles.presetLabel}>{preset.label}</Text>
      <Text style={styles.presetDescription}>{preset.description}</Text>
    </TouchableOpacity>
  );

  const CustomFilterButton = ({ filter }) => (
    <TouchableOpacity
      style={[styles.customButton, { borderColor: filter.color }]}
      onPress={filter.action}
    >
      <Icon name={filter.icon} size={18} color={filter.color} />
      <Text style={[styles.customButtonText, { color: filter.color }]}>
        {filter.label}
      </Text>
    </TouchableOpacity>
  );

  const hasActiveFilters = Object.values(activeFilters).some(value =>
    value !== '' && value !== null && value !== undefined
  );

  return (
    <View style={styles.container}>
      {/* Header con estadísticas */}
      <View style={styles.header}>
        <View style={styles.statsContainer}>
          <Text style={styles.statsTitle}>Filtros Rápidos</Text>
          {stats.total > 0 && (
            <Text style={styles.statsText}>
              {stats.filtered} de {stats.total} pasajes
              {hasActiveFilters && ` (${stats.hidden} ocultos)`}
            </Text>
          )}
        </View>

        {hasActiveFilters && (
          <View style={styles.activeIndicator}>
            <Icon name="filter" size={16} color="#2563eb" />
            <Text style={styles.activeText}>Activos</Text>
          </View>
        )}
      </View>

      {/* Filtros presets */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.presetsContainer}
        contentContainerStyle={styles.presetsContent}
      >
        {presets.map((preset) => (
          <PresetButton key={preset.id} preset={preset} />
        ))}
      </ScrollView>

      {/* Botones de acción */}
      <View style={styles.actionsContainer}>
        {customFilters.map((filter) => (
          <CustomFilterButton key={filter.id} filter={filter} />
        ))}
      </View>

      {/* Indicador de filtros activos */}
      {hasActiveFilters && (
        <View style={styles.activeFiltersIndicator}>
          <View style={styles.activeFiltersContent}>
            <Icon name="information-circle-outline" size={16} color="#2563eb" />
            <Text style={styles.activeFiltersText}>
              Filtros aplicados:
              {activeFilters.origenNombre && ` Origen: ${activeFilters.origenNombre}`}
              {activeFilters.destinoNombre && ` Destino: ${activeFilters.destinoNombre}`}
              {activeFilters.fechaDesde && ` Desde: ${activeFilters.fechaDesde}`}
              {activeFilters.fechaHasta && ` Hasta: ${activeFilters.fechaHasta}`}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  statsContainer: {
    flex: 1,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  statsText: {
    fontSize: 12,
    color: '#6b7280',
  },
  activeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  activeText: {
    fontSize: 12,
    color: '#2563eb',
    fontWeight: '500',
  },
  presetsContainer: {
    paddingHorizontal: 12,
  },
  presetsContent: {
    paddingHorizontal: 8,
    gap: 12,
  },
  presetButton: {
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    minWidth: 90,
    maxWidth: 110,
  },
  presetIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  presetLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 2,
  },
  presetDescription: {
    fontSize: 10,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 12,
  },
  actionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
  },
  customButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: '#fff',
    gap: 6,
  },
  customButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  activeFiltersIndicator: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#dbeafe',
  },
  activeFiltersContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  activeFiltersText: {
    fontSize: 12,
    color: '#1e40af',
    flex: 1,
    lineHeight: 16,
  },
});