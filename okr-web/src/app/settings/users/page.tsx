"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Layout } from '@/components/layout';
import { logout } from '@/lib/auth';
import { clearTokens } from '@/lib/api';
import { UserManagement } from '@/components/settings/UserManagement';
import { AdminManagement } from '@/components/settings/AdminManagement';
import { InviteUserModal } from '@/components/InviteUserModal';
import { Loading } from '@/components/Loading';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'user' | 'viewer';
  status: 'active' | 'inactive' | 'pending';
  groups: string[];
  last_login?: string;
  created_date: string;
  avatar?: string;
}

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

interface Group {
  id: string;
  name: string;
  type: string;
}

interface Workspace {
  id: string;
  name: string;
}

export default function UsersSettingsPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'users' | 'admins'>('users');
  
  // Modal states
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Mock data for now - replace with actual API calls
      const mockUsers: User[] = [
        {
          id: '1',
          name: 'John Doe',
          email: 'john.doe@acme.com',
          role: 'user',
          status: 'active',
          groups: ['5', '7'], // Frontend Team, Mobile Team
          last_login: '2024-01-20T10:30:00Z',
          created_date: '2024-01-01T00:00:00Z',
        },
        {
          id: '2',
          name: 'Jane Smith',
          email: 'jane.smith@acme.com',
          role: 'manager',
          status: 'active',
          groups: ['2', '5'], // Engineering, Frontend Team
          last_login: '2024-01-20T09:15:00Z',
          created_date: '2024-01-02T00:00:00Z',
        },
        {
          id: '3',
          name: 'Bob Johnson',
          email: 'bob.johnson@acme.com',
          role: 'user',
          status: 'inactive',
          groups: ['6'], // Backend Team
          last_login: '2024-01-15T14:20:00Z',
          created_date: '2024-01-03T00:00:00Z',
        },
        {
          id: '4',
          name: 'Alice Brown',
          email: 'alice.brown@acme.com',
          role: 'viewer',
          status: 'pending',
          groups: ['3'], // Product
          created_date: '2024-01-18T00:00:00Z',
        },
        {
          id: '5',
          name: 'Charlie Wilson',
          email: 'charlie.wilson@acme.com',
          role: 'user',
          status: 'active',
          groups: ['8'], // DevOps Team
          last_login: '2024-01-20T11:45:00Z',
          created_date: '2024-01-04T00:00:00Z',
        },
      ];

      const mockAdmins: Admin[] = [
        {
          id: 'admin-1',
          name: 'Admin User',
          email: 'admin@acme.com',
          role: 'super_admin',
          permissions: ['manage_users', 'manage_workspaces', 'manage_groups', 'system_settings'],
          assigned_workspaces: ['1'],
          assigned_groups: [],
          status: 'active',
          created_date: '2024-01-01T00:00:00Z',
          last_login: '2024-01-20T08:00:00Z',
        },
        {
          id: 'admin-2',
          name: 'Workspace Manager',
          email: 'workspace.manager@acme.com',
          role: 'workspace_admin',
          permissions: ['manage_users', 'manage_groups'],
          assigned_workspaces: ['1'],
          assigned_groups: ['2', '3'],
          status: 'active',
          created_date: '2024-01-05T00:00:00Z',
          last_login: '2024-01-19T16:30:00Z',
        },
      ];

      const mockGroups: Group[] = [
        { id: '1', name: 'Acme Corporation', type: 'company' },
        { id: '2', name: 'Engineering', type: 'department' },
        { id: '3', name: 'Product', type: 'department' },
        { id: '4', name: 'Marketing', type: 'department' },
        { id: '5', name: 'Frontend Team', type: 'team' },
        { id: '6', name: 'Backend Team', type: 'team' },
        { id: '7', name: 'Mobile Team', type: 'subteam' },
        { id: '8', name: 'DevOps Team', type: 'team' },
      ];

      const mockWorkspaces: Workspace[] = [
        { id: '1', name: 'Acme Corp OKRs' },
        { id: '2', name: 'Engineering Team' },
        { id: '3', name: 'Marketing Q1 2024' },
      ];
      
      setUsers(mockUsers);
      setAdmins(mockAdmins);
      setGroups(mockGroups);
      setWorkspaces(mockWorkspaces);
    } catch (e: any) {
      setError(e.message || 'Failed to load data');
      if (e.message.includes('Authentication failed')) {
        clearTokens();
        window.location.href = '/login';
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user: User) => {
    console.log('Edit user:', user);
    // Implement user editing
  };

  const handleDeleteUser = async (userId: string) => {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      setUsers(prev => prev.filter(u => u.id !== userId));
    }
  };

  const handleToggleUserStatus = async (userId: string) => {
    setUsers(prev => prev.map(u => 
      u.id === userId ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u
    ));
  };

  const handleAssignUserGroups = async (userId: string, groupIds: string[]) => {
    setUsers(prev => prev.map(u => 
      u.id === userId ? { ...u, groups: groupIds } : u
    ));
  };

  const handleEditAdmin = (admin: Admin) => {
    console.log('Edit admin:', admin);
    // Implement admin editing
  };

  const handleDeleteAdmin = async (adminId: string) => {
    if (confirm('Are you sure you want to remove this administrator? This action cannot be undone.')) {
      setAdmins(prev => prev.filter(a => a.id !== adminId));
    }
  };

  const handleToggleAdminStatus = async (adminId: string) => {
    setAdmins(prev => prev.map(a => 
      a.id === adminId ? { ...a, status: a.status === 'active' ? 'inactive' : 'active' } : a
    ));
  };

  const handleAssignAdminPermissions = async (adminId: string, permissions: string[]) => {
    setAdmins(prev => prev.map(a => 
      a.id === adminId ? { ...a, permissions } : a
    ));
  };

  const handleAssignAdminWorkspaces = async (adminId: string, workspaceIds: string[]) => {
    setAdmins(prev => prev.map(a => 
      a.id === adminId ? { ...a, assigned_workspaces: workspaceIds } : a
    ));
  };

  const handleAssignAdminGroups = async (adminId: string, groupIds: string[]) => {
    setAdmins(prev => prev.map(a => 
      a.id === adminId ? { ...a, assigned_groups: groupIds } : a
    ));
  };

  const handlePromoteUser = async (userId: string, role: string) => {
    console.log('Promote user:', userId, 'to role:', role);
    // Implement user promotion
  };

  const handleInvite = async (inviteData: any) => {
    try {
      setIsSubmitting(true);
      console.log('Inviting users:', inviteData);
      // Implement user invitation
      setShowInviteModal(false);
    } catch (e: any) {
      console.error('Failed to invite users:', e);
    } finally {
      setIsSubmitting(false);
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

  if (loading) {
    return (
      <Layout onLogout={handleLogout}>
        <Loading text="Loading users..." />
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
            <h1 className="text-2xl font-bold text-gray-900">Users Management</h1>
            <p className="text-gray-600 mt-1">
              Manage users, roles, and administrator permissions
            </p>
          </div>
          <button
            onClick={() => setShowInviteModal(true)}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Invite Users
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('users')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'users'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Users ({users.length})
            </button>
            <button
              onClick={() => setActiveTab('admins')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'admins'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Administrators ({admins.length})
            </button>
          </nav>
        </div>

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6">
              <UserManagement
                users={users}
                groups={groups}
                onEdit={handleEditUser}
                onDelete={handleDeleteUser}
                onToggleStatus={handleToggleUserStatus}
                onAssignGroups={handleAssignUserGroups}
                onInvite={() => setShowInviteModal(true)}
                currentUserId="user-1" // This should come from user context
              />
            </div>
          </div>
        )}

        {/* Administrators Tab */}
        {activeTab === 'admins' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6">
              <AdminManagement
                admins={admins}
                workspaces={workspaces}
                groups={groups}
                onEdit={handleEditAdmin}
                onDelete={handleDeleteAdmin}
                onToggleStatus={handleToggleAdminStatus}
                onAssignPermissions={handleAssignAdminPermissions}
                onAssignWorkspaces={handleAssignAdminWorkspaces}
                onAssignGroups={handleAssignAdminGroups}
                onPromote={handlePromoteUser}
                currentUserId="user-1" // This should come from user context
              />
            </div>
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-2xl font-bold text-blue-600">{users.length}</div>
            <div className="text-sm text-gray-600">Total Users</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-2xl font-bold text-green-600">
              {users.filter(u => u.status === 'active').length}
            </div>
            <div className="text-sm text-gray-600">Active Users</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-2xl font-bold text-yellow-600">
              {users.filter(u => u.status === 'pending').length}
            </div>
            <div className="text-sm text-gray-600">Pending Invites</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-2xl font-bold text-purple-600">{admins.length}</div>
            <div className="text-sm text-gray-600">Administrators</div>
          </div>
        </div>

        {/* Invite User Modal */}
        <InviteUserModal
          isOpen={showInviteModal}
          onClose={() => setShowInviteModal(false)}
          onInvite={handleInvite}
          workspaceName="Acme Corp OKRs"
        />
      </div>
    </Layout>
  );
}


