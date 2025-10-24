"use client";
import React, { useState, useEffect } from 'react';

interface Component {
  id?: string;
  name: string;
  type: 'okr_level' | 'metric_type' | 'custom_field' | 'workflow' | 'template';
  description: string;
  is_active: boolean;
  settings: {
    visibility: 'public' | 'private' | 'workspace';
    permissions: string[];
    workflow_steps?: string[];
    validation_rules?: any;
  };
}

interface ComponentFormProps {
  component?: Component | null;
  onSubmit: (component: Component) => void;
  onCancel: () => void;
  isLoading?: boolean;
  className?: string;
}

export function ComponentForm({ 
  component, 
  onSubmit, 
  onCancel, 
  isLoading = false,
  className = "" 
}: ComponentFormProps) {
  const [formData, setFormData] = useState<Component>({
    name: '',
    type: 'custom_field',
    description: '',
    is_active: true,
    settings: {
      visibility: 'workspace',
      permissions: [],
      workflow_steps: [],
      validation_rules: {},
    },
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [workflowStep, setWorkflowStep] = useState('');

  useEffect(() => {
    if (component) {
      setFormData(component);
    }
  }, [component]);

  const handleChange = (field: keyof Component, value: any) => {
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

  const handleSettingsChange = (field: keyof Component['settings'], value: any) => {
    setFormData(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        [field]: value
      }
    }));
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Component name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Component name must be at least 2 characters';
    } else if (formData.name.length > 100) {
      newErrors.name = 'Component name must be less than 100 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 5) {
      newErrors.description = 'Description must be at least 5 characters';
    } else if (formData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }

    if (formData.type === 'workflow' && (!formData.settings.workflow_steps || formData.settings.workflow_steps.length === 0)) {
      newErrors.workflow_steps = 'Workflow must have at least one step';
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

  const handleAddWorkflowStep = () => {
    if (workflowStep.trim()) {
      handleSettingsChange('workflow_steps', [...(formData.settings.workflow_steps || []), workflowStep.trim()]);
      setWorkflowStep('');
    }
  };

  const handleRemoveWorkflowStep = (index: number) => {
    const newSteps = formData.settings.workflow_steps?.filter((_, i) => i !== index) || [];
    handleSettingsChange('workflow_steps', newSteps);
  };

  const handlePermissionChange = (permission: string, checked: boolean) => {
    const newPermissions = checked 
      ? [...formData.settings.permissions, permission]
      : formData.settings.permissions.filter(p => p !== permission);
    handleSettingsChange('permissions', newPermissions);
  };

  const getTypeDescription = (type: string) => {
    switch (type) {
      case 'okr_level':
        return 'Define organizational levels for OKRs (Company, Department, Team, Individual)';
      case 'metric_type':
        return 'Define types of metrics and measurements for key results';
      case 'custom_field':
        return 'Create custom fields to extend objective and key result data';
      case 'workflow':
        return 'Define approval workflows and process steps';
      case 'template':
        return 'Create reusable templates for objectives and key results';
      default:
        return '';
    }
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

  const availablePermissions = [
    'view', 'create', 'edit', 'delete', 'approve', 'assign', 'comment'
  ];

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${className}`}>
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Component Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.name ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Enter component name"
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
            rows={3}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.description ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Describe the purpose and usage of this component"
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

      {/* Component Type */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Component Type</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { value: 'okr_level', label: 'OKR Level', icon: '📊' },
            { value: 'metric_type', label: 'Metric Type', icon: '📈' },
            { value: 'custom_field', label: 'Custom Field', icon: '🏷️' },
            { value: 'workflow', label: 'Workflow', icon: '🔄' },
            { value: 'template', label: 'Template', icon: '📋' },
          ].map(option => (
            <label key={option.value} className="flex items-start p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                value={option.value}
                checked={formData.type === option.value}
                onChange={(e) => handleChange('type', e.target.value)}
                className="mt-1 mr-3"
                disabled={isLoading}
              />
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{option.icon}</span>
                  <span className="text-sm font-medium text-gray-900">{option.label}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {getTypeDescription(option.value)}
                </p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Visibility Settings */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Visibility Settings</h3>
        
        <div className="space-y-3">
          {[
            { value: 'public', label: 'Public', icon: '🌐', description: 'Visible to all users' },
            { value: 'workspace', label: 'Workspace', icon: '👥', description: 'Visible to workspace members' },
            { value: 'private', label: 'Private', icon: '🔒', description: 'Visible only to you' },
          ].map(option => (
            <label key={option.value} className="flex items-start">
              <input
                type="radio"
                value={option.value}
                checked={formData.settings.visibility === option.value}
                onChange={(e) => handleSettingsChange('visibility', e.target.value)}
                className="mt-1 mr-3"
                disabled={isLoading}
              />
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{option.icon}</span>
                  <span className="text-sm font-medium text-gray-900">{option.label}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {option.description}
                </p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Workflow Steps (for workflow type) */}
      {formData.type === 'workflow' && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Workflow Steps</h3>
          
          <div className="space-y-3">
            <div className="flex space-x-2">
              <input
                type="text"
                value={workflowStep}
                onChange={(e) => setWorkflowStep(e.target.value)}
                placeholder="Enter workflow step"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddWorkflowStep())}
              />
              <button
                type="button"
                onClick={handleAddWorkflowStep}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
              >
                Add Step
              </button>
            </div>
            
            {formData.settings.workflow_steps && formData.settings.workflow_steps.length > 0 && (
              <div className="space-y-2">
                {formData.settings.workflow_steps.map((step, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm text-gray-700">
                      {index + 1}. {step}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveWorkflowStep(index)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            {errors.workflow_steps && (
              <p className="text-sm text-red-600">{errors.workflow_steps}</p>
            )}
          </div>
        </div>
      )}

      {/* Permissions */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Permissions</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {availablePermissions.map(permission => (
            <label key={permission} className="flex items-center">
              <input
                type="checkbox"
                checked={formData.settings.permissions.includes(permission)}
                onChange={(e) => handlePermissionChange(permission, e.target.checked)}
                className="mr-2"
                disabled={isLoading}
              />
              <span className="text-sm text-gray-700 capitalize">{permission}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Status */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Status</h3>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="is_active"
            checked={formData.is_active}
            onChange={(e) => handleChange('is_active', e.target.checked)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            disabled={isLoading}
          />
          <label htmlFor="is_active" className="ml-2 text-sm text-gray-700">
            Active component
          </label>
        </div>
        <p className="text-xs text-gray-500">
          Inactive components won't appear in selection lists but existing data will be preserved
        </p>
      </div>

      {/* Preview */}
      {formData.name && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Component Preview</h4>
          <div className="flex items-center space-x-2">
            <span className="text-lg">{getTypeIcon(formData.type)}</span>
            <span className="font-medium">{formData.name}</span>
            <span className="text-gray-400">({getTypeDescription(formData.type).split(' ')[0]})</span>
          </div>
          <p className="text-sm text-gray-600 mt-1">{formData.description}</p>
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
          {isLoading ? 'Saving...' : component ? 'Update Component' : 'Create Component'}
        </button>
      </div>
    </form>
  );
}

