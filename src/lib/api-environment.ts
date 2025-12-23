/**
 * API Environment Manager
 * Manages switching between different API environments (KOYEB, RAILWAY, GCP)
 */

export type ApiEnvironment = 'GCP' | 'RAILWAY' | 'KOYEB';

export interface ApiEnvironmentConfig {
  name: ApiEnvironment;
  url: string;
  description: string;
}

export const API_ENVIRONMENTS: Record<ApiEnvironment, ApiEnvironmentConfig> = {
  GCP: {
    name: 'GCP',
    url: import.meta.env.VITE_GCP_API_URL || 'http://localhost:8080',
    description: 'Google Cloud Platform (Production)',
  },
  RAILWAY: {
    name: 'RAILWAY',
    url: import.meta.env.VITE_RAILWAY_API_URL || 'https://myerp-production.up.railway.app',
    description: 'Railway (Staging)',
  },
  KOYEB: {
    name: 'KOYEB',
    url: import.meta.env.VITE_KOYEB_API_URL || 'https://myerp-koyeb.example.com',
    description: 'Koyeb (Development)',
  },
};

const STORAGE_KEY = 'api_environment';
const DEFAULT_ENVIRONMENT: ApiEnvironment = 'GCP';

/**
 * Get the currently selected API environment
 */
export function getApiEnvironment(): ApiEnvironment {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && (stored === 'GCP' || stored === 'RAILWAY' || stored === 'KOYEB')) {
      return stored as ApiEnvironment;
    }
  } catch (error) {
    console.error('Error reading API environment from localStorage:', error);
  }
  return DEFAULT_ENVIRONMENT;
}

/**
 * Set the API environment
 */
export function setApiEnvironment(env: ApiEnvironment): void {
  try {
    localStorage.setItem(STORAGE_KEY, env);
    // Trigger a custom event so other parts of the app can react
    window.dispatchEvent(new CustomEvent('api-environment-changed', { detail: env }));
  } catch (error) {
    console.error('Error saving API environment to localStorage:', error);
  }
}

/**
 * Get the current API base URL based on selected environment
 */
export function getApiBaseUrl(): string {
  const env = getApiEnvironment();
  const config = API_ENVIRONMENTS[env];
  
  // If using localhost in development, override
  const viteApiUrl = import.meta.env.VITE_API_URL;
  if (viteApiUrl && viteApiUrl.includes('localhost')) {
    return viteApiUrl;
  }
  
  return config.url;
}

/**
 * Get all available API environments
 */
export function getAllApiEnvironments(): ApiEnvironmentConfig[] {
  return Object.values(API_ENVIRONMENTS);
}

/**
 * Get configuration for a specific environment
 */
export function getEnvironmentConfig(env: ApiEnvironment): ApiEnvironmentConfig {
  return API_ENVIRONMENTS[env];
}







