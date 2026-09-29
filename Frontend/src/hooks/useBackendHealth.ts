import { useState, useEffect, useCallback } from 'react';
import { apiService, ApiError, getApiBaseUrl } from '../services/api';
import { HealthResponse } from '../types';

export interface HealthState {
  isChecking: boolean;
  isConnected: boolean;
  isModelLoaded: boolean;
  data: HealthResponse | null;
  error: string | null;
  lastChecked: Date | null;
  activeUrl: string;
}

export function useBackendHealth() {
  const [state, setState] = useState<HealthState>({
    isChecking: true,
    isConnected: false,
    isModelLoaded: false,
    data: null,
    error: null,
    lastChecked: null,
    activeUrl: getApiBaseUrl(),
  });

  const checkHealth = useCallback(async () => {
    setState((prev) => ({ ...prev, isChecking: true }));
    try {
      const data = await apiService.checkHealth();
      const isConnected = data.status === 'ok';
      const isModelLoaded = data.model === 'loaded';

      setState({
        isChecking: false,
        isConnected,
        isModelLoaded,
        data,
        error: isConnected && isModelLoaded ? null : 'Backend reported degraded or unready status',
        lastChecked: new Date(),
        activeUrl: getApiBaseUrl(),
      });
    } catch (err) {
      const errorMsg =
        err instanceof ApiError
          ? err.message
          : 'Backend unavailable. Please verify FastAPI backend is active and reachable.';
      setState({
        isChecking: false,
        isConnected: false,
        isModelLoaded: false,
        data: null,
        error: errorMsg,
        lastChecked: new Date(),
        activeUrl: getApiBaseUrl(),
      });
    }
  }, []);

  useEffect(() => {
    checkHealth();
    // Re-check health every 30 seconds
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, [checkHealth]);

  return {
    ...state,
    refreshHealth: checkHealth,
  };
}
