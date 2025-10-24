"use client";
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Layout } from '@/components/layout';
import { apiFetch } from '@/lib/api';
import { clearTokens } from '@/lib/api';
import { logout } from '@/lib/auth';
import { useTranslation } from 'react-i18next';
import { Workspace, WorkspaceMember, UpdateWorkspaceForm, InviteUserForm } from '@/types';
import { Modal } from '@/components/Modal';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Textarea } from '@/components/Textarea';

export default function WorkspaceDetailPage() {
  const { t } = useTranslation();
  const params = useParams();
  const workspaceId = params.id as string;
  
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [editForm, setEditForm] = useState<UpdateWorkspaceForm>({});
  const [inviteForm, setInviteForm] = useState<InviteUserForm>({
    user_email: '',
    role: 'MEMBER'
  });
  const [updating, setUpdating] = useState(false);
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      window.location.href = '/login';
      return;
    }
    
    loadWorkspace();
    loadMembers();
  }, [workspaceId]);

  const loadWorkspace = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await apiFetch<Workspace>(`/workspaces/${workspaceId}`);
      setWorkspace(data);
      setEditForm({
        name: data.name,
        description: data.description || '',
        settings: data.settings || ''
      });
    } catch (e: any) {
      setError(e.message || 'Failed to load workspace');
      if (e.message.includes('Authentication failed')) {
        clearTokens();
        window.location.href = '/login';
      }
    } finally {
      setLoading(false);
    }
  };

  const loadMembers = async () => {
    try {
      const data = await apiFetch<WorkspaceMember[]>(`/workspaces/${workspaceId}/members`);
      setMembers(data);
    } catch (e: any) {
      console.error('Failed to load members:', e);
    }
  };

  const handleUpdateWorkspace = async () => {
    try {
      setUpdating(true);
      setError(null);
      
      const updatedWorkspace = await apiFetch<Workspace>(`/workspaces/${workspaceId}`, {
        method: 'PUT',
        body: editForm
      });
      
      setWorkspace(updatedWorkspace);
      setShowEditModal(false);
    } catch (e: any) {
      setError(e.message || 'Failed to update workspace');
    } finally {
      setUpdating(false);
    }
  };

  const handleInviteUser = async () => {
    if (!inviteForm.user_email.trim()) {
      setError('User email is required');
      return;
    }

    try {
      setInviting(true);
      setError(null);
      
      await apiFetch(`/workspaces/${workspaceId}/invite`, {
        method: 'POST',
        body: inviteForm
      });
      
      setShowInviteModal(false);
      setInviteForm({ user_email: '', role: 'MEMBER' });
      // Reload members to show the new invitation
      loadMembers();
    } catch (e: any) {
      setError(e.message || 'Failed to invite user');
    } finally {
      setInviting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.warn('Logout failed:', error);
    } finally {
      clearTokens();
      window.location.href = '/login';
    }
  };

  const getRoleColor = (role: string): string => {
    switch (role.toLowerCase()) {
      case 'owner':
        return 'text-purple-600 bg-purple-100';
      case 'admin':
        return 'text-blue-600 bg-blue-100';
      case 'member':
        return 'text-green-600 bg-green-100';
      case 'viewer':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'inactive':
        return 'text-gray-600 bg-gray-100';
      case 'suspended':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <Layout onLogout={handleLogout}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading workspace...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!workspace) {
    return (
      <Layout onLogout={handleLogout}>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Workspace not found</h2>
          <p className="text-gray-600 mb-4">The workspace you're looking for doesn't exist or you don't have access to it.</p>
          <Button
            onClick={() => window.location.href = '/workspaces'}
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            Back to Workspaces
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout onLogout={handleLogout}>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{workspace.name}</h1>
            {workspace.description && (
              <p className="text-gray-600 mt-1">{workspace.description}</p>
            )}
          </div>
          <div className="flex space-x-3">
            <Button
              onClick={() => setShowEditModal(true)}
              className="bg-gray-600 text-white hover:bg-gray-700"
            >
              Edit Workspace
            </Button>
            <Button
              onClick={() => setShowInviteModal(true)}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              Invite User
            </Button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Workspace Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-2xl font-bold text-gray-900">{workspace.member_count}</div>
            <div className="text-sm text-gray-500">Members</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-2xl font-bold text-gray-900">{workspace.objective_count}</div>
            <div className="text-sm text-gray-500">Objectives</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-2xl font-bold text-gray-900">0</div>
            <div className="text-sm text-gray-500">Teams</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-2xl font-bold text-gray-900">0</div>
            <div className="text-sm text-gray-500">Projects</div>
          </div>
        </div>

        {/* Members Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Members</h2>
          </div>
          <div className="p-6">
            {members.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 text-4xl mb-2">👥</div>
                <p className="text-gray-500">No members yet</p>
                <Button
                  onClick={() => setShowInviteModal(true)}
                  className="mt-4 bg-blue-600 text-white hover:bg-blue-700"
                >
                  Invite First Member
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-medium">
                          {member.user_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{member.user_name}</div>
                        <div className="text-sm text-gray-500">{member.user_email}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(member.role)}`}>
                        {member.role}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(member.status)}`}>
                        {member.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Edit Workspace Modal */}
        <Modal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          title="Edit Workspace"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Workspace Name
              </label>
              <Input
                type="text"
                value={editForm.name || ''}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                placeholder="Enter workspace name"
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <Textarea
                value={editForm.description || ''}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                placeholder="Enter workspace description"
                rows={3}
                className="w-full"
              />
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                onClick={() => setShowEditModal(false)}
                className="bg-gray-300 text-gray-700 hover:bg-gray-400"
                disabled={updating}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateWorkspace}
                className="bg-blue-600 text-white hover:bg-blue-700"
                disabled={updating}
              >
                {updating ? 'Updating...' : 'Update Workspace'}
              </Button>
            </div>
          </div>
        </Modal>

        {/* Invite User Modal */}
        <Modal
          isOpen={showInviteModal}
          onClose={() => setShowInviteModal(false)}
          title="Invite User to Workspace"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                User Email *
              </label>
              <Input
                type="email"
                value={inviteForm.user_email}
                onChange={(e) => setInviteForm({ ...inviteForm, user_email: e.target.value })}
                placeholder="Enter user email"
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <select
                value={inviteForm.role}
                onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="MEMBER">Member</option>
                <option value="ADMIN">Admin</option>
                <option value="VIEWER">Viewer</option>
              </select>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                onClick={() => setShowInviteModal(false)}
                className="bg-gray-300 text-gray-700 hover:bg-gray-400"
                disabled={inviting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleInviteUser}
                className="bg-blue-600 text-white hover:bg-blue-700"
                disabled={inviting || !inviteForm.user_email.trim()}
              >
                {inviting ? 'Inviting...' : 'Send Invitation'}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  );
}


