// src/api/trips.js
import { apiClient } from './client';

export const tripsService = {
    searchTrips: async (criteriosBusqueda) => {
      try {
        console.log('🔍 searchTrips - Enviando criterios:', criteriosBusqueda);

        // Construir la URL manualmente para debugging
        const baseURL = '/api/vendedor/viajes/buscar-disponibles';
        const params = new URLSearchParams();

        Object.keys(criteriosBusqueda).forEach(key => {
          if (criteriosBusqueda[key] !== null && criteriosBusqueda[key] !== undefined) {
            params.append(key, criteriosBusqueda[key]);
          }
        });

        const fullURL = `${baseURL}?${params.toString()}`;
        console.log('🌐 URL construida:', fullURL);

        // Usar el método igual que el frontend web
        const response = await apiClient.get( fullURL );

        console.log('✅ Viajes encontrados:', response.length || 0);
        if (response.length > 0) {
          console.log('📋 Primer viaje:', response[0]);
        }

        return response || [];

      } catch (error) {
        const status = error.response?.status;
        const errorMessage = error.response?.data?.message || error.message || "Error desconocido";

        console.error(`❌ Error en búsqueda de viajes - Status: ${status}`);
        console.error(`📋 Mensaje: ${errorMessage}`);
        console.error(`🔍 Criterios enviados:`, criteriosBusqueda);

        if (error.config) {
          console.error(`🌐 URL completa:`, error.config.url);
          console.error(`📋 Parámetros:`, error.config.params);
        }

        // Re-lanzar el error con información más detallada
        const enhancedError = new Error(errorMessage);
        enhancedError.status = status;
        enhancedError.originalError = error;

        throw enhancedError;
      }
    },

  async getTripById(id) {
    // Usar el endpoint de detalles con asientos
    const response = await apiClient.get(
      `/api/vendedor/viajes/${id}/detalles-asientos`,
      true
    );
    return response;
  },

  async getAvailableLocations() {
    const response = await apiClient.get(
      '/api/vendedor/localidades-disponibles',
      true
    );
    return response;
  },

  // Nuevo método para reservar asientos temporalmente
  async reserveSeatsTemporarily(reservationData) {
    const response = await apiClient.post(
      '/api/vendedor/pasajes/reservar-temporalmente',
      reservationData,
      true
    );
    return response;
  },

  // Nuevo método para confirmar compra múltiple
  async confirmMultiplePurchase(purchaseData) {
    const response = await apiClient.post(
      '/api/vendedor/pasajes/confirmar-compra-multiple',
      purchaseData,
      true
    );
    return response;
  },

  // Obtener pasajes del usuario
  async getUserTickets() {
    const response = await apiClient.get(
      '/api/cliente/pasajes',
      true
    );
    return response;
  },

  // Cancelar/devolver un pasaje
  async cancelTicket(ticketId) {
    const response = await apiClient.post(
      `/api/vendedor/pasajes/${ticketId}/devolucion`,
      {},
      true
    );
    return response;
  }
};