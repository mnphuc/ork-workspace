"use client";
import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout';
import { apiFetch } from '@/lib/api';
import { clearTokens } from '@/lib/api';
import { logout } from '@/lib/auth';
import { useTranslation } from 'react-i18next';
import { WorkspaceSummary, CreateWorkspaceForm } from '@/types';
import { Modal } from '@/components/Modal';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Textarea } from '@/components/Textarea';

export default function WorkspacesPage() {
  const { t } = useTranslation();
  const [workspaces, setWorkspaces] = useState<WorkspaceSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState<CreateWorkspaceForm>({
    name: '',
    description: '',
    settings: ''
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      window.location.href = '/login';
      return;
    }
    
    loadWorkspaces();
  }, []);

  const loadWorkspaces = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await apiFetch<WorkspaceSummary[]>('/workspaces');
      setWorkspaces(data);
    } catch (e: any) {
      setError(e.message || 'Failed to load workspaces');
      if (e.message.includes('Authentication failed')) {
        clearTokens();
        window.location.href = '/login';
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWorkspace = async () => {
    if (!createForm.name.trim()) {
      setError('Workspace name is required');
      return;
    }

    try {
      setCreating(true);
      setError(null);
      
      const newWorkspace = await apiFetch<WorkspaceSummary>('/workspaces', {
        method: 'POST',
        body: createForm
      });
      
      setWorkspaces([newWorkspace, ...workspaces]);
      setShowCreateModal(false);
      setCreateForm({ name: '', description: '', settings: '' });
    } catch (e: any) {
      setError(e.message || 'Failed to create workspace');
    } finally {
      setCreating(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.warn('Logout failed:', error);
    } finally {
      clearTokens();
      window.location.href = '/login';
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'inactive':
        return 'text-gray-600 bg-gray-100';
      case 'suspended':
        return 'text-red-600 bg-red-100';
      case 'archived':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <Layout onLogout={handleLogout}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading workspaces...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout onLogout={handleLogout}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Workspaces</h1>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            Create Workspace
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {workspaces.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🏢</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No workspaces yet</h3>
            <p className="text-gray-500 mb-6">Create your first workspace to get started</p>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              Create Workspace
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workspaces.map((workspace) => (
              <div key={workspace.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">{workspace.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(workspace.status)}`}>
                    {workspace.status}
                  </span>
                </div>
                
                {workspace.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{workspace.description}</p>
                )}
                
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{workspace.member_count}</div>
                    <div className="text-xs text-gray-500">Members</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{workspace.objective_count}</div>
                    <div className="text-xs text-gray-500">Objectives</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{workspace.team_count}</div>
                    <div className="text-xs text-gray-500">Teams</div>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">
                      Last activity: {workspace.last_activity ? new Date(workspace.last_activity).toLocaleDateString() : 'Never'}
                    </span>
                    <Button
                      onClick={() => window.location.href = `/workspaces/${workspace.id}`}
                      className="text-blue-600 hover:text-blue-700 text-sm"
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Workspace Modal */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Create New Workspace"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Workspace Name *
              </label>
              <Input
                type="text"
                value={createForm.name}
                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                placeholder="Enter workspace name"
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <Textarea
                value={createForm.description}
                onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                placeholder="Enter workspace description"
                rows={3}
                className="w-full"
              />
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                onClick={() => setShowCreateModal(false)}
                className="bg-gray-300 text-gray-700 hover:bg-gray-400"
                disabled={creating}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateWorkspace}
                className="bg-blue-600 text-white hover:bg-blue-700"
                disabled={creating || !createForm.name.trim()}
              >
                {creating ? 'Creating...' : 'Create Workspace'}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  );
}

