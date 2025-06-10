import { useState } from 'react';
import { ticketsService, PayPalOrderResponse, PayPalCaptureResponse } from '../lib/api/tickets';

export const usePayPal = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createOrder = async (amount: number): Promise<PayPalOrderResponse> => {
    try {
      setIsLoading(true);
      setError(null);
      const order = await ticketsService.createPayPalOrder(amount);
      return order;
    } catch (err: any) {
      setError(err.message || 'Error creando orden de PayPal');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const captureOrder = async (orderId: string): Promise<PayPalCaptureResponse> => {
    try {
      setIsLoading(true);
      setError(null);
      const capture = await ticketsService.capturePayPalOrder(orderId);
      return capture;
    } catch (err: any) {
      setError(err.message || 'Error capturando pago de PayPal');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    createOrder,
    captureOrder,
  };
};