import { handleAuthError } from './api';

// Global error handler for authentication
export function setupAuthInterceptor() {
  // Handle unhandled promise rejections (API errors)
  if (typeof window !== 'undefined') {
    window.addEventListener('unhandledrejection', (event) => {
      const error = event.reason;
      if (error && typeof error === 'object' && error.message) {
        const message = error.message.toLowerCase();
        if (message.includes('401') || message.includes('403') || 
            message.includes('authentication') || message.includes('unauthorized')) {
          console.warn('Authentication error detected:', error.message);
          handleAuthError();
          event.preventDefault(); // Prevent default error handling
        }
      }
    });

    // Handle fetch errors globally
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);
        
        // Check for 401/403 responses
        if (response.status === 401 || response.status === 403) {
          console.warn('Authentication error in fetch:', response.status);
          handleAuthError();
        }
        
        return response;
      } catch (error) {
        console.error('Fetch error:', error);
        throw error;
      }
    };
  }
}

// Initialize auth interceptor
if (typeof window !== 'undefined') {
  setupAuthInterceptor();
}
