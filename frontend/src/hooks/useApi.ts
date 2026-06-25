import { useAuth } from '../contexts/AuthContext';
import { API_URL } from '../lib/config';

// Caché global en memoria para evitar parpadeos al cambiar de pestañas
const cache = new Map<string, { data: any, timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 5; // 5 minutos de vida

export const useApi = () => {
  const { token, logout } = useAuth();

  const request = async (endpoint: string, options: RequestInit = {}) => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {})
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const method = options.method || 'GET';

    // Si es una mutación (POST, PUT, DELETE, PATCH), limpiamos la caché
    if (method !== 'GET') {
      cache.clear();
    }

    // Retornar caché inmediatamente si existe y no ha expirado
    if (method === 'GET') {
      const cached = cache.get(endpoint);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.data; // Instant response
      }
    }

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
      });

      if (response.status === 401 || response.status === 403) {
        logout();
        throw new Error('Sesión expirada o acceso denegado');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ocurrió un error en la petición');
      }

      // Guardar en caché si es GET
      if (method === 'GET') {
        cache.set(endpoint, { data, timestamp: Date.now() });
      }

      return data;
    } catch (error: any) {
      throw error;
    }
  };

  return { request, clearCache: () => cache.clear() };
};
