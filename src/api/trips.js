import { apiClient } from './client';

export const tripsService = {
  async searchTrips(params = {}) {
    const queryParams = new URLSearchParams();

    if (params.origenNombre) queryParams.append('origenNombre', params.origenNombre);
    if (params.destinoNombre) queryParams.append('destinoNombre', params.destinoNombre);
    if (params.fecha) queryParams.append('fecha', params.fecha);
    if (params.precioMinimo) queryParams.append('precioMinimo', params.precioMinimo.toString());
    if (params.precioMaximo) queryParams.append('precioMaximo', params.precioMaximo.toString());

    const response = await apiClient.get(
      `/api/vendedor/viajes/buscar-disponibles?${queryParams.toString()}`,
      true // Requiere autenticación
    );
    return response;
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
  }
};