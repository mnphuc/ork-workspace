"use client";
import React, { useState } from 'react';

interface Component {
  id: string;
  name: string;
  type: string;
  description: string;
  is_active: boolean;
  usage_count: number;
  settings: {
    visibility: string;
    permissions: string[];
    workflow_steps?: string[];
    validation_rules?: any;
  };
}

interface ComponentSettingsProps {
  component: Component;
  onUpdate: (componentId: string, updates: Partial<Component>) => void;
  onClose: () => void;
  className?: string;
}

export function ComponentSettings({ 
  component, 
  onUpdate, 
  onClose,
  className = "" 
}: ComponentSettingsProps) {
  const [activeTab, setActiveTab] = useState<'general' | 'permissions' | 'workflow' | 'usage'>('general');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: component.name,
    description: component.description,
    is_active: component.is_active,
  });

  const handleSave = () => {
    onUpdate(component.id, editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData({
      name: component.name,
      description: component.description,
      is_active: component.is_active,
    });
    setIsEditing(false);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'okr_level': return '📊';
      case 'metric_type': return '📈';
      case 'custom_field': return '🏷️';
      case 'workflow': return '🔄';
      case 'template': return '📋';
      default: return '📁';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'okr_level': return 'OKR Level';
      case 'metric_type': return 'Metric Type';
      case 'custom_field': return 'Custom Field';
      case 'workflow': return 'Workflow';
      case 'template': return 'Template';
      default: return 'Unknown';
    }
  };

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case 'public': return '🌐';
      case 'private': return '🔒';
      case 'workspace': return '👥';
      default: return '❓';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{getTypeIcon(component.type)}</span>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{component.name}</h2>
            <p className="text-sm text-gray-600">{getTypeLabel(component.type)}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'general', label: 'General' },
            { key: 'permissions', label: 'Permissions' },
            { key: 'workflow', label: 'Workflow' },
            { key: 'usage', label: 'Usage' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* General Tab */}
      {activeTab === 'general' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">General Settings</h3>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
              >
                Edit
              </button>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Component Name
                </label>
                <input
                  type="text"
                  value={editData.name}
                  onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={editData.description}
                  onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={editData.is_active}
                  onChange={(e) => setEditData(prev => ({ ...prev, is_active: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="is_active" className="ml-2 text-sm text-gray-700">
                  Active component
                </label>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Component Name
                </label>
                <p className="text-gray-900">{component.name}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <p className="text-gray-900">{component.description}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  component.is_active 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {component.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Visibility
                </label>
                <div className="flex items-center space-x-2">
                  <span className="text-sm">{getVisibilityIcon(component.settings.visibility)}</span>
                  <span className="text-gray-900 capitalize">{component.settings.visibility}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Permissions Tab */}
      {activeTab === 'permissions' && (
        <div className="space-y-6">
          <h3 className="text-lg font-medium text-gray-900">Permissions</h3>
          
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Current Permissions</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {component.settings.permissions.map(permission => (
                  <div key={permission} className="flex items-center space-x-2 p-2 bg-green-50 rounded">
                    <span className="text-green-600">✓</span>
                    <span className="text-sm text-gray-700 capitalize">{permission}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <div className="text-blue-600">ℹ️</div>
                <div className="text-sm text-blue-800">
                  <strong>Note:</strong> Permission changes require component recreation. 
                  Consider duplicating the component with new permissions.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Workflow Tab */}
      {activeTab === 'workflow' && component.type === 'workflow' && (
        <div className="space-y-6">
          <h3 className="text-lg font-medium text-gray-900">Workflow Steps</h3>
          
          {component.settings.workflow_steps && component.settings.workflow_steps.length > 0 ? (
            <div className="space-y-3">
              {component.settings.workflow_steps.map((step, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{step}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-400 text-4xl mb-4">🔄</div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">No workflow steps</h4>
              <p className="text-gray-500">This workflow component doesn't have any defined steps.</p>
            </div>
          )}
        </div>
      )}

      {/* Usage Tab */}
      {activeTab === 'usage' && (
        <div className="space-y-6">
          <h3 className="text-lg font-medium text-gray-900">Usage Analytics</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600">{component.usage_count}</div>
              <div className="text-sm text-gray-600">Total Usage</div>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600">
                {component.is_active ? 'Active' : 'Inactive'}
              </div>
              <div className="text-sm text-gray-600">Status</div>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="text-2xl font-bold text-purple-600">
                {component.settings.permissions.length}
              </div>
              <div className="text-sm text-gray-600">Permissions</div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Usage Information</h4>
            <div className="space-y-2 text-sm text-gray-600">
              <p>• This component has been used {component.usage_count} times across the workspace</p>
              <p>• Component type: {getTypeLabel(component.type)}</p>
              <p>• Visibility: {component.settings.visibility}</p>
              <p>• Created: {new Date().toLocaleDateString()}</p>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <div className="text-yellow-600">⚠️</div>
              <div className="text-sm text-yellow-800">
                <strong>Warning:</strong> Deleting this component may affect existing objectives and key results that use it.
                Consider deactivating instead of deleting.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

