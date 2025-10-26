/**
 * Meta Pixel utility functions for tracking events
 */

// Initialize Meta Pixel
export const initMetaPixel = (pixelId: string) => {
  if (!pixelId) {
    console.warn('Meta Pixel ID not configured');
    return;
  }

  // Check if Meta Pixel script is loaded
  if (typeof window.fbq === 'undefined') {
    console.warn('Meta Pixel script not loaded');
    return;
  }

  // Initialize the pixel if not already done
  const fbq = window.fbq;
  if (fbq) {
    fbq('init', pixelId);
    fbq('track', 'PageView');
  }
};

/**
 * Generic event tracking function
 */
export const trackEvent = (
  eventName: string,
  params?: Record<string, any>
) => {
  if (!window.fbq) {
    console.warn('Meta Pixel not initialized');
    return;
  }

  if (params) {
    window.fbq('track', eventName, params);
  } else {
    window.fbq('track', eventName);
  }
};

/**
 * Track affiliate registration completion
 */
export const trackCompleteRegistration = (data: {
  email: string;
  full_name: string;
  timestamp: string;
}) => {
  trackEvent('CompleteRegistration', {
    affiliate_email: data.email,
    affiliate_name: data.full_name,
    registration_timestamp: data.timestamp,
  });
};

