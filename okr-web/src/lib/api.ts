export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080';

export type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';

// Get current language from i18next
function getCurrentLanguage(): string {
  if (typeof window === 'undefined') return 'vi';
  return window.localStorage.getItem('i18nextLng') || 'vi';
}

// Token management
export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token');
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('refresh_token');
}

export function setTokens(accessToken: string, refreshToken: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('access_token', accessToken);
  localStorage.setItem('refresh_token', refreshToken);
}

export function clearTokens(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
}

// Refresh token function
async function refreshAccessToken(): Promise<string> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  try {
    const response = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }

    const data = await response.json();
    setTokens(data.access_token, data.refresh_token);
    return data.access_token;
  } catch (error) {
    clearTokens();
    throw error;
  }
}

// Enhanced API fetch with automatic token refresh
export async function apiFetch<T>(path: string, options: {
  method?: HttpMethod;
  body?: any;
  token?: string | null;
  next?: RequestInit['next'];
  skipAuth?: boolean;
} = {}): Promise<T> {
  const { method = 'GET', body, token, next, skipAuth = false } = options;
  
  // If skipAuth is true, don't add authorization header
  if (skipAuth) {
    const headers: Record<string, string> = { 
      'Content-Type': 'application/json',
      'Accept-Language': getCurrentLanguage()
    };
    const res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      cache: 'no-store',
      next,
    });
    
    if (!res.ok) {
      let errorMessage = `Request failed: ${res.status}`;
      
      try {
        const errorData = await res.json();
        if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (typeof errorData === 'string') {
          errorMessage = errorData;
        }
      } catch {
        const text = await res.text().catch(() => '');
        if (text) {
          try {
            const parsed = JSON.parse(text);
            errorMessage = parsed.message || parsed.detail || text;
          } catch {
            errorMessage = text || errorMessage;
          }
        }
      }
      
      throw new Error(errorMessage);
    }
    
    if (res.status === 204) return undefined as unknown as T;
    return res.json() as Promise<T>;
  }

  // Get token (use provided token or get from storage)
  let accessToken = token || getAccessToken();
  
  const headers: Record<string, string> = { 
    'Content-Type': 'application/json',
    'Accept-Language': getCurrentLanguage()
  };
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;

  let res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store',
    next,
  });

  // If 401 and we have a refresh token, try to refresh
  if (res.status === 401 && getRefreshToken() && !token) {
    try {
      accessToken = await refreshAccessToken();
      headers['Authorization'] = `Bearer ${accessToken}`;
      headers['Accept-Language'] = getCurrentLanguage();
      
      // Retry the request with new token
      res = await fetch(`${API_BASE}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        cache: 'no-store',
        next,
      });
    } catch (refreshError) {
      // If refresh fails, redirect to login
      if (typeof window !== 'undefined') {
        clearTokens();
        window.location.href = '/login';
      }
      throw new Error('Authentication failed. Please login again.');
    }
  }

  if (!res.ok) {
    let errorMessage = `Request failed: ${res.status}`;
    
    try {
      const errorData = await res.json();
      // Extract user-friendly message from error response
      if (errorData.message) {
        errorMessage = errorData.message;
      } else if (errorData.detail) {
        errorMessage = errorData.detail;
      } else if (typeof errorData === 'string') {
        errorMessage = errorData;
      }
    } catch {
      // If JSON parsing fails, try to get text
      const text = await res.text().catch(() => '');
      if (text) {
        try {
          const parsed = JSON.parse(text);
          errorMessage = parsed.message || parsed.detail || text;
        } catch {
          errorMessage = text || errorMessage;
        }
      }
    }
    
    throw new Error(errorMessage);
  }
  
  if (res.status === 204) return undefined as unknown as T;
  return res.json() as Promise<T>;
}