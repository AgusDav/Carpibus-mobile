import AsyncStorage from '@react-native-async-storage/async-storage';

// ⚠️ IMPORTANTE: Reemplaza con tu URL real de Railway
const API_BASE_URL = 'https://web-production-2443c.up.railway.app';

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async getAuthToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('auth_token');
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  private async getHeaders(includeAuth: boolean = true): Promise<HeadersInit> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (includeAuth) {
      const token = await this.getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    const data = await response.json();

    if (!response.ok) {
      // El backend devuelve errores como { "message": "error description" }
      const error = new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
      throw error;
    }

    return data;
  }

  async get<T>(endpoint: string, includeAuth: boolean = true): Promise<T> {
    const headers = await this.getHeaders(includeAuth);
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'GET',
      headers,
    });
    return this.handleResponse<T>(response);
  }

  async post<T>(endpoint: string, body: any, includeAuth: boolean = true): Promise<T> {
    const headers = await this.getHeaders(includeAuth);
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
    return this.handleResponse<T>(response);
  }

  async put<T>(endpoint: string, body: any, includeAuth: boolean = true): Promise<T> {
    const headers = await this.getHeaders(includeAuth);
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body),
    });
    return this.handleResponse<T>(response);
  }

  async delete<T>(endpoint: string, includeAuth: boolean = true): Promise<T> {
    const headers = await this.getHeaders(includeAuth);
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'DELETE',
      headers,
    });
    return this.handleResponse<T>(response);
  }
}

export const apiClient = new ApiClient(API_BASE_URL);