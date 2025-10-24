'use client';

import React, { useState } from 'react';

interface CheckInFormProps {
  keyResult: {
    id: string;
    title: string;
    metric_type: string;
    unit: string;
    target_value: number;
    current_value: number;
    objective_id?: string;
    objective_title?: string;
  };
  onSubmit: (value: number, note?: string) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function CheckInForm({ keyResult, onSubmit, onCancel, isLoading = false }: CheckInFormProps) {
  const [value, setValue] = useState(keyResult.current_value.toString());
  const [note, setNote] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericValue = parseFloat(value);
    if (!isNaN(numericValue) && numericValue >= 0) {
      onSubmit(numericValue, note.trim() || undefined);
    }
  };

  const formatValue = (val: number, metricType: string, unit: string): string => {
    switch (metricType) {
      case 'CURRENCY':
        return `$${val.toLocaleString()}`;
      case 'PERCENT':
        return `${val}%`;
      case 'NUMBER':
        return `${val} ${unit}`;
      case 'BOOLEAN':
        return val === 1 ? 'Yes' : 'No';
      default:
        return `${val} ${unit}`;
    }
  };

  const getInputType = (): string => {
    switch (keyResult.metric_type) {
      case 'CURRENCY':
      case 'PERCENT':
      case 'NUMBER':
        return 'number';
      case 'BOOLEAN':
        return 'select';
      default:
        return 'number';
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl p-4 sm:p-6 w-full max-w-md h-full sm:h-auto sm:max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Check-in: {keyResult.title}</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Value
            </label>
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
              <span className="text-sm text-gray-500">
                {formatValue(keyResult.current_value, keyResult.metric_type, keyResult.unit)}
              </span>
              <span className="text-gray-400 hidden sm:inline">→</span>
              <span className="text-gray-400 sm:hidden">↓</span>
              {keyResult.metric_type === 'BOOLEAN' ? (
                <select
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className="flex-1 px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]"
                  required
                >
                  <option value="0">No</option>
                  <option value="1">Yes</option>
                </select>
              ) : (
                <input
                  type={getInputType()}
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  step={getInputStep()}
                  max={getMaxValue()}
                  min="0"
                  className="flex-1 px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]"
                  required
                />
              )}
              <span className="text-sm text-gray-500">{keyResult.unit}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Note (Optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]"
              placeholder="Add a note about this check-in..."
            />
          </div>

          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2.5 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors min-h-[44px] w-full sm:w-auto"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 min-h-[44px] w-full sm:w-auto"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save Check-in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

