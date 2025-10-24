"use client";
import React, { useState } from 'react';

interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

interface FilterConfig {
  key: string;
  label: string;
  type: 'select' | 'multiselect' | 'date' | 'daterange';
  options?: FilterOption[];
  placeholder?: string;
}

interface FilterPanelProps {
  filters: FilterConfig[];
  values: Record<string, any>;
  onChange: (key: string, value: any) => void;
  onClear: () => void;
  className?: string;
}

export function FilterPanel({ 
  filters, 
  values, 
  onChange, 
  onClear,
  className = "" 
}: FilterPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFilterChange = (key: string, value: any) => {
    onChange(key, value);
  };

  const hasActiveFilters = Object.values(values).some(value => 
    value !== null && value !== undefined && value !== '' && 
    (Array.isArray(value) ? value.length > 0 : true)
  );

  const renderFilter = (filter: FilterConfig) => {
    const currentValue = values[filter.key];

    switch (filter.type) {
      case 'select':
        return (
          <div key={filter.key} className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              {filter.label}
            </label>
            <select
              value={currentValue || ''}
              onChange={(e) => handleFilterChange(filter.key, e.target.value || null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="">All {filter.label}</option>
              {filter.options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label} {option.count !== undefined ? `(${option.count})` : ''}
                </option>
              ))}
            </select>
          </div>
        );

      case 'multiselect':
        return (
          <div key={filter.key} className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              {filter.label}
            </label>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {filter.options?.map((option) => (
                <label key={option.value} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={Array.isArray(currentValue) && currentValue.includes(option.value)}
                    onChange={(e) => {
                      const current = Array.isArray(currentValue) ? currentValue : [];
                      const newValue = e.target.checked
                        ? [...current, option.value]
                        : current.filter(v => v !== option.value);
                      handleFilterChange(filter.key, newValue.length > 0 ? newValue : null);
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    {option.label} {option.count !== undefined ? `(${option.count})` : ''}
                  </span>
                </label>
              ))}
            </div>
          </div>
        );

      case 'date':
        return (
          <div key={filter.key} className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              {filter.label}
            </label>
            <input
              type="date"
              value={currentValue || ''}
              onChange={(e) => handleFilterChange(filter.key, e.target.value || null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
        );

      case 'daterange':
        return (
          <div key={filter.key} className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              {filter.label}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                placeholder="From"
                value={currentValue?.from || ''}
                onChange={(e) => handleFilterChange(filter.key, {
                  ...currentValue,
                  from: e.target.value || null
                })}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <input
                type="date"
                placeholder="To"
                value={currentValue?.to || ''}
                onChange={(e) => handleFilterChange(filter.key, {
                  ...currentValue,
                  to: e.target.value || null
                })}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Filters</h3>
          <div className="flex items-center space-x-2">
            {hasActiveFilters && (
              <button
                onClick={onClear}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Clear All
              </button>
            )}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              {isExpanded ? 'Collapse' : 'Expand'}
            </button>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filters.map(renderFilter)}
          </div>
        </div>
      )}

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            {Object.entries(values).map(([key, value]) => {
              if (!value || (Array.isArray(value) && value.length === 0)) return null;
              
              const filter = filters.find(f => f.key === key);
              if (!filter) return null;

              const getDisplayValue = () => {
                if (Array.isArray(value)) {
                  return `${filter.label}: ${value.join(', ')}`;
                }
                if (typeof value === 'object' && value.from && value.to) {
                  return `${filter.label}: ${value.from} - ${value.to}`;
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
  );
}

