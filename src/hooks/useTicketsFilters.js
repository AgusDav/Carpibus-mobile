import { useState, useMemo } from 'react';

export const useTicketsFilters = (tickets = []) => {
  const [filters, setFilters] = useState({
    origenNombre: '',
    destinoNombre: '',
    fechaDesde: '',
    fechaHasta: '',
    estadoPasaje: '', // Para futuras implementaciones de estado
    sortBy: 'fechaViaje',
    sortDir: 'desc',
  });

  // Aplicar filtros y ordenamiento
  const filteredAndSortedTickets = useMemo(() => {
    let processed = [...tickets];

    // Aplicar filtros
    processed = processed.filter(ticket => {
      // Filtro por origen
      const origenMatch = filters.origenNombre ?
        ticket.origenViaje?.toLowerCase().includes(filters.origenNombre.toLowerCase()) : true;

      // Filtro por destino
      const destinoMatch = filters.destinoNombre ?
        ticket.destinoViaje?.toLowerCase().includes(filters.destinoNombre.toLowerCase()) : true;

      // Filtro por estado del pasaje (para futuras implementaciones)
      const estadoMatch = filters.estadoPasaje ?
        ticket.estado === filters.estadoPasaje : true;

      // Filtro por rango de fechas
      let fechaMatch = true;
      if (ticket.fechaViaje) {
        const fechaTicket = new Date(ticket.fechaViaje);
        fechaTicket.setHours(0, 0, 0, 0);

        if (filters.fechaDesde) {
          const fechaDesde = new Date(filters.fechaDesde);
          fechaDesde.setHours(0, 0, 0, 0);
          if (fechaTicket < fechaDesde) fechaMatch = false;
        }

        if (filters.fechaHasta && fechaMatch) {
          const fechaHasta = new Date(filters.fechaHasta);
          fechaHasta.setHours(0, 0, 0, 0);
          if (fechaTicket > fechaHasta) fechaMatch = false;
        }
      } else if (filters.fechaDesde || filters.fechaHasta) {
        fechaMatch = false;
      }

      return origenMatch && destinoMatch && estadoMatch && fechaMatch;
    });

    // Aplicar ordenamiento
    if (filters.sortBy) {
      processed.sort((a, b) => {
        let valA = a[filters.sortBy];
        let valB = b[filters.sortBy];

        // Manejo especial para fechas
        if (filters.sortBy === 'fechaViaje' || filters.sortBy === 'fechaCompra') {
          valA = a[filters.sortBy] ? new Date(a[filters.sortBy]) : null;
          valB = b[filters.sortBy] ? new Date(b[filters.sortBy]) : null;
        }
        // Manejo especial para strings
        else if (typeof valA === 'string' && typeof valB === 'string') {
          valA = valA.toLowerCase();
          valB = valB.toLowerCase();
        }
        // Manejo especial para números
        else if (filters.sortBy === 'precio' || filters.sortBy === 'numeroAsiento') {
          valA = parseFloat(valA) || 0;
          valB = parseFloat(valB) || 0;
        }

        // Manejar valores null/undefined
        if (valA === null && valB === null) return 0;
        if (valA === null) return filters.sortDir === 'asc' ? 1 : -1;
        if (valB === null) return filters.sortDir === 'asc' ? -1 : 1;

        // Comparación normal
        if (valA < valB) return filters.sortDir === 'asc' ? -1 : 1;
        if (valA > valB) return filters.sortDir === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return processed;
  }, [tickets, filters]);

  // Función para actualizar un filtro específico
  const updateFilter = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  // Función para cambiar ordenamiento
  const toggleSort = (newSortBy) => {
    setFilters(prev => ({
      ...prev,
      sortBy: newSortBy,
      sortDir: prev.sortBy === newSortBy && prev.sortDir === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Función para limpiar todos los filtros
  const clearFilters = () => {
    setFilters({
      origenNombre: '',
      destinoNombre: '',
      fechaDesde: '',
      fechaHasta: '',
      estadoPasaje: '',
      sortBy: 'fechaViaje',
      sortDir: 'desc',
    });
  };

  // Función para obtener indicador visual de ordenamiento
  const getSortIndicator = (columnName) => {
    if (filters.sortBy === columnName) {
      return filters.sortDir === 'asc' ? ' ▲' : ' ▼';
    }
    return '';
  };

  // Verificar si hay filtros activos
  const hasActiveFilters = Boolean(
    filters.origenNombre ||
    filters.destinoNombre ||
    filters.fechaDesde ||
    filters.fechaHasta ||
    filters.estadoPasaje
  );

  // Obtener estadísticas de los filtros
  const filterStats = {
    total: tickets.length,
    filtered: filteredAndSortedTickets.length,
    hidden: tickets.length - filteredAndSortedTickets.length,
    hasActiveFilters,
  };

  // Obtener opciones únicas para filtros de selección
  const uniqueOptions = useMemo(() => {
    const origenes = [...new Set(tickets.map(t => t.origenViaje).filter(Boolean))].sort();
    const destinos = [...new Set(tickets.map(t => t.destinoViaje).filter(Boolean))].sort();
    const estados = [...new Set(tickets.map(t => t.estado).filter(Boolean))].sort();

    return {
      origenes,
      destinos,
      estados,
    };
  }, [tickets]);

  // Funciones de utilidad para formateo
  const formatters = {
    date: (dateString) => {
      if (!dateString) return 'Fecha no disponible';
      const date = new Date(dateString);
      return date.toLocaleDateString('es-UY', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    },

    time: (timeString) => {
      if (!timeString) return '';
      return timeString.substring(0, 5);
    },

    currency: (amount) => {
      if (!amount) return '$0';
      return `${parseFloat(amount).toLocaleString('es-UY')}`;
    },

    dateRange: (fechaDesde, fechaHasta) => {
      if (!fechaDesde && !fechaHasta) return '';
      if (fechaDesde && !fechaHasta) return `Desde ${formatters.date(fechaDesde)}`;
      if (!fechaDesde && fechaHasta) return `Hasta ${formatters.date(fechaHasta)}`;
      return `${formatters.date(fechaDesde)} - ${formatters.date(fechaHasta)}`;
    }
  };

  // Función para exportar filtros (para persistencia o compartir)
  const exportFilters = () => {
    return JSON.stringify(filters);
  };

  // Función para importar filtros
  const importFilters = (filtersString) => {
    try {
      const importedFilters = JSON.parse(filtersString);
      setFilters(prev => ({ ...prev, ...importedFilters }));
      return true;
    } catch (error) {
      console.error('Error importing filters:', error);
      return false;
    }
  };

  // Función para aplicar filtros predefinidos
  const applyPreset = (presetName) => {
    const presets = {
      today: {
        fechaDesde: new Date().toISOString().split('T')[0],
        fechaHasta: new Date().toISOString().split('T')[0],
        sortBy: 'horaViaje',
        sortDir: 'asc'
      },
      thisWeek: {
        fechaDesde: new Date().toISOString().split('T')[0],
        fechaHasta: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        sortBy: 'fechaViaje',
        sortDir: 'asc'
      },
      thisMonth: {
        fechaDesde: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        fechaHasta: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0],
        sortBy: 'fechaViaje',
        sortDir: 'asc'
      },
      recent: {
        sortBy: 'fechaCompra',
        sortDir: 'desc'
      },
      expensive: {
        sortBy: 'precio',
        sortDir: 'desc'
      }
    };

    if (presets[presetName]) {
      setFilters(prev => ({ ...prev, ...presets[presetName] }));
    }
  };

  return {
    // Estados
    filters,
    filteredAndSortedTickets,
    filterStats,
    uniqueOptions,

    // Funciones principales
    updateFilter,
    toggleSort,
    clearFilters,

    // Utilidades
    getSortIndicator,
    hasActiveFilters,
    formatters,

    // Funciones avanzadas
    exportFilters,
    importFilters,
    applyPreset,

    // Setters directos para casos especiales
    setFilters,
  };
};