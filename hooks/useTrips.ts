import { useState } from 'react';
import { Trip, TripSearchParams, tripsService } from '../lib/api/trips';

export const useTrips = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchTrips = async (params: TripSearchParams = {}) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await tripsService.searchTrips(params);
      setTrips(response);
    } catch (err: any) {
      setError(err.message || 'Error cargando viajes');
      console.error('Error fetching trips:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshTrips = (params?: TripSearchParams) => {
    searchTrips(params);
  };

  return {
    trips,
    isLoading,
    error,
    searchTrips,
    refreshTrips,
  };
};