"use client";
import React, { useState, useRef } from 'react';
import { Modal } from './Modal';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (importData: ImportData) => void;
  dataType: 'objectives' | 'keyresults' | 'users' | 'teams';
}

interface ImportData {
  file: File;
  mapping: {
    [key: string]: string;
  };
  options: {
    skipFirstRow: boolean;
    createMissingTeams: boolean;
    updateExisting: boolean;
    validateData: boolean;
  };
}

interface FieldMapping {
  sourceField: string;
  targetField: string;
  required: boolean;
  dataType: 'text' | 'number' | 'date' | 'boolean';
}

export function ImportModal({ 
  isOpen, 
  onClose, 
  onImport, 
  dataType 
}: ImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [mapping, setMapping] = useState<{[key: string]: string}>({});
  const [options, setOptions] = useState({
    skipFirstRow: true,
    createMissingTeams: true,
    updateExisting: false,
    validateData: true,
  });
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'upload' | 'mapping' | 'preview'>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Field definitions based on data type
  const getFieldDefinitions = (): FieldMapping[] => {
    switch (dataType) {
      case 'objectives':
        return [
          { sourceField: 'title', targetField: 'title', required: true, dataType: 'text' },
          { sourceField: 'description', targetField: 'description', required: false, dataType: 'text' },
          { sourceField: 'owner', targetField: 'owner_id', required: true, dataType: 'text' },
          { sourceField: 'team', targetField: 'team_id', required: true, dataType: 'text' },
          { sourceField: 'quarter', targetField: 'quarter', required: true, dataType: 'text' },
          { sourceField: 'status', targetField: 'status', required: false, dataType: 'text' },
        ];
      case 'keyresults':
        return [
          { sourceField: 'title', targetField: 'title', required: true, dataType: 'text' },
          { sourceField: 'objective', targetField: 'objective_id', required: true, dataType: 'text' },
          { sourceField: 'metric_type', targetField: 'metric_type', required: true, dataType: 'text' },
          { sourceField: 'unit', targetField: 'unit', required: true, dataType: 'text' },
          { sourceField: 'target_value', targetField: 'target_value', required: true, dataType: 'number' },
          { sourceField: 'current_value', targetField: 'current_value', required: false, dataType: 'number' },
        ];
      case 'users':
        return [
          { sourceField: 'name', targetField: 'name', required: true, dataType: 'text' },
          { sourceField: 'email', targetField: 'email', required: true, dataType: 'text' },
          { sourceField: 'role', targetField: 'role', required: true, dataType: 'text' },
          { sourceField: 'team', targetField: 'team_id', required: false, dataType: 'text' },
        ];
      case 'teams':
        return [
          { sourceField: 'name', targetField: 'name', required: true, dataType: 'text' },
          { sourceField: 'type', targetField: 'type', required: true, dataType: 'text' },
          { sourceField: 'parent', targetField: 'parent_id', required: false, dataType: 'text' },
        ];
      default:
        return [];
    }
  };

  const fieldDefinitions = getFieldDefinitions();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      processFile(selectedFile);
    }
  };

  const processFile = async (file: File) => {
    setIsProcessing(true);
    
    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length === 0) {
        throw new Error('File is empty');
      }

      // Parse CSV
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      const data = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
        const row: any = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        return row;
      });

      setPreviewData(data.slice(0, 5)); // Show first 5 rows
      
      // Auto-map fields
      const autoMapping: {[key: string]: string} = {};
      fieldDefinitions.forEach(field => {
        const matchingHeader = headers.find(header => 
          header.toLowerCase().includes(field.sourceField.toLowerCase()) ||
          field.sourceField.toLowerCase().includes(header.toLowerCase())
        );
        if (matchingHeader) {
          autoMapping[matchingHeader] = field.targetField;
        }
      });
      
      setMapping(autoMapping);
      setStep('mapping');
    } catch (error) {
      console.error('Error processing file:', error);
      alert('Error processing file. Please check the format.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMappingChange = (sourceField: string, targetField: string) => {
    setMapping(prev => ({
      ...prev,
      [sourceField]: targetField
    }));
  };

  const handleOptionChange = (key: keyof typeof options, value: boolean) => {
    setOptions(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) return;

    const importData: ImportData = {
      file,
      mapping,
      options,
    };

    await onImport(importData);
    onClose();
  };

  const handleReset = () => {
    setFile(null);
    setMapping({});
    setPreviewData([]);
    setStep('upload');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getDataTypeLabel = () => {
    switch (dataType) {
      case 'objectives': return 'Objectives';
      case 'keyresults': return 'Key Results';
      case 'users': return 'Users';
      case 'teams': return 'Teams';
      default: return 'Data';
    }
  };

  const getFileTypeDescription = () => {
    switch (dataType) {
      case 'objectives':
        return 'CSV file with columns: title, description, owner, team, quarter, status';
      case 'keyresults':
        return 'CSV file with columns: title, objective, metric_type, unit, target_value, current_value';
      case 'users':
        return 'CSV file with columns: name, email, role, team';
      case 'teams':
        return 'CSV file with columns: name, type, parent';
      default:
        return 'CSV file';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Import ${getDataTypeLabel()}`} size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step Indicator */}
        <div className="flex items-center space-x-4">
          {[
            { key: 'upload', label: 'Upload', icon: '📁' },
            { key: 'mapping', label: 'Map Fields', icon: '🔗' },
            { key: 'preview', label: 'Preview', icon: '👁️' },
          ].map((stepItem, index) => (
            <div key={stepItem.key} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                step === stepItem.key 
                  ? 'bg-blue-600 text-white' 
                  : index < ['upload', 'mapping', 'preview'].indexOf(step)
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-600'
              }`}>
                {index < ['upload', 'mapping', 'preview'].indexOf(step) ? '✓' : stepItem.icon}
              </div>
              <span className={`ml-2 text-sm ${
                step === stepItem.key ? 'text-blue-600 font-medium' : 'text-gray-500'
              }`}>
                {stepItem.label}
              </span>
              {index < 2 && <div className="w-8 h-px bg-gray-200 mx-4" />}
            </div>
          ))}
        </div>

        {/* Upload Step */}
        {step === 'upload' && (
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Upload {getDataTypeLabel()} File
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {getFileTypeDescription()}
              </p>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileSelect}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
              >
                Choose File
              </button>
              <p className="text-xs text-gray-500 mt-2">
                Supported formats: CSV, Excel (.xlsx, .xls)
              </p>
            </div>

            {file && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <span className="text-green-600">✓</span>
                  <span className="text-sm text-green-800">
                    File selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Mapping Step */}
        {step === 'mapping' && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Map Fields</h3>
            <p className="text-sm text-gray-600">
              Map the columns in your file to the required fields
            </p>

            <div className="space-y-3">
              {Object.keys(previewData[0] || {}).map(sourceField => (
                <div key={sourceField} className="flex items-center space-x-3">
                  <div className="w-32 text-sm text-gray-700 truncate">
                    {sourceField}
                  </div>
                  <div className="text-gray-400">→</div>
                  <select
                    value={mapping[sourceField] || ''}
                    onChange={(e) => handleMappingChange(sourceField, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="">Select field...</option>
                    {fieldDefinitions.map(field => (
                      <option key={field.targetField} value={field.targetField}>
                        {field.targetField} {field.required && '*'}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="text-sm text-yellow-800">
                <strong>Note:</strong> Fields marked with * are required
              </div>
            </div>
          </div>
        )}

        {/* Preview Step */}
        {step === 'preview' && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Preview Data</h3>
            <p className="text-sm text-gray-600">
              Review the first few rows of your data
            </p>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {Object.keys(previewData[0] || {}).map(header => (
                      <th key={header} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {previewData.map((row, index) => (
                    <tr key={index}>
                      {Object.values(row).map((value, cellIndex) => (
                        <td key={cellIndex} className="px-3 py-2 text-sm text-gray-900">
                          {String(value)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Import Options */}
        {step !== 'upload' && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Import Options</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Skip first row (headers)</span>
                <input
                  type="checkbox"
                  checked={options.skipFirstRow}
                  onChange={(e) => handleOptionChange('skipFirstRow', e.target.checked)}
                  className="rounded"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Create missing teams</span>
                <input
                  type="checkbox"
                  checked={options.createMissingTeams}
                  onChange={(e) => handleOptionChange('createMissingTeams', e.target.checked)}
                  className="rounded"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Update existing records</span>
                <input
                  type="checkbox"
                  checked={options.updateExisting}
                  onChange={(e) => handleOptionChange('updateExisting', e.target.checked)}
                  className="rounded"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Validate data before import</span>
                <input
                  type="checkbox"
                  checked={options.validateData}
                  onChange={(e) => handleOptionChange('validateData', e.target.checked)}
                  className="rounded"
                />
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-between pt-4 border-t border-gray-200">
          <div className="flex space-x-3">
            {step !== 'upload' && (
              <button
                type="button"
                onClick={() => setStep(step === 'mapping' ? 'upload' : 'mapping')}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 text-sm"
              >
                Back
              </button>
            )}
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 text-sm"
            >
              Reset
            </button>
          </div>
          
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 text-sm"
            >
              Cancel
            </button>
            {step === 'mapping' && (
              <button
                type="button"
                onClick={() => setStep('preview')}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
              >
                Preview
              </button>
            )}
            {step === 'preview' && (
              <button
                type="submit"
                disabled={isProcessing}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {isProcessing ? 'Importing...' : `Import ${getDataTypeLabel()}`}
              </button>
            )}
          </div>
        </div>
      </form>
    </Modal>
  );
}

