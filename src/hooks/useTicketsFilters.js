import { useState, useMemo } from 'react';

export const useTicketsFilters = (tickets = []) => {
  const [filters, setFilters] = useState({
    origenNombre: '',
    destinoNombre: '',
    fechaDesde: '',
    fechaHasta: '',
    sortBy: 'fechaViaje',
    sortDir: 'desc',
  });

  // Aplicar filtros y ordenamiento - IGUAL AL WEB
  const filteredAndSortedTickets = useMemo(() => {
    let processed = [...tickets];

    // Aplicar filtros (copiado exactamente del web)
    processed = processed.filter(ticket => {
      const origenMatch = filters.origenNombre ?
        ticket.origenViaje?.toLowerCase().includes(filters.origenNombre.toLowerCase()) : true;

      const destinoMatch = filters.destinoNombre ?
        ticket.destinoViaje?.toLowerCase().includes(filters.destinoNombre.toLowerCase()) : true;

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

      return origenMatch && destinoMatch && fechaMatch;
    });

    // Aplicar ordenamiento (copiado exactamente del web)
    if (filters.sortBy) {
      processed.sort((a, b) => {
        let valA = a[filters.sortBy];
        let valB = b[filters.sortBy];

        if (filters.sortBy === 'fechaViaje') {
          valA = a.fechaViaje ? new Date(a.fechaViaje) : null;
          valB = b.fechaViaje ? new Date(b.fechaViaje) : null;
        } else if (typeof valA === 'string' && typeof valB === 'string') {
          valA = valA.toLowerCase();
          valB = valB.toLowerCase();
        }

        if (valA < valB) return filters.sortDir === 'asc' ? -1 : 1;
        if (valA > valB) return filters.sortDir === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return processed;
  }, [tickets, filters]);

  // Función para actualizar filtros (igual al web)
  const updateFilter = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  // Función para cambiar ordenamiento (igual al web)
  const toggleSort = (newSortBy) => {
    setFilters(prev => {
      const newSortDir = prev.sortBy === newSortBy && prev.sortDir === 'asc' ? 'desc' : 'asc';
      return { ...prev, sortBy: newSortBy, sortDir: newSortDir };
    });
  };

  // Limpiar filtros
  const clearFilters = () => {
    setFilters({
      origenNombre: '',
      destinoNombre: '',
      fechaDesde: '',
      fechaHasta: '',
      sortBy: 'fechaViaje',
      sortDir: 'desc',
    });
  };

  // Obtener indicador de ordenamiento (igual al web)
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
    filters.fechaHasta
  );

  // Estadísticas de filtros
  const filterStats = {
    total: tickets.length,
    filtered: filteredAndSortedTickets.length,
    hidden: tickets.length - filteredAndSortedTickets.length,
    hasActiveFilters,
  };

  // Opciones únicas para sugerencias
  const uniqueOptions = useMemo(() => {
    const origenes = [...new Set(tickets.map(t => t.origenViaje).filter(Boolean))].sort();
    const destinos = [...new Set(tickets.map(t => t.destinoViaje).filter(Boolean))].sort();

    return {
      origenes,
      destinos,
    };
  }, [tickets]);

  // Formatters para mostrar datos
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
      return `$${parseFloat(amount).toLocaleString('es-UY')}`;
    }
  };

  return {
    // Estados principales
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

    // Setter directo para casos especiales
    setFilters,
  };
};