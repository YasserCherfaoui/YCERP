import { useState, useEffect, useCallback } from 'react';
import { 
  ApiEnvironment, 
  getApiEnvironment, 
  setApiEnvironment as saveApiEnvironment,
  getAllApiEnvironments,
  getEnvironmentConfig,
  ApiEnvironmentConfig
} from '@/lib/api-environment';

/**
 * React hook for managing API environment selection
 */
export function useApiEnvironment() {
  const [currentEnvironment, setCurrentEnvironment] = useState<ApiEnvironment>(getApiEnvironment());
  const [availableEnvironments] = useState<ApiEnvironmentConfig[]>(getAllApiEnvironments());

  // Listen for environment changes from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'api_environment' && e.newValue) {
        setCurrentEnvironment(e.newValue as ApiEnvironment);
      }
    };

    const handleCustomEvent = (e: CustomEvent<ApiEnvironment>) => {
      setCurrentEnvironment(e.detail);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('api-environment-changed', handleCustomEvent as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('api-environment-changed', handleCustomEvent as EventListener);
    };
  }, []);

  const setApiEnvironment = useCallback((env: ApiEnvironment) => {
    saveApiEnvironment(env);
    setCurrentEnvironment(env);
  }, []);

  const currentConfig = getEnvironmentConfig(currentEnvironment);

  return {
    currentEnvironment,
    currentConfig,
    availableEnvironments,
    setApiEnvironment,
  };
}







