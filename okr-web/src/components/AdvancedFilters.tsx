"use client";
import React, { useState } from 'react';

interface AdvancedFilterConfig {
  key: string;
  label: string;
  type: 'range' | 'text' | 'number' | 'boolean';
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
}

interface AdvancedFiltersProps {
  filters: AdvancedFilterConfig[];
  values: Record<string, any>;
  onChange: (key: string, value: any) => void;
  onClear: () => void;
  className?: string;
}

export function AdvancedFilters({ 
  filters, 
  values, 
  onChange, 
  onClear,
  className = "" 
}: AdvancedFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleFilterChange = (key: string, value: any) => {
    onChange(key, value);
  };

  const hasActiveFilters = Object.values(values).some(value => 
    value !== null && value !== undefined && value !== '' && 
    (Array.isArray(value) ? value.length > 0 : true)
  );

  const renderFilter = (filter: AdvancedFilterConfig) => {
    const currentValue = values[filter.key];

    switch (filter.type) {
      case 'range':
        return (
          <div key={filter.key} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {filter.label}
            </label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  placeholder="Min"
                  min={filter.min}
                  max={filter.max}
                  step={filter.step}
                  value={currentValue?.min || ''}
                  onChange={(e) => handleFilterChange(filter.key, {
                    ...currentValue,
                    min: e.target.value ? Number(e.target.value) : null
                  })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <span className="text-gray-500">to</span>
                <input
                  type="number"
                  placeholder="Max"
                  min={filter.min}
                  max={filter.max}
                  step={filter.step}
                  value={currentValue?.max || ''}
                  onChange={(e) => handleFilterChange(filter.key, {
                    ...currentValue,
                    max: e.target.value ? Number(e.target.value) : null
                  })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              {filter.min !== undefined && filter.max !== undefined && (
                <div className="text-xs text-gray-500">
                  Range: {filter.min} - {filter.max}
                </div>
              )}
            </div>
          </div>
        );

      case 'text':
        return (
          <div key={filter.key} className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              {filter.label}
            </label>
            <input
              type="text"
              placeholder={filter.placeholder}
              value={currentValue || ''}
              onChange={(e) => handleFilterChange(filter.key, e.target.value || null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
        );

      case 'number':
        return (
          <div key={filter.key} className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              {filter.label}
            </label>
            <input
              type="number"
              placeholder={filter.placeholder}
              min={filter.min}
              max={filter.max}
              step={filter.step}
              value={currentValue || ''}
              onChange={(e) => handleFilterChange(filter.key, e.target.value ? Number(e.target.value) : null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
        );

      case 'boolean':
        return (
          <div key={filter.key} className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              {filter.label}
            </label>
            <select
              value={currentValue === null ? '' : currentValue ? 'true' : 'false'}
              onChange={(e) => {
                const value = e.target.value === '' ? null : e.target.value === 'true';
                handleFilterChange(filter.key, value);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="">All</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800"
      >
        <span>Advanced Filters</span>
        <svg 
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium text-gray-900">Advanced Filters</h4>
            {hasActiveFilters && (
              <button
                onClick={onClear}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Clear All
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filters.map(renderFilter)}
          </div>

          {/* Active Filters Summary */}
          {hasActiveFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex flex-wrap gap-2">
                {Object.entries(values).map(([key, value]) => {
                  if (!value || (Array.isArray(value) && value.length === 0)) return null;
                  
                  const filter = filters.find(f => f.key === key);
                  if (!filter) return null;

                  const getDisplayValue = () => {
                    if (typeof value === 'object' && value.min !== undefined && value.max !== undefined) {
                      return `${filter.label}: ${value.min} - ${value.max}`;
                    }
                    if (typeof value === 'boolean') {
                      return `${filter.label}: ${value ? 'Yes' : 'No'}`;
                    }
                    return `${filter.label}: ${value}`;
                  };

                  return (
                    <span
                      key={key}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {getDisplayValue()}
                      <button
                        onClick={() => handleFilterChange(key, null)}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

