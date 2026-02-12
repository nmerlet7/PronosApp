import { useState, useEffect, useCallback } from 'react';
import { ApiService } from '@/services/api.service';
import { StorageService } from '@/services/storage.service';
import { getErrorMessage, isNetworkError, isAuthError } from '@/services/error';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useApi<T>(
  apiCall: () => Promise<T>,
  dependencies: any[] = []
): UseApiState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiCall();
      setData(result);
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      
      if (isAuthError(err)) {
        // Gérer les erreurs d'authentification
        console.warn('Authentication error:', errorMessage);
      }
      
      if (isNetworkError(err)) {
        console.warn('Network error:', errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  useEffect(() => {
    fetchData();
  }, dependencies);

  return { data, loading, error, refetch: fetchData };
}

export function useApiKey() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadApiKey = async () => {
      try {
        const key = await StorageService.getApiKey();
        if (key) {
          setApiKey(key);
          ApiService.setApiKey(key);
        }
      } catch (error) {
        console.error('Error loading API key:', error);
      } finally {
        setLoading(false);
      }
    };

    loadApiKey();
  }, []);

  const saveApiKey = useCallback(async (key: string) => {
    try {
      await StorageService.saveApiKey(key);
      setApiKey(key);
      ApiService.setApiKey(key);
    } catch (error) {
      console.error('Error saving API key:', error);
      throw error;
    }
  }, []);

  return { apiKey, loading, saveApiKey };
}
