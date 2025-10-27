"use client";
import React, { useState } from 'react';
import { Modal } from './Modal';

interface KPI {
  id: string;
  title: string;
  description?: string;
  progress: number;
  status: string;
  weight: number;
  owner_id: string;
  key_results?: KeyResult[];
}

interface KeyResult {
  id: string;
  title: string;
  metric_type: string;
  unit?: string;
  target_value: number;
  current_value: number;
}

interface KPICheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  kpi: KPI | null;
  onSubmit?: (keyResultId: string, value: number, note?: string) => void;
  isLoading?: boolean;
}

export function KPICheckInModal({ isOpen, onClose, kpi, onSubmit, isLoading = false }: KPICheckInModalProps) {
  const [value, setValue] = useState('');
  const [note, setNote] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('NOT_STARTED');

  if (!kpi) return null;

  // Get the first key result for this KPI, or use direct KPI values if available
  let keyResult = kpi.key_results?.[0];
  
  // If KPI doesn't have key_results, create a mock keyResult from KPI's direct values
  if (!keyResult && 'current_value' in kpi && 'target_value' in kpi) {
    keyResult = {
      id: kpi.id,
      title: kpi.title,
      metric_type: 'NUMBER', // default
      unit: '',
      target_value: kpi.target_value || 0,
      current_value: kpi.current_value || 0
    };
  }
  
  if (!keyResult) {
    return null;
  }

  // Calculate progress
  const numericValue = parseFloat(value) || 0;
  const progress = keyResult.target_value > 0 
    ? Math.min((numericValue / keyResult.target_value) * 100, 100) 
    : 0;

  // Start value is the initial value (0 or first check-in value)
  const startValue = 0; // You might want to get this from somewhere

  const formatValue = (val: number): string => {
    switch (keyResult.metric_type) {
      case 'CURRENCY':
        return `$${val.toLocaleString()}`;
      case 'PERCENT':
        return `${val}%`;
      case 'NUMBER':
        return `${val}${keyResult.unit ? ' ' + keyResult.unit : ''}`;
      case 'BOOLEAN':
        return val === 1 ? 'Yes' : 'No';
      default:
        return `${val}${keyResult.unit ? ' ' + keyResult.unit : ''}`;
    }
  };

  const getInputStep = (): string => {
    switch (keyResult.metric_type) {
      case 'CURRENCY':
        return '0.01';
      case 'PERCENT':
        return '0.1';
      case 'NUMBER':
        return '1';
      default:
        return '0.01';
    }
  };

  const getMaxValue = (): number | undefined => {
    switch (keyResult.metric_type) {
      case 'PERCENT':
        return 100;
      case 'BOOLEAN':
        return 1;
      default:
        return undefined;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit && value) {
      onSubmit(keyResult.id, parseFloat(value), note.trim() || undefined);
    }
  };

  const getStatusOptions = () => [
    { value: 'NOT_STARTED', label: 'Not Started' },
    { value: 'AT_RISK', label: 'At Risk' },
    { value: 'BEHIND', label: 'Behind' },
    { value: 'ON_TRACK', label: 'On Track' },
    { value: 'COMPLETED', label: 'Completed' }
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New check-in">
      <div className="space-y-6">
        {/* KPI Info */}
        <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
          <span className="inline-flex items-center justify-center w-8 h-8 bg-orange-100 text-orange-600 text-xs font-bold rounded flex-shrink-0">
            KR
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {kpi.title}
            </p>
            {kpi.description && (
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                {kpi.description}
              </p>
            )}
          </div>
        </div>

        {/* Started by */}
        <div className="text-sm text-gray-600">
          <span className="font-medium">Phuc Mai Nhan</span> started a new check-in{' '}
          <button className="text-blue-600 hover:text-blue-700 flex items-center inline-flex">
            Today
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Value Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Value
            </label>
            <div className="grid grid-cols-3 gap-3">
              {/* Start */}
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 mb-1">Start</span>
                <div className="px-3 py-2 bg-gray-100 rounded-md text-center">
                  {formatValue(startValue)}
                </div>
              </div>
              {/* Value Input */}
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 mb-1">Value</span>
                <input
                  type="number"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  step={getInputStep()}
                  max={getMaxValue()}
                  min="0"
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                  required
                />
              </div>
              {/* Target */}
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 mb-1">Target</span>
                <div className="px-3 py-2 bg-gray-100 rounded-md text-center">
                  {formatValue(keyResult.target_value)}
                </div>
              </div>
            </div>
          </div>

          {/* Progress Section */}
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700">
              Progress
            </label>
            <span className="text-sm font-semibold text-gray-900">
              {progress.toFixed(1)}%
            </span>
          </div>

          {/* Status Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Status
            </label>
            <div className="relative">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
              >
                {getStatusOptions().map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Share Updates */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Share Updates
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Share your updates..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !value}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

