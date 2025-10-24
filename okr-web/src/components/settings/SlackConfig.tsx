"use client";
import React, { useState } from 'react';

interface SlackConfig {
  bot_token: string;
  app_token: string;
  workspace_id: string;
  default_channel: string;
  notifications: {
    check_in_reminders: boolean;
    objective_updates: boolean;
    mention_notifications: boolean;
    weekly_digest: boolean;
  };
  reminder_settings: {
    frequency: 'daily' | 'weekly' | 'monthly';
    time: string;
    channels: string[];
  };
}

interface SlackConfigProps {
  config: SlackConfig;
  onSave: (config: SlackConfig) => void;
  onTest: () => void;
  onCancel: () => void;
  isLoading?: boolean;
  className?: string;
}

export function SlackConfig({ 
  config, 
  onSave, 
  onTest, 
  onCancel, 
  isLoading = false,
  className = "" 
}: SlackConfigProps) {
  const [formData, setFormData] = useState<SlackConfig>(config);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [showBotToken, setShowBotToken] = useState(false);
  const [showAppToken, setShowAppToken] = useState(false);

  const handleChange = (field: keyof SlackConfig, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleNotificationChange = (notification: keyof SlackConfig['notifications'], value: boolean) => {
    setFormData(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [notification]: value
      }
    }));
  };

  const handleReminderChannelChange = (channel: string, checked: boolean) => {
    const newChannels = checked 
      ? [...formData.reminder_settings.channels, channel]
      : formData.reminder_settings.channels.filter(c => c !== channel);
    
    setFormData(prev => ({
      ...prev,
      reminder_settings: {
        ...prev.reminder_settings,
        channels: newChannels
      }
    }));
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.bot_token.trim()) {
      newErrors.bot_token = 'Bot token is required';
    } else if (!formData.bot_token.startsWith('xoxb-')) {
      newErrors.bot_token = 'Bot token must start with xoxb-';
    }

    if (!formData.app_token.trim()) {
      newErrors.app_token = 'App token is required';
    } else if (!formData.app_token.startsWith('xapp-')) {
      newErrors.app_token = 'App token must start with xapp-';
    }

    if (!formData.workspace_id.trim()) {
      newErrors.workspace_id = 'Workspace ID is required';
    }

    if (!formData.default_channel.trim()) {
      newErrors.default_channel = 'Default channel is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSave(formData);
    }
  };

  const mockChannels = [
    { id: 'general', name: '#general' },
    { id: 'okr-updates', name: '#okr-updates' },
    { id: 'engineering', name: '#engineering' },
    { id: 'product', name: '#product' },
    { id: 'marketing', name: '#marketing' },
  ];

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${className}`}>
      {/* Connection Settings */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Connection Settings</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bot Token *
          </label>
          <div className="relative">
            <input
              type={showBotToken ? 'text' : 'password'}
              value={formData.bot_token}
              onChange={(e) => handleChange('bot_token', e.target.value)}
              className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.bot_token ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="xoxb-..."
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowBotToken(!showBotToken)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showBotToken ? '🙈' : '👁️'}
            </button>
          </div>
          {errors.bot_token && (
            <p className="mt-1 text-sm text-red-600">{errors.bot_token}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Bot token from your Slack app's OAuth & Permissions page
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            App Token *
          </label>
          <div className="relative">
            <input
              type={showAppToken ? 'text' : 'password'}
              value={formData.app_token}
              onChange={(e) => handleChange('app_token', e.target.value)}
              className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.app_token ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="xapp-..."
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowAppToken(!showAppToken)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showAppToken ? '🙈' : '👁️'}
            </button>
          </div>
          {errors.app_token && (
            <p className="mt-1 text-sm text-red-600">{errors.app_token}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            App token from your Slack app's Basic Information page
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Workspace ID *
          </label>
          <input
            type="text"
            value={formData.workspace_id}
            onChange={(e) => handleChange('workspace_id', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.workspace_id ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="T1234567890"
            disabled={isLoading}
          />
          {errors.workspace_id && (
            <p className="mt-1 text-sm text-red-600">{errors.workspace_id}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Default Channel *
          </label>
          <input
            type="text"
            value={formData.default_channel}
            onChange={(e) => handleChange('default_channel', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.default_channel ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="#general"
            disabled={isLoading}
          />
          {errors.default_channel && (
            <p className="mt-1 text-sm text-red-600">{errors.default_channel}</p>
          )}
        </div>
      </div>

      {/* Notification Settings */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Notification Settings</h3>
        
        <div className="space-y-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.notifications.check_in_reminders}
              onChange={(e) => handleNotificationChange('check_in_reminders', e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              disabled={isLoading}
            />
            <span className="ml-2 text-sm text-gray-700">Send check-in reminders</span>
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.notifications.objective_updates}
              onChange={(e) => handleNotificationChange('objective_updates', e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              disabled={isLoading}
            />
            <span className="ml-2 text-sm text-gray-700">Notify on objective updates</span>
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.notifications.mention_notifications}
              onChange={(e) => handleNotificationChange('mention_notifications', e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              disabled={isLoading}
            />
            <span className="ml-2 text-sm text-gray-700">Send mention notifications</span>
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.notifications.weekly_digest}
              onChange={(e) => handleNotificationChange('weekly_digest', e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              disabled={isLoading}
            />
            <span className="ml-2 text-sm text-gray-700">Send weekly progress digest</span>
          </label>
        </div>
      </div>

      {/* Reminder Settings */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Reminder Settings</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Frequency
            </label>
            <select
              value={formData.reminder_settings.frequency}
              onChange={(e) => handleChange('reminder_settings', {
                ...formData.reminder_settings,
                frequency: e.target.value as 'daily' | 'weekly' | 'monthly'
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time
            </label>
            <input
              type="time"
              value={formData.reminder_settings.time}
              onChange={(e) => handleChange('reminder_settings', {
                ...formData.reminder_settings,
                time: e.target.value
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reminder Channels
          </label>
          <div className="space-y-2">
            {mockChannels.map(channel => (
              <label key={channel.id} className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.reminder_settings.channels.includes(channel.id)}
                  onChange={(e) => handleReminderChannelChange(channel.id, e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  disabled={isLoading}
                />
                <span className="ml-2 text-sm text-gray-700">{channel.name}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Test Connection */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-3">
          <div className="text-green-600">🔧</div>
          <h4 className="text-sm font-medium text-green-900">Test Connection</h4>
        </div>
        <p className="text-sm text-green-800 mb-3">
          Test your Slack connection and send a test message to verify everything is working.
        </p>
        <button
          type="button"
          onClick={onTest}
          disabled={isLoading}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          Test Connection
        </button>
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Saving...' : 'Save Configuration'}
        </button>
      </div>
    </form>
  );
}


