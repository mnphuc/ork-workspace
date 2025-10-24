"use client";
import React, { useState } from 'react';

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

interface DigestSettingsProps {
  settings: DigestSettings;
  onSave: (settings: DigestSettings) => void;
  onPreview: () => void;
  onSendTest: () => void;
  className?: string;
}

export function DigestSettings({ 
  settings, 
  onSave, 
  onPreview,
  onSendTest,
  className = "" 
}: DigestSettingsProps) {
  const [formData, setFormData] = useState<DigestSettings>(settings);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: keyof DigestSettings, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleContentChange = (field: keyof DigestSettings['content'], value: boolean) => {
    setFormData(prev => ({
      ...prev,
      content: {
        ...prev.content,
        [field]: value
      }
    }));
  };

  const handleRecipientChange = (field: keyof DigestSettings['recipients'], value: any) => {
    setFormData(prev => ({
      ...prev,
      recipients: {
        ...prev.recipients,
        [field]: value
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
    setFormData(settings);
    setIsEditing(false);
  };

  const getDayOptions = () => [
    { value: 'monday', label: 'Monday' },
    { value: 'tuesday', label: 'Tuesday' },
    { value: 'wednesday', label: 'Wednesday' },
    { value: 'thursday', label: 'Thursday' },
    { value: 'friday', label: 'Friday' },
    { value: 'saturday', label: 'Saturday' },
    { value: 'sunday', label: 'Sunday' },
  ];

  const getMonthDayOptions = () => {
    return Array.from({ length: 28 }, (_, i) => i + 1);
  };

  const mockGroups = ['Engineering', 'Product', 'Marketing', 'Sales', 'HR'];
  const mockUsers = ['John Doe', 'Jane Smith', 'Bob Johnson', 'Alice Brown'];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Digest Settings</h3>
          <p className="text-sm text-gray-600">
            Configure automated digest emails for your workspace
          </p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
          >
            Edit Settings
          </button>
        )}
      </div>

      {/* General Settings */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-md font-medium text-gray-900 mb-4">General Settings</h4>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h5 className="text-sm font-medium text-gray-900">Enable Digest Emails</h5>
              <p className="text-xs text-gray-500">Send automated digest emails to users</p>
            </div>
            {isEditing ? (
              <input
                type="checkbox"
                checked={formData.enabled}
                onChange={(e) => handleChange('enabled', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
            ) : (
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                formData.enabled 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {formData.enabled ? 'Enabled' : 'Disabled'}
              </span>
            )}
          </div>

          {formData.enabled && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Frequency
                  </label>
                  {isEditing ? (
                    <select
                      value={formData.frequency}
                      onChange={(e) => handleChange('frequency', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  ) : (
                    <p className="text-sm text-gray-900 capitalize">{formData.frequency}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time
                  </label>
                  {isEditing ? (
                    <input
                      type="time"
                      value={formData.time}
                      onChange={(e) => handleChange('time', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-sm text-gray-900">{formData.time}</p>
                  )}
                </div>
              </div>

              {formData.frequency === 'weekly' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Day of Week
                  </label>
                  {isEditing ? (
                    <select
                      value={formData.day_of_week || 'monday'}
                      onChange={(e) => handleChange('day_of_week', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {getDayOptions().map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-sm text-gray-900 capitalize">{formData.day_of_week || 'Monday'}</p>
                  )}
                </div>
              )}

              {formData.frequency === 'monthly' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Day of Month
                  </label>
                  {isEditing ? (
                    <select
                      value={formData.day_of_month || 1}
                      onChange={(e) => handleChange('day_of_month', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {getMonthDayOptions().map(day => (
                        <option key={day} value={day}>
                          {day}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-sm text-gray-900">{formData.day_of_month || 1}</p>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Content Settings */}
      {formData.enabled && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-md font-medium text-gray-900 mb-4">Content Settings</h4>
          
          <div className="space-y-4">
            {Object.entries(formData.content).map(([key, enabled]) => {
              const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
              const description = getContentDescription(key);
              
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
                      onChange={(e) => handleContentChange(key as keyof DigestSettings['content'], e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  ) : (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      enabled 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {enabled ? 'Included' : 'Excluded'}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recipients */}
      {formData.enabled && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-md font-medium text-gray-900 mb-4">Recipients</h4>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h5 className="text-sm font-medium text-gray-900">All Users</h5>
                <p className="text-xs text-gray-500">Send digest to all workspace users</p>
              </div>
              {isEditing ? (
                <input
                  type="checkbox"
                  checked={formData.recipients.all_users}
                  onChange={(e) => handleRecipientChange('all_users', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
              ) : (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  formData.recipients.all_users 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {formData.recipients.all_users ? 'Enabled' : 'Disabled'}
                </span>
              )}
            </div>

            {!formData.recipients.all_users && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Specific Groups
                  </label>
                  {isEditing ? (
                    <div className="space-y-2">
                      {mockGroups.map(group => (
                        <label key={group} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.recipients.specific_groups.includes(group)}
                            onChange={(e) => {
                              const newGroups = e.target.checked
                                ? [...formData.recipients.specific_groups, group]
                                : formData.recipients.specific_groups.filter(g => g !== group);
                              handleRecipientChange('specific_groups', newGroups);
                            }}
                            className="mr-2"
                          />
                          <span className="text-sm text-gray-700">{group}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {formData.recipients.specific_groups.map(group => (
                        <span key={group} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                          {group}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Specific Users
                  </label>
                  {isEditing ? (
                    <div className="space-y-2">
                      {mockUsers.map(user => (
                        <label key={user} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.recipients.specific_users.includes(user)}
                            onChange={(e) => {
                              const newUsers = e.target.checked
                                ? [...formData.recipients.specific_users, user]
                                : formData.recipients.specific_users.filter(u => u !== user);
                              handleRecipientChange('specific_users', newUsers);
                            }}
                            className="mr-2"
                          />
                          <span className="text-sm text-gray-700">{user}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {formData.recipients.specific_users.map(user => (
                        <span key={user} className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                          {user}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Format & Template */}
      {formData.enabled && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-md font-medium text-gray-900 mb-4">Format & Template</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Format
              </label>
              {isEditing ? (
                <select
                  value={formData.format}
                  onChange={(e) => handleChange('format', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="html">HTML</option>
                  <option value="text">Plain Text</option>
                  <option value="pdf">PDF</option>
                </select>
              ) : (
                <p className="text-sm text-gray-900 uppercase">{formData.format}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Template
              </label>
              {isEditing ? (
                <select
                  value={formData.template}
                  onChange={(e) => handleChange('template', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="default">Default</option>
                  <option value="minimal">Minimal</option>
                  <option value="detailed">Detailed</option>
                </select>
              ) : (
                <p className="text-sm text-gray-900 capitalize">{formData.template}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      {formData.enabled && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <div className="text-green-600">📧</div>
            <h4 className="text-sm font-medium text-green-900">Digest Actions</h4>
          </div>
          <p className="text-sm text-green-800 mb-3">
            Preview and test your digest email settings.
          </p>
          <div className="flex space-x-3">
            <button
              onClick={onPreview}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
            >
              Preview Digest
            </button>
            <button
              onClick={onSendTest}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
            >
              Send Test
            </button>
          </div>
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
            {isSubmitting ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      )}
    </div>
  );
}

function getContentDescription(key: string): string {
  switch (key) {
    case 'include_objectives':
      return 'Include objective updates and progress';
    case 'include_checkins':
      return 'Include recent check-in activities';
    case 'include_comments':
      return 'Include comments and discussions';
    case 'include_mentions':
      return 'Include mentions and notifications';
    case 'include_deadlines':
      return 'Include upcoming deadlines and alerts';
    case 'include_progress_charts':
      return 'Include progress charts and visualizations';
    case 'include_team_summary':
      return 'Include team performance summary';
    default:
      return 'Content description';
  }
}

