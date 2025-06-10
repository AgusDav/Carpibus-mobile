import { apiClient } from './client';

// Tipos basados en el backend real
export interface Location {
  id: number;
  nombre: string;
  departamento: string;
}

export interface Bus {
  id: number;
  matricula: string;
  modelo: string;
  capacidad: number;
}

export interface Trip {
  id: number;
  origen: Location;
  destino: Location;
  fecha: string; // "YYYY-MM-DD"
  horaSalida: string; // "HH:MM:SS"
  horaLlegada: string; // "HH:MM:SS"
  precio: number;
  omnibus: Bus;
  asientosDisponibles: number;
  asientosOcupados: number;
  ventasCerradas: boolean;
}

export interface TripSearchParams {
  origenNombre?: string;
  destinoNombre?: string;
  fecha?: string; // "YYYY-MM-DD"
  precioMinimo?: number;
  precioMaximo?: number;
}

export const tripsService = {
  async searchTrips(params: TripSearchParams): Promise<Trip[]> {
    const queryParams = new URLSearchParams();

    if (params.origenNombre) queryParams.append('origenNombre', params.origenNombre);
    if (params.destinoNombre) queryParams.append('destinoNombre', params.destinoNombre);
    if (params.fecha) queryParams.append('fecha', params.fecha);
    if (params.precioMinimo) queryParams.append('precioMinimo', params.precioMinimo.toString());
    if (params.precioMaximo) queryParams.append('precioMaximo', params.precioMaximo.toString());

    const response = await apiClient.get<Trip[]>(
      `/api/vendedor/viajes/buscar-disponibles?${queryParams.toString()}`,
      true // Requiere autenticación
    );
    return response;
  },

  async getTripById(id: number): Promise<any> {
    // Usar el endpoint de detalles con asientos
    const response = await apiClient.get<any>(
      `/api/vendedor/viajes/${id}/detalles-asientos`,
      true
    );
    return response;
  },

  async getAvailableLocations(): Promise<Location[]> {
    const response = await apiClient.get<Location[]>(
      '/api/vendedor/localidades-disponibles',
      true
    );
    return response;
  }
};