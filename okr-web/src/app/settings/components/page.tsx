"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Layout } from '@/components/layout';
import { logout } from '@/lib/auth';
import { clearTokens } from '@/lib/api';
import { ComponentsList } from '@/components/settings/ComponentsList';
import { ComponentForm } from '@/components/settings/ComponentForm';
import { ComponentSettings } from '@/components/settings/ComponentSettings';
import { Modal } from '@/components/Modal';
import { Loading } from '@/components/Loading';

interface Component {
  id: string;
  name: string;
  type: 'okr_level' | 'metric_type' | 'custom_field' | 'workflow' | 'template';
  description: string;
  is_active: boolean;
  is_system: boolean;
  usage_count: number;
  created_date: string;
  last_modified_date: string;
  settings: {
    visibility: 'public' | 'private' | 'workspace';
    permissions: string[];
    workflow_steps?: string[];
    validation_rules?: any;
  };
}

export default function ComponentsSettingsPage() {
  const router = useRouter();
  const [components, setComponents] = useState<Component[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal states
  const [showComponentForm, setShowComponentForm] = useState(false);
  const [showComponentSettings, setShowComponentSettings] = useState(false);
  const [editingComponent, setEditingComponent] = useState<Component | null>(null);
  const [viewingComponent, setViewingComponent] = useState<Component | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadComponents();
  }, []);

  const loadComponents = async () => {
    try {
      setLoading(true);
      // Mock data for now - replace with actual API call
      const mockComponents: Component[] = [
        {
          id: '1',
          name: 'Company Level',
          type: 'okr_level',
          description: 'Top-level company objectives and key results',
          is_active: true,
          is_system: true,
          usage_count: 15,
          created_date: '2024-01-01T00:00:00Z',
          last_modified_date: '2024-01-15T00:00:00Z',
          settings: {
            visibility: 'public',
            permissions: ['view', 'create', 'edit'],
          },
        },
        {
          id: '2',
          name: 'Department Level',
          type: 'okr_level',
          description: 'Department-level objectives and key results',
          is_active: true,
          is_system: true,
          usage_count: 25,
          created_date: '2024-01-01T00:00:00Z',
          last_modified_date: '2024-01-15T00:00:00Z',
          settings: {
            visibility: 'public',
            permissions: ['view', 'create', 'edit'],
          },
        },
        {
          id: '3',
          name: 'Team Level',
          type: 'okr_level',
          description: 'Team-level objectives and key results',
          is_active: true,
          is_system: true,
          usage_count: 35,
          created_date: '2024-01-01T00:00:00Z',
          last_modified_date: '2024-01-15T00:00:00Z',
          settings: {
            visibility: 'public',
            permissions: ['view', 'create', 'edit'],
          },
        },
        {
          id: '4',
          name: 'Percentage Metric',
          type: 'metric_type',
          description: 'Percentage-based metrics (0-100%)',
          is_active: true,
          is_system: true,
          usage_count: 45,
          created_date: '2024-01-01T00:00:00Z',
          last_modified_date: '2024-01-15T00:00:00Z',
          settings: {
            visibility: 'public',
            permissions: ['view', 'create', 'edit'],
          },
        },
        {
          id: '5',
          name: 'Count Metric',
          type: 'metric_type',
          description: 'Numerical count-based metrics',
          is_active: true,
          is_system: true,
          usage_count: 30,
          created_date: '2024-01-01T00:00:00Z',
          last_modified_date: '2024-01-15T00:00:00Z',
          settings: {
            visibility: 'public',
            permissions: ['view', 'create', 'edit'],
          },
        },
        {
          id: '6',
          name: 'Priority Field',
          type: 'custom_field',
          description: 'Custom priority field for objectives',
          is_active: true,
          is_system: false,
          usage_count: 20,
          created_date: '2024-01-10T00:00:00Z',
          last_modified_date: '2024-01-20T00:00:00Z',
          settings: {
            visibility: 'workspace',
            permissions: ['view', 'create', 'edit'],
          },
        },
        {
          id: '7',
          name: 'Approval Workflow',
          type: 'workflow',
          description: 'Standard approval workflow for objectives',
          is_active: true,
          is_system: false,
          usage_count: 12,
          created_date: '2024-01-12T00:00:00Z',
          last_modified_date: '2024-01-18T00:00:00Z',
          settings: {
            visibility: 'workspace',
            permissions: ['view', 'create', 'edit', 'approve'],
            workflow_steps: ['Draft', 'Review', 'Approval', 'Active'],
          },
        },
        {
          id: '8',
          name: 'Q1 Template',
          type: 'template',
          description: 'Template for Q1 objectives and key results',
          is_active: true,
          is_system: false,
          usage_count: 8,
          created_date: '2024-01-15T00:00:00Z',
          last_modified_date: '2024-01-22T00:00:00Z',
          settings: {
            visibility: 'workspace',
            permissions: ['view', 'create', 'edit'],
          },
        },
      ];
      
      setComponents(mockComponents);
    } catch (e: any) {
      setError(e.message || 'Failed to load components');
      if (e.message.includes('Authentication failed')) {
        clearTokens();
        window.location.href = '/login';
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateComponent = () => {
    setEditingComponent(null);
    setShowComponentForm(true);
  };

  const handleEditComponent = (component: Component) => {
    setEditingComponent(component);
    setShowComponentForm(true);
  };

  const handleComponentSubmit = async (componentData: Component) => {
    try {
      setIsSubmitting(true);
      
      if (editingComponent) {
        // Update existing component
        setComponents(prev => prev.map(c => 
          c.id === editingComponent.id ? { 
            ...c, 
            ...componentData, 
            last_modified_date: new Date().toISOString() 
          } : c
        ));
      } else {
        // Create new component
        const newComponent: Component = {
          ...componentData,
          id: Date.now().toString(),
          is_system: false,
          usage_count: 0,
          created_date: new Date().toISOString(),
          last_modified_date: new Date().toISOString(),
        };
        setComponents(prev => [...prev, newComponent]);
      }
      
      setShowComponentForm(false);
      setEditingComponent(null);
    } catch (e: any) {
      console.error('Failed to save component:', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComponent = async (componentId: string) => {
    if (confirm('Are you sure you want to delete this component? This action cannot be undone.')) {
      setComponents(prev => prev.filter(c => c.id !== componentId));
    }
  };

  const handleToggleActive = async (componentId: string) => {
    setComponents(prev => prev.map(c => 
      c.id === componentId ? { 
        ...c, 
        is_active: !c.is_active, 
        last_modified_date: new Date().toISOString() 
      } : c
    ));
  };

  const handleDuplicateComponent = async (component: Component) => {
    const duplicatedComponent: Component = {
      ...component,
      id: Date.now().toString(),
      name: `${component.name} (Copy)`,
      is_system: false,
      usage_count: 0,
      created_date: new Date().toISOString(),
      last_modified_date: new Date().toISOString(),
    };
    setComponents(prev => [...prev, duplicatedComponent]);
  };

  const handleViewUsage = (componentId: string) => {
    const component = components.find(c => c.id === componentId);
    if (component) {
      setViewingComponent(component);
      setShowComponentSettings(true);
    }
  };

  const handleUpdateComponent = async (componentId: string, updates: Partial<Component>) => {
    setComponents(prev => prev.map(c => 
      c.id === componentId ? { 
        ...c, 
        ...updates, 
        last_modified_date: new Date().toISOString() 
      } : c
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
        <Loading text="Loading components..." />
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
            <h1 className="text-2xl font-bold text-gray-900">Components & Strategy</h1>
            <p className="text-gray-600 mt-1">
              Manage OKR components, metric types, and strategic templates
            </p>
          </div>
          <button
            onClick={handleCreateComponent}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Create Component
          </button>
        </div>

        {/* Components List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Components Library</h2>
            <p className="text-sm text-gray-600 mt-1">
              Define and manage OKR levels, metric types, custom fields, workflows, and templates
            </p>
          </div>
          <div className="p-6">
            <ComponentsList
              components={components}
              onEdit={handleEditComponent}
              onDelete={handleDeleteComponent}
              onToggleActive={handleToggleActive}
              onDuplicate={handleDuplicateComponent}
              onViewUsage={handleViewUsage}
              currentUserId="user-1" // This should come from user context
            />
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-2xl font-bold text-blue-600">{components.length}</div>
            <div className="text-sm text-gray-600">Total Components</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-2xl font-bold text-green-600">
              {components.filter(c => c.is_active).length}
            </div>
            <div className="text-sm text-gray-600">Active</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-2xl font-bold text-purple-600">
              {components.filter(c => c.type === 'okr_level').length}
            </div>
            <div className="text-sm text-gray-600">OKR Levels</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-2xl font-bold text-orange-600">
              {components.filter(c => c.type === 'metric_type').length}
            </div>
            <div className="text-sm text-gray-600">Metric Types</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-2xl font-bold text-red-600">
              {components.filter(c => c.is_system).length}
            </div>
            <div className="text-sm text-gray-600">System Components</div>
          </div>
        </div>

        {/* Component Form Modal */}
        <Modal
          isOpen={showComponentForm}
          onClose={() => {
            setShowComponentForm(false);
            setEditingComponent(null);
          }}
          title={editingComponent ? 'Edit Component' : 'Create Component'}
          size="lg"
        >
          <ComponentForm
            component={editingComponent}
            onSubmit={handleComponentSubmit}
            onCancel={() => {
              setShowComponentForm(false);
              setEditingComponent(null);
            }}
            isLoading={isSubmitting}
          />
        </Modal>

        {/* Component Settings Modal */}
        <Modal
          isOpen={showComponentSettings}
          onClose={() => {
            setShowComponentSettings(false);
            setViewingComponent(null);
          }}
          title="Component Settings"
          size="lg"
        >
          {viewingComponent && (
            <ComponentSettings
              component={viewingComponent}
              onUpdate={handleUpdateComponent}
              onClose={() => {
                setShowComponentSettings(false);
                setViewingComponent(null);
              }}
            />
          )}
        </Modal>
      </div>
    </Layout>
  );
}


