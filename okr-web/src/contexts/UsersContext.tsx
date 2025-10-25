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

interface UsersContextType {
  users: User[];
  loading: boolean;
  error: string | null;
  getUserById: (id: string) => User | undefined;
  getUserName: (id: string) => string;
}

const UsersContext = createContext<UsersContextType | undefined>(undefined);

export function UsersProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem('access_token');
        if (!token) {
          setLoading(false);
          return;
        }

        // Load users from API
        const usersData = await apiFetch<User[]>('/users');
        setUsers(usersData);
      } catch (e: any) {
        console.error('Error loading users:', e);
        setError(e.message || 'Failed to load users');
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  const getUserById = (id: string): User | undefined => {
    return users.find(user => user.id === id);
  };

  const getUserName = (id: string): string => {
    const user = getUserById(id);
    return user ? user.full_name : id.substring(0, 8) + '...';
  };

  return (
    <UsersContext.Provider value={{
      users,
      loading,
      error,
      getUserById,
      getUserName
    }}>
      {children}
    </UsersContext.Provider>
  );
}

export function useUsers() {
  const context = useContext(UsersContext);
  if (context === undefined) {
    throw new Error('useUsers must be used within a UsersProvider');
  }
  return context;
}
