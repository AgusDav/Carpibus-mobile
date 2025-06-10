import { useState, useEffect } from 'react';
import { Location, tripsService } from '../lib/api/trips';

export const useLocations = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await tripsService.getAvailableLocations();
      setLocations(data);
    } catch (err: any) {
      setError(err.message || 'Error cargando ubicaciones');
      console.error('Error fetching locations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return { locations, isLoading, error, refetch: fetchLocations };
};