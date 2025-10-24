"use client";
import React, { useState, useEffect } from 'react';

interface Workspace {
  id?: string;
  name: string;
  description: string;
  visibility: 'public' | 'private' | 'restricted';
  status: 'active' | 'inactive' | 'archived';
  owner_id?: string;
}

interface WorkspaceFormProps {
  workspace?: Workspace | null;
  onSubmit: (workspace: Workspace) => void;
  onCancel: () => void;
  isLoading?: boolean;
  className?: string;
}

export function WorkspaceForm({ 
  workspace, 
  onSubmit, 
  onCancel, 
  isLoading = false,
  className = "" 
}: WorkspaceFormProps) {
  const [formData, setFormData] = useState<Workspace>({
    name: '',
    description: '',
    visibility: 'private',
    status: 'active',
    owner_id: '',
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    if (workspace) {
      setFormData(workspace);
    }
  }, [workspace]);

  const handleChange = (field: keyof Workspace, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Workspace name is required';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Workspace name must be at least 3 characters';
    } else if (formData.name.length > 100) {
      newErrors.name = 'Workspace name must be less than 100 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    } else if (formData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const getVisibilityDescription = (visibility: string) => {
    switch (visibility) {
      case 'public':
        return 'Anyone can view and join this workspace';
      case 'private':
        return 'Only invited users can access this workspace';
      case 'restricted':
        return 'Only specific groups can access this workspace';
      default:
        return '';
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${className}`}>
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Workspace Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.name ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Enter workspace name"
            disabled={isLoading}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            rows={4}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.description ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Describe the purpose and scope of this workspace"
            disabled={isLoading}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            {formData.description.length}/500 characters
          </p>
        </div>
      </div>

      {/* Visibility Settings */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Visibility Settings</h3>
        
        <div className="space-y-3">
          {[
            { value: 'public', label: 'Public', icon: '🌐' },
            { value: 'private', label: 'Private', icon: '🔒' },
            { value: 'restricted', label: 'Restricted', icon: '👥' },
          ].map(option => (
            <label key={option.value} className="flex items-start">
              <input
                type="radio"
                value={option.value}
                checked={formData.visibility === option.value}
                onChange={(e) => handleChange('visibility', e.target.value)}
                className="mt-1 mr-3"
                disabled={isLoading}
              />
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{option.icon}</span>
                  <span className="text-sm font-medium text-gray-900">{option.label}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {getVisibilityDescription(option.value)}
                </p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Status Settings */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Status</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Workspace Status
          </label>
          <select
            value={formData.status}
            onChange={(e) => handleChange('status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="archived">Archived</option>
          </select>
          <p className="mt-1 text-xs text-gray-500">
            {formData.status === 'active' && 'Workspace is fully functional and accessible'}
            {formData.status === 'inactive' && 'Workspace is temporarily disabled'}
            {formData.status === 'archived' && 'Workspace is archived and read-only'}
          </p>
        </div>
      </div>

      {/* Workspace Statistics (for existing workspaces) */}
      {workspace?.id && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Workspace Statistics</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-gray-900">0</div>
              <div className="text-sm text-gray-600">Users</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-gray-900">0</div>
              <div className="text-sm text-gray-600">Groups</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-gray-900">0</div>
              <div className="text-sm text-gray-600">Objectives</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-gray-900">0</div>
              <div className="text-sm text-gray-600">Key Results</div>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Saving...' : workspace ? 'Update Workspace' : 'Create Workspace'}
        </button>
      </div>
    </form>
  );
}


