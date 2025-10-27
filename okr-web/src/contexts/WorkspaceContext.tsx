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
  // Try to load workspace from localStorage first to avoid loading state
  const [currentWorkspace, setCurrentWorkspace] = useState<WorkspaceSummary | null>(() => {
    if (typeof window !== 'undefined') {
      const savedWorkspaceStr = localStorage.getItem('current_workspace');
      if (savedWorkspaceStr) {
        try {
          return JSON.parse(savedWorkspaceStr);
        } catch (e) {
          return null;
        }
      }
    }
    return null;
  });
  
  const [workspaces, setWorkspaces] = useState<WorkspaceSummary[]>([]);
  const [loading, setLoading] = useState(false); // Don't start with loading=true
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
      
      // Set workspace only if we have workspaces data
      if (workspacesData.length > 0) {
        // First, try to use current workspace (from localStorage on mount)
        const currentId = currentWorkspace?.id;
        
        if (currentId) {
          // Check if current workspace still exists in the list
          const updatedWorkspace = workspacesData.find(w => w.id === currentId);
          if (updatedWorkspace) {
            // Update it with fresh data from server
            setCurrentWorkspace(updatedWorkspace);
            localStorage.setItem('current_workspace', JSON.stringify(updatedWorkspace));
            localStorage.setItem('current_workspace_id', updatedWorkspace.id);
          } else {
            // Workspace not found, use first one
            setCurrentWorkspace(workspacesData[0]);
            localStorage.setItem('current_workspace', JSON.stringify(workspacesData[0]));
            localStorage.setItem('current_workspace_id', workspacesData[0].id);
          }
        } else {
          // No current workspace, try to restore from localStorage
          const savedWorkspaceId = localStorage.getItem('current_workspace_id');
          if (savedWorkspaceId) {
            const savedWorkspace = workspacesData.find(w => w.id === savedWorkspaceId);
            if (savedWorkspace) {
              setCurrentWorkspace(savedWorkspace);
              localStorage.setItem('current_workspace', JSON.stringify(savedWorkspace));
            } else {
              // Saved workspace not found, use first one
              setCurrentWorkspace(workspacesData[0]);
              localStorage.setItem('current_workspace', JSON.stringify(workspacesData[0]));
              localStorage.setItem('current_workspace_id', workspacesData[0].id);
            }
          } else {
            // No saved workspace, use first one
            setCurrentWorkspace(workspacesData[0]);
            localStorage.setItem('current_workspace', JSON.stringify(workspacesData[0]));
            localStorage.setItem('current_workspace_id', workspacesData[0].id);
          }
        }
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
    // Always load workspaces on mount to get fresh data
    // But only if we don't already have workspaces loaded
    if (workspaces.length === 0) {
      loadWorkspaces();
    }
  }, []); // Empty dependency array - only run once

  // Enhanced setCurrentWorkspace that saves to localStorage
  const handleSetCurrentWorkspace = (workspace: WorkspaceSummary) => {
    setCurrentWorkspace(workspace);
    localStorage.setItem('current_workspace_id', workspace.id);
    localStorage.setItem('current_workspace', JSON.stringify(workspace));
  };

  const value: WorkspaceContextType = {
    currentWorkspace,
    workspaces,
    loading,
    error,
    setCurrentWorkspace: handleSetCurrentWorkspace,
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


