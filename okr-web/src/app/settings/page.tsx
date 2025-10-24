"use client";
import React, { useState } from 'react';
import { Layout } from '@/components/layout';
import { useUser } from '@/contexts/UserContext';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { AvatarUpload } from '@/components/AvatarUpload';
import { PersonalPreferences } from '@/components/PersonalPreferences';
import { LanguageSelector } from '@/components/LanguageSelector';
import { logout } from '@/lib/auth';

export default function SettingsPage() {
  const { user, refreshUser } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'account'>('profile');
  const [avatar, setAvatar] = useState<string | null>(user?.avatar || null);
  const [preferences, setPreferences] = useState({
    language: 'en',
    timezone: 'UTC',
    date_format: 'MM/DD/YYYY',
    time_format: '12h' as '12h' | '24h',
    week_start: 'monday' as 'monday' | 'sunday',
    default_groups: [] as string[],
    email_notifications: true,
    push_notifications: true,
    digest_frequency: 'weekly' as 'daily' | 'weekly' | 'monthly' | 'never',
    theme: 'light' as 'light' | 'dark' | 'auto',
  });

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.warn('Logout failed:', error);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // TODO: Implement profile update API
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      setSuccess('Profile updated successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (file: File) => {
    setLoading(true);
    try {
      // TODO: Implement avatar upload API
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatar(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      setSuccess('Avatar updated successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to upload avatar');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarRemove = async () => {
    setLoading(true);
    try {
      // TODO: Implement avatar removal API
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
      setAvatar(null);
      setSuccess('Avatar removed successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to remove avatar');
    } finally {
      setLoading(false);
    }
  };

  const handlePreferencesSave = async (newPreferences: typeof preferences) => {
    setLoading(true);
    try {
      // TODO: Implement preferences save API
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      setPreferences(newPreferences);
      setSuccess('Preferences saved successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to save preferences');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout onLogout={handleLogout}>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">Manage your account settings and preferences</p>
        </div>

        {/* Quick Navigation */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          <a
            href="/settings/workspaces"
            className="p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center space-x-3">
              <div className="text-2xl">🏢</div>
              <div>
                <h3 className="font-medium text-gray-900">Workspace Settings</h3>
                <p className="text-sm text-gray-600">Manage workspaces and intervals</p>
              </div>
            </div>
          </a>
          
          <a
            href="/settings/groups"
            className="p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center space-x-3">
              <div className="text-2xl">👥</div>
              <div>
                <h3 className="font-medium text-gray-900">Groups & Users</h3>
                <p className="text-sm text-gray-600">Manage teams and permissions</p>
              </div>
            </div>
          </a>
          
          <a
            href="/settings/components"
            className="p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center space-x-3">
              <div className="text-2xl">📋</div>
              <div>
                <h3 className="font-medium text-gray-900">Components & Strategy</h3>
                <p className="text-sm text-gray-600">Manage OKR components and templates</p>
              </div>
            </div>
          </a>
          
          <a
            href="/settings/integrations"
            className="p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center space-x-3">
              <div className="text-2xl">🔗</div>
              <div>
                <h3 className="font-medium text-gray-900">Integrations</h3>
                <p className="text-sm text-gray-600">Connect with external tools</p>
              </div>
            </div>
          </a>
          
          <a
            href="/settings/notifications"
            className="p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center space-x-3">
              <div className="text-2xl">🔔</div>
              <div>
                <h3 className="font-medium text-gray-900">Notifications</h3>
                <p className="text-sm text-gray-600">Configure alerts and emails</p>
              </div>
            </div>
          </a>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'profile'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Profile
            </button>
            <button
              onClick={() => setActiveTab('preferences')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'preferences'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Preferences
            </button>
            <button
              onClick={() => setActiveTab('account')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'account'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Account
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'profile' && (
          <div className="space-y-8">
            {/* Avatar Upload */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <AvatarUpload
                currentAvatar={avatar}
                onUpload={handleAvatarUpload}
                onRemove={handleAvatarRemove}
                loading={loading}
              />
            </div>

            {/* Profile Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h2>
              
              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}
              
              {success && (
                <div className="mb-4 bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg text-sm">
                  {success}
                </div>
              )}

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <Input
                  label="Full Name"
                  value={user?.full_name || ''}
                  onChange={() => {}} // TODO: Implement state management
                  placeholder="Enter your full name"
                  required
                />
                
                <Input
                  label="Email"
                  value={user?.email || ''}
                  onChange={() => {}} // TODO: Implement state management
                  placeholder="Enter your email"
                  type="email"
                  required
                  disabled
                />
                
                <div className="pt-4">
                  <Button
                    type="submit"
                    loading={loading}
                    className="w-full"
                  >
                    Update Profile
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Preferences Tab */}
        {activeTab === 'preferences' && (
          <div className="space-y-8">
            <PersonalPreferences
              preferences={preferences}
              onSave={handlePreferencesSave}
              availableGroups={['Engineering', 'Product', 'Marketing', 'Sales', 'HR']}
            />
          </div>
        )}

        {/* Account Tab */}
        {activeTab === 'account' && (
          <div className="space-y-8">
            {/* Account Settings */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Settings</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Account Status</h3>
                    <p className="text-sm text-gray-500">Your account is active</p>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {user?.status || 'ACTIVE'}
                  </span>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">User ID</h3>
                    <p className="text-sm text-gray-500 font-mono">{user?.id || 'N/A'}</p>
                  </div>
                </div>

                <div className="pt-4">
                  <Button
                    onClick={handleLogout}
                    variant="danger"
                    className="w-full"
                  >
                    Sign Out
                  </Button>
                </div>
              </div>
            </div>

            {/* Language Settings */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Language Settings</h2>
              <LanguageSelector />
            </div>
          </div>
        )}

        {/* System Information */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">System Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Application Version: </span>
              <span className="text-gray-600">1.0.0</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Last Login: </span>
              <span className="text-gray-600">Just now</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Account Created: </span>
              <span className="text-gray-600">Recently</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Environment: </span>
              <span className="text-gray-600">Development</span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
