"use client";
import React, { useState } from 'react';
import { formatDate } from '@/lib/date-utils';

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

interface ComponentsListProps {
  components: Component[];
  onEdit: (component: Component) => void;
  onDelete: (componentId: string) => void;
  onToggleActive: (componentId: string) => void;
  onDuplicate: (component: Component) => void;
  onViewUsage: (componentId: string) => void;
  currentUserId?: string;
  className?: string;
}

export function ComponentsList({ 
  components, 
  onEdit, 
  onDelete, 
  onToggleActive,
  onDuplicate,
  onViewUsage,
  currentUserId,
  className = "" 
}: ComponentsListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'okr_level' | 'metric_type' | 'custom_field' | 'workflow' | 'template'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'type' | 'usage_count' | 'created_date'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const filteredComponents = components
    .filter(component => {
      const matchesSearch = component.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           component.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === 'all' || component.type === filterType;
      const matchesStatus = filterStatus === 'all' || 
                           (filterStatus === 'active' && component.is_active) ||
                           (filterStatus === 'inactive' && !component.is_active);
      return matchesSearch && matchesType && matchesStatus;
    })
    .sort((a, b) => {
      let aValue, bValue;
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'type':
          aValue = a.type;
          bValue = b.type;
          break;
        case 'usage_count':
          aValue = a.usage_count;
          bValue = b.usage_count;
          break;
        case 'created_date':
          aValue = new Date(a.created_date).getTime();
          bValue = new Date(b.created_date).getTime();
          break;
        default:
          return 0;
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

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

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'okr_level': return 'bg-blue-100 text-blue-800';
      case 'metric_type': return 'bg-green-100 text-green-800';
      case 'custom_field': return 'bg-purple-100 text-purple-800';
      case 'workflow': return 'bg-orange-100 text-orange-800';
      case 'template': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
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

  const canManage = (component: Component) => {
    return !component.is_system; // System components cannot be managed
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search components..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="all">All Types</option>
            <option value="okr_level">OKR Levels</option>
            <option value="metric_type">Metric Types</option>
            <option value="custom_field">Custom Fields</option>
            <option value="workflow">Workflows</option>
            <option value="template">Templates</option>
          </select>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="name">Sort by Name</option>
            <option value="type">Sort by Type</option>
            <option value="usage_count">Sort by Usage</option>
            <option value="created_date">Sort by Created</option>
          </select>
          
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      {/* Components Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredComponents.map((component) => (
          <div key={component.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-lg">{getTypeIcon(component.type)}</span>
                  <h3 className="text-lg font-semibold text-gray-900">{component.name}</h3>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2 mb-3">{component.description}</p>
              </div>
              <div className="flex items-center space-x-2 ml-2">
                {component.is_system && (
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                    System
                  </span>
                )}
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  component.is_active 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {component.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Type:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(component.type)}`}>
                  {getTypeLabel(component.type)}
                </span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Visibility:</span>
                <div className="flex items-center space-x-1">
                  <span className="text-sm">{getVisibilityIcon(component.settings.visibility)}</span>
                  <span className="font-medium capitalize">{component.settings.visibility}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Usage:</span>
                <span className="font-medium">{component.usage_count} times</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Created:</span>
                <span className="font-medium">{formatDate(component.created_date)}</span>
              </div>
            </div>

            {canManage(component) && (
              <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
                <button
                  onClick={() => onEdit(component)}
                  className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                >
                  Edit
                </button>
                
                <button
                  onClick={() => onDuplicate(component)}
                  className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                >
                  Duplicate
                </button>
                
                <button
                  onClick={() => onViewUsage(component.id)}
                  className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                >
                  View Usage
                </button>
                
                <button
                  onClick={() => onToggleActive(component.id)}
                  className={`px-3 py-1 text-xs rounded hover:opacity-80 ${
                    component.is_active 
                      ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' 
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  {component.is_active ? 'Deactivate' : 'Activate'}
                </button>
                
                <button
                  onClick={() => onDelete(component.id)}
                  className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                >
                  Delete
                </button>
              </div>
            )}

            {component.is_system && (
              <div className="pt-4 border-t border-gray-100">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onViewUsage(component.id)}
                    className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                  >
                    View Usage
                  </button>
                  <span className="text-xs text-gray-500">
                    System components cannot be modified
                  </span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredComponents.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-4xl mb-4">📋</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No components found</h3>
          <p className="text-gray-500">
            {searchQuery || filterType !== 'all' || filterStatus !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Create your first component to get started'
            }
          </p>
        </div>
      )}
    </div>
  );
}

