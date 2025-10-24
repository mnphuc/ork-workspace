"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Layout } from '@/components/layout';
import { logout } from '@/lib/auth';
import { clearTokens } from '@/lib/api';
import { IntegrationCard } from '@/components/settings/IntegrationCard';
import { JiraConfig } from '@/components/settings/JiraConfig';
import { SlackConfig } from '@/components/settings/SlackConfig';
import { APITokens } from '@/components/settings/APITokens';
import { Modal } from '@/components/Modal';
import { Loading } from '@/components/Loading';

interface Integration {
  id: string;
  name: string;
  type: 'platform' | 'messaging' | 'developer';
  description: string;
  icon: string;
  is_connected: boolean;
  is_available: boolean;
  features: string[];
  last_sync?: string;
  status: 'active' | 'inactive' | 'error' | 'pending';
  error_message?: string;
}

interface APIToken {
  id: string;
  name: string;
  token: string;
  permissions: string[];
  last_used?: string;
  created_date: string;
  expires_date?: string;
  is_active: boolean;
}

export default function IntegrationsSettingsPage() {
  const router = useRouter();
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [apiTokens, setApiTokens] = useState<APIToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'integrations' | 'api-tokens'>('integrations');
  
  // Modal states
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [configuringIntegration, setConfiguringIntegration] = useState<Integration | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Mock data for now - replace with actual API calls
      const mockIntegrations: Integration[] = [
        {
          id: 'jira',
          name: 'Jira',
          type: 'platform',
          description: 'Sync objectives with Jira issues and track progress',
          icon: '🎫',
          is_connected: false,
          is_available: true,
          features: ['Issue sync', 'Status mapping', 'Comment sync', 'Auto-linking'],
          status: 'inactive',
        },
        {
          id: 'slack',
          name: 'Slack',
          type: 'messaging',
          description: 'Send notifications and reminders to Slack channels',
          icon: '💬',
          is_connected: true,
          is_available: true,
          features: ['Notifications', 'Reminders', 'Digest reports', 'Mentions'],
          last_sync: '2024-01-20T10:30:00Z',
          status: 'active',
        },
        {
          id: 'teams',
          name: 'Microsoft Teams',
          type: 'messaging',
          description: 'Integrate with Microsoft Teams for notifications',
          icon: '👥',
          is_connected: false,
          is_available: false,
          features: ['Notifications', 'Reminders', 'Digest reports'],
          status: 'inactive',
        },
        {
          id: 'discord',
          name: 'Discord',
          type: 'messaging',
          description: 'Send updates to Discord channels and servers',
          icon: '🎮',
          is_connected: false,
          is_available: false,
          features: ['Notifications', 'Bot commands', 'Channel updates'],
          status: 'inactive',
        },
        {
          id: 'asana',
          name: 'Asana',
          type: 'platform',
          description: 'Sync objectives with Asana projects and tasks',
          icon: '📋',
          is_connected: false,
          is_available: false,
          features: ['Project sync', 'Task mapping', 'Progress tracking'],
          status: 'inactive',
        },
        {
          id: 'trello',
          name: 'Trello',
          type: 'platform',
          description: 'Connect with Trello boards and cards',
          icon: '📌',
          is_connected: false,
          is_available: false,
          features: ['Board sync', 'Card mapping', 'List tracking'],
          status: 'inactive',
        },
      ];

      const mockApiTokens: APIToken[] = [
        {
          id: '1',
          name: 'Jira Integration',
          token: 'okr_sk_1234567890abcdef',
          permissions: ['read_objectives', 'write_objectives', 'read_checkins'],
          last_used: '2024-01-20T09:15:00Z',
          created_date: '2024-01-15T00:00:00Z',
          expires_date: '2024-04-15T00:00:00Z',
          is_active: true,
        },
        {
          id: '2',
          name: 'Slack Bot',
          token: 'okr_sk_abcdef1234567890',
          permissions: ['read_objectives', 'read_checkins'],
          created_date: '2024-01-10T00:00:00Z',
          is_active: true,
        },
        {
          id: '3',
          name: 'Webhook Endpoint',
          token: 'okr_sk_9876543210fedcba',
          permissions: ['read_objectives', 'write_checkins'],
          last_used: '2024-01-18T14:20:00Z',
          created_date: '2024-01-05T00:00:00Z',
          expires_date: '2024-01-25T00:00:00Z',
          is_active: false,
        },
      ];
      
      setIntegrations(mockIntegrations);
      setApiTokens(mockApiTokens);
    } catch (e: any) {
      setError(e.message || 'Failed to load integrations');
      if (e.message.includes('Authentication failed')) {
        clearTokens();
        window.location.href = '/login';
      }
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (integrationId: string) => {
    setConfiguringIntegration(integrations.find(i => i.id === integrationId) || null);
    setShowConfigModal(true);
  };

  const handleDisconnect = async (integrationId: string) => {
    if (confirm('Are you sure you want to disconnect this integration?')) {
      setIntegrations(prev => prev.map(i => 
        i.id === integrationId 
          ? { ...i, is_connected: false, status: 'inactive', last_sync: undefined }
          : i
      ));
    }
  };

  const handleConfigure = async (integrationId: string) => {
    setConfiguringIntegration(integrations.find(i => i.id === integrationId) || null);
    setShowConfigModal(true);
  };

  const handleTest = async (integrationId: string) => {
    // Simulate test connection
    const integration = integrations.find(i => i.id === integrationId);
    if (integration) {
      setIntegrations(prev => prev.map(i => 
        i.id === integrationId 
          ? { ...i, status: 'active', last_sync: new Date().toISOString() }
          : i
      ));
    }
  };

  const handleSaveConfig = async (config: any) => {
    try {
      setIsSubmitting(true);
      // Simulate saving configuration
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (configuringIntegration) {
        setIntegrations(prev => prev.map(i => 
          i.id === configuringIntegration.id 
            ? { ...i, is_connected: true, status: 'active', last_sync: new Date().toISOString() }
            : i
        ));
      }
      
      setShowConfigModal(false);
      setConfiguringIntegration(null);
    } catch (e: any) {
      console.error('Failed to save configuration:', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateToken = async (name: string, permissions: string[], expiresIn?: number) => {
    const newToken: APIToken = {
      id: Date.now().toString(),
      name,
      token: `okr_sk_${Math.random().toString(36).substring(2, 15)}`,
      permissions,
      created_date: new Date().toISOString(),
      expires_date: expiresIn ? new Date(Date.now() + expiresIn * 24 * 60 * 60 * 1000).toISOString() : undefined,
      is_active: true,
    };
    setApiTokens(prev => [...prev, newToken]);
  };

  const handleDeleteToken = async (tokenId: string) => {
    if (confirm('Are you sure you want to delete this API token?')) {
      setApiTokens(prev => prev.filter(t => t.id !== tokenId));
    }
  };

  const handleToggleTokenActive = async (tokenId: string) => {
    setApiTokens(prev => prev.map(t => 
      t.id === tokenId ? { ...t, is_active: !t.is_active } : t
    ));
  };

  const handleRegenerateToken = async (tokenId: string) => {
    if (confirm('Are you sure you want to regenerate this token? The old token will no longer work.')) {
      setApiTokens(prev => prev.map(t => 
        t.id === tokenId 
          ? { ...t, token: `okr_sk_${Math.random().toString(36).substring(2, 15)}` }
          : t
      ));
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
        <Loading text="Loading integrations..." />
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
            <h1 className="text-2xl font-bold text-gray-900">Integrations</h1>
            <p className="text-gray-600 mt-1">
              Connect with external tools and services to enhance your OKR workflow
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('integrations')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'integrations'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Integrations ({integrations.length})
            </button>
            <button
              onClick={() => setActiveTab('api-tokens')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'api-tokens'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              API Tokens ({apiTokens.length})
            </button>
          </nav>
        </div>

        {/* Integrations Tab */}
        {activeTab === 'integrations' && (
          <div className="space-y-6">
            {/* Platform Integrations */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Platform Integrations</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {integrations.filter(i => i.type === 'platform').map(integration => (
                  <IntegrationCard
                    key={integration.id}
                    integration={integration}
                    onConnect={handleConnect}
                    onDisconnect={handleDisconnect}
                    onConfigure={handleConfigure}
                    onTest={handleTest}
                  />
                ))}
              </div>
            </div>

            {/* Messaging Integrations */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Messaging Integrations</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {integrations.filter(i => i.type === 'messaging').map(integration => (
                  <IntegrationCard
                    key={integration.id}
                    integration={integration}
                    onConnect={handleConnect}
                    onDisconnect={handleDisconnect}
                    onConfigure={handleConfigure}
                    onTest={handleTest}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* API Tokens Tab */}
        {activeTab === 'api-tokens' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6">
              <APITokens
                tokens={apiTokens}
                onCreate={handleCreateToken}
                onDelete={handleDeleteToken}
                onToggleActive={handleToggleTokenActive}
                onRegenerate={handleRegenerateToken}
              />
            </div>
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-2xl font-bold text-blue-600">
              {integrations.filter(i => i.is_connected).length}
            </div>
            <div className="text-sm text-gray-600">Connected</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-2xl font-bold text-green-600">
              {integrations.filter(i => i.status === 'active').length}
            </div>
            <div className="text-sm text-gray-600">Active</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-2xl font-bold text-purple-600">{apiTokens.length}</div>
            <div className="text-sm text-gray-600">API Tokens</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-2xl font-bold text-orange-600">
              {apiTokens.filter(t => t.is_active).length}
            </div>
            <div className="text-sm text-gray-600">Active Tokens</div>
          </div>
        </div>

        {/* Configuration Modal */}
        <Modal
          isOpen={showConfigModal}
          onClose={() => {
            setShowConfigModal(false);
            setConfiguringIntegration(null);
          }}
          title={`Configure ${configuringIntegration?.name}`}
          size="lg"
        >
          {configuringIntegration && (
            <div>
              {configuringIntegration.id === 'jira' && (
                <JiraConfig
                  config={{
                    base_url: '',
                    username: '',
                    api_token: '',
                    project_key: '',
                    sync_issues: true,
                    sync_comments: true,
                    auto_link_issues: true,
                    issue_status_mapping: {},
                  }}
                  onSave={handleSaveConfig}
                  onTest={() => handleTest(configuringIntegration.id)}
                  onCancel={() => {
                    setShowConfigModal(false);
                    setConfiguringIntegration(null);
                  }}
                  isLoading={isSubmitting}
                />
              )}
              
              {configuringIntegration.id === 'slack' && (
                <SlackConfig
                  config={{
                    bot_token: '',
                    app_token: '',
                    workspace_id: '',
                    default_channel: '',
                    notifications: {
                      check_in_reminders: true,
                      objective_updates: true,
                      mention_notifications: true,
                      weekly_digest: false,
                    },
                    reminder_settings: {
                      frequency: 'weekly',
                      time: '09:00',
                      channels: [],
                    },
                  }}
                  onSave={handleSaveConfig}
                  onTest={() => handleTest(configuringIntegration.id)}
                  onCancel={() => {
                    setShowConfigModal(false);
                    setConfiguringIntegration(null);
                  }}
                  isLoading={isSubmitting}
                />
              )}
            </div>
          )}
        </Modal>
      </div>
    </Layout>
  );
}


