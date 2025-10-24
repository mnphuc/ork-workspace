"use client";
import React, { useState } from 'react';
import { formatDate } from '@/lib/date-utils';

interface Workspace {
  id: string;
  name: string;
  description: string;
  visibility: 'public' | 'private' | 'restricted';
  created_date: string;
  last_modified_date: string;
  user_count: number;
  group_count: number;
  objective_count: number;
  owner_id: string;
  status: 'active' | 'inactive' | 'archived';
}

interface WorkspaceListProps {
  workspaces: Workspace[];
  onEdit: (workspace: Workspace) => void;
  onDelete: (workspaceId: string) => void;
  onArchive: (workspaceId: string) => void;
  onRestore: (workspaceId: string) => void;
  currentUserId?: string;
  className?: string;
}

export function WorkspaceList({ 
  workspaces, 
  onEdit, 
  onDelete, 
  onArchive,
  onRestore,
  currentUserId,
  className = "" 
}: WorkspaceListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'archived'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'created_date' | 'user_count' | 'objective_count'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const filteredWorkspaces = workspaces
    .filter(workspace => {
      const matchesSearch = workspace.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           workspace.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === 'all' || workspace.status === filterStatus;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let aValue, bValue;
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'created_date':
          aValue = new Date(a.created_date).getTime();
          bValue = new Date(b.created_date).getTime();
          break;
        case 'user_count':
          aValue = a.user_count;
          bValue = b.user_count;
          break;
        case 'objective_count':
          aValue = a.objective_count;
          bValue = b.objective_count;
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

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case 'public': return '🌐';
      case 'private': return '🔒';
      case 'restricted': return '👥';
      default: return '❓';
    }
  };

  const getVisibilityLabel = (visibility: string) => {
    switch (visibility) {
      case 'public': return 'Public';
      case 'private': return 'Private';
      case 'restricted': return 'Restricted';
      default: return 'Unknown';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const canManage = (workspace: Workspace) => {
    return currentUserId && workspace.owner_id === currentUserId;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search workspaces..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="archived">Archived</option>
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="name">Sort by Name</option>
            <option value="created_date">Sort by Created</option>
            <option value="user_count">Sort by Users</option>
            <option value="objective_count">Sort by Objectives</option>
          </select>
          
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      {/* Workspaces Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredWorkspaces.map((workspace) => (
          <div key={workspace.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{workspace.name}</h3>
                <p className="text-sm text-gray-600 line-clamp-2">{workspace.description}</p>
              </div>
              <div className="flex items-center space-x-2 ml-2">
                <span className="text-lg">{getVisibilityIcon(workspace.visibility)}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(workspace.status)}`}>
                  {workspace.status}
                </span>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Visibility:</span>
                <span className="font-medium">{getVisibilityLabel(workspace.visibility)}</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Users:</span>
                <span className="font-medium">{workspace.user_count}</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Groups:</span>
                <span className="font-medium">{workspace.group_count}</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Objectives:</span>
                <span className="font-medium">{workspace.objective_count}</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Created:</span>
                <span className="font-medium">{formatDate(workspace.created_date)}</span>
              </div>
            </div>

            {canManage(workspace) && (
              <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
                <button
                  onClick={() => onEdit(workspace)}
                  className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                >
                  Edit
                </button>
                
                {workspace.status === 'archived' ? (
                  <button
                    onClick={() => onRestore(workspace.id)}
                    className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                  >
                    Restore
                  </button>
                ) : (
                  <button
                    onClick={() => onArchive(workspace.id)}
                    className="px-3 py-1 text-xs bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200"
                  >
                    Archive
                  </button>
                )}
                
                <button
                  onClick={() => onDelete(workspace.id)}
                  className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredWorkspaces.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-4xl mb-4">🏢</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No workspaces found</h3>
          <p className="text-gray-500">
            {searchQuery || filterStatus !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'Create your first workspace to get started'
            }
          </p>
        </div>
      )}
    </div>
  );
}

