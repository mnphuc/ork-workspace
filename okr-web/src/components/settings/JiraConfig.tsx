"use client";
import React, { useState } from 'react';

interface JiraConfig {
  base_url: string;
  username: string;
  api_token: string;
  project_key: string;
  sync_issues: boolean;
  sync_comments: boolean;
  auto_link_issues: boolean;
  issue_status_mapping: {
    [key: string]: string;
  };
}

interface JiraConfigProps {
  config: JiraConfig;
  onSave: (config: JiraConfig) => void;
  onTest: () => void;
  onCancel: () => void;
  isLoading?: boolean;
  className?: string;
}

export function JiraConfig({ 
  config, 
  onSave, 
  onTest, 
  onCancel, 
  isLoading = false,
  className = "" 
}: JiraConfigProps) {
  const [formData, setFormData] = useState<JiraConfig>(config);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [showToken, setShowToken] = useState(false);

  const handleChange = (field: keyof JiraConfig, value: any) => {
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

  const handleStatusMappingChange = (jiraStatus: string, okrStatus: string) => {
    setFormData(prev => ({
      ...prev,
      issue_status_mapping: {
        ...prev.issue_status_mapping,
        [jiraStatus]: okrStatus
      }
    }));
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.base_url.trim()) {
      newErrors.base_url = 'Jira base URL is required';
    } else if (!formData.base_url.startsWith('https://')) {
      newErrors.base_url = 'Base URL must start with https://';
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }

    if (!formData.api_token.trim()) {
      newErrors.api_token = 'API token is required';
    }

    if (!formData.project_key.trim()) {
      newErrors.project_key = 'Project key is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSave(formData);
    }
  };

  const defaultStatusMappings = [
    { jira: 'To Do', okr: 'Not Started' },
    { jira: 'In Progress', okr: 'On Track' },
    { jira: 'Done', okr: 'Completed' },
    { jira: 'Blocked', okr: 'At Risk' },
  ];

  const okrStatuses = ['Not Started', 'On Track', 'At Risk', 'Behind', 'Completed', 'Abandoned'];

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${className}`}>
      {/* Connection Settings */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Connection Settings</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Jira Base URL *
          </label>
          <input
            type="url"
            value={formData.base_url}
            onChange={(e) => handleChange('base_url', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.base_url ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="https://yourcompany.atlassian.net"
            disabled={isLoading}
          />
          {errors.base_url && (
            <p className="mt-1 text-sm text-red-600">{errors.base_url}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Username/Email *
          </label>
          <input
            type="text"
            value={formData.username}
            onChange={(e) => handleChange('username', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.username ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="your.email@company.com"
            disabled={isLoading}
          />
          {errors.username && (
            <p className="mt-1 text-sm text-red-600">{errors.username}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            API Token *
          </label>
          <div className="relative">
            <input
              type={showToken ? 'text' : 'password'}
              value={formData.api_token}
              onChange={(e) => handleChange('api_token', e.target.value)}
              className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.api_token ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter your Jira API token"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowToken(!showToken)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showToken ? '🙈' : '👁️'}
            </button>
          </div>
          {errors.api_token && (
            <p className="mt-1 text-sm text-red-600">{errors.api_token}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Generate an API token from your Jira account settings
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Project Key *
          </label>
          <input
            type="text"
            value={formData.project_key}
            onChange={(e) => handleChange('project_key', e.target.value.toUpperCase())}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.project_key ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="PROJ"
            disabled={isLoading}
          />
          {errors.project_key && (
            <p className="mt-1 text-sm text-red-600">{errors.project_key}</p>
          )}
        </div>
      </div>

      {/* Sync Settings */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Sync Settings</h3>
        
        <div className="space-y-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.sync_issues}
              onChange={(e) => handleChange('sync_issues', e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              disabled={isLoading}
            />
            <span className="ml-2 text-sm text-gray-700">Sync Jira issues with OKR objectives</span>
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.sync_comments}
              onChange={(e) => handleChange('sync_comments', e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              disabled={isLoading}
            />
            <span className="ml-2 text-sm text-gray-700">Sync comments between Jira and OKR</span>
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.auto_link_issues}
              onChange={(e) => handleChange('auto_link_issues', e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              disabled={isLoading}
            />
            <span className="ml-2 text-sm text-gray-700">Automatically link issues mentioned in OKR descriptions</span>
          </label>
        </div>
      </div>

      {/* Status Mapping */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Status Mapping</h3>
        <p className="text-sm text-gray-600">
          Map Jira issue statuses to OKR objective statuses
        </p>
        
        <div className="space-y-3">
          {defaultStatusMappings.map((mapping, index) => (
            <div key={index} className="flex items-center space-x-3">
              <div className="w-24 text-sm text-gray-700">{mapping.jira}</div>
              <div className="text-gray-400">→</div>
              <select
                value={formData.issue_status_mapping[mapping.jira] || mapping.okr}
                onChange={(e) => handleStatusMappingChange(mapping.jira, e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                disabled={isLoading}
              >
                {okrStatuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>

      {/* Test Connection */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-3">
          <div className="text-blue-600">🔧</div>
          <h4 className="text-sm font-medium text-blue-900">Test Connection</h4>
        </div>
        <p className="text-sm text-blue-800 mb-3">
          Test your Jira connection to ensure everything is working correctly.
        </p>
        <button
          type="button"
          onClick={onTest}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          Test Connection
        </button>
      </div>

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
          {isLoading ? 'Saving...' : 'Save Configuration'}
        </button>
      </div>
    </form>
  );
}

