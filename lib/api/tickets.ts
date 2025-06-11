import { apiClient } from './client';

export interface Passenger {
  nombre: string;
  apellido: string;
  ci: number;
  email?: string;
  telefono?: number;
}

export interface PurchaseRequest {
  viajeId: number;
  clienteId: number;
  numeroAsiento: number;
  // Para compra múltiple
  numerosAsiento?: number[];
}

export interface Ticket {
  id: number;
  clienteId: number;
  clienteNombre: string;
  clienteEmail: string;
  viajeId: number;
  origenViaje: string;
  destinoViaje: string;
  fechaViaje: string;
  horaSalidaViaje: string;
  omnibusMatricula: string;
  precio: number;
  estado: 'VENDIDO' | 'CANCELADO' | 'RESERVADO';
  numeroAsiento: number;
  fechaReserva: string;
}

export interface PayPalOrder {
  amount: number;
}

export interface PayPalOrderResponse {
  id: string;
  status: string;
  links: Array<{
    href: string;
    rel: string;
    method: string;
  }>;
}

export interface PayPalCaptureResponse {
  id: string;
  status: string;
  paymentSource?: any;
}

export const ticketsService = {
  async purchaseTicket(purchaseData: PurchaseRequest): Promise<Ticket> {
    const response = await apiClient.post<Ticket>(
      '/api/vendedor/pasajes/comprar',
      purchaseData,
      true
    );
    return response;
  },

  async purchaseMultipleTickets(purchaseData: {
    viajeId: number;
    clienteId: number;
    numerosAsiento: number[];
  }): Promise<Ticket[]> {
    const response = await apiClient.post<Ticket[]>(
      '/api/vendedor/pasajes/comprar-multiple',
      purchaseData,
      true
    );
    return response;
  },

  // ✅ NUEVA FUNCIÓN: Obtener pasajes de un cliente específico
  async getTicketsByClientId(clienteId: number): Promise<Ticket[]> {
    const response = await apiClient.get<Ticket[]>(
      `/api/cliente/${clienteId}/historial-pasajes`,
      true // Requiere autenticación
    );
    return response;
  },

  // Función legacy para compatibilidad (ahora usa la nueva implementación)
  async getMyTickets(): Promise<Ticket[]> {
    throw new Error('Use getTicketsByClientId() con el ID del usuario autenticado');
  },

  // PayPal integration
  async createPayPalOrder(amount: number): Promise<PayPalOrderResponse> {
    const response = await apiClient.post<PayPalOrderResponse>(
      '/api/paypal/orders',
      { amount },
      false // PayPal endpoints no requieren autenticación JWT
    );
    return response;
  },

  async capturePayPalOrder(orderId: string): Promise<PayPalCaptureResponse> {
    const response = await apiClient.post<PayPalCaptureResponse>(
      `/api/paypal/orders/${orderId}/capture`,
      {},
      false
    );
    return response;
  }
};