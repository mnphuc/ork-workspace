"use client";
import React, { useState } from 'react';

interface RoadmapFilters {
  quarters: string[];
  years: number[];
  groups: string[];
  owners: string[];
  statuses: string[];
  levels: number[];
  dateRange: {
    start: string;
    end: string;
  };
}

interface RoadmapFiltersProps {
  filters: RoadmapFilters;
  onFiltersChange: (filters: RoadmapFilters) => void;
  onClearFilters: () => void;
  availableGroups: string[];
  availableOwners: string[];
  className?: string;
}

export function RoadmapFilters({ 
  filters, 
  onFiltersChange, 
  onClearFilters,
  availableGroups,
  availableOwners,
  className = "" 
}: RoadmapFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFilterChange = (filterType: keyof RoadmapFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [filterType]: value
    });
  };

  const handleArrayFilterChange = (filterType: keyof RoadmapFilters, item: string | number, checked: boolean) => {
    const currentArray = filters[filterType] as (string | number)[];
    const newArray = checked 
      ? [...currentArray, item]
      : currentArray.filter(i => i !== item);
    
    onFiltersChange({
      ...filters,
      [filterType]: newArray
    });
  };

  const handleDateRangeChange = (field: 'start' | 'end', value: string) => {
    onFiltersChange({
      ...filters,
      dateRange: {
        ...filters.dateRange,
        [field]: value
      }
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.quarters.length > 0) count++;
    if (filters.years.length > 0) count++;
    if (filters.groups.length > 0) count++;
    if (filters.owners.length > 0) count++;
    if (filters.statuses.length > 0) count++;
    if (filters.levels.length > 0) count++;
    if (filters.dateRange.start || filters.dateRange.end) count++;
    return count;
  };

  const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
  const years = [2023, 2024, 2025];
  const statuses = ['not_started', 'on_track', 'at_risk', 'behind', 'completed', 'abandoned'];
  const levels = [
    { value: 0, label: 'Company' },
    { value: 1, label: 'Department' },
    { value: 2, label: 'Team' },
    { value: 3, label: 'Individual' }
  ];

  const getStatusLabel = (status: string) => {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg ${className}`}>
      {/* Filter Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h3 className="text-md font-medium text-gray-900">Roadmap Filters</h3>
            {getActiveFiltersCount() > 0 && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                {getActiveFiltersCount()} active
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {getActiveFiltersCount() > 0 && (
              <button
                onClick={onClearFilters}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Clear All
              </button>
            )}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-400 hover:text-gray-600"
            >
              {isExpanded ? '▼' : '▶'}
            </button>
          </div>
        </div>
      </div>

      {/* Filter Content */}
      {isExpanded && (
        <div className="p-4 space-y-6">
          {/* Quarters */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quarters
            </label>
            <div className="flex flex-wrap gap-2">
              {quarters.map(quarter => (
                <label key={quarter} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.quarters.includes(quarter)}
                    onChange={(e) => handleArrayFilterChange('quarters', quarter, e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">{quarter}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Years */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Years
            </label>
            <div className="flex flex-wrap gap-2">
              {years.map(year => (
                <label key={year} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.years.includes(year)}
                    onChange={(e) => handleArrayFilterChange('years', year, e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">{year}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Groups */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Groups
            </label>
            <div className="max-h-32 overflow-y-auto space-y-1">
              {availableGroups.map(group => (
                <label key={group} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.groups.includes(group)}
                    onChange={(e) => handleArrayFilterChange('groups', group, e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">{group}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Owners */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Owners
            </label>
            <div className="max-h-32 overflow-y-auto space-y-1">
              {availableOwners.map(owner => (
                <label key={owner} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.owners.includes(owner)}
                    onChange={(e) => handleArrayFilterChange('owners', owner, e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">{owner}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Statuses */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <div className="flex flex-wrap gap-2">
              {statuses.map(status => (
                <label key={status} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.statuses.includes(status)}
                    onChange={(e) => handleArrayFilterChange('statuses', status, e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">{getStatusLabel(status)}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Levels */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Objective Level
            </label>
            <div className="flex flex-wrap gap-2">
              {levels.map(level => (
                <label key={level.value} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.levels.includes(level.value)}
                    onChange={(e) => handleArrayFilterChange('levels', level.value, e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">{level.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Range
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Start Date</label>
                <input
                  type="date"
                  value={filters.dateRange.start}
                  onChange={(e) => handleDateRangeChange('start', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">End Date</label>
                <input
                  type="date"
                  value={filters.dateRange.end}
                  onChange={(e) => handleDateRangeChange('end', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Quick Filter Presets */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quick Filters
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  onFiltersChange({
                    quarters: ['Q1', 'Q2', 'Q3', 'Q4'],
                    years: [2024],
                    groups: [],
                    owners: [],
                    statuses: [],
                    levels: [],
                    dateRange: { start: '', end: '' }
                  });
                }}
                className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
              >
                Current Year
              </button>
              <button
                onClick={() => {
                  onFiltersChange({
                    quarters: [],
                    years: [],
                    groups: [],
                    owners: [],
                    statuses: ['at_risk', 'behind'],
                    levels: [],
                    dateRange: { start: '', end: '' }
                  });
                }}
                className="px-3 py-1 text-xs bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200"
              >
                At Risk & Behind
              </button>
              <button
                onClick={() => {
                  onFiltersChange({
                    quarters: [],
                    years: [],
                    groups: [],
                    owners: [],
                    statuses: ['completed'],
                    levels: [],
                    dateRange: { start: '', end: '' }
                  });
                }}
                className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
              >
                Completed Only
              </button>
              <button
                onClick={() => {
                  onFiltersChange({
                    quarters: [],
                    years: [],
                    groups: [],
                    owners: [],
                    statuses: [],
                    levels: [0, 1], // Company & Department
                    dateRange: { start: '', end: '' }
                  });
                }}
                className="px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
              >
                Strategic Level
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

