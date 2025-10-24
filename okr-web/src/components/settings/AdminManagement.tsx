"use client";
import React, { useState } from 'react';
import { formatDate } from '@/lib/date-utils';

interface Admin {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'workspace_admin' | 'group_admin';
  permissions: string[];
  assigned_workspaces: string[];
  assigned_groups: string[];
  status: 'active' | 'inactive';
  created_date: string;
  last_login?: string;
  avatar?: string;
}

interface Workspace {
  id: string;
  name: string;
}

interface Group {
  id: string;
  name: string;
  type: string;
}

interface AdminManagementProps {
  admins: Admin[];
  workspaces: Workspace[];
  groups: Group[];
  onEdit: (admin: Admin) => void;
  onDelete: (adminId: string) => void;
  onToggleStatus: (adminId: string) => void;
  onAssignPermissions: (adminId: string, permissions: string[]) => void;
  onAssignWorkspaces: (adminId: string, workspaceIds: string[]) => void;
  onAssignGroups: (adminId: string, groupIds: string[]) => void;
  onPromote: (userId: string, role: string) => void;
  currentUserId?: string;
  className?: string;
}

export function AdminManagement({ 
  admins, 
  workspaces,
  groups,
  onEdit, 
  onDelete, 
  onToggleStatus,
  onAssignPermissions,
  onAssignWorkspaces,
  onAssignGroups,
  onPromote,
  currentUserId,
  className = "" 
}: AdminManagementProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'super_admin' | 'workspace_admin' | 'group_admin'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'email' | 'role' | 'last_login' | 'created_date'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showPromoteModal, setShowPromoteModal] = useState(false);
  const [promoteUserId, setPromoteUserId] = useState<string | null>(null);

  const filteredAdmins = admins
    .filter(admin => {
      const matchesSearch = admin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           admin.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = filterRole === 'all' || admin.role === filterRole;
      const matchesStatus = filterStatus === 'all' || admin.status === filterStatus;
      return matchesSearch && matchesRole && matchesStatus;
    })
    .sort((a, b) => {
      let aValue, bValue;
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'email':
          aValue = a.email.toLowerCase();
          bValue = b.email.toLowerCase();
          break;
        case 'role':
          aValue = a.role;
          bValue = b.role;
          break;
        case 'last_login':
          aValue = new Date(a.last_login || 0).getTime();
          bValue = new Date(b.last_login || 0).getTime();
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

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin': return 'bg-red-100 text-red-800';
      case 'workspace_admin': return 'bg-blue-100 text-blue-800';
      case 'group_admin': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'super_admin': return 'Full system access, can manage all workspaces and users';
      case 'workspace_admin': return 'Can manage specific workspaces and their users';
      case 'group_admin': return 'Can manage specific groups and their members';
      default: return '';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const canManage = (admin: Admin) => {
    return currentUserId && currentUserId !== admin.id;
  };

  const handlePromote = (userId: string) => {
    setPromoteUserId(userId);
    setShowPromoteModal(true);
  };

  const handlePromoteSubmit = (role: string) => {
    if (promoteUserId) {
      onPromote(promoteUserId, role);
      setShowPromoteModal(false);
      setPromoteUserId(null);
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Administrator Management</h3>
          <p className="text-sm text-gray-600">
            Manage system administrators and their permissions
          </p>
        </div>
        <button
          onClick={() => setShowPromoteModal(true)}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Promote User
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search administrators by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="all">All Roles</option>
            <option value="super_admin">Super Admin</option>
            <option value="workspace_admin">Workspace Admin</option>
            <option value="group_admin">Group Admin</option>
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
            <option value="email">Sort by Email</option>
            <option value="role">Sort by Role</option>
            <option value="last_login">Sort by Last Login</option>
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

      {/* Admins List */}
      <div className="space-y-4">
        {filteredAdmins.map((admin) => (
          <div key={admin.id} className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 h-12 w-12">
                  {admin.avatar ? (
                    <img className="h-12 w-12 rounded-full" src={admin.avatar} alt={admin.name} />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center">
                      <span className="text-lg font-medium text-gray-700">
                        {admin.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="text-lg font-medium text-gray-900">{admin.name}</h4>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(admin.role)}`}>
                      {admin.role.replace('_', ' ').toUpperCase()}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(admin.status)}`}>
                      {admin.status}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">{admin.email}</p>
                  <p className="text-sm text-gray-500 mb-3">{getRoleDescription(admin.role)}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Permissions:</span>
                      <div className="mt-1">
                        {admin.permissions.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {admin.permissions.slice(0, 3).map(permission => (
                              <span key={permission} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                                {permission}
                              </span>
                            ))}
                            {admin.permissions.length > 3 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                +{admin.permissions.length - 3} more
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">No permissions</span>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <span className="font-medium text-gray-700">Workspaces:</span>
                      <div className="mt-1">
                        {admin.assigned_workspaces.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {admin.assigned_workspaces.slice(0, 2).map(workspaceId => {
                              const workspace = workspaces.find(w => w.id === workspaceId);
                              return workspace ? (
                                <span key={workspaceId} className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                                  {workspace.name}
                                </span>
                              ) : null;
                            })}
                            {admin.assigned_workspaces.length > 2 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                +{admin.assigned_workspaces.length - 2} more
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">No workspaces</span>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <span className="font-medium text-gray-700">Groups:</span>
                      <div className="mt-1">
                        {admin.assigned_groups.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {admin.assigned_groups.slice(0, 2).map(groupId => {
                              const group = groups.find(g => g.id === groupId);
                              return group ? (
                                <span key={groupId} className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                                  {group.name}
                                </span>
                              ) : null;
                            })}
                            {admin.assigned_groups.length > 2 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                +{admin.assigned_groups.length - 2} more
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">No groups</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3 text-xs text-gray-500">
                    <span>Created: {formatDate(admin.created_date)}</span>
                    {admin.last_login && (
                      <span className="ml-4">Last login: {formatDate(admin.last_login)}</span>
                    )}
                  </div>
                </div>
              </div>
              
              {canManage(admin) && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onEdit(admin)}
                    className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onToggleStatus(admin.id)}
                    className="px-3 py-1 text-sm text-yellow-600 hover:text-yellow-800"
                  >
                    {admin.status === 'active' ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => onDelete(admin.id)}
                    className="px-3 py-1 text-sm text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredAdmins.length === 0 && (
        <div className="text-center py-8">
          <div className="text-gray-400 text-4xl mb-4">👑</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No administrators found</h3>
          <p className="text-gray-500">
            {searchQuery || filterRole !== 'all' || filterStatus !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Promote users to administrator roles'
            }
          </p>
        </div>
      )}

      {/* Promote User Modal */}
      {showPromoteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Promote User to Administrator</h3>
            <p className="text-sm text-gray-600 mb-4">
              Select the role for the new administrator
            </p>
            <div className="space-y-3">
              {[
                { value: 'group_admin', label: 'Group Admin', description: 'Can manage specific groups' },
                { value: 'workspace_admin', label: 'Workspace Admin', description: 'Can manage specific workspaces' },
                { value: 'super_admin', label: 'Super Admin', description: 'Full system access' },
              ].map(role => (
                <label key={role.value} className="flex items-start">
                  <input
                    type="radio"
                    name="adminRole"
                    value={role.value}
                    className="mt-1 mr-3"
                  />
                  <div>
                    <div className="text-sm font-medium text-gray-900">{role.label}</div>
                    <div className="text-xs text-gray-500">{role.description}</div>
                  </div>
                </label>
              ))}
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowPromoteModal(false)}
                className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const selectedRole = document.querySelector('input[name="adminRole"]:checked') as HTMLInputElement;
                  if (selectedRole) {
                    handlePromoteSubmit(selectedRole.value);
                  }
                }}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Promote User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


