'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useWorkspace } from '@/contexts/WorkspaceContext';

interface WorkspaceSelectorProps {
  onWorkspaceChange?: (workspaceId: string) => void;
}

export function WorkspaceSelector({ onWorkspaceChange }: WorkspaceSelectorProps) {
  const { currentWorkspace, workspaces, loading, setCurrentWorkspace } = useWorkspace();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleWorkspaceSelect = (workspace: typeof workspaces[0]) => {
    setCurrentWorkspace(workspace);
    setIsOpen(false);
    
    // Reload the current page to load new workspace data
    window.location.reload();
    
    if (onWorkspaceChange) {
      onWorkspaceChange(workspace.id);
    }
  };

  if (loading) {
    return (
      <div className="px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center space-x-2">
          <span className="text-gray-400">🏢</span>
          <span className="text-sm text-gray-500">Loading...</span>
        </div>
      </div>
    );
  }

  if (workspaces.length === 0) {
    return (
      <div className="px-3 py-2 bg-yellow-50 rounded-lg border border-yellow-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-yellow-600">⚠️</span>
            <span className="text-sm font-medium text-yellow-800">No Workspaces</span>
          </div>
          <button 
            onClick={() => window.location.href = '/workspaces'}
            className="text-yellow-600 hover:text-yellow-800 text-sm"
          >
            Create
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <div 
        className="px-3 py-2 bg-blue-50 rounded-lg border border-blue-200 cursor-pointer hover:bg-blue-100 transition-colors"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-blue-600">🏢</span>
            <span className="text-sm font-medium text-blue-800 truncate">
              {currentWorkspace?.name || 'Select Workspace'}
            </span>
          </div>
          <svg 
            className={`w-4 h-4 text-blue-600 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
          {workspaces.map((workspace) => (
            <div
              key={workspace.id}
              className={`px-3 py-2 cursor-pointer hover:bg-gray-50 transition-colors ${
                workspace.id === currentWorkspace?.id ? 'bg-blue-50' : ''
              }`}
              onClick={() => handleWorkspaceSelect(workspace)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {workspace.name}
                  </div>
                  {workspace.description && (
                    <div className="text-xs text-gray-500 truncate">
                      {workspace.description}
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-2 ml-2">
                  <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${
                    workspace.status === 'ACTIVE' 
                      ? 'text-green-600 bg-green-100' 
                      : 'text-gray-600 bg-gray-100'
                  }`}>
                    {workspace.status}
                  </span>
                  {workspace.id === currentWorkspace?.id && (
                    <span className="text-blue-600 text-xs">✓</span>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          <div className="border-t border-gray-200">
            <button
              onClick={() => {
                setIsOpen(false);
                window.location.href = '/workspaces';
              }}
              className="w-full px-3 py-2 text-left text-sm text-blue-600 hover:bg-blue-50 transition-colors"
            >
              + Create New Workspace
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
