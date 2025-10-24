"use client";
import React, { useState } from 'react';

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

interface APITokensProps {
  tokens: APIToken[];
  onCreate: (name: string, permissions: string[], expiresIn?: number) => void;
  onDelete: (tokenId: string) => void;
  onToggleActive: (tokenId: string) => void;
  onRegenerate: (tokenId: string) => void;
  className?: string;
}

export function APITokens({ 
  tokens, 
  onCreate, 
  onDelete, 
  onToggleActive,
  onRegenerate,
  className = "" 
}: APITokensProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showToken, setShowToken] = useState<string | null>(null);
  const [newTokenName, setNewTokenName] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [expiresIn, setExpiresIn] = useState<number | undefined>(undefined);

  const availablePermissions = [
    { key: 'read_objectives', label: 'Read Objectives', description: 'View objectives and key results' },
    { key: 'write_objectives', label: 'Write Objectives', description: 'Create and update objectives' },
    { key: 'delete_objectives', label: 'Delete Objectives', description: 'Delete objectives and key results' },
    { key: 'read_checkins', label: 'Read Check-ins', description: 'View check-in data' },
    { key: 'write_checkins', label: 'Write Check-ins', description: 'Create and update check-ins' },
    { key: 'read_users', label: 'Read Users', description: 'View user information' },
    { key: 'write_users', label: 'Write Users', description: 'Create and update users' },
    { key: 'admin', label: 'Admin Access', description: 'Full administrative access' },
  ];

  const handlePermissionChange = (permission: string, checked: boolean) => {
    if (checked) {
      setSelectedPermissions(prev => [...prev, permission]);
    } else {
      setSelectedPermissions(prev => prev.filter(p => p !== permission));
    }
  };

  const handleCreateToken = () => {
    if (newTokenName.trim() && selectedPermissions.length > 0) {
      onCreate(newTokenName.trim(), selectedPermissions, expiresIn);
      setNewTokenName('');
      setSelectedPermissions([]);
      setExpiresIn(undefined);
      setShowCreateForm(false);
    }
  };

  const maskToken = (token: string) => {
    if (token.length <= 8) return token;
    return token.substring(0, 8) + '•'.repeat(token.length - 8);
  };

  const getPermissionColor = (permission: string) => {
    if (permission === 'admin') return 'bg-red-100 text-red-800';
    if (permission.startsWith('write') || permission.startsWith('delete')) return 'bg-orange-100 text-orange-800';
    return 'bg-blue-100 text-blue-800';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const isExpired = (expiresDate?: string) => {
    if (!expiresDate) return false;
    return new Date(expiresDate) < new Date();
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">API Tokens</h3>
          <p className="text-sm text-gray-600">
            Manage API tokens for external integrations and automation
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
        >
          Create Token
        </button>
      </div>

      {/* Create Token Form */}
      {showCreateForm && (
        <div className="bg-gray-50 rounded-lg p-6">
          <h4 className="text-md font-medium text-gray-900 mb-4">Create New API Token</h4>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Token Name *
              </label>
              <input
                type="text"
                value={newTokenName}
                onChange={(e) => setNewTokenName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Jira Integration, Slack Bot"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Permissions *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {availablePermissions.map(permission => (
                  <label key={permission.key} className="flex items-start">
                    <input
                      type="checkbox"
                      checked={selectedPermissions.includes(permission.key)}
                      onChange={(e) => handlePermissionChange(permission.key, e.target.checked)}
                      className="mt-1 mr-3"
                    />
                    <div>
                      <div className="text-sm font-medium text-gray-900">{permission.label}</div>
                      <div className="text-xs text-gray-500">{permission.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expires In (Optional)
              </label>
              <select
                value={expiresIn || ''}
                onChange={(e) => setExpiresIn(e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Never expires</option>
                <option value="7">7 days</option>
                <option value="30">30 days</option>
                <option value="90">90 days</option>
                <option value="365">1 year</option>
              </select>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateToken}
                disabled={!newTokenName.trim() || selectedPermissions.length === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Token
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tokens List */}
      <div className="space-y-4">
        {tokens.map((token) => (
          <div key={token.id} className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h4 className="text-lg font-medium text-gray-900">{token.name}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    token.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {token.is_active ? 'Active' : 'Inactive'}
                  </span>
                  {isExpired(token.expires_date) && (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Expired
                    </span>
                  )}
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Token:</span>
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded font-mono">
                      {showToken === token.id ? token.token : maskToken(token.token)}
                    </code>
                    <button
                      onClick={() => setShowToken(showToken === token.id ? null : token.id)}
                      className="text-gray-400 hover:text-gray-600 text-sm"
                    >
                      {showToken === token.id ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>Created: {formatDate(token.created_date)}</span>
                    {token.expires_date && (
                      <span>Expires: {formatDate(token.expires_date)}</span>
                    )}
                    {token.last_used && (
                      <span>Last used: {formatDate(token.last_used)}</span>
                    )}
                  </div>
                  
                  <div>
                    <span className="text-sm text-gray-600">Permissions:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {token.permissions.map(permission => (
                        <span key={permission} className={`px-2 py-1 rounded-full text-xs font-medium ${getPermissionColor(permission)}`}>
                          {availablePermissions.find(p => p.key === permission)?.label || permission}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={() => onToggleActive(token.id)}
                  className={`px-3 py-1 text-xs rounded ${
                    token.is_active 
                      ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' 
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  {token.is_active ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={() => onRegenerate(token.id)}
                  className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                >
                  Regenerate
                </button>
                <button
                  onClick={() => onDelete(token.id)}
                  className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {tokens.length === 0 && (
        <div className="text-center py-8">
          <div className="text-gray-400 text-4xl mb-4">🔑</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No API tokens</h3>
          <p className="text-gray-500">
            Create your first API token to enable external integrations
          </p>
        </div>
      )}

      {/* Security Notice */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <div className="text-yellow-600">⚠️</div>
          <div className="text-sm text-yellow-800">
            <strong>Security Notice:</strong> Keep your API tokens secure and never share them publicly. 
            Tokens provide access to your OKR data and should be treated like passwords.
          </div>
        </div>
      </div>
    </div>
  );
}

