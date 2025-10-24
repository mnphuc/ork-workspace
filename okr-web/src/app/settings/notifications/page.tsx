"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Layout } from '@/components/layout';
import { logout } from '@/lib/auth';
import { clearTokens } from '@/lib/api';
import { NotificationRules } from '@/components/settings/NotificationRules';
import { EmailPreferences } from '@/components/settings/EmailPreferences';
import { DigestSettings } from '@/components/settings/DigestSettings';
import { Loading } from '@/components/Loading';

interface NotificationRule {
  id: string;
  name: string;
  type: 'objective' | 'checkin' | 'mention' | 'deadline' | 'milestone';
  trigger: 'created' | 'updated' | 'completed' | 'overdue' | 'mentioned';
  conditions: {
    roles: string[];
    groups: string[];
    statuses: string[];
    time_before?: number;
  };
  channels: {
    email: boolean;
    in_app: boolean;
    slack?: boolean;
    teams?: boolean;
  };
  frequency: 'immediate' | 'daily' | 'weekly' | 'never';
  is_active: boolean;
}

interface EmailPreferences {
  email_address: string;
  email_enabled: boolean;
  digest_frequency: 'daily' | 'weekly' | 'monthly' | 'never';
  digest_time: string;
  digest_day?: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  notifications: {
    objective_updates: boolean;
    check_in_reminders: boolean;
    deadline_alerts: boolean;
    mention_notifications: boolean;
    comment_replies: boolean;
    status_changes: boolean;
    new_assignments: boolean;
    weekly_progress: boolean;
  };
  unsubscribe_token?: string;
}

interface DigestSettings {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly';
  time: string;
  day_of_week?: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  day_of_month?: number;
  content: {
    include_objectives: boolean;
    include_checkins: boolean;
    include_comments: boolean;
    include_mentions: boolean;
    include_deadlines: boolean;
    include_progress_charts: boolean;
    include_team_summary: boolean;
  };
  recipients: {
    all_users: boolean;
    specific_groups: string[];
    specific_users: string[];
  };
  format: 'html' | 'text' | 'pdf';
  template: 'default' | 'minimal' | 'detailed';
}

export default function NotificationsSettingsPage() {
  const router = useRouter();
  const [notificationRules, setNotificationRules] = useState<NotificationRule[]>([]);
  const [emailPreferences, setEmailPreferences] = useState<EmailPreferences | null>(null);
  const [digestSettings, setDigestSettings] = useState<DigestSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'rules' | 'email' | 'digest'>('rules');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Mock data for now - replace with actual API calls
      const mockNotificationRules: NotificationRule[] = [
        {
          id: '1',
          name: 'Objective Updates for Managers',
          type: 'objective',
          trigger: 'updated',
          conditions: {
            roles: ['Manager', 'Admin'],
            groups: [],
            statuses: ['On Track', 'At Risk', 'Behind'],
          },
          channels: {
            email: true,
            in_app: true,
            slack: false,
            teams: false,
          },
          frequency: 'immediate',
          is_active: true,
        },
        {
          id: '2',
          name: 'Check-in Reminders',
          type: 'checkin',
          trigger: 'created',
          conditions: {
            roles: ['User', 'Manager'],
            groups: [],
            statuses: [],
            time_before: 24,
          },
          channels: {
            email: true,
            in_app: true,
            slack: true,
            teams: false,
          },
          frequency: 'daily',
          is_active: true,
        },
        {
          id: '3',
          name: 'Deadline Alerts',
          type: 'deadline',
          trigger: 'overdue',
          conditions: {
            roles: ['User', 'Manager', 'Admin'],
            groups: [],
            statuses: ['On Track', 'At Risk', 'Behind'],
            time_before: 48,
          },
          channels: {
            email: true,
            in_app: true,
            slack: true,
            teams: true,
          },
          frequency: 'immediate',
          is_active: true,
        },
        {
          id: '4',
          name: 'Mention Notifications',
          type: 'mention',
          trigger: 'mentioned',
          conditions: {
            roles: ['User', 'Manager', 'Admin'],
            groups: [],
            statuses: [],
          },
          channels: {
            email: true,
            in_app: true,
            slack: false,
            teams: false,
          },
          frequency: 'immediate',
          is_active: true,
        },
      ];

      const mockEmailPreferences: EmailPreferences = {
        email_address: 'user@company.com',
        email_enabled: true,
        digest_frequency: 'weekly',
        digest_time: '09:00',
        digest_day: 'monday',
        notifications: {
          objective_updates: true,
          check_in_reminders: true,
          deadline_alerts: true,
          mention_notifications: true,
          comment_replies: true,
          status_changes: false,
          new_assignments: true,
          weekly_progress: true,
        },
        unsubscribe_token: 'abc123def456',
      };

      const mockDigestSettings: DigestSettings = {
        enabled: true,
        frequency: 'weekly',
        time: '09:00',
        day_of_week: 'monday',
        content: {
          include_objectives: true,
          include_checkins: true,
          include_comments: false,
          include_mentions: true,
          include_deadlines: true,
          include_progress_charts: true,
          include_team_summary: true,
        },
        recipients: {
          all_users: true,
          specific_groups: [],
          specific_users: [],
        },
        format: 'html',
        template: 'default',
      };
      
      setNotificationRules(mockNotificationRules);
      setEmailPreferences(mockEmailPreferences);
      setDigestSettings(mockDigestSettings);
    } catch (e: any) {
      setError(e.message || 'Failed to load notification settings');
      if (e.message.includes('Authentication failed')) {
        clearTokens();
        window.location.href = '/login';
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddRule = async (rule: Omit<NotificationRule, 'id'>) => {
    const newRule: NotificationRule = {
      ...rule,
      id: Date.now().toString(),
    };
    setNotificationRules(prev => [...prev, newRule]);
  };

  const handleEditRule = async (rule: NotificationRule) => {
    setNotificationRules(prev => prev.map(r => r.id === rule.id ? rule : r));
  };

  const handleDeleteRule = async (ruleId: string) => {
    if (confirm('Are you sure you want to delete this notification rule?')) {
      setNotificationRules(prev => prev.filter(r => r.id !== ruleId));
    }
  };

  const handleToggleRuleActive = async (ruleId: string) => {
    setNotificationRules(prev => prev.map(r => 
      r.id === ruleId ? { ...r, is_active: !r.is_active } : r
    ));
  };

  const handleSaveEmailPreferences = async (preferences: EmailPreferences) => {
    setEmailPreferences(preferences);
  };

  const handleTestEmail = async () => {
    // Simulate test email
    alert('Test email sent successfully!');
  };

  const handleSaveDigestSettings = async (settings: DigestSettings) => {
    setDigestSettings(settings);
  };

  const handlePreviewDigest = async () => {
    // Simulate digest preview
    alert('Digest preview opened in new window!');
  };

  const handleSendTestDigest = async () => {
    // Simulate test digest
    alert('Test digest sent successfully!');
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
        <Loading text="Loading notification settings..." />
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
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-600 mt-1">
              Configure email notifications, rules, and digest settings
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('rules')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'rules'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Notification Rules ({notificationRules.length})
            </button>
            <button
              onClick={() => setActiveTab('email')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'email'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Email Preferences
            </button>
            <button
              onClick={() => setActiveTab('digest')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'digest'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Digest Settings
            </button>
          </nav>
        </div>

        {/* Notification Rules Tab */}
        {activeTab === 'rules' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6">
              <NotificationRules
                rules={notificationRules}
                onAdd={handleAddRule}
                onEdit={handleEditRule}
                onDelete={handleDeleteRule}
                onToggleActive={handleToggleRuleActive}
              />
            </div>
          </div>
        )}

        {/* Email Preferences Tab */}
        {activeTab === 'email' && emailPreferences && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6">
              <EmailPreferences
                preferences={emailPreferences}
                onSave={handleSaveEmailPreferences}
                onTest={handleTestEmail}
              />
            </div>
          </div>
        )}

        {/* Digest Settings Tab */}
        {activeTab === 'digest' && digestSettings && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6">
              <DigestSettings
                settings={digestSettings}
                onSave={handleSaveDigestSettings}
                onPreview={handlePreviewDigest}
                onSendTest={handleSendTestDigest}
              />
            </div>
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-2xl font-bold text-blue-600">{notificationRules.length}</div>
            <div className="text-sm text-gray-600">Notification Rules</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-2xl font-bold text-green-600">
              {notificationRules.filter(r => r.is_active).length}
            </div>
            <div className="text-sm text-gray-600">Active Rules</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-2xl font-bold text-purple-600">
              {emailPreferences?.email_enabled ? 'Enabled' : 'Disabled'}
            </div>
            <div className="text-sm text-gray-600">Email Notifications</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-2xl font-bold text-orange-600">
              {digestSettings?.enabled ? 'Enabled' : 'Disabled'}
            </div>
            <div className="text-sm text-gray-600">Digest Emails</div>
          </div>
        </div>
      </div>
    </Layout>
  );
}


