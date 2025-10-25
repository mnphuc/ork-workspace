'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { WorkspaceSummary } from '@/types';
import { apiFetch } from '@/lib/api';

interface WorkspaceContextType {
  currentWorkspace: WorkspaceSummary | null;
  workspaces: WorkspaceSummary[];
  loading: boolean;
  error: string | null;
  setCurrentWorkspace: (workspace: WorkspaceSummary) => void;
  refreshWorkspaces: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

interface WorkspaceProviderProps {
  children: ReactNode;
}

export function WorkspaceProvider({ children }: WorkspaceProviderProps) {
  const [currentWorkspace, setCurrentWorkspace] = useState<WorkspaceSummary | null>(null);
  const [workspaces, setWorkspaces] = useState<WorkspaceSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadWorkspaces = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('access_token');
      if (!token) {
        setLoading(false);
        return;
      }
      
      // Load workspaces from API
      const workspacesData = await apiFetch<WorkspaceSummary[]>('/workspaces');
      
      setWorkspaces(workspacesData);
      if (workspacesData.length > 0) {
        setCurrentWorkspace(workspacesData[0]);
      }
    } catch (e: any) {
      console.error('Error loading workspaces:', e);
      
      // Check if it's an authentication error
      if (e.message && (
        e.message.includes('401') || 
        e.message.includes('403') || 
        e.message.includes('Authentication') ||
        e.message.includes('Unauthorized')
      )) {
        // Don't set error for auth failures, just clear workspaces
        setWorkspaces([]);
        setCurrentWorkspace(null);
        setError(null);
      } else {
        setError(e.message || 'Failed to load workspaces');
      }
    } finally {
      setLoading(false);
    }
  };

  const refreshWorkspaces = async () => {
    await loadWorkspaces();
  };

  useEffect(() => {
    loadWorkspaces();
  }, []);

  // Load workspaces when currentWorkspace changes
  useEffect(() => {
    if (currentWorkspace && workspaces.length === 0) {
      loadWorkspaces();
    }
  }, [currentWorkspace]);

  const value: WorkspaceContextType = {
    currentWorkspace,
    workspaces,
    loading,
    error,
    setCurrentWorkspace,
    refreshWorkspaces,
  };

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
}


