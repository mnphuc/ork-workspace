"use client";
import React, { useState } from 'react';

interface Stakeholder {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  user_avatar?: string;
  role: 'owner' | 'collaborator' | 'stakeholder' | 'viewer';
  permissions: {
    can_edit: boolean;
    can_comment: boolean;
    can_view: boolean;
    can_assign: boolean;
  };
  added_date: string;
  added_by: string;
  status: 'active' | 'inactive' | 'pending';
}

interface StakeholdersListProps {
  stakeholders: Stakeholder[];
  onAddStakeholder: (userId: string, role: string, permissions: any) => void;
  onUpdateStakeholder: (stakeholderId: string, updates: Partial<Stakeholder>) => void;
  onRemoveStakeholder: (stakeholderId: string) => void;
  availableUsers: Array<{
    id: string;
    name: string;
    email: string;
    avatar?: string;
  }>;
  className?: string;
}

export function StakeholdersList({ 
  stakeholders, 
  onAddStakeholder,
  onUpdateStakeholder,
  onRemoveStakeholder,
  availableUsers,
  className = "" 
}: StakeholdersListProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingStakeholder, setEditingStakeholder] = useState<Stakeholder | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>('stakeholder');
  const [permissions, setPermissions] = useState({
    can_edit: false,
    can_comment: true,
    can_view: true,
    can_assign: false,
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-purple-100 text-purple-800';
      case 'collaborator': return 'bg-blue-100 text-blue-800';
      case 'stakeholder': return 'bg-green-100 text-green-800';
      case 'viewer': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner': return '👑';
      case 'collaborator': return '🤝';
      case 'stakeholder': return '👤';
      case 'viewer': return '👁️';
      default: return '👤';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAddStakeholder = () => {
    if (selectedUserId) {
      onAddStakeholder(selectedUserId, selectedRole, permissions);
      setShowAddForm(false);
      setSelectedUserId('');
      setSelectedRole('stakeholder');
      setPermissions({
        can_edit: false,
        can_comment: true,
        can_view: true,
        can_assign: false,
      });
    }
  };

  const handleEditStakeholder = (stakeholder: Stakeholder) => {
    setEditingStakeholder(stakeholder);
    setSelectedRole(stakeholder.role);
    setPermissions(stakeholder.permissions);
  };

  const handleUpdateStakeholder = () => {
    if (editingStakeholder) {
      onUpdateStakeholder(editingStakeholder.id, {
        role: selectedRole as any,
        permissions,
      });
      setEditingStakeholder(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingStakeholder(null);
    setSelectedRole('stakeholder');
    setPermissions({
      can_edit: false,
      can_comment: true,
      can_view: true,
      can_assign: false,
    });
  };

  const getAvailableUsers = () => {
    const stakeholderUserIds = stakeholders.map(s => s.user_id);
    return availableUsers.filter(user => !stakeholderUserIds.includes(user.id));
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'owner':
        return 'Full control over the objective, can edit, assign, and manage all aspects';
      case 'collaborator':
        return 'Can edit and comment on the objective, participate in discussions';
      case 'stakeholder':
        return 'Can view and comment on the objective, receive updates';
      case 'viewer':
        return 'Read-only access to the objective';
      default:
        return 'Unknown role';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Stakeholders</h3>
          <p className="text-sm text-gray-600">
            Manage who can access and interact with this objective
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          disabled={getAvailableUsers().length === 0}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          Add Stakeholder
        </button>
      </div>

      {/* Add Stakeholder Form */}
      {showAddForm && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-md font-medium text-blue-900 mb-4">Add Stakeholder</h4>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                User
              </label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select user...</option>
                {getAvailableUsers().map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role
              </label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="stakeholder">Stakeholder</option>
                <option value="collaborator">Collaborator</option>
                <option value="viewer">Viewer</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {getRoleDescription(selectedRole)}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Permissions
              </label>
              <div className="space-y-2">
                {Object.entries(permissions).map(([key, value]) => (
                  <label key={key} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) => setPermissions(prev => ({
                        ...prev,
                        [key]: e.target.checked
                      }))}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">
                      {key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleAddStakeholder}
                disabled={!selectedUserId}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Stakeholder
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stakeholders List */}
      <div className="space-y-3">
        {stakeholders.map((stakeholder) => (
          <div key={stakeholder.id} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {stakeholder.user_avatar ? (
                    <img
                      src={stakeholder.user_avatar}
                      alt={stakeholder.user_name}
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600">
                        {stakeholder.user_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="text-sm font-medium text-gray-900">
                      {stakeholder.user_name}
                    </h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(stakeholder.role)}`}>
                      {getRoleIcon(stakeholder.role)} {stakeholder.role}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(stakeholder.status)}`}>
                      {stakeholder.status}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600">{stakeholder.user_email}</p>
                  
                  <div className="mt-2 flex flex-wrap gap-2">
                    {Object.entries(stakeholder.permissions).map(([key, value]) => (
                      <span
                        key={key}
                        className={`px-2 py-1 rounded text-xs ${
                          value 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {key.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2">
                {stakeholder.role !== 'owner' && (
                  <>
                    <button
                      onClick={() => handleEditStakeholder(stakeholder)}
                      className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onRemoveStakeholder(stakeholder.id)}
                      className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                    >
                      Remove
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Stakeholder Modal */}
      {editingStakeholder && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="text-md font-medium text-yellow-900 mb-4">
            Edit Stakeholder: {editingStakeholder.user_name}
          </h4>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role
              </label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="stakeholder">Stakeholder</option>
                <option value="collaborator">Collaborator</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Permissions
              </label>
              <div className="space-y-2">
                {Object.entries(permissions).map(([key, value]) => (
                  <label key={key} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) => setPermissions(prev => ({
                        ...prev,
                        [key]: e.target.checked
                      }))}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">
                      {key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleUpdateStakeholder}
                className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
              >
                Update Stakeholder
              </button>
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {stakeholders.length === 0 && (
        <div className="text-center py-8">
          <div className="text-gray-400 text-4xl mb-4">👥</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No stakeholders</h3>
          <p className="text-gray-500">
            Add stakeholders to collaborate on this objective
          </p>
        </div>
      )}

      {/* Statistics */}
      {stakeholders.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Stakeholder Summary</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="font-semibold text-purple-600">
                {stakeholders.filter(s => s.role === 'owner').length}
              </div>
              <div className="text-gray-500">Owners</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-blue-600">
                {stakeholders.filter(s => s.role === 'collaborator').length}
              </div>
              <div className="text-gray-500">Collaborators</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-green-600">
                {stakeholders.filter(s => s.role === 'stakeholder').length}
              </div>
              <div className="text-gray-500">Stakeholders</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-gray-600">
                {stakeholders.filter(s => s.role === 'viewer').length}
              </div>
              <div className="text-gray-500">Viewers</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


