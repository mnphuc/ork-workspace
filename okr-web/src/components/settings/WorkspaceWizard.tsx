"use client";
import React, { useState } from 'react';
import { apiFetch } from '@/lib/api';

interface WorkspaceData {
  name: string;
  description: string;
  settings: string;
}

interface GroupData {
  name: string;
  description: string;
  groupType: string;
  settings: string;
}

interface IntervalData {
  name: string;
  description: string;
  intervalType: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  settings: string;
}

interface WorkspaceWizardProps {
  onComplete: (workspaceId: string) => void;
  onCancel: () => void;
  isLoading: boolean;
}

export function WorkspaceWizard({ onComplete, onCancel, isLoading }: WorkspaceWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [workspaceData, setWorkspaceData] = useState<WorkspaceData>({
    name: '',
    description: '',
    settings: '{}'
  });
  const [groupsData, setGroupsData] = useState<GroupData[]>([]);
  const [intervalsData, setIntervalsData] = useState<IntervalData[]>([]);
  const [error, setError] = useState<string | null>(null);

  const steps = [
    { id: 1, title: 'Workspace Info', description: 'Basic workspace information' },
    { id: 2, title: 'Groups', description: 'Create teams and departments' },
    { id: 3, title: 'Time Intervals', description: 'Set up quarters and periods' },
    { id: 4, title: 'Review', description: 'Review and create workspace' }
  ];

  const handleWorkspaceSubmit = (data: WorkspaceData) => {
    setWorkspaceData(data);
    setCurrentStep(2);
  };

  const handleGroupsSubmit = (groups: GroupData[]) => {
    setGroupsData(groups);
    setCurrentStep(3);
  };

  const handleIntervalsSubmit = (intervals: IntervalData[]) => {
    setIntervalsData(intervals);
    setCurrentStep(4);
  };

  const handleCreateWorkspace = async () => {
    try {
      setError(null);
      
      // Step 1: Create workspace
      const workspace = await apiFetch('/workspaces', {
        method: 'POST',
        body: {
          name: workspaceData.name,
          description: workspaceData.description,
          settings: workspaceData.settings
        }
      });

      const workspaceId = workspace.id;

      // Step 2: Create groups
      for (const group of groupsData) {
        await apiFetch('/groups', {
          method: 'POST',
          body: {
            name: group.name,
            description: group.description,
            workspace_id: workspaceId,
            group_type: group.groupType,
            settings: group.settings
          }
        });
      }

      // Step 3: Create intervals
      for (const interval of intervalsData) {
        await apiFetch('/intervals', {
          method: 'POST',
          body: {
            name: interval.name,
            description: interval.description,
            workspace_id: workspaceId,
            interval_type: interval.intervalType,
            start_date: interval.startDate,
            end_date: interval.endDate,
            is_active: interval.isActive,
            settings: interval.settings
          }
        });
      }

      onComplete(workspaceId);
    } catch (e: any) {
      setError(e.message || 'Failed to create workspace');
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <WorkspaceInfoStep
            data={workspaceData}
            onSubmit={handleWorkspaceSubmit}
            onCancel={onCancel}
          />
        );
      case 2:
        return (
          <GroupsStep
            data={groupsData}
            onSubmit={handleGroupsSubmit}
            onBack={() => setCurrentStep(1)}
            onCancel={onCancel}
          />
        );
      case 3:
        return (
          <IntervalsStep
            data={intervalsData}
            onSubmit={handleIntervalsSubmit}
            onBack={() => setCurrentStep(2)}
            onCancel={onCancel}
          />
        );
      case 4:
        return (
          <ReviewStep
            workspaceData={workspaceData}
            groupsData={groupsData}
            intervalsData={intervalsData}
            onCreate={handleCreateWorkspace}
            onBack={() => setCurrentStep(3)}
            onCancel={onCancel}
            isLoading={isLoading}
            error={error}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
              currentStep >= step.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-600'
            }`}>
              {step.id}
            </div>
            <div className="ml-3">
              <div className={`text-sm font-medium ${
                currentStep >= step.id ? 'text-blue-600' : 'text-gray-500'
              }`}>
                {step.title}
              </div>
              <div className="text-xs text-gray-500">{step.description}</div>
            </div>
            {index < steps.length - 1 && (
              <div className={`w-16 h-0.5 mx-4 ${
                currentStep > step.id ? 'bg-blue-600' : 'bg-gray-200'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="border-t border-gray-200 pt-6">
        {renderStepContent()}
      </div>
    </div>
  );
}

// Step 1: Workspace Info
function WorkspaceInfoStep({ 
  data, 
  onSubmit, 
  onCancel 
}: { 
  data: WorkspaceData; 
  onSubmit: (data: WorkspaceData) => void; 
  onCancel: () => void; 
}) {
  const [formData, setFormData] = useState(data);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Workspace Information</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Workspace Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter workspace name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              required
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe the purpose and scope of this workspace"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          Next: Groups
        </button>
      </div>
    </form>
  );
}

// Step 2: Groups
function GroupsStep({ 
  data, 
  onSubmit, 
  onBack, 
  onCancel 
}: { 
  data: GroupData[]; 
  onSubmit: (groups: GroupData[]) => void; 
  onBack: () => void; 
  onCancel: () => void; 
}) {
  const [groups, setGroups] = useState<GroupData[]>(data.length > 0 ? data : [
    { name: '', description: '', groupType: 'TEAM', settings: '{}' }
  ]);

  const addGroup = () => {
    setGroups(prev => [...prev, { name: '', description: '', groupType: 'TEAM', settings: '{}' }]);
  };

  const removeGroup = (index: number) => {
    if (groups.length > 1) {
      setGroups(prev => prev.filter((_, i) => i !== index));
    }
  };

  const updateGroup = (index: number, field: keyof GroupData, value: string | boolean) => {
    setGroups(prev => prev.map((group, i) => 
      i === index ? { ...group, [field]: value } : group
    ));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validGroups = groups.filter(group => group.name.trim() !== '');
    onSubmit(validGroups);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Groups & Teams</h3>
          <button
            type="button"
            onClick={addGroup}
            className="px-3 py-1 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100"
          >
            + Add Group
          </button>
        </div>

        <div className="space-y-4">
          {groups.map((group, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-900">Group {index + 1}</h4>
                {groups.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeGroup(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Group Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={group.name}
                    onChange={(e) => updateGroup(index, 'name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Engineering Team"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Group Type
                  </label>
                  <select
                    value={group.groupType}
                    onChange={(e) => updateGroup(index, 'groupType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="TEAM">Team</option>
                    <option value="DEPARTMENT">Department</option>
                    <option value="PROJECT">Project</option>
                    <option value="COMMITTEE">Committee</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    value={group.description}
                    onChange={(e) => updateGroup(index, 'description', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe this group's purpose"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Back
        </button>
        <div className="space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Next: Intervals
          </button>
        </div>
      </div>
    </form>
  );
}

// Step 3: Intervals
function IntervalsStep({ 
  data, 
  onSubmit, 
  onBack, 
  onCancel 
}: { 
  data: IntervalData[]; 
  onSubmit: (intervals: IntervalData[]) => void; 
  onBack: () => void; 
  onCancel: () => void; 
}) {
  const [intervals, setIntervals] = useState<IntervalData[]>(data.length > 0 ? data : [
    { 
      name: 'Q1 2025', 
      description: 'First Quarter 2025', 
      intervalType: 'QUARTER', 
      startDate: '2025-01-01', 
      endDate: '2025-03-31', 
      isActive: true, 
      settings: '{}' 
    }
  ]);

  const addInterval = () => {
    setIntervals(prev => [...prev, { 
      name: '', 
      description: '', 
      intervalType: 'QUARTER', 
      startDate: '', 
      endDate: '', 
      isActive: false, 
      settings: '{}' 
    }]);
  };

  const removeInterval = (index: number) => {
    if (intervals.length > 1) {
      setIntervals(prev => prev.filter((_, i) => i !== index));
    }
  };

  const updateInterval = (index: number, field: keyof IntervalData, value: string | boolean) => {
    setIntervals(prev => prev.map((interval, i) => 
      i === index ? { ...interval, [field]: value } : interval
    ));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validIntervals = intervals.filter(interval => 
      interval.name.trim() !== '' && interval.startDate && interval.endDate
    );
    onSubmit(validIntervals);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Time Intervals</h3>
          <button
            type="button"
            onClick={addInterval}
            className="px-3 py-1 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100"
          >
            + Add Interval
          </button>
        </div>

        <div className="space-y-4">
          {intervals.map((interval, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-900">Interval {index + 1}</h4>
                {intervals.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeInterval(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Interval Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={interval.name}
                    onChange={(e) => updateInterval(index, 'name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Q1 2025"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Interval Type
                  </label>
                  <select
                    value={interval.intervalType}
                    onChange={(e) => updateInterval(index, 'intervalType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="QUARTER">Quarter</option>
                    <option value="MONTH">Month</option>
                    <option value="YEAR">Year</option>
                    <option value="CUSTOM">Custom</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={interval.startDate}
                    onChange={(e) => updateInterval(index, 'startDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={interval.endDate}
                    onChange={(e) => updateInterval(index, 'endDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    value={interval.description}
                    onChange={(e) => updateInterval(index, 'description', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe this interval"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={interval.isActive}
                      onChange={(e) => updateInterval(index, 'isActive', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Active interval</span>
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Back
        </button>
        <div className="space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Next: Review
          </button>
        </div>
      </div>
    </form>
  );
}

// Step 4: Review
function ReviewStep({ 
  workspaceData, 
  groupsData, 
  intervalsData, 
  onCreate, 
  onBack, 
  onCancel, 
  isLoading, 
  error 
}: { 
  workspaceData: WorkspaceData; 
  groupsData: GroupData[]; 
  intervalsData: IntervalData[]; 
  onCreate: () => void; 
  onBack: () => void; 
  onCancel: () => void; 
  isLoading: boolean; 
  error: string | null; 
}) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Review & Create</h3>
        
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="space-y-6">
          {/* Workspace Info */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Workspace</h4>
            <p className="text-sm text-gray-600"><strong>Name:</strong> {workspaceData.name}</p>
            <p className="text-sm text-gray-600"><strong>Description:</strong> {workspaceData.description}</p>
          </div>

          {/* Groups */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Groups ({groupsData.length})</h4>
            {groupsData.length > 0 ? (
              <div className="space-y-2">
                {groupsData.map((group, index) => (
                  <div key={index} className="text-sm text-gray-600">
                    <strong>{group.name}</strong> - {group.groupType}
                    {group.description && <span className="ml-2">({group.description})</span>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No groups</p>
            )}
          </div>

          {/* Intervals */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Time Intervals ({intervalsData.length})</h4>
            {intervalsData.length > 0 ? (
              <div className="space-y-2">
                {intervalsData.map((interval, index) => (
                  <div key={index} className="text-sm text-gray-600">
                    <strong>{interval.name}</strong> - {interval.intervalType}
                    <span className="ml-2">({interval.startDate} to {interval.endDate})</span>
                    {interval.isActive && <span className="ml-2 text-green-600">• Active</span>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No intervals</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Back
        </button>
        <div className="space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onCreate}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Creating...' : 'Create Workspace'}
          </button>
        </div>
      </div>
    </div>
  );
}

