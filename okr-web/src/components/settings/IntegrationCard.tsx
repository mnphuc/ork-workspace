"use client";
import React, { useState } from 'react';

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

interface IntegrationCardProps {
  integration: Integration;
  onConnect: (integrationId: string) => void;
  onDisconnect: (integrationId: string) => void;
  onConfigure: (integrationId: string) => void;
  onTest: (integrationId: string) => void;
  className?: string;
}

export function IntegrationCard({ 
  integration, 
  onConnect, 
  onDisconnect, 
  onConfigure,
  onTest,
  className = "" 
}: IntegrationCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return '✅';
      case 'inactive': return '⚪';
      case 'error': return '❌';
      case 'pending': return '⏳';
      default: return '❓';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'platform': return 'bg-blue-100 text-blue-800';
      case 'messaging': return 'bg-green-100 text-green-800';
      case 'developer': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAction = async (action: () => void) => {
    setIsLoading(true);
    try {
      await action();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow ${className}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="text-3xl">{integration.icon}</div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{integration.name}</h3>
            <p className="text-sm text-gray-600">{integration.description}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(integration.type)}`}>
            {integration.type}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(integration.status)}`}>
            {getStatusIcon(integration.status)} {integration.status}
          </span>
        </div>
      </div>

      {/* Features */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Features</h4>
        <div className="flex flex-wrap gap-1">
          {integration.features.map((feature, index) => (
            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
              {feature}
            </span>
          ))}
        </div>
      </div>

      {/* Status Information */}
      {integration.is_connected && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Last Sync:</span>
            <span className="text-gray-900">
              {integration.last_sync ? new Date(integration.last_sync).toLocaleString() : 'Never'}
            </span>
          </div>
          {integration.error_message && (
            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
              <strong>Error:</strong> {integration.error_message}
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        {!integration.is_connected ? (
          <button
            onClick={() => handleAction(() => onConnect(integration.id))}
            disabled={!integration.is_available || isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {isLoading ? 'Connecting...' : 'Connect'}
          </button>
        ) : (
          <>
            <button
              onClick={() => handleAction(() => onConfigure(integration.id))}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm"
            >
              Configure
            </button>
            <button
              onClick={() => handleAction(() => onTest(integration.id))}
              className="px-4 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 text-sm"
            >
              Test Connection
            </button>
            <button
              onClick={() => handleAction(() => onDisconnect(integration.id))}
              className="px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 text-sm"
            >
              Disconnect
            </button>
          </>
        )}
      </div>

      {/* Availability Notice */}
      {!integration.is_available && (
        <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
          <strong>Coming Soon:</strong> This integration is currently under development.
        </div>
      )}
    </div>
  );
}

