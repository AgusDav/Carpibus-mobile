import { useState } from 'react';
import { Ticket, PurchaseRequest, ticketsService } from '../lib/api/tickets';
import { useAuth } from '../lib/context/AuthContext';

export const useTickets = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTickets = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Verificar que el usuario esté autenticado
      if (!user || !user.id) {
        throw new Error('Usuario no autenticado');
      }

      // Usar el endpoint correcto del backend: /api/cliente/{clienteId}/historial-pasajes
      const response = await ticketsService.getTicketsByClientId(user.id);
      setTickets(response);
    } catch (err: any) {
      setError(err.message || 'Error cargando pasajes');
      console.error('Error fetching tickets:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const purchaseTicket = async (purchaseData: PurchaseRequest) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await ticketsService.purchaseTicket(purchaseData);

      // Agregar el nuevo ticket a la lista local
      setTickets(prev => [result, ...prev]);

      return result;
    } catch (err: any) {
      setError(err.message || 'Error procesando la compra');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const purchaseMultipleTickets = async (purchaseData: {
    viajeId: number;
    clienteId: number;
    numerosAsiento: number[];
  }) => {
    try {
      setIsLoading(true);
      setError(null);
      const results = await ticketsService.purchaseMultipleTickets(purchaseData);

      // Agregar los nuevos tickets a la lista local
      setTickets(prev => [...results, ...prev]);

      return results;
    } catch (err: any) {
      setError(err.message || 'Error procesando la compra múltiple');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    tickets,
    isLoading,
    error,
    fetchTickets,
    purchaseTicket,
    purchaseMultipleTickets,
  };
};