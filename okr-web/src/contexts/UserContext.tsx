"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';

interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  status: string;
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshUser = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('access_token');
      if (!token) {
        setUser(null);
        return;
      }

      // Fetch real user data from backend
      const userData = await apiFetch<User>('/auth/me');
      setUser(userData);
    } catch (err) {
      setError('Failed to load user data');
      console.error('User context error:', err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, loading, error, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

