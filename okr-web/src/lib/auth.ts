import { apiFetch } from './api';

export type TokenResponse = { access_token: string; refresh_token: string };
export type UserResponse = { id: string; email: string; full_name?: string; avatar_url?: string; status?: string };

export async function login(email: string, password: string): Promise<TokenResponse> {
  return apiFetch<TokenResponse>('/auth/login', { 
    method: 'POST', 
    body: { email, password },
    skipAuth: true 
  });
}

export async function register(email: string, password: string, name_text: string): Promise<UserResponse> {
  return apiFetch<UserResponse>('/auth/register', { 
    method: 'POST', 
    body: { email, password, name_text },
    skipAuth: true 
  });
}

export async function me(): Promise<UserResponse> {
  return apiFetch<UserResponse>('/auth/me');
}

export async function refreshToken(): Promise<TokenResponse> {
  return apiFetch<TokenResponse>('/auth/refresh', { 
    method: 'POST',
    skipAuth: true 
  });
}

export async function logout(): Promise<void> {
  try {
    // Call logout endpoint if it exists
    await apiFetch('/auth/logout', { method: 'POST' });
  } catch (error) {
    // Ignore logout endpoint errors, just clear local tokens
    // This is expected behavior when backend doesn't implement logout endpoint
    // or when there are network issues
  }
}