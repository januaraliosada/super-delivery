import { useState, useCallback } from 'react';

const API_BASE_URL = '/api';

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const apiCall = useCallback(async (endpoint, options = {}) => {
    setLoading(true);
    setError(null);

    try {
      const url = `${API_BASE_URL}${endpoint}`;
      const config = {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      };

      if (config.body && typeof config.body === 'object') {
        config.body = JSON.stringify(config.body);
      }

      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      const errorMessage = err.message || 'An unexpected error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const get = useCallback((endpoint) => apiCall(endpoint), [apiCall]);
  
  const post = useCallback((endpoint, data) => 
    apiCall(endpoint, { method: 'POST', body: data }), [apiCall]);
  
  const put = useCallback((endpoint, data) => 
    apiCall(endpoint, { method: 'PUT', body: data }), [apiCall]);
  
  const del = useCallback((endpoint) => 
    apiCall(endpoint, { method: 'DELETE' }), [apiCall]);

  return {
    loading,
    error,
    get,
    post,
    put,
    delete: del,
    clearError: () => setError(null),
  };
};

export default useApi;

