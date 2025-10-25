"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Layout } from '@/components/layout';
import { logout } from '@/lib/auth';
import { clearTokens, apiFetch } from '@/lib/api';
import { WorkspaceList } from '@/components/settings/WorkspaceList';
import { WorkspaceForm } from '@/components/settings/WorkspaceForm';
import { WorkspaceWizard } from '@/components/settings/WorkspaceWizard';
import { IntervalsConfig } from '@/components/settings/IntervalsConfig';
import { Modal } from '@/components/Modal';
import { Loading } from '@/components/Loading';

interface Workspace {
  id: string;
  name: string;
  description: string;
  owner_id: string;
  status: 'active' | 'inactive' | 'archived';
  settings?: string;
  created_date: string;
  last_modified_date: string;
  member_count: number;
  objective_count: number;
  team_count: number;
  last_activity?: string;
}

interface Interval {
  id: string;
  name: string;
  type: 'quarter' | 'month' | 'custom';
  start_date: string;
  end_date: string;
  is_active: boolean;
  workspace_id: string;
}

export default function WorkspaceSettingsPage() {
  const router = useRouter();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [intervals, setIntervals] = useState<Interval[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal states
  const [showWorkspaceForm, setShowWorkspaceForm] = useState(false);
  const [showWorkspaceWizard, setShowWorkspaceWizard] = useState(false);
  const [showIntervalsConfig, setShowIntervalsConfig] = useState(false);
  const [editingWorkspace, setEditingWorkspace] = useState<Workspace | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadWorkspaces();
    loadIntervals();
  }, []);

  const loadWorkspaces = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load workspaces from API
      const data = await apiFetch<Workspace[]>('/workspaces');
      setWorkspaces(data);
    } catch (e: any) {
      setError(e.message || 'Failed to load workspaces');
      if (e.message && (
        e.message.includes('401') ||
        e.message.includes('403') ||
        e.message.includes('Authentication') ||
        e.message.includes('Unauthorized')
      )) {
        clearTokens();
        window.location.href = '/login';
      }
    } finally {
      setLoading(false);
    }
  };

  const loadIntervals = async () => {
    try {
      // Mock data for now - replace with actual API call
      const mockIntervals: Interval[] = [
        {
          id: '1',
          name: 'Q1 2024',
          type: 'quarter',
          start_date: '2024-01-01',
          end_date: '2024-03-31',
          is_active: true,
          workspace_id: '1',
        },
        {
          id: '2',
          name: 'Q2 2024',
          type: 'quarter',
          start_date: '2024-04-01',
          end_date: '2024-06-30',
          is_active: true,
          workspace_id: '1',
        },
        {
          id: '3',
          name: 'Q3 2024',
          type: 'quarter',
          start_date: '2024-07-01',
          end_date: '2024-09-30',
          is_active: false,
          workspace_id: '1',
        },
        {
          id: '4',
          name: 'Q4 2024',
          type: 'quarter',
          start_date: '2024-10-01',
          end_date: '2024-12-31',
          is_active: false,
          workspace_id: '1',
        },
      ];
      
      setIntervals(mockIntervals);
    } catch (e: any) {
      console.error('Failed to load intervals:', e);
    }
  };

  const handleCreateWorkspace = () => {
    setEditingWorkspace(null);
    setShowWorkspaceWizard(true);
  };

  const handleWorkspaceWizardComplete = (workspaceId: string) => {
    setShowWorkspaceWizard(false);
    loadWorkspaces(); // Reload workspaces to show the new one
  };

  const handleEditWorkspace = (workspace: Workspace) => {
    setEditingWorkspace(workspace);
    setShowWorkspaceForm(true);
  };

  const handleWorkspaceSubmit = async (workspaceData: Workspace) => {
    try {
      setIsSubmitting(true);
      
      if (editingWorkspace) {
        // Update existing workspace
        const updatedWorkspace = await apiFetch<Workspace>(`/workspaces/${editingWorkspace.id}`, {
          method: 'PUT',
          body: {
            name: workspaceData.name,
            description: workspaceData.description,
            settings: workspaceData.settings || '{}'
          }
        });
        
        setWorkspaces(prev => prev.map(w => 
          w.id === editingWorkspace.id ? updatedWorkspace : w
        ));
      } else {
        // Create new workspace
        const newWorkspace = await apiFetch<Workspace>('/workspaces', {
          method: 'POST',
          body: {
            name: workspaceData.name,
            description: workspaceData.description,
            settings: workspaceData.settings || '{}'
          }
        });
        
        setWorkspaces(prev => [newWorkspace, ...prev]);
      }
      
      setShowWorkspaceForm(false);
      setEditingWorkspace(null);
    } catch (e: any) {
      console.error('Failed to save workspace:', e);
      setError(e.message || 'Failed to save workspace');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteWorkspace = async (workspaceId: string) => {
    if (confirm('Are you sure you want to delete this workspace? This action cannot be undone.')) {
      try {
        await apiFetch(`/workspaces/${workspaceId}`, {
          method: 'DELETE'
        });
        
        setWorkspaces(prev => prev.filter(w => w.id !== workspaceId));
      } catch (e: any) {
        console.error('Failed to delete workspace:', e);
        setError(e.message || 'Failed to delete workspace');
      }
    }
  };

  const handleArchiveWorkspace = async (workspaceId: string) => {
    try {
      const updatedWorkspace = await apiFetch<Workspace>(`/workspaces/${workspaceId}`, {
        method: 'PUT',
        body: {
          status: 'archived'
        }
      });
      
      setWorkspaces(prev => prev.map(w => 
        w.id === workspaceId ? updatedWorkspace : w
      ));
    } catch (e: any) {
      console.error('Failed to archive workspace:', e);
      setError(e.message || 'Failed to archive workspace');
    }
  };

  const handleRestoreWorkspace = async (workspaceId: string) => {
    try {
      const updatedWorkspace = await apiFetch<Workspace>(`/workspaces/${workspaceId}`, {
        method: 'PUT',
        body: {
          status: 'active'
        }
      });
      
      setWorkspaces(prev => prev.map(w => 
        w.id === workspaceId ? updatedWorkspace : w
      ));
    } catch (e: any) {
      console.error('Failed to restore workspace:', e);
      setError(e.message || 'Failed to restore workspace');
    }
  };

  const handleIntervalSave = async (updatedIntervals: Interval[]) => {
    setIntervals(updatedIntervals);
  };

  const handleIntervalAdd = async (interval: Omit<Interval, 'id'>) => {
    const newInterval: Interval = {
      ...interval,
      id: Date.now().toString(),
    };
    setIntervals(prev => [...prev, newInterval]);
  };

  const handleIntervalUpdate = async (id: string, updates: Partial<Interval>) => {
    setIntervals(prev => prev.map(interval => 
      interval.id === id ? { ...interval, ...updates } : interval
    ));
  };

  const handleIntervalDelete = async (id: string) => {
    setIntervals(prev => prev.filter(interval => interval.id !== id));
  };

  const handleIntervalToggleActive = async (id: string) => {
    setIntervals(prev => prev.map(interval => 
      interval.id === id ? { ...interval, is_active: !interval.is_active } : interval
    ));
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

  if (loading) {
    return (
      <Layout onLogout={handleLogout}>
        <Loading text="Loading workspaces..." />
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout onLogout={handleLogout}>
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
          {error}
        </div>
      </Layout>
    );
  }

  return (
    <Layout onLogout={handleLogout}>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Workspace Settings</h1>
            <p className="text-gray-600 mt-1">
              Manage your workspaces and configure time intervals
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowIntervalsConfig(true)}
              className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            >
              Configure Intervals
            </button>
            <button
              onClick={handleCreateWorkspace}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Create Workspace
            </button>
          </div>
        </div>

        {/* Workspaces List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Your Workspaces</h2>
            <p className="text-sm text-gray-600 mt-1">
              Manage and configure your workspaces
            </p>
          </div>
          <div className="p-6">
            <WorkspaceList
              workspaces={workspaces}
              onEdit={handleEditWorkspace}
              onDelete={handleDeleteWorkspace}
              onArchive={handleArchiveWorkspace}
              onRestore={handleRestoreWorkspace}
              currentUserId="user-1" // TODO: Get from user context
            />
          </div>
        </div>

        {/* Intervals Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Time Intervals</h2>
            <p className="text-sm text-gray-600 mt-1">
              Configure quarters and custom time periods
            </p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{intervals.length}</div>
                <div className="text-sm text-gray-600">Total Intervals</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {intervals.filter(i => i.is_active).length}
                </div>
                <div className="text-sm text-gray-600">Active</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {intervals.filter(i => i.type === 'quarter').length}
                </div>
                <div className="text-sm text-gray-600">Quarters</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {intervals.filter(i => i.type === 'custom').length}
                </div>
                <div className="text-sm text-gray-600">Custom</div>
              </div>
            </div>
          </div>
        </div>

        {/* Modals */}
        <Modal
          isOpen={showWorkspaceForm}
          onClose={() => {
            setShowWorkspaceForm(false);
            setEditingWorkspace(null);
          }}
          title={editingWorkspace ? 'Edit Workspace' : 'Create Workspace'}
          size="lg"
        >
          <WorkspaceForm
            workspace={editingWorkspace}
            onSubmit={handleWorkspaceSubmit}
            onCancel={() => {
              setShowWorkspaceForm(false);
              setEditingWorkspace(null);
            }}
            isLoading={isSubmitting}
          />
        </Modal>

        <Modal
          isOpen={showWorkspaceWizard}
          onClose={() => setShowWorkspaceWizard(false)}
          title="Create New Workspace"
          size="xl"
        >
          <WorkspaceWizard
            onComplete={handleWorkspaceWizardComplete}
            onCancel={() => setShowWorkspaceWizard(false)}
            isLoading={isSubmitting}
          />
        </Modal>

        <Modal
          isOpen={showIntervalsConfig}
          onClose={() => setShowIntervalsConfig(false)}
          title="Configure Time Intervals"
          size="lg"
        >
          <IntervalsConfig
            intervals={intervals}
            onSave={handleIntervalSave}
            onAdd={handleIntervalAdd}
            onUpdate={handleIntervalUpdate}
            onDelete={handleIntervalDelete}
            onToggleActive={handleIntervalToggleActive}
          />
        </Modal>
      </div>
    </Layout>
  );
}


