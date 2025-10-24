'use client';

import React from 'react';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useTranslation } from 'react-i18next';

interface WorkspaceRequiredProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function WorkspaceRequired({ children, fallback }: WorkspaceRequiredProps) {
  const { currentWorkspace, loading, error, workspaces } = useWorkspace();
  const { t } = useTranslation();

  // Show loading while workspaces are being loaded
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading workspace...</p>
        </div>
      </div>
    );
  }

  // Show error if there's an error loading workspaces
  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">
          <div className="text-4xl mb-2">⚠️</div>
          <p className="text-lg font-medium">Failed to load workspaces</p>
          <p className="text-sm text-gray-600 mt-1">{error}</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  // Show no workspaces message if no workspaces available
  if (workspaces.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-600 mb-4">
          <div className="text-4xl mb-2">🏢</div>
          <p className="text-lg font-medium">No workspaces available</p>
          <p className="text-sm text-gray-500 mt-1">You need to be part of a workspace to access this page</p>
        </div>
        <button
          onClick={() => window.location.href = '/workspaces'}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Create Workspace
        </button>
      </div>
    );
  }

  // Show no current workspace message
  if (!currentWorkspace) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-600 mb-4">
          <div className="text-4xl mb-2">🎯</div>
          <p className="text-lg font-medium">No workspace selected</p>
          <p className="text-sm text-gray-500 mt-1">Please select a workspace to continue</p>
        </div>
        <button
          onClick={() => window.location.href = '/workspaces'}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Select Workspace
        </button>
      </div>
    );
  }

  // Show custom fallback if provided
  if (fallback) {
    return <>{fallback}</>;
  }

  // Render children if workspace is available
  return <>{children}</>;
}
