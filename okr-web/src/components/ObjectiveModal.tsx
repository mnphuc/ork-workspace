"use client";
import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/Modal';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { Select } from '@/components/Select';
import { Textarea } from '@/components/Textarea';
import { apiFetch } from '@/lib/api';
import { ObjectiveType } from '@/components/ObjectiveTypeSelector';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useUser } from '@/contexts/UserContext';

interface ObjectiveFormData {
  title: string;
  description: string;
  type: 'COMPANY' | 'DEPARTMENT' | 'TEAM' | 'KPI';
  groups: string[];
  quarter: string;
  start_date: string;
  end_date: string;
  labels: string[];
  stakeholders: string[];
}

interface ObjectiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (objective: any) => void;
  selectedType: ObjectiveType | null;
}

export function ObjectiveModal({ 
  isOpen, 
  onClose, 
  onSave, 
  selectedType 
}: ObjectiveModalProps) {
  const { currentWorkspace } = useWorkspace();
  const { user } = useUser();
  const [formData, setFormData] = useState<ObjectiveFormData>({
    title: '',
    description: '',
    type: 'COMPANY',
    groups: [],
    quarter: '2025-Q4',
    start_date: '',
    end_date: '',
    labels: [],
    stakeholders: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showNestedDropdown, setShowNestedDropdown] = useState(false);

  useEffect(() => {
    if (selectedType) {
      setFormData(prev => ({
        ...prev,
        type: selectedType.type
      }));
    }
  }, [selectedType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!currentWorkspace) {
      setError('No workspace selected');
      setLoading(false);
      return;
    }

    if (!user) {
      setError('User not found');
      setLoading(false);
      return;
    }

    try {
      const response = await apiFetch('/objectives', {
        method: 'POST',
        body: {
          ...formData,
          workspace_id: currentWorkspace.id,
          owner_id: user.id, // Use snake_case for backend
          // Convert arrays to strings for backend compatibility
          groups: formData.groups.join(','),
          labels: formData.labels.join(','),
          stakeholders: formData.stakeholders.join(','),
        }
      });
      onSave(response);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create objective');
    } finally {
      setLoading(false);
    }
  };

  const handleArrayInput = (field: 'groups' | 'labels' | 'stakeholders', value: string) => {
    const items = value.split(',').map(item => item.trim()).filter(item => item);
    setFormData(prev => ({
      ...prev,
      [field]: items
    }));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'COMPANY': return { icon: 'C', color: 'bg-blue-600' };
      case 'DEPARTMENT': return { icon: 'Dp', color: 'bg-blue-500' };
      case 'TEAM': return { icon: 'T', color: 'bg-blue-400' };
      case 'KPI': return { icon: 'KPI', color: 'bg-red-500' };
      default: return { icon: 'C', color: 'bg-blue-600' };
    }
  };

  const typeIcon = getTypeIcon(formData.type);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create new objective" size="xl">
      <div className="flex gap-6">
        {/* Main Content */}
        <div className="flex-1">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Type Badge */}
            <div className="flex items-center gap-2 mb-4">
              <div className={`w-8 h-8 ${typeIcon.color} rounded flex items-center justify-center text-white font-semibold text-sm`}>
                {typeIcon.icon}
              </div>
              <span className="text-lg font-semibold text-gray-900">Create new objective</span>
            </div>

            {/* Title */}
            <div>
              <Input
                label="Title"
                value={formData.title}
                onChange={(value) => setFormData(prev => ({ ...prev, title: value }))}
                placeholder="Title"
                required
                className="text-2xl font-semibold"
              />
            </div>

            {/* Description */}
            <Textarea
              label="Description"
              value={formData.description}
              onChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
              placeholder="Add a description..."
              rows={4}
            />

            {/* Add Nested Item */}
            <div className="relative">
              <button
                onClick={() => setShowNestedDropdown(!showNestedDropdown)}
                className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md bg-gray-50 hover:bg-gray-100 text-gray-700"
              >
                <span>Add nested item</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
              
              {showNestedDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                  <button
                    onClick={() => {
                      // Handle create objective
                      setShowNestedDropdown(false);
                    }}
                    className="w-full flex items-center px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center text-white font-semibold text-xs mr-3">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    <span className="text-gray-900 font-medium">Create objective</span>
                    <svg className="w-4 h-4 ml-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  
                  <button
                    onClick={() => {
                      // Handle create metric
                      setShowNestedDropdown(false);
                    }}
                    className="w-full flex items-center px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-6 h-6 bg-orange-500 rounded flex items-center justify-center text-white font-semibold text-xs mr-3">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    <span className="text-gray-900 font-medium">Create metric</span>
                    <svg className="w-4 h-4 ml-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              )}
              
              {/* Overlay to close dropdown when clicking outside */}
              {showNestedDropdown && (
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowNestedDropdown(false)}
                />
              )}
            </div>
          </form>
        </div>

        {/* Sidebar */}
        <div className="w-80 space-y-4">
          {/* Type & Owner Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-6 h-6 ${typeIcon.color} rounded flex items-center justify-center text-white font-semibold text-xs`}>
                {typeIcon.icon}
              </div>
              <span className="font-medium text-gray-900">{formData.type === 'TEAM' ? 'Team' : formData.type}</span>
            </div>
            
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-sm text-gray-600">Phuc Mai Nhan</span>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Groups</label>
              <div className="flex items-center gap-2">
                <div className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                  </svg>
                  tech
                </div>
              </div>
            </div>
          </div>

          {/* Details Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Interval</label>
                <Select
                  value={formData.quarter}
                  onChange={(value) => setFormData(prev => ({ ...prev, quarter: value }))}
                  options={[
                    { value: '2025-Q1', label: 'Q1 2025' },
                    { value: '2025-Q2', label: 'Q2 2025' },
                    { value: '2025-Q3', label: 'Q3 2025' },
                    { value: '2025-Q4', label: 'Q4 2025' },
                  ]}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dates</label>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>01 Oct 2025 - 31 Dec 2025</span>
                </div>
              </div>

              <div>
                <Input
                  label="Add label"
                  value={formData.labels.join(', ')}
                  onChange={(value) => handleArrayInput('labels', value)}
                  placeholder="Add label..."
                />
              </div>

              <div>
                <Input
                  label="Add stakeholder"
                  value={formData.stakeholders.join(', ')}
                  onChange={(value) => handleArrayInput('stakeholders', value)}
                  placeholder="Add stakeholder..."
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input type="checkbox" className="rounded" />
          Create another
        </label>
        
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={loading}
            onClick={handleSubmit}
          >
            Create
          </Button>
        </div>
      </div>
    </Modal>
  );
}
