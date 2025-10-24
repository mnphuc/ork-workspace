"use client";
import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/Modal';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { Select } from '@/components/Select';
import { apiFetch } from '@/lib/api';

interface KeyResultFormData {
  title: string;
  metric_type: string;
  unit: string;
  target_value: number;
  current_value: number;
}

interface KeyResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (keyResult: any) => void;
  objectiveId: string;
  editKeyResult?: {
    id: string;
    title: string;
    metric_type: string;
    unit: string;
    target_value: number;
    current_value: number;
  } | null;
}

export function KeyResultModal({ 
  isOpen, 
  onClose, 
  onSave, 
  objectiveId, 
  editKeyResult 
}: KeyResultModalProps) {
  const [formData, setFormData] = useState<KeyResultFormData>({
    title: '',
    metric_type: 'NUMBER',
    unit: '',
    target_value: 0,
    current_value: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editKeyResult) {
      setFormData({
        title: editKeyResult.title,
        metric_type: editKeyResult.metric_type,
        unit: editKeyResult.unit,
        target_value: editKeyResult.target_value,
        current_value: editKeyResult.current_value,
      });
    } else {
      setFormData({
        title: '',
        metric_type: 'NUMBER',
        unit: '',
        target_value: 0,
        current_value: 0,
      });
    }
    setError(null);
  }, [editKeyResult, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (editKeyResult) {
        // Update existing key result
        const response = await apiFetch(`/key-results/${editKeyResult.id}`, {
          method: 'PATCH',
          body: formData
        });
        onSave(response);
      } else {
        // Create new key result
        const response = await apiFetch(`/key-results/objective/${objectiveId}`, {
          method: 'POST',
          body: {
            ...formData,
            objective_id: objectiveId
          }
        });
        onSave(response);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save key result');
    } finally {
      setLoading(false);
    }
  };

  const metricTypeOptions = [
    { value: 'NUMBER', label: 'Number' },
    { value: 'PERCENT', label: 'Percentage' },
    { value: 'CURRENCY', label: 'Currency' },
    { value: 'BOOLEAN', label: 'Boolean' },
  ];

  const getDefaultUnit = (metricType: string): string => {
    switch (metricType) {
      case 'PERCENT': return '%';
      case 'CURRENCY': return 'USD';
      case 'BOOLEAN': return '';
      default: return 'units';
    }
  };

  const handleMetricTypeChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      metric_type: value,
      unit: getDefaultUnit(value),
    }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editKeyResult ? 'Edit Key Result' : 'Add Key Result'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <Input
          label="Title"
          value={formData.title}
          onChange={(value) => setFormData(prev => ({ ...prev, title: value }))}
          placeholder="Enter key result title"
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Metric Type"
            value={formData.metric_type}
            onChange={handleMetricTypeChange}
            options={metricTypeOptions}
            required
          />

          <Input
            label="Unit"
            value={formData.unit}
            onChange={(value) => setFormData(prev => ({ ...prev, unit: value }))}
            placeholder="Enter unit"
            disabled={formData.metric_type === 'PERCENT' || formData.metric_type === 'BOOLEAN'}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Target Value"
            type="number"
            value={formData.target_value.toString()}
            onChange={(value) => setFormData(prev => ({ ...prev, target_value: parseFloat(value) || 0 }))}
            placeholder="Enter target value"
            required
            min="0"
            step={formData.metric_type === 'PERCENT' ? '0.1' : '1'}
          />

          <Input
            label="Current Value"
            type="number"
            value={formData.current_value.toString()}
            onChange={(value) => setFormData(prev => ({ ...prev, current_value: parseFloat(value) || 0 }))}
            placeholder="Enter current value"
            required
            min="0"
            step={formData.metric_type === 'PERCENT' ? '0.1' : '1'}
          />
        </div>

        <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={loading}
            className="w-full sm:w-auto"
          >
            {editKeyResult ? 'Update' : 'Create'} Key Result
          </Button>
        </div>
      </form>
    </Modal>
  );
}
