"use client";
import React, { useState } from 'react';

interface NotificationRule {
  id: string;
  name: string;
  type: 'objective' | 'checkin' | 'mention' | 'deadline' | 'milestone';
  trigger: 'created' | 'updated' | 'completed' | 'overdue' | 'mentioned';
  conditions: {
    roles: string[];
    groups: string[];
    statuses: string[];
    time_before?: number; // hours before deadline
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

interface NotificationRulesProps {
  rules: NotificationRule[];
  onAdd: (rule: Omit<NotificationRule, 'id'>) => void;
  onEdit: (rule: NotificationRule) => void;
  onDelete: (ruleId: string) => void;
  onToggleActive: (ruleId: string) => void;
  className?: string;
}

export function NotificationRules({ 
  rules, 
  onAdd, 
  onEdit, 
  onDelete, 
  onToggleActive,
  className = "" 
}: NotificationRulesProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingRule, setEditingRule] = useState<NotificationRule | null>(null);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'objective': return '🎯';
      case 'checkin': return '📊';
      case 'mention': return '💬';
      case 'deadline': return '⏰';
      case 'milestone': return '🏁';
      default: return '📢';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'objective': return 'Objective';
      case 'checkin': return 'Check-in';
      case 'mention': return 'Mention';
      case 'deadline': return 'Deadline';
      case 'milestone': return 'Milestone';
      default: return 'Unknown';
    }
  };

  const getTriggerLabel = (trigger: string) => {
    switch (trigger) {
      case 'created': return 'Created';
      case 'updated': return 'Updated';
      case 'completed': return 'Completed';
      case 'overdue': return 'Overdue';
      case 'mentioned': return 'Mentioned';
      default: return 'Unknown';
    }
  };

  const getFrequencyColor = (frequency: string) => {
    switch (frequency) {
      case 'immediate': return 'bg-red-100 text-red-800';
      case 'daily': return 'bg-blue-100 text-blue-800';
      case 'weekly': return 'bg-green-100 text-green-800';
      case 'never': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAddRule = () => {
    setEditingRule(null);
    setShowAddForm(true);
  };

  const handleEditRule = (rule: NotificationRule) => {
    setEditingRule(rule);
    setShowAddForm(true);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Notification Rules</h3>
          <p className="text-sm text-gray-600">
            Configure when and how users receive notifications
          </p>
        </div>
        <button
          onClick={handleAddRule}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
        >
          Add Rule
        </button>
      </div>

      {/* Rules List */}
      <div className="space-y-4">
        {rules.map((rule) => (
          <div key={rule.id} className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <span className="text-lg">{getTypeIcon(rule.type)}</span>
                  <h4 className="text-lg font-medium text-gray-900">{rule.name}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    rule.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {rule.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Type:</span>
                    <span className="ml-2 text-gray-600">{getTypeLabel(rule.type)}</span>
                  </div>
                  
                  <div>
                    <span className="font-medium text-gray-700">Trigger:</span>
                    <span className="ml-2 text-gray-600">{getTriggerLabel(rule.trigger)}</span>
                  </div>
                  
                  <div>
                    <span className="font-medium text-gray-700">Frequency:</span>
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getFrequencyColor(rule.frequency)}`}>
                      {rule.frequency}
                    </span>
                  </div>
                  
                  <div>
                    <span className="font-medium text-gray-700">Channels:</span>
                    <div className="ml-2 flex flex-wrap gap-1">
                      {rule.channels.email && <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">Email</span>}
                      {rule.channels.in_app && <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">In-app</span>}
                      {rule.channels.slack && <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">Slack</span>}
                      {rule.channels.teams && <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">Teams</span>}
                    </div>
                  </div>
                </div>
                
                {/* Conditions */}
                <div className="mt-3">
                  <span className="font-medium text-gray-700 text-sm">Conditions:</span>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {rule.conditions.roles.length > 0 && (
                      <div className="flex items-center space-x-1">
                        <span className="text-xs text-gray-500">Roles:</span>
                        {rule.conditions.roles.map(role => (
                          <span key={role} className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs">
                            {role}
                          </span>
                        ))}
                      </div>
                    )}
                    {rule.conditions.groups.length > 0 && (
                      <div className="flex items-center space-x-1">
                        <span className="text-xs text-gray-500">Groups:</span>
                        {rule.conditions.groups.map(group => (
                          <span key={group} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                            {group}
                          </span>
                        ))}
                      </div>
                    )}
                    {rule.conditions.statuses.length > 0 && (
                      <div className="flex items-center space-x-1">
                        <span className="text-xs text-gray-500">Statuses:</span>
                        {rule.conditions.statuses.map(status => (
                          <span key={status} className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                            {status}
                          </span>
                        ))}
                      </div>
                    )}
                    {rule.conditions.time_before && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs">
                        {rule.conditions.time_before}h before
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={() => handleEditRule(rule)}
                  className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                >
                  Edit
                </button>
                <button
                  onClick={() => onToggleActive(rule.id)}
                  className={`px-3 py-1 text-xs rounded ${
                    rule.is_active 
                      ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' 
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  {rule.is_active ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={() => onDelete(rule.id)}
                  className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {rules.length === 0 && (
        <div className="text-center py-8">
          <div className="text-gray-400 text-4xl mb-4">📢</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No notification rules</h3>
          <p className="text-gray-500">
            Create your first notification rule to get started
          </p>
        </div>
      )}

      {/* Add/Edit Rule Form */}
      {showAddForm && (
        <NotificationRuleForm
          rule={editingRule}
          onSave={(rule) => {
            if (editingRule) {
              onEdit({ ...rule, id: editingRule.id });
            } else {
              onAdd(rule);
            }
            setShowAddForm(false);
            setEditingRule(null);
          }}
          onCancel={() => {
            setShowAddForm(false);
            setEditingRule(null);
          }}
        />
      )}
    </div>
  );
}

// Notification Rule Form Component
interface NotificationRuleFormProps {
  rule?: NotificationRule | null;
  onSave: (rule: Omit<NotificationRule, 'id'>) => void;
  onCancel: () => void;
}

function NotificationRuleForm({ rule, onSave, onCancel }: NotificationRuleFormProps) {
  const [formData, setFormData] = useState<Omit<NotificationRule, 'id'>>({
    name: rule?.name || '',
    type: rule?.type || 'objective',
    trigger: rule?.trigger || 'created',
    conditions: {
      roles: rule?.conditions.roles || [],
      groups: rule?.conditions.groups || [],
      statuses: rule?.conditions.statuses || [],
      time_before: rule?.conditions.time_before,
    },
    channels: {
      email: rule?.channels.email || true,
      in_app: rule?.channels.in_app || true,
      slack: rule?.channels.slack || false,
      teams: rule?.channels.teams || false,
    },
    frequency: rule?.frequency || 'immediate',
    is_active: rule?.is_active || true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleConditionChange = (field: keyof typeof formData.conditions, value: any) => {
    setFormData(prev => ({
      ...prev,
      conditions: {
        ...prev.conditions,
        [field]: value
      }
    }));
  };

  const handleChannelChange = (channel: keyof typeof formData.channels, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      channels: {
        ...prev.channels,
        [channel]: value
      }
    }));
  };

  const availableRoles = ['Admin', 'Manager', 'User', 'Viewer'];
  const availableGroups = ['Engineering', 'Product', 'Marketing', 'Sales'];
  const availableStatuses = ['Not Started', 'On Track', 'At Risk', 'Behind', 'Completed', 'Abandoned'];

  return (
    <div className="bg-gray-50 rounded-lg p-6">
      <h4 className="text-md font-medium text-gray-900 mb-4">
        {rule ? 'Edit Notification Rule' : 'Add Notification Rule'}
      </h4>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rule Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Objective Updates for Managers"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type *
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="objective">Objective</option>
              <option value="checkin">Check-in</option>
              <option value="mention">Mention</option>
              <option value="deadline">Deadline</option>
              <option value="milestone">Milestone</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trigger *
            </label>
            <select
              value={formData.trigger}
              onChange={(e) => setFormData(prev => ({ ...prev, trigger: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="created">Created</option>
              <option value="updated">Updated</option>
              <option value="completed">Completed</option>
              <option value="overdue">Overdue</option>
              <option value="mentioned">Mentioned</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Frequency *
          </label>
          <select
            value={formData.frequency}
            onChange={(e) => setFormData(prev => ({ ...prev, frequency: e.target.value as any }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="immediate">Immediate</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="never">Never</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Channels
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(formData.channels).map(([channel, enabled]) => (
              <label key={channel} className="flex items-center">
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={(e) => handleChannelChange(channel as keyof typeof formData.channels, e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700 capitalize">{channel.replace('_', ' ')}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Conditions
          </label>
          <div className="space-y-3">
            <div>
              <span className="text-sm text-gray-600">Roles:</span>
              <div className="mt-1 flex flex-wrap gap-2">
                {availableRoles.map(role => (
                  <label key={role} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.conditions.roles.includes(role)}
                      onChange={(e) => {
                        const newRoles = e.target.checked
                          ? [...formData.conditions.roles, role]
                          : formData.conditions.roles.filter(r => r !== role);
                        handleConditionChange('roles', newRoles);
                      }}
                      className="mr-1"
                    />
                    <span className="text-sm text-gray-700">{role}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <span className="text-sm text-gray-600">Groups:</span>
              <div className="mt-1 flex flex-wrap gap-2">
                {availableGroups.map(group => (
                  <label key={group} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.conditions.groups.includes(group)}
                      onChange={(e) => {
                        const newGroups = e.target.checked
                          ? [...formData.conditions.groups, group]
                          : formData.conditions.groups.filter(g => g !== group);
                        handleConditionChange('groups', newGroups);
                      }}
                      className="mr-1"
                    />
                    <span className="text-sm text-gray-700">{group}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <span className="text-sm text-gray-600">Statuses:</span>
              <div className="mt-1 flex flex-wrap gap-2">
                {availableStatuses.map(status => (
                  <label key={status} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.conditions.statuses.includes(status)}
                      onChange={(e) => {
                        const newStatuses = e.target.checked
                          ? [...formData.conditions.statuses, status]
                          : formData.conditions.statuses.filter(s => s !== status);
                        handleConditionChange('statuses', newStatuses);
                      }}
                      className="mr-1"
                    />
                    <span className="text-sm text-gray-700">{status}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="is_active"
            checked={formData.is_active}
            onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="is_active" className="ml-2 text-sm text-gray-700">
            Active rule
          </label>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            {rule ? 'Update Rule' : 'Create Rule'}
          </button>
        </div>
      </form>
    </div>
  );
}


