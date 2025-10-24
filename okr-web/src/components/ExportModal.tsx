"use client";
import React, { useState } from 'react';
import { Modal } from './Modal';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (exportData: ExportData) => void;
  dataType: 'objectives' | 'keyresults' | 'checkins' | 'dashboard' | 'roadmap';
  dataCount?: number;
}

interface ExportData {
  format: 'excel' | 'pdf' | 'csv' | 'json';
  include: {
    objectives: boolean;
    keyResults: boolean;
    checkIns: boolean;
    comments: boolean;
    progress: boolean;
    charts: boolean;
  };
  filters: {
    dateRange: {
      from: string;
      to: string;
    };
    teams: string[];
    status: string[];
    quarters: string[];
  };
  options: {
    includeHeaders: boolean;
    includeMetadata: boolean;
    groupByTeam: boolean;
    sortBy: 'title' | 'progress' | 'created_date' | 'last_modified_date';
    sortOrder: 'asc' | 'desc';
  };
}

export function ExportModal({ 
  isOpen, 
  onClose, 
  onExport, 
  dataType,
  dataCount = 0 
}: ExportModalProps) {
  const [format, setFormat] = useState<'excel' | 'pdf' | 'csv' | 'json'>('excel');
  const [include, setInclude] = useState({
    objectives: true,
    keyResults: true,
    checkIns: false,
    comments: false,
    progress: true,
    charts: false,
  });
  const [filters, setFilters] = useState({
    dateRange: {
      from: '',
      to: '',
    },
    teams: [] as string[],
    status: [] as string[],
    quarters: [] as string[],
  });
  const [options, setOptions] = useState({
    includeHeaders: true,
    includeMetadata: true,
    groupByTeam: false,
    sortBy: 'title' as const,
    sortOrder: 'asc' as const,
  });
  const [isExporting, setIsExporting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsExporting(true);
    
    try {
      const exportData: ExportData = {
        format,
        include,
        filters,
        options,
      };
      
      await onExport(exportData);
      onClose();
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleIncludeChange = (key: keyof typeof include) => {
    setInclude(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleFilterChange = (key: keyof typeof filters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleOptionChange = (key: keyof typeof options, value: any) => {
    setOptions(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const getDataTypeLabel = () => {
    switch (dataType) {
      case 'objectives': return 'Objectives';
      case 'keyresults': return 'Key Results';
      case 'checkins': return 'Check-ins';
      case 'dashboard': return 'Dashboard';
      case 'roadmap': return 'Roadmap';
      default: return 'Data';
    }
  };

  const getFormatDescription = (format: string) => {
    switch (format) {
      case 'excel':
        return 'Excel spreadsheet (.xlsx) - Best for data analysis';
      case 'pdf':
        return 'PDF document (.pdf) - Best for reports and presentations';
      case 'csv':
        return 'CSV file (.csv) - Best for data import/export';
      case 'json':
        return 'JSON file (.json) - Best for API integration';
      default:
        return '';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Export ${getDataTypeLabel()}`} size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Export Summary */}
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <div className="text-blue-600 text-lg">📊</div>
            <div>
              <div className="text-sm font-medium text-blue-900">
                Exporting {dataCount} {getDataTypeLabel().toLowerCase()}
              </div>
              <div className="text-xs text-blue-700">
                Choose your export format and options below
              </div>
            </div>
          </div>
        </div>

        {/* Format Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Export Format
          </label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: 'excel', label: 'Excel (.xlsx)', icon: '📊' },
              { value: 'pdf', label: 'PDF (.pdf)', icon: '📄' },
              { value: 'csv', label: 'CSV (.csv)', icon: '📋' },
              { value: 'json', label: 'JSON (.json)', icon: '🔧' },
            ].map(formatOption => (
              <label key={formatOption.value} className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  value={formatOption.value}
                  checked={format === formatOption.value}
                  onChange={(e) => setFormat(e.target.value as any)}
                  className="mr-3"
                />
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{formatOption.icon}</span>
                  <div>
                    <div className="text-sm font-medium text-gray-900">{formatOption.label}</div>
                    <div className="text-xs text-gray-500">
                      {getFormatDescription(formatOption.value)}
                    </div>
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Include Options */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Include in Export
          </label>
          <div className="space-y-2">
            {[
              { key: 'objectives', label: 'Objectives', description: 'Main objective data' },
              { key: 'keyResults', label: 'Key Results', description: 'Associated key results' },
              { key: 'checkIns', label: 'Check-ins', description: 'Progress updates and notes' },
              { key: 'comments', label: 'Comments', description: 'Discussion threads' },
              { key: 'progress', label: 'Progress Data', description: 'Progress percentages and metrics' },
              { key: 'charts', label: 'Charts & Graphs', description: 'Visual progress representations' },
            ].map(option => (
              <label key={option.key} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={include[option.key as keyof typeof include]}
                    onChange={() => handleIncludeChange(option.key as keyof typeof include)}
                    className="rounded"
                  />
                  <div>
                    <div className="text-sm font-medium text-gray-900">{option.label}</div>
                    <div className="text-xs text-gray-500">{option.description}</div>
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Filters
          </label>
          <div className="space-y-4">
            {/* Date Range */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">From Date</label>
                <input
                  type="date"
                  value={filters.dateRange.from}
                  onChange={(e) => handleFilterChange('dateRange', { ...filters.dateRange, from: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">To Date</label>
                <input
                  type="date"
                  value={filters.dateRange.to}
                  onChange={(e) => handleFilterChange('dateRange', { ...filters.dateRange, to: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
            </div>

            {/* Quarters */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Quarters</label>
              <div className="flex flex-wrap gap-2">
                {['Q1', 'Q2', 'Q3', 'Q4'].map(quarter => (
                  <label key={quarter} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.quarters.includes(quarter)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          handleFilterChange('quarters', [...filters.quarters, quarter]);
                        } else {
                          handleFilterChange('quarters', filters.quarters.filter(q => q !== quarter));
                        }
                      }}
                      className="mr-1"
                    />
                    <span className="text-sm text-gray-700">{quarter}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Export Options */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Export Options
          </label>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Include Headers</span>
              <input
                type="checkbox"
                checked={options.includeHeaders}
                onChange={(e) => handleOptionChange('includeHeaders', e.target.checked)}
                className="rounded"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Include Metadata</span>
              <input
                type="checkbox"
                checked={options.includeMetadata}
                onChange={(e) => handleOptionChange('includeMetadata', e.target.checked)}
                className="rounded"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Group by Team</span>
              <input
                type="checkbox"
                checked={options.groupByTeam}
                onChange={(e) => handleOptionChange('groupByTeam', e.target.checked)}
                className="rounded"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Sort By</label>
                <select
                  value={options.sortBy}
                  onChange={(e) => handleOptionChange('sortBy', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="title">Title</option>
                  <option value="progress">Progress</option>
                  <option value="created_date">Created Date</option>
                  <option value="last_modified_date">Last Modified</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Order</label>
                <select
                  value={options.sortOrder}
                  onChange={(e) => handleOptionChange('sortOrder', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
                </select>
              </div>
            </div>
          </div>
        </div>

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
            disabled={isExporting}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {isExporting ? 'Exporting...' : `Export ${getDataTypeLabel()}`}
          </button>
        </div>
      </form>
    </Modal>
  );
}

