import { apiClient } from './client';

export const ticketsService = {
  async getUserTickets(clienteId) {
    try {
      const response = await apiClient.get(
        `/api/cliente/${clienteId}/historial-pasajes`,
        true // Requiere autenticación
      );
      return response;
    } catch (error) {
      console.error('Error getting user tickets:', error);
      throw error;
    }
  },

  async getTicketDetails(ticketId) {
    try {
      const response = await apiClient.get(
        `/api/vendedor/pasajes/${ticketId}`,
        true
      );
      return response;
    } catch (error) {
      console.error('Error getting ticket details:', error);
      throw error;
    }
  }
};