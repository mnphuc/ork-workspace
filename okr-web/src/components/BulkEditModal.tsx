"use client";
import React, { useState } from 'react';
import { Modal } from './Modal';

interface BulkEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBulkEdit: (bulkEditData: BulkEditData) => void;
  selectedItems: any[];
  dataType: 'objectives' | 'keyresults' | 'checkins';
}

interface BulkEditData {
  action: 'update' | 'delete' | 'assign' | 'change_status' | 'change_quarter';
  updates: {
    status?: string;
    quarter?: string;
    owner_id?: string;
    team_id?: string;
    priority?: string;
    tags?: string[];
  };
  filters: {
    selectedIds: string[];
  };
}

export function BulkEditModal({ 
  isOpen, 
  onClose, 
  onBulkEdit, 
  selectedItems,
  dataType 
}: BulkEditModalProps) {
  const [action, setAction] = useState<'update' | 'delete' | 'assign' | 'change_status' | 'change_quarter'>('update');
  const [updates, setUpdates] = useState({
    status: '',
    quarter: '',
    owner_id: '',
    team_id: '',
    priority: '',
    tags: [] as string[],
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsProcessing(true);
    
    try {
      const bulkEditData: BulkEditData = {
        action,
        updates: Object.fromEntries(
          Object.entries(updates).filter(([_, value]) => 
            value !== '' && value !== null && value !== undefined && 
            (Array.isArray(value) ? value.length > 0 : true)
          )
        ),
        filters: {
          selectedIds: selectedItems.map(item => item.id),
        },
      };
      
      await onBulkEdit(bulkEditData);
      onClose();
    } catch (error) {
      console.error('Bulk edit failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdateChange = (key: keyof typeof updates, value: any) => {
    setUpdates(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const getDataTypeLabel = () => {
    switch (dataType) {
      case 'objectives': return 'Objectives';
      case 'keyresults': return 'Key Results';
      case 'checkins': return 'Check-ins';
      default: return 'Items';
    }
  };

  const getActionDescription = (actionType: string) => {
    switch (actionType) {
      case 'update':
        return 'Update multiple fields for selected items';
      case 'delete':
        return 'Permanently delete selected items';
      case 'assign':
        return 'Assign selected items to a new owner or team';
      case 'change_status':
        return 'Change the status of selected items';
      case 'change_quarter':
        return 'Move selected items to a different quarter';
      default:
        return '';
    }
  };

  const getAvailableStatuses = () => {
    switch (dataType) {
      case 'objectives':
        return [
          { value: 'not_started', label: 'Not Started' },
          { value: 'in_progress', label: 'In Progress' },
          { value: 'at_risk', label: 'At Risk' },
          { value: 'behind', label: 'Behind' },
          { value: 'on_track', label: 'On Track' },
          { value: 'completed', label: 'Completed' },
          { value: 'cancelled', label: 'Cancelled' },
        ];
      case 'keyresults':
        return [
          { value: 'not_started', label: 'Not Started' },
          { value: 'in_progress', label: 'In Progress' },
          { value: 'completed', label: 'Completed' },
        ];
      default:
        return [];
    }
  };

  const getAvailableQuarters = () => {
    const currentYear = new Date().getFullYear();
    return [
      { value: `Q1-${currentYear}`, label: `Q1 ${currentYear}` },
      { value: `Q2-${currentYear}`, label: `Q2 ${currentYear}` },
      { value: `Q3-${currentYear}`, label: `Q3 ${currentYear}` },
      { value: `Q4-${currentYear}`, label: `Q4 ${currentYear}` },
      { value: `Q1-${currentYear + 1}`, label: `Q1 ${currentYear + 1}` },
      { value: `Q2-${currentYear + 1}`, label: `Q2 ${currentYear + 1}` },
    ];
  };

  const getAvailablePriorities = () => [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical' },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Bulk Edit ${getDataTypeLabel()}`} size="md">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Selection Summary */}
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <div className="text-blue-600 text-lg">📝</div>
            <div>
              <div className="text-sm font-medium text-blue-900">
                {selectedItems.length} {getDataTypeLabel().toLowerCase()} selected
              </div>
              <div className="text-xs text-blue-700">
                Choose an action to apply to all selected items
              </div>
            </div>
          </div>
        </div>

        {/* Action Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Action
          </label>
          <div className="space-y-2">
            {[
              { value: 'update', label: 'Update Fields', icon: '✏️' },
              { value: 'assign', label: 'Assign Owner/Team', icon: '👤' },
              { value: 'change_status', label: 'Change Status', icon: '🔄' },
              { value: 'change_quarter', label: 'Change Quarter', icon: '📅' },
              { value: 'delete', label: 'Delete Items', icon: '🗑️', danger: true },
            ].map(actionOption => (
              <label key={actionOption.value} className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  value={actionOption.value}
                  checked={action === actionOption.value}
                  onChange={(e) => setAction(e.target.value as any)}
                  className="mr-3"
                />
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{actionOption.icon}</span>
                  <div>
                    <div className={`text-sm font-medium ${actionOption.danger ? 'text-red-600' : 'text-gray-900'}`}>
                      {actionOption.label}
                    </div>
                    <div className="text-xs text-gray-500">
                      {getActionDescription(actionOption.value)}
                    </div>
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Update Fields */}
        {action === 'update' && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700">Update Fields</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                <select
                  value={updates.status}
                  onChange={(e) => handleUpdateChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="">No change</option>
                  {getAvailableStatuses().map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Quarter</label>
                <select
                  value={updates.quarter}
                  onChange={(e) => handleUpdateChange('quarter', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="">No change</option>
                  {getAvailableQuarters().map(quarter => (
                    <option key={quarter.value} value={quarter.value}>
                      {quarter.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Priority</label>
                <select
                  value={updates.priority}
                  onChange={(e) => handleUpdateChange('priority', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="">No change</option>
                  {getAvailablePriorities().map(priority => (
                    <option key={priority.value} value={priority.value}>
                      {priority.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Tags</label>
                <input
                  type="text"
                  value={updates.tags.join(', ')}
                  onChange={(e) => handleUpdateChange('tags', e.target.value.split(',').map(t => t.trim()).filter(t => t))}
                  placeholder="tag1, tag2, tag3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* Assign Owner/Team */}
        {action === 'assign' && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700">Assign To</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Owner</label>
                <input
                  type="text"
                  value={updates.owner_id}
                  onChange={(e) => handleUpdateChange('owner_id', e.target.value)}
                  placeholder="Enter owner ID or email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Team</label>
                <input
                  type="text"
                  value={updates.team_id}
                  onChange={(e) => handleUpdateChange('team_id', e.target.value)}
                  placeholder="Enter team ID or name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* Change Status */}
        {action === 'change_status' && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700">New Status</h3>
            
            <select
              value={updates.status}
              onChange={(e) => handleUpdateChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              required
            >
              <option value="">Select new status</option>
              {getAvailableStatuses().map(status => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Change Quarter */}
        {action === 'change_quarter' && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700">New Quarter</h3>
            
            <select
              value={updates.quarter}
              onChange={(e) => handleUpdateChange('quarter', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              required
            >
              <option value="">Select new quarter</option>
              {getAvailableQuarters().map(quarter => (
                <option key={quarter.value} value={quarter.value}>
                  {quarter.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Delete Confirmation */}
        {action === 'delete' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <div className="text-red-600 text-lg">⚠️</div>
              <div>
                <div className="text-sm font-medium text-red-900">
                  Delete {selectedItems.length} {getDataTypeLabel().toLowerCase()}
                </div>
                <div className="text-xs text-red-700 mt-1">
                  This action cannot be undone. All selected items will be permanently deleted.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Preview */}
        {action !== 'delete' && Object.values(updates).some(value => 
          value !== '' && value !== null && value !== undefined && 
          (Array.isArray(value) ? value.length > 0 : true)
        ) && (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm font-medium text-gray-900 mb-2">Preview Changes:</div>
            <div className="text-sm text-gray-600 space-y-1">
              {updates.status && <div>• Status: {updates.status}</div>}
              {updates.quarter && <div>• Quarter: {updates.quarter}</div>}
              {updates.owner_id && <div>• Owner: {updates.owner_id}</div>}
              {updates.team_id && <div>• Team: {updates.team_id}</div>}
              {updates.priority && <div>• Priority: {updates.priority}</div>}
              {updates.tags.length > 0 && <div>• Tags: {updates.tags.join(', ')}</div>}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 text-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isProcessing || (action === 'delete' && !confirm('Are you sure you want to delete these items?'))}
            className={`px-4 py-2 text-white rounded-md text-sm ${
              action === 'delete' 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-blue-600 hover:bg-blue-700'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isProcessing ? 'Processing...' : action === 'delete' ? 'Delete Items' : 'Apply Changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

