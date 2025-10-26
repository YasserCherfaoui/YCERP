/**
 * TypeScript declarations for Meta Pixel
 */

declare global {
  interface Window {
    fbq?: (
      action: string,
      event?: string,
      params?: Record<string, any>
    ) => void;
    _fbq?: any;
  }
}

export { };

