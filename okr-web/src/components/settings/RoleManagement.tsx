"use client";
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Select } from '@/components/Select';
import { Modal } from '@/components/Modal';
import { apiFetch } from '@/lib/api';

interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  status: 'active' | 'inactive' | 'pending';
  joined_date: string;
}

interface RoleManagementProps {
  workspaceId: string;
  onClose: () => void;
}

export function RoleManagement({ workspaceId, onClose }: RoleManagementProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'member' | 'viewer'>('member');
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    loadUsers();
  }, [workspaceId]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await apiFetch(`/workspaces/${workspaceId}/members`, {
        method: 'GET'
      });
      setUsers(response);
    } catch (e: any) {
      console.error('Failed to load users:', e);
      setError(e.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleInviteUser = async () => {
    if (!inviteEmail.trim()) return;

    try {
      setInviting(true);
      await apiFetch(`/workspaces/${workspaceId}/invite`, {
        method: 'POST',
        body: {
          email: inviteEmail,
          role: inviteRole
        }
      });
      
      setInviteEmail('');
      setInviteRole('member');
      setShowInviteModal(false);
      await loadUsers();
    } catch (e: any) {
      console.error('Failed to invite user:', e);
      setError(e.message || 'Failed to invite user');
    } finally {
      setInviting(false);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      await apiFetch(`/workspaces/${workspaceId}/members/${userId}/role`, {
        method: 'PATCH',
        body: { role: newRole }
      });
      await loadUsers();
    } catch (e: any) {
      console.error('Failed to update role:', e);
      setError(e.message || 'Failed to update role');
    }
  };

  const handleRemoveUser = async (userId: string) => {
    if (!confirm('Are you sure you want to remove this user from the workspace?')) {
      return;
    }

    try {
      await apiFetch(`/workspaces/${workspaceId}/members/${userId}`, {
        method: 'DELETE'
      });
      await loadUsers();
    } catch (e: any) {
      console.error('Failed to remove user:', e);
      setError(e.message || 'Failed to remove user');
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-purple-100 text-purple-800';
      case 'admin': return 'bg-red-100 text-red-800';
      case 'member': return 'bg-blue-100 text-blue-800';
      case 'viewer': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
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

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Role Management</h3>
          <p className="text-sm text-gray-600">
            Manage user roles and permissions in this workspace
          </p>
        </div>
        <Button
          onClick={() => setShowInviteModal(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Invite User
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Users List */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h4 className="text-sm font-medium text-gray-900">Workspace Members</h4>
        </div>
        <div className="divide-y divide-gray-200">
          {users.map((user) => (
            <div key={user.id} className="px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  {user.avatar_url ? (
                    <img
                      className="h-10 w-10 rounded-full"
                      src={user.avatar_url}
                      alt={user.full_name}
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-700">
                        {user.full_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {user.full_name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {user.email}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                  {user.status}
                </span>
                
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                  {user.role}
                </span>

                {user.role !== 'owner' && (
                  <div className="flex items-center space-x-2">
                    <Select
                      value={user.role}
                      onChange={(value) => handleUpdateRole(user.id, value)}
                      options={[
                        { value: 'admin', label: 'Admin' },
                        { value: 'member', label: 'Member' },
                        { value: 'viewer', label: 'Viewer' }
                      ]}
                      className="text-sm"
                    />
                    <Button
                      onClick={() => handleRemoveUser(user.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                      variant="ghost"
                    >
                      Remove
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Invite Modal */}
      <Modal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        title="Invite User to Workspace"
      >
        <div className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            value={inviteEmail}
            onChange={setInviteEmail}
            placeholder="user@example.com"
            required
          />
          
          <Select
            label="Role"
            value={inviteRole}
            onChange={setInviteRole}
            options={[
              { value: 'admin', label: 'Admin - Full access to workspace' },
              { value: 'member', label: 'Member - Can create and edit objectives' },
              { value: 'viewer', label: 'Viewer - Read-only access' }
            ]}
          />
          
          <div className="flex justify-end space-x-3">
            <Button
              onClick={() => setShowInviteModal(false)}
              variant="ghost"
            >
              Cancel
            </Button>
            <Button
              onClick={handleInviteUser}
              disabled={!inviteEmail.trim() || inviting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {inviting ? 'Inviting...' : 'Send Invite'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

