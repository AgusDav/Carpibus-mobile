export interface Location {
  id: string;
  name: string;
  province: string;
  country: string;
}

export interface Bus {
  id: string;
  licensePlate: string;
  model: string;
  totalSeats: number;
  isActive: boolean;
}

export interface Trip {
  id: string;
  originLocation: Location;
  destinationLocation: Location;
  departureDate: string;
  departureTime: string;
  arrivalDate: string;
  arrivalTime: string;
  basePrice: number;
  bus: Bus;
  availableSeats: number;
  totalSeats: number;
  isActive: boolean;
  salesClosed: boolean;
}

export interface TripFilter {
  origin?: string;
  destination?: string;
  departureDate?: string;
  minPrice?: number;
  maxPrice?: number;
  availableSeats?: number;
}

export interface TripSort {
  field: 'departureDate' | 'departureTime' | 'basePrice' | 'availableSeats';
  order: 'asc' | 'desc';
}

export interface Discount {
  id: string;
  name: string;
  percentage: number;
  description: string;
  isActive: boolean;
}