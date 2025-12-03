import { getApiBaseUrl } from '@/lib/api-environment';

// Dynamic base URL based on selected API environment
// Priority: localStorage selection > VITE_API_URL > environment defaults
export const getBaseUrl = (): string => {
  const viteApiUrl = import.meta.env.VITE_API_URL;
  // If explicitly set to localhost in env, use that (for local development)
  if (viteApiUrl && (viteApiUrl.includes('localhost') || viteApiUrl.includes('127.0.0.1'))) {
    return viteApiUrl;
  }
  // Otherwise use the selected environment
  return getApiBaseUrl();
};

// Export a getter that always returns the current URL
// For backward compatibility, also export as a constant
export const baseUrl = getBaseUrl();

export const wooClientKey = import.meta.env.VITE_WOO_CLIENT_KEY || 'ck_24045858e7e45e0635cdbf02c0b04dd67c82aea7';
export const wooClientSecret = import.meta.env.VITE_WOO_CLIENT_SECRET || 'cs_c9d4958db7c4160c0282c26a906b02ad670f4169';
export const metaPixelId = import.meta.env.VITE_META_PIXEL_ID;
