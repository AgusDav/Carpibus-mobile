import { useState, useMemo, useCallback } from 'react';

export const useTicketsFilters = (tickets = []) => {
  const [filters, setFilters] = useState({
    origenNombre: '',
    destinoNombre: '',
    fechaDesde: '',
    fechaHasta: '',
    sortBy: 'fechaViaje',
    sortDir: 'desc',
  });

  // OPTIMIZACIÓN: Usar useCallback para funciones que no necesitan re-crearse
  const updateFilter = useCallback((field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  }, []);

  const toggleSort = useCallback((newSortBy) => {
    setFilters(prev => {
      const newSortDir = prev.sortBy === newSortBy && prev.sortDir === 'asc' ? 'desc' : 'asc';
      return { ...prev, sortBy: newSortBy, sortDir: newSortDir };
    });
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      origenNombre: '',
      destinoNombre: '',
      fechaDesde: '',
      fechaHasta: '',
      sortBy: 'fechaViaje',
      sortDir: 'desc',
    });
  }, []);

  // OPTIMIZACIÓN: Dividir el useMemo en partes más pequeñas para evitar recálculos innecesarios

  // 1. Filtrado separado
  const filteredTickets = useMemo(() => {
    if (!tickets.length) return [];

    return tickets.filter(ticket => {
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
  }, [tickets, filters.origenNombre, filters.destinoNombre, filters.fechaDesde, filters.fechaHasta]);

  // 2. Ordenamiento separado
  const filteredAndSortedTickets = useMemo(() => {
    if (!filteredTickets.length || !filters.sortBy) return filteredTickets;

    const sorted = [...filteredTickets];

    sorted.sort((a, b) => {
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

    return sorted;
  }, [filteredTickets, filters.sortBy, filters.sortDir]);

  // OPTIMIZACIÓN: Cachear opciones únicas solo cuando tickets cambian
  const uniqueOptions = useMemo(() => {
    const origenes = [...new Set(tickets.map(t => t.origenViaje).filter(Boolean))].sort();
    const destinos = [...new Set(tickets.map(t => t.destinoViaje).filter(Boolean))].sort();

    return {
      origenes,
      destinos,
    };
  }, [tickets]); // Solo depende de tickets, no de filters

  // OPTIMIZACIÓN: Calcular estadísticas de forma eficiente
  const filterStats = useMemo(() => {
    const hasActiveFilters = Boolean(
      filters.origenNombre ||
      filters.destinoNombre ||
      filters.fechaDesde ||
      filters.fechaHasta
    );

    return {
      total: tickets.length,
      filtered: filteredAndSortedTickets.length,
      hidden: tickets.length - filteredAndSortedTickets.length,
      hasActiveFilters,
    };
  }, [tickets.length, filteredAndSortedTickets.length, filters.origenNombre, filters.destinoNombre, filters.fechaDesde, filters.fechaHasta]);

  // OPTIMIZACIÓN: Usar useCallback para funciones de utilidad
  const getSortIndicator = useCallback((columnName) => {
    if (filters.sortBy === columnName) {
      return filters.sortDir === 'asc' ? ' ▲' : ' ▼';
    }
    return '';
  }, [filters.sortBy, filters.sortDir]);

  const hasActiveFilters = filterStats.hasActiveFilters;

  // OPTIMIZACIÓN: Formatters estáticos (no necesitan ser recalculados)
  const formatters = useMemo(() => ({
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
  }), []); // Sin dependencias - son funciones puras

  return {
    // Estados principales
    filters,
    filteredAndSortedTickets,
    filterStats,
    uniqueOptions,

    // Funciones principales (ahora optimizadas con useCallback)
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