"use client";
import React, { useState } from 'react';

interface PersonalPreferences {
  language: string;
  timezone: string;
  date_format: string;
  time_format: '12h' | '24h';
  week_start: 'monday' | 'sunday';
  default_groups: string[];
  email_notifications: boolean;
  push_notifications: boolean;
  digest_frequency: 'daily' | 'weekly' | 'monthly' | 'never';
  theme: 'light' | 'dark' | 'auto';
}

interface PersonalPreferencesProps {
  preferences: PersonalPreferences;
  onSave: (preferences: PersonalPreferences) => void;
  availableGroups: string[];
  className?: string;
}

export function PersonalPreferences({ 
  preferences, 
  onSave,
  availableGroups,
  className = "" 
}: PersonalPreferencesProps) {
  const [formData, setFormData] = useState<PersonalPreferences>(preferences);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: keyof PersonalPreferences, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
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

  const timezones = [
    'UTC',
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Europe/Berlin',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Asia/Kolkata',
    'Australia/Sydney',
  ];

  const dateFormats = [
    { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (US)' },
    { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (EU)' },
    { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (ISO)' },
    { value: 'DD MMM YYYY', label: 'DD MMM YYYY' },
  ];

  const languages = [
    { value: 'en', label: 'English' },
    { value: 'vi', label: 'Tiếng Việt' },
    { value: 'es', label: 'Español' },
    { value: 'fr', label: 'Français' },
    { value: 'de', label: 'Deutsch' },
    { value: 'ja', label: '日本語' },
    { value: 'ko', label: '한국어' },
    { value: 'zh', label: '中文' },
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Personal Preferences</h3>
          <p className="text-sm text-gray-600">
            Customize your experience and default settings
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

      {/* Language & Localization */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-md font-medium text-gray-900 mb-4">Language & Localization</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Language
            </label>
            {isEditing ? (
              <select
                value={formData.language}
                onChange={(e) => handleChange('language', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {languages.map(lang => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-sm text-gray-900">
                {languages.find(lang => lang.value === formData.language)?.label || formData.language}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Timezone
            </label>
            {isEditing ? (
              <select
                value={formData.timezone}
                onChange={(e) => handleChange('timezone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {timezones.map(tz => (
                  <option key={tz} value={tz}>
                    {tz}
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-sm text-gray-900">{formData.timezone}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Format
            </label>
            {isEditing ? (
              <select
                value={formData.date_format}
                onChange={(e) => handleChange('date_format', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {dateFormats.map(format => (
                  <option key={format.value} value={format.value}>
                    {format.label}
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-sm text-gray-900">{formData.date_format}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time Format
            </label>
            {isEditing ? (
              <select
                value={formData.time_format}
                onChange={(e) => handleChange('time_format', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="12h">12-hour (AM/PM)</option>
                <option value="24h">24-hour</option>
              </select>
            ) : (
              <p className="text-sm text-gray-900">
                {formData.time_format === '12h' ? '12-hour (AM/PM)' : '24-hour'}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Week Starts On
            </label>
            {isEditing ? (
              <select
                value={formData.week_start}
                onChange={(e) => handleChange('week_start', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="monday">Monday</option>
                <option value="sunday">Sunday</option>
              </select>
            ) : (
              <p className="text-sm text-gray-900 capitalize">{formData.week_start}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Theme
            </label>
            {isEditing ? (
              <select
                value={formData.theme}
                onChange={(e) => handleChange('theme', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto">Auto (System)</option>
              </select>
            ) : (
              <p className="text-sm text-gray-900 capitalize">{formData.theme}</p>
            )}
          </div>
        </div>
      </div>

      {/* Default Groups */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-md font-medium text-gray-900 mb-4">Default Groups</h4>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select your default groups
          </label>
          {isEditing ? (
            <div className="space-y-2">
              {availableGroups.map(group => (
                <label key={group} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.default_groups.includes(group)}
                    onChange={(e) => {
                      const newGroups = e.target.checked
                        ? [...formData.default_groups, group]
                        : formData.default_groups.filter(g => g !== group);
                      handleChange('default_groups', newGroups);
                    }}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">{group}</span>
                </label>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {formData.default_groups.length > 0 ? (
                formData.default_groups.map(group => (
                  <span key={group} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                    {group}
                  </span>
                ))
              ) : (
                <span className="text-sm text-gray-500">No default groups selected</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-md font-medium text-gray-900 mb-4">Notification Preferences</h4>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h5 className="text-sm font-medium text-gray-900">Email Notifications</h5>
              <p className="text-xs text-gray-500">Receive email updates about your objectives</p>
            </div>
            {isEditing ? (
              <input
                type="checkbox"
                checked={formData.email_notifications}
                onChange={(e) => handleChange('email_notifications', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
            ) : (
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                formData.email_notifications 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {formData.email_notifications ? 'Enabled' : 'Disabled'}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h5 className="text-sm font-medium text-gray-900">Push Notifications</h5>
              <p className="text-xs text-gray-500">Receive browser notifications for updates</p>
            </div>
            {isEditing ? (
              <input
                type="checkbox"
                checked={formData.push_notifications}
                onChange={(e) => handleChange('push_notifications', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
            ) : (
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                formData.push_notifications 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {formData.push_notifications ? 'Enabled' : 'Disabled'}
              </span>
            )}
          </div>

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
        </div>
      </div>

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
    </div>
  );
}

