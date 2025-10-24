"use client";
import React, { useState } from 'react';

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

interface EmailPreferencesProps {
  preferences: EmailPreferences;
  onSave: (preferences: EmailPreferences) => void;
  onTest: () => void;
  className?: string;
}

export function EmailPreferences({ 
  preferences, 
  onSave, 
  onTest,
  className = "" 
}: EmailPreferencesProps) {
  const [formData, setFormData] = useState<EmailPreferences>(preferences);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: keyof EmailPreferences, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNotificationChange = (notification: keyof EmailPreferences['notifications'], value: boolean) => {
    setFormData(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [notification]: value
      }
    }));
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      await onSave(formData);
      setIsEditing(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData(preferences);
    setIsEditing(false);
  };

  const getDigestDayOptions = () => {
    if (formData.digest_frequency === 'weekly') {
      return [
        { value: 'monday', label: 'Monday' },
        { value: 'tuesday', label: 'Tuesday' },
        { value: 'wednesday', label: 'Wednesday' },
        { value: 'thursday', label: 'Thursday' },
        { value: 'friday', label: 'Friday' },
        { value: 'saturday', label: 'Saturday' },
        { value: 'sunday', label: 'Sunday' },
      ];
    }
    return [];
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Email Preferences</h3>
          <p className="text-sm text-gray-600">
            Configure your email notification settings and preferences
          </p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
          >
            Edit Preferences
          </button>
        )}
      </div>

      {/* Email Address */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-md font-medium text-gray-900 mb-4">Email Address</h4>
        
        {isEditing ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address *
            </label>
            <input
              type="email"
              value={formData.email_address}
              onChange={(e) => handleChange('email_address', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="your.email@company.com"
            />
          </div>
        ) : (
          <div className="flex items-center space-x-3">
            <span className="text-lg">📧</span>
            <div>
              <p className="text-sm font-medium text-gray-900">{formData.email_address}</p>
              <p className="text-xs text-gray-500">
                {formData.email_enabled ? 'Email notifications enabled' : 'Email notifications disabled'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Email Settings */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-md font-medium text-gray-900 mb-4">Email Settings</h4>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h5 className="text-sm font-medium text-gray-900">Enable Email Notifications</h5>
              <p className="text-xs text-gray-500">Receive email notifications for OKR activities</p>
            </div>
            {isEditing ? (
              <input
                type="checkbox"
                checked={formData.email_enabled}
                onChange={(e) => handleChange('email_enabled', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
            ) : (
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                formData.email_enabled 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {formData.email_enabled ? 'Enabled' : 'Disabled'}
              </span>
            )}
          </div>

          {formData.email_enabled && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Digest Frequency
                  </label>
                  {isEditing ? (
                    <select
                      value={formData.digest_frequency}
                      onChange={(e) => handleChange('digest_frequency', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="never">Never</option>
                    </select>
                  ) : (
                    <p className="text-sm text-gray-900 capitalize">{formData.digest_frequency}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Digest Time
                  </label>
                  {isEditing ? (
                    <input
                      type="time"
                      value={formData.digest_time}
                      onChange={(e) => handleChange('digest_time', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-sm text-gray-900">{formData.digest_time}</p>
                  )}
                </div>
              </div>

              {formData.digest_frequency === 'weekly' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Digest Day
                  </label>
                  {isEditing ? (
                    <select
                      value={formData.digest_day || 'monday'}
                      onChange={(e) => handleChange('digest_day', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {getDigestDayOptions().map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-sm text-gray-900 capitalize">{formData.digest_day || 'Monday'}</p>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Notification Types */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-md font-medium text-gray-900 mb-4">Notification Types</h4>
        
        <div className="space-y-4">
          {Object.entries(formData.notifications).map(([key, enabled]) => {
            const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            const description = getNotificationDescription(key);
            
            return (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <h5 className="text-sm font-medium text-gray-900">{label}</h5>
                  <p className="text-xs text-gray-500">{description}</p>
                </div>
                {isEditing ? (
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={(e) => handleNotificationChange(key as keyof EmailPreferences['notifications'], e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                ) : (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    enabled 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {enabled ? 'Enabled' : 'Disabled'}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Test Email */}
      {formData.email_enabled && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <div className="text-blue-600">📧</div>
            <h4 className="text-sm font-medium text-blue-900">Test Email</h4>
          </div>
          <p className="text-sm text-blue-800 mb-3">
            Send a test email to verify your email settings are working correctly.
          </p>
          <button
            onClick={onTest}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
          >
            Send Test Email
          </button>
        </div>
      )}

      {/* Actions */}
      {isEditing && (
        <div className="flex justify-end space-x-3">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      )}

      {/* Unsubscribe Info */}
      {formData.unsubscribe_token && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <div className="text-gray-600">🔗</div>
            <h4 className="text-sm font-medium text-gray-900">Unsubscribe Link</h4>
          </div>
          <p className="text-xs text-gray-600 mb-2">
            Share this link to allow users to unsubscribe from email notifications:
          </p>
          <code className="text-xs bg-white px-2 py-1 rounded border text-gray-800">
            {window.location.origin}/unsubscribe/{formData.unsubscribe_token}
          </code>
        </div>
      )}
    </div>
  );
}

function getNotificationDescription(key: string): string {
  switch (key) {
    case 'objective_updates':
      return 'Get notified when objectives you own or follow are updated';
    case 'check_in_reminders':
      return 'Receive reminders to submit check-ins for your objectives';
    case 'deadline_alerts':
      return 'Get alerts when objectives are approaching their deadlines';
    case 'mention_notifications':
      return 'Be notified when someone mentions you in comments or updates';
    case 'comment_replies':
      return 'Get notified when someone replies to your comments';
    case 'status_changes':
      return 'Be notified when objective statuses change';
    case 'new_assignments':
      return 'Get notified when you are assigned to new objectives';
    case 'weekly_progress':
      return 'Receive weekly progress summaries for your objectives';
    default:
      return 'Notification description';
  }
}

