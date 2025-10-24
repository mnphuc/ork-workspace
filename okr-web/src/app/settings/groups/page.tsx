"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Layout } from '@/components/layout';
import { logout } from '@/lib/auth';
import { clearTokens } from '@/lib/api';
import { GroupHierarchy } from '@/components/settings/GroupHierarchy';
import { GroupForm } from '@/components/settings/GroupForm';
import { Modal } from '@/components/Modal';
import { Loading } from '@/components/Loading';

interface Group {
  id: string;
  name: string;
  type: 'company' | 'department' | 'team' | 'subteam';
  parent_id?: string;
  description: string;
  user_count: number;
  objective_count: number;
  is_active: boolean;
  created_date: string;
  last_modified_date: string;
  children?: Group[];
}

export default function GroupsSettingsPage() {
  const router = useRouter();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal states
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      setLoading(true);
      // Mock data for now - replace with actual API call
      const mockGroups: Group[] = [
        {
          id: '1',
          name: 'Acme Corporation',
          type: 'company',
          description: 'Main company organization',
          user_count: 150,
          objective_count: 45,
          is_active: true,
          created_date: '2024-01-01T00:00:00Z',
          last_modified_date: '2024-01-15T00:00:00Z',
        },
        {
          id: '2',
          name: 'Engineering',
          type: 'department',
          parent_id: '1',
          description: 'Engineering department responsible for product development',
          user_count: 45,
          objective_count: 18,
          is_active: true,
          created_date: '2024-01-02T00:00:00Z',
          last_modified_date: '2024-01-16T00:00:00Z',
        },
        {
          id: '3',
          name: 'Product',
          type: 'department',
          parent_id: '1',
          description: 'Product management and strategy',
          user_count: 25,
          objective_count: 12,
          is_active: true,
          created_date: '2024-01-02T00:00:00Z',
          last_modified_date: '2024-01-16T00:00:00Z',
        },
        {
          id: '4',
          name: 'Marketing',
          type: 'department',
          parent_id: '1',
          description: 'Marketing and customer acquisition',
          user_count: 20,
          objective_count: 8,
          is_active: true,
          created_date: '2024-01-02T00:00:00Z',
          last_modified_date: '2024-01-16T00:00:00Z',
        },
        {
          id: '5',
          name: 'Frontend Team',
          type: 'team',
          parent_id: '2',
          description: 'Frontend development team',
          user_count: 12,
          objective_count: 6,
          is_active: true,
          created_date: '2024-01-03T00:00:00Z',
          last_modified_date: '2024-01-17T00:00:00Z',
        },
        {
          id: '6',
          name: 'Backend Team',
          type: 'team',
          parent_id: '2',
          description: 'Backend development team',
          user_count: 15,
          objective_count: 8,
          is_active: true,
          created_date: '2024-01-03T00:00:00Z',
          last_modified_date: '2024-01-17T00:00:00Z',
        },
        {
          id: '7',
          name: 'Mobile Team',
          type: 'subteam',
          parent_id: '5',
          description: 'Mobile app development sub-team',
          user_count: 6,
          objective_count: 3,
          is_active: true,
          created_date: '2024-01-04T00:00:00Z',
          last_modified_date: '2024-01-18T00:00:00Z',
        },
        {
          id: '8',
          name: 'DevOps Team',
          type: 'team',
          parent_id: '2',
          description: 'DevOps and infrastructure team',
          user_count: 8,
          objective_count: 4,
          is_active: true,
          created_date: '2024-01-03T00:00:00Z',
          last_modified_date: '2024-01-17T00:00:00Z',
        },
      ];
      
      setGroups(mockGroups);
    } catch (e: any) {
      setError(e.message || 'Failed to load groups');
      if (e.message.includes('Authentication failed')) {
        clearTokens();
        window.location.href = '/login';
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = () => {
    setEditingGroup(null);
    setShowGroupForm(true);
  };

  const handleEditGroup = (group: Group) => {
    setEditingGroup(group);
    setShowGroupForm(true);
  };

  const handleGroupSubmit = async (groupData: Group) => {
    try {
      setIsSubmitting(true);
      
      if (editingGroup) {
        // Update existing group
        setGroups(prev => prev.map(g => 
          g.id === editingGroup.id ? { ...g, ...groupData, last_modified_date: new Date().toISOString() } : g
        ));
      } else {
        // Create new group
        const newGroup: Group = {
          ...groupData,
          id: Date.now().toString(),
          user_count: 0,
          objective_count: 0,
          created_date: new Date().toISOString(),
          last_modified_date: new Date().toISOString(),
        };
        setGroups(prev => [...prev, newGroup]);
      }
      
      setShowGroupForm(false);
      setEditingGroup(null);
    } catch (e: any) {
      console.error('Failed to save group:', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (confirm('Are you sure you want to delete this group? This action cannot be undone.')) {
      setGroups(prev => prev.filter(g => g.id !== groupId));
    }
  };

  const handleAddChild = (parentId: string) => {
    const parentGroup = groups.find(g => g.id === parentId);
    if (parentGroup) {
      setEditingGroup({
        name: '',
        type: parentGroup.type === 'company' ? 'department' : 
              parentGroup.type === 'department' ? 'team' : 'subteam',
        parent_id: parentId,
        description: '',
        is_active: true,
      });
      setShowGroupForm(true);
    }
  };

  const handleMoveGroup = async (groupId: string, newParentId: string | null) => {
    setGroups(prev => prev.map(g => 
      g.id === groupId ? { ...g, parent_id: newParentId, last_modified_date: new Date().toISOString() } : g
    ));
  };

  const handleToggleActive = async (groupId: string) => {
    setGroups(prev => prev.map(g => 
      g.id === groupId ? { ...g, is_active: !g.is_active, last_modified_date: new Date().toISOString() } : g
    ));
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

  if (loading) {
    return (
      <Layout onLogout={handleLogout}>
        <Loading text="Loading groups..." />
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout onLogout={handleLogout}>
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
          {error}
        </div>
      </Layout>
    );
  }

  return (
    <Layout onLogout={handleLogout}>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Groups Management</h1>
            <p className="text-gray-600 mt-1">
              Organize your teams and departments in a hierarchical structure
            </p>
          </div>
          <button
            onClick={handleCreateGroup}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Create Group
          </button>
        </div>

        {/* Groups Hierarchy */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Organization Structure</h2>
            <p className="text-sm text-gray-600 mt-1">
              Drag and drop to reorganize groups. Click to expand/collapse.
            </p>
          </div>
          <div className="p-6">
            <GroupHierarchy
              groups={groups}
              onEdit={handleEditGroup}
              onDelete={handleDeleteGroup}
              onAddChild={handleAddChild}
              onMove={handleMoveGroup}
              onToggleActive={handleToggleActive}
              currentUserId="user-1" // This should come from user context
            />
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-2xl font-bold text-blue-600">{groups.length}</div>
            <div className="text-sm text-gray-600">Total Groups</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-2xl font-bold text-green-600">
              {groups.filter(g => g.is_active).length}
            </div>
            <div className="text-sm text-gray-600">Active Groups</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-2xl font-bold text-purple-600">
              {groups.reduce((sum, g) => sum + g.user_count, 0)}
            </div>
            <div className="text-sm text-gray-600">Total Users</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-2xl font-bold text-orange-600">
              {groups.reduce((sum, g) => sum + g.objective_count, 0)}
            </div>
            <div className="text-sm text-gray-600">Total Objectives</div>
          </div>
        </div>

        {/* Group Form Modal */}
        <Modal
          isOpen={showGroupForm}
          onClose={() => {
            setShowGroupForm(false);
            setEditingGroup(null);
          }}
          title={editingGroup ? 'Edit Group' : 'Create Group'}
          size="lg"
        >
          <GroupForm
            group={editingGroup}
            parentGroups={groups}
            onSubmit={handleGroupSubmit}
            onCancel={() => {
              setShowGroupForm(false);
              setEditingGroup(null);
            }}
            isLoading={isSubmitting}
          />
        </Modal>
      </div>
    </Layout>
  );
}


