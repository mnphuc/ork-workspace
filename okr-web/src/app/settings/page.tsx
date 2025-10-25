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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {/* Header Section */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-2">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Settings</h1>
            <p className="text-sm text-gray-600 max-w-xl mx-auto">
              Manage your account settings and preferences
            </p>
          </div>

          {/* Quick Navigation Cards */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 text-center">Quick Access</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <a
                href="/settings/workspaces"
                className="group relative bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                <div className="relative p-4">
                  <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg mb-3 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-lg">🏢</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1 text-sm group-hover:text-blue-600 transition-colors duration-300">Workspace</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">Manage workspaces</p>
                  <div className="mt-2 flex items-center text-blue-600 text-xs font-medium group-hover:text-blue-700">
                    <span>Configure</span>
                    <svg className="w-3 h-3 ml-1 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </a>
              
              <a
                href="/settings/groups"
                className="group relative bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-green-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                <div className="relative p-4">
                  <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-lg mb-3 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-lg">👥</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1 text-sm group-hover:text-green-600 transition-colors duration-300">Groups</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">Manage teams</p>
                  <div className="mt-2 flex items-center text-green-600 text-xs font-medium group-hover:text-green-700">
                    <span>Manage</span>
                    <svg className="w-3 h-3 ml-1 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </a>
              
              <a
                href="/settings/components"
                className="group relative bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-purple-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                <div className="relative p-4">
                  <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg mb-3 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-lg">📋</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1 text-sm group-hover:text-purple-600 transition-colors duration-300">Components</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">OKR components</p>
                  <div className="mt-2 flex items-center text-purple-600 text-xs font-medium group-hover:text-purple-700">
                    <span>Setup</span>
                    <svg className="w-3 h-3 ml-1 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </a>
              
              <a
                href="/settings/integrations"
                className="group relative bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-orange-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                <div className="relative p-4">
                  <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg mb-3 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-lg">🔗</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1 text-sm group-hover:text-orange-600 transition-colors duration-300">Integrations</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">External tools</p>
                  <div className="mt-2 flex items-center text-orange-600 text-xs font-medium group-hover:text-orange-700">
                    <span>Connect</span>
                    <svg className="w-3 h-3 ml-1 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </a>
              
              <a
                href="/settings/notifications"
                className="group relative bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-red-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                <div className="relative p-4">
                  <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-red-500 to-red-600 rounded-lg mb-3 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-lg">🔔</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1 text-sm group-hover:text-red-600 transition-colors duration-300">Notifications</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">Alerts & emails</p>
                  <div className="mt-2 flex items-center text-red-600 text-xs font-medium group-hover:text-red-700">
                    <span>Configure</span>
                    <svg className="w-3 h-3 ml-1 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </a>
            </div>
          </div>

          {/* Personal Settings Section */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            {/* Tabs */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Personal Settings</h2>
              <nav className="flex space-x-4">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`relative py-2 px-4 font-semibold text-xs rounded-lg transition-all duration-300 ${
                    activeTab === 'profile'
                      ? 'bg-white text-blue-600 shadow-md'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                  }`}
                >
                  <div className="flex items-center space-x-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>Profile</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('preferences')}
                  className={`relative py-2 px-4 font-semibold text-xs rounded-lg transition-all duration-300 ${
                    activeTab === 'preferences'
                      ? 'bg-white text-blue-600 shadow-md'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                  }`}
                >
                  <div className="flex items-center space-x-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>Preferences</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('account')}
                  className={`relative py-2 px-4 font-semibold text-xs rounded-lg transition-all duration-300 ${
                    activeTab === 'account'
                      ? 'bg-white text-blue-600 shadow-md'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                  }`}
                >
                  <div className="flex items-center space-x-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span>Account</span>
                  </div>
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'profile' && (
                <div className="space-y-4">
                  {/* Avatar Upload */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-gray-900">Profile Picture</h3>
                        <p className="text-xs text-gray-600">Upload a new image</p>
                      </div>
                    </div>
                    <AvatarUpload
                      currentAvatar={avatar}
                      onUpload={handleAvatarUpload}
                      onRemove={handleAvatarRemove}
                      loading={loading}
                    />
                  </div>

                  {/* Profile Information */}
                  <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-gray-900">Profile Information</h3>
                        <p className="text-xs text-gray-600">Update your details</p>
                      </div>
                    </div>
                    
                    {error && (
                      <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center space-x-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{error}</span>
                      </div>
                    )}
                    
                    {success && (
                      <div className="mb-6 bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-xl text-sm flex items-center space-x-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{success}</span>
                      </div>
                    )}

                    <form onSubmit={handleUpdateProfile} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      </div>
                      
                      <div className="pt-4">
                        <Button
                          type="submit"
                          loading={loading}
                          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105"
                        >
                          <div className="flex items-center justify-center space-x-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                            <span>Update Profile</span>
                          </div>
                        </Button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Preferences Tab */}
              {activeTab === 'preferences' && (
                <div className="space-y-8">
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-8 border border-purple-100">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">Personal Preferences</h3>
                        <p className="text-gray-600">Customize your experience</p>
                      </div>
                    </div>
                    <PersonalPreferences
                      preferences={preferences}
                      onSave={handlePreferencesSave}
                      availableGroups={['Engineering', 'Product', 'Marketing', 'Sales', 'HR']}
                    />
                  </div>
                </div>
              )}

              {/* Account Tab */}
              {activeTab === 'account' && (
                <div className="space-y-8">
                  {/* Account Settings */}
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">Account Settings</h3>
                        <p className="text-gray-600">Manage your account information</p>
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="flex items-center justify-between py-4 px-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900">Account Status</h4>
                            <p className="text-gray-600">Your account is active and secure</p>
                          </div>
                        </div>
                        <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                          {user?.status || 'ACTIVE'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between py-4 px-6 bg-gray-50 rounded-xl">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-gray-500 to-gray-600 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900">User ID</h4>
                            <p className="text-gray-600 font-mono text-sm">{user?.id || 'N/A'}</p>
                          </div>
                        </div>
                      </div>

                      <div className="pt-6">
                        <Button
                          onClick={handleLogout}
                          variant="danger"
                          className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105"
                        >
                          <div className="flex items-center justify-center space-x-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            <span>Sign Out</span>
                          </div>
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Language Settings */}
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">Language Settings</h3>
                        <p className="text-gray-600">Choose your preferred language</p>
                      </div>
                    </div>
                    <LanguageSelector />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* System Information */}
          <div className="mt-6 bg-white rounded-xl shadow-lg border border-gray-100 p-4">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-6 h-6 bg-gradient-to-r from-gray-600 to-gray-700 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
              </div>
              <div>
                <h2 className="text-sm font-bold text-gray-900">System Information</h2>
                <p className="text-xs text-gray-600">Application details</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-100">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-9 0a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2H7z" />
                    </svg>
                  </div>
                  <h3 className="text-xs font-semibold text-gray-900">Version</h3>
                </div>
                <p className="text-lg font-bold text-blue-600">1.0.0</p>
                <p className="text-xs text-gray-600">Latest</p>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3 border border-green-100">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-5 h-5 bg-gradient-to-r from-green-500 to-emerald-500 rounded flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xs font-semibold text-gray-900">Login</h3>
                </div>
                <p className="text-lg font-bold text-green-600">Now</p>
                <p className="text-xs text-gray-600">Active</p>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-3 border border-purple-100">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-5 h-5 bg-gradient-to-r from-purple-500 to-pink-500 rounded flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0V6a2 2 0 012-2h4a2 2 0 012 2v1m-6 0h6m-6 0l-2 2m8-2l2 2m-2-2v10a2 2 0 01-2 2H8a2 2 0 01-2-2V9z" />
                    </svg>
                  </div>
                  <h3 className="text-xs font-semibold text-gray-900">Account</h3>
                </div>
                <p className="text-lg font-bold text-purple-600">New</p>
                <p className="text-xs text-gray-600">Recent</p>
              </div>

              <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg p-3 border border-orange-100">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-5 h-5 bg-gradient-to-r from-orange-500 to-yellow-500 rounded flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-xs font-semibold text-gray-900">Env</h3>
                </div>
                <p className="text-lg font-bold text-orange-600">Dev</p>
                <p className="text-xs text-gray-600">Local</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
