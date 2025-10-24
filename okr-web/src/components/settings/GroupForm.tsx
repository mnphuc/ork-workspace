"use client";
import React, { useState, useEffect } from 'react';

interface Group {
  id?: string;
  name: string;
  type: 'company' | 'department' | 'team' | 'subteam';
  parent_id?: string;
  description: string;
  is_active: boolean;
}

interface GroupFormProps {
  group?: Group | null;
  parentGroups: Group[];
  onSubmit: (group: Group) => void;
  onCancel: () => void;
  isLoading?: boolean;
  className?: string;
}

export function GroupForm({ 
  group, 
  parentGroups,
  onSubmit, 
  onCancel, 
  isLoading = false,
  className = "" 
}: GroupFormProps) {
  const [formData, setFormData] = useState<Group>({
    name: '',
    type: 'team',
    parent_id: '',
    description: '',
    is_active: true,
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    if (group) {
      setFormData(group);
    }
  }, [group]);

  const handleChange = (field: keyof Group, value: any) => {
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
      newErrors.name = 'Group name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Group name must be at least 2 characters';
    } else if (formData.name.length > 100) {
      newErrors.name = 'Group name must be less than 100 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 5) {
      newErrors.description = 'Description must be at least 5 characters';
    } else if (formData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }

    // Validate parent selection based on type
    if (formData.type === 'subteam' && !formData.parent_id) {
      newErrors.parent_id = 'Sub-teams must have a parent group';
    }

    if (formData.type === 'company' && formData.parent_id) {
      newErrors.parent_id = 'Company groups cannot have a parent';
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

  const getTypeDescription = (type: string) => {
    switch (type) {
      case 'company':
        return 'Top-level organization (e.g., Acme Corp)';
      case 'department':
        return 'Major division within company (e.g., Engineering, Sales)';
      case 'team':
        return 'Working group within department (e.g., Frontend Team)';
      case 'subteam':
        return 'Smaller group within a team (e.g., Mobile Team)';
      default:
        return '';
    }
  };

  const getAvailableParents = () => {
    return parentGroups.filter(parent => {
      // Company can only be root
      if (formData.type === 'company') return false;
      
      // Department can only have company as parent
      if (formData.type === 'department') return parent.type === 'company';
      
      // Team can have department or company as parent
      if (formData.type === 'team') return parent.type === 'department' || parent.type === 'company';
      
      // Subteam can have team, department, or company as parent
      if (formData.type === 'subteam') return true;
      
      return false;
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'company': return '🏢';
      case 'department': return '🏛️';
      case 'team': return '👥';
      case 'subteam': return '🔗';
      default: return '📁';
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${className}`}>
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Group Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.name ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Enter group name"
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
            placeholder="Describe the purpose and scope of this group"
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

      {/* Group Type */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Group Type</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { value: 'company', label: 'Company', icon: '🏢' },
            { value: 'department', label: 'Department', icon: '🏛️' },
            { value: 'team', label: 'Team', icon: '👥' },
            { value: 'subteam', label: 'Sub-team', icon: '🔗' },
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

      {/* Parent Group */}
      {formData.type !== 'company' && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Parent Group</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Parent Group
              {formData.type === 'subteam' && <span className="text-red-500 ml-1">*</span>}
            </label>
            <select
              value={formData.parent_id || ''}
              onChange={(e) => handleChange('parent_id', e.target.value || undefined)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.parent_id ? 'border-red-300' : 'border-gray-300'
              }`}
              disabled={isLoading}
            >
              <option value="">Select a parent group (optional)</option>
              {getAvailableParents().map(parent => (
                <option key={parent.id} value={parent.id}>
                  {getTypeIcon(parent.type)} {parent.name}
                </option>
              ))}
            </select>
            {errors.parent_id && (
              <p className="mt-1 text-sm text-red-600">{errors.parent_id}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              {formData.type === 'subteam' 
                ? 'Sub-teams must have a parent group'
                : 'Optional: Select a parent group to organize hierarchy'
              }
            </p>
          </div>
        </div>
      )}

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
            Active group
          </label>
        </div>
        <p className="text-xs text-gray-500">
          Inactive groups won't appear in selection lists but existing data will be preserved
        </p>
      </div>

      {/* Hierarchy Preview */}
      {formData.name && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Hierarchy Preview</h4>
          <div className="text-sm text-gray-600">
            {formData.parent_id ? (
              <>
                {getAvailableParents().find(p => p.id === formData.parent_id)?.name} 
                <span className="text-gray-400 mx-1">→</span>
                <span className="font-medium">{formData.name}</span>
              </>
            ) : (
              <span className="font-medium">{formData.name}</span>
            )}
            <span className="text-gray-400 ml-2">
              ({formData.type})
            </span>
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
          {isLoading ? 'Saving...' : group ? 'Update Group' : 'Create Group'}
        </button>
      </div>
    </form>
  );
}


