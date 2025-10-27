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
  role: string;
  status: 'active' | 'inactive' | 'pending';
}

interface Group {
  id: string;
  name: string;
  description: string;
  parent_id?: string;
  member_count: number;
  members: User[];
}

interface MemberAssignmentProps {
  groupId: string;
  onClose: () => void;
}

export function MemberAssignment({ groupId, onClose }: MemberAssignmentProps) {
  const [group, setGroup] = useState<Group | null>(null);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    loadGroupData();
  }, [groupId]);

  const loadGroupData = async () => {
    try {
      setLoading(true);
      const [groupResponse, usersResponse] = await Promise.all([
        apiFetch(`/groups/${groupId}`, { method: 'GET' }),
        apiFetch('/users', { method: 'GET' })
      ]);
      
      setGroup(groupResponse);
      setAvailableUsers(usersResponse.filter((user: User) => 
        !groupResponse.members.some((member: User) => member.id === user.id)
      ));
    } catch (e: any) {
      console.error('Failed to load group data:', e);
      setError(e.message || 'Failed to load group data');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignMember = async () => {
    if (!selectedUserId) return;

    try {
      setAssigning(true);
      await apiFetch(`/groups/${groupId}/members`, {
        method: 'POST',
        body: { user_id: selectedUserId }
      });
      
      setSelectedUserId('');
      setShowAddModal(false);
      await loadGroupData();
    } catch (e: any) {
      console.error('Failed to assign member:', e);
      setError(e.message || 'Failed to assign member');
    } finally {
      setAssigning(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!confirm('Are you sure you want to remove this member from the group?')) {
      return;
    }

    try {
      await apiFetch(`/groups/${groupId}/members/${userId}`, {
        method: 'DELETE'
      });
      await loadGroupData();
    } catch (e: any) {
      console.error('Failed to remove member:', e);
      setError(e.message || 'Failed to remove member');
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

  if (!group) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Group not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Member Assignment</h3>
          <p className="text-sm text-gray-600">
            Manage members in "{group.name}"
          </p>
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Add Member
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

      {/* Group Info */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">{group.name}</h4>
        <p className="text-sm text-gray-600 mb-3">{group.description}</p>
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <span>{group.member_count} members</span>
          <span>•</span>
          <span>Active group</span>
        </div>
      </div>

      {/* Members List */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h4 className="text-sm font-medium text-gray-900">Group Members</h4>
        </div>
        <div className="divide-y divide-gray-200">
          {group.members.length === 0 ? (
            <div className="px-6 py-8 text-center">
              <div className="text-gray-400 text-4xl mb-2">👥</div>
              <h3 className="text-sm font-medium text-gray-900 mb-1">No members yet</h3>
              <p className="text-sm text-gray-600">
                Add members to this group to get started
              </p>
            </div>
          ) : (
            group.members.map((member) => (
              <div key={member.id} className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    {member.avatar_url ? (
                      <img
                        className="h-10 w-10 rounded-full"
                        src={member.avatar_url}
                        alt={member.full_name}
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-700">
                          {member.full_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {member.full_name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {member.email}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(member.status)}`}>
                    {member.status}
                  </span>
                  
                  <Button
                    onClick={() => handleRemoveMember(member.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                    variant="ghost"
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Member Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Member to Group"
      >
        <div className="space-y-4">
          <Select
            label="Select User"
            value={selectedUserId}
            onChange={setSelectedUserId}
            options={availableUsers.map(user => ({
              value: user.id,
              label: `${user.full_name} (${user.email})`
            }))}
            placeholder="Choose a user to add"
            required
          />
          
          <div className="flex justify-end space-x-3">
            <Button
              onClick={() => setShowAddModal(false)}
              variant="ghost"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAssignMember}
              disabled={!selectedUserId || assigning}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {assigning ? 'Adding...' : 'Add Member'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

