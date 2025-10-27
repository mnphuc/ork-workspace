"use client";
import React, { useState, useRef } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Input } from './Input';
import { Select } from './Select';
import { apiFetch } from '@/lib/api';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (importData: ImportData) => void;
  dataType: 'objectives' | 'keyresults' | 'checkins' | 'users';
}

interface ImportData {
  format: 'excel' | 'csv' | 'json';
  file: File;
  options: {
    skipDuplicates: boolean;
    updateExisting: boolean;
    validateData: boolean;
    createMissingTeams: boolean;
  };
  mapping: {
    [key: string]: string;
  };
}

export function ImportModal({ 
  isOpen, 
  onClose, 
  onImport, 
  dataType 
}: ImportModalProps) {
  const [format, setFormat] = useState<'excel' | 'csv' | 'json'>('excel');
  const [file, setFile] = useState<File | null>(null);
  const [options, setOptions] = useState({
    skipDuplicates: true,
    updateExisting: false,
    validateData: true,
    createMissingTeams: true
  });
  const [mapping, setMapping] = useState<{[key: string]: string}>({});
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      // Auto-detect format based on file extension
      const extension = selectedFile.name.split('.').pop()?.toLowerCase();
      if (extension === 'csv') {
        setFormat('csv');
      } else if (extension === 'json') {
        setFormat('json');
      } else if (extension === 'xlsx' || extension === 'xls') {
        setFormat('excel');
      }
      // Load preview
      loadPreview(selectedFile);
    }
  };

  const loadPreview = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('format', format);
      
      const response = await apiFetch('/import/preview', {
        method: 'POST',
        body: formData
      });
      
      setPreview(response.preview || []);
      
      // Auto-generate mapping based on preview
      if (response.preview && response.preview.length > 0) {
        const sampleRow = response.preview[0];
        const autoMapping: {[key: string]: string} = {};
        
        Object.keys(sampleRow).forEach(key => {
          const lowerKey = key.toLowerCase();
          if (lowerKey.includes('title') || lowerKey.includes('name')) {
            autoMapping[key] = 'title';
          } else if (lowerKey.includes('description')) {
            autoMapping[key] = 'description';
          } else if (lowerKey.includes('status')) {
            autoMapping[key] = 'status';
          } else if (lowerKey.includes('progress')) {
            autoMapping[key] = 'progress';
          } else if (lowerKey.includes('owner') || lowerKey.includes('assignee')) {
            autoMapping[key] = 'owner_id';
          } else if (lowerKey.includes('team') || lowerKey.includes('group')) {
            autoMapping[key] = 'team_id';
          } else if (lowerKey.includes('quarter')) {
            autoMapping[key] = 'quarter';
          } else if (lowerKey.includes('start') || lowerKey.includes('begin')) {
            autoMapping[key] = 'start_date';
          } else if (lowerKey.includes('end') || lowerKey.includes('due')) {
            autoMapping[key] = 'end_date';
          }
        });
        
        setMapping(autoMapping);
      }
    } catch (e: any) {
      console.error('Failed to load preview:', e);
      setError('Failed to load file preview');
    }
  };

  const handleImport = async () => {
    if (!file) return;

    try {
      setImporting(true);
      setError(null);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('format', format);
      formData.append('options', JSON.stringify(options));
      formData.append('mapping', JSON.stringify(mapping));

      const response = await apiFetch(`/import/${dataType}`, {
        method: 'POST',
        body: formData
      });

      onImport({
        format,
        file,
        options,
        mapping
      });

      onClose();
    } catch (e: any) {
      console.error('Import failed:', e);
      setError(e.message || 'Import failed');
    } finally {
      setImporting(false);
    }
  };

  const getFieldOptions = () => {
    switch (dataType) {
      case 'objectives':
        return [
          { value: 'title', label: 'Title' },
          { value: 'description', label: 'Description' },
          { value: 'status', label: 'Status' },
          { value: 'progress', label: 'Progress' },
          { value: 'owner_id', label: 'Owner ID' },
          { value: 'team_id', label: 'Team ID' },
          { value: 'quarter', label: 'Quarter' },
          { value: 'start_date', label: 'Start Date' },
          { value: 'end_date', label: 'End Date' },
          { value: 'parent_id', label: 'Parent ID' }
        ];
      case 'keyresults':
        return [
          { value: 'title', label: 'Title' },
          { value: 'metric_type', label: 'Metric Type' },
          { value: 'unit', label: 'Unit' },
          { value: 'target_value', label: 'Target Value' },
          { value: 'current_value', label: 'Current Value' },
          { value: 'objective_id', label: 'Objective ID' }
        ];
      case 'checkins':
        return [
          { value: 'key_result_id', label: 'Key Result ID' },
          { value: 'value', label: 'Value' },
          { value: 'note', label: 'Note' },
          { value: 'created_date', label: 'Created Date' }
        ];
      case 'users':
        return [
          { value: 'email', label: 'Email' },
          { value: 'full_name', label: 'Full Name' },
          { value: 'role', label: 'Role' },
          { value: 'status', label: 'Status' }
        ];
      default:
        return [];
    }
  };

  const getFormatOptions = () => {
    switch (dataType) {
      case 'objectives':
      case 'keyresults':
        return [
          { value: 'excel', label: 'Excel (.xlsx)' },
          { value: 'csv', label: 'CSV (.csv)' },
          { value: 'json', label: 'JSON (.json)' }
        ];
      case 'checkins':
        return [
          { value: 'csv', label: 'CSV (.csv)' },
          { value: 'json', label: 'JSON (.json)' }
        ];
      case 'users':
        return [
          { value: 'excel', label: 'Excel (.xlsx)' },
          { value: 'csv', label: 'CSV (.csv)' }
        ];
      default:
        return [];
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Import ${dataType.charAt(0).toUpperCase() + dataType.slice(1)}`}
      size="lg"
    >
      <div className="space-y-6">
        {/* File Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select File
          </label>
          <div className="flex items-center space-x-4">
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv,.json"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <span>Choose File</span>
            </Button>
            {file && (
              <span className="text-sm text-gray-600">
                {file.name} ({(file.size / 1024).toFixed(1)} KB)
              </span>
            )}
          </div>
        </div>

        {/* Format Selection */}
        <div>
          <Select
            label="File Format"
            value={format}
            onChange={setFormat}
            options={getFormatOptions()}
            disabled={!file}
          />
        </div>

        {/* Import Options */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">Import Options</h4>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={options.skipDuplicates}
                onChange={(e) => setOptions(prev => ({ ...prev, skipDuplicates: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Skip duplicate entries</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={options.updateExisting}
                onChange={(e) => setOptions(prev => ({ ...prev, updateExisting: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Update existing entries</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={options.validateData}
                onChange={(e) => setOptions(prev => ({ ...prev, validateData: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Validate data before import</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={options.createMissingTeams}
                onChange={(e) => setOptions(prev => ({ ...prev, createMissingTeams: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Create missing teams/groups</span>
            </label>
          </div>
        </div>

        {/* Field Mapping */}
        {preview.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700">Field Mapping</h4>
            <div className="space-y-2">
              {Object.keys(preview[0] || {}).map((field) => (
                <div key={field} className="flex items-center space-x-3">
                  <span className="text-sm text-gray-600 w-32 truncate">{field}</span>
                  <span className="text-gray-400">→</span>
                  <Select
                    value={mapping[field] || ''}
                    onChange={(value) => setMapping(prev => ({ ...prev, [field]: value }))}
                    options={[
                      { value: '', label: 'Skip this field' },
                      ...getFieldOptions()
                    ]}
                    className="flex-1"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Preview */}
        {preview.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700">Preview (First 5 rows)</h4>
            <div className="bg-gray-50 rounded-lg p-4 max-h-40 overflow-y-auto">
              <pre className="text-xs text-gray-600">
                {JSON.stringify(preview.slice(0, 5), null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Import Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-3">
          <Button
            onClick={onClose}
            variant="ghost"
          >
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={!file || importing}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {importing ? 'Importing...' : 'Import Data'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}