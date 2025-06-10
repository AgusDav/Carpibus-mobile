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

  // ⚠️ Nota: No hay endpoint específico para obtener pasajes del cliente
  // Necesitarías pedirle a tu compañero que agregue este endpoint
  async getMyTickets(): Promise<Ticket[]> {
    // Este endpoint no existe en el backend actual
    // Podrías usar /api/vendedor/viajes/{viajeId}/pasajes pero necesitas el viajeId
    throw new Error('Endpoint getMyTickets no implementado en el backend');
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