"use client";
import React, { useState, useEffect } from 'react';

interface Interval {
  id: string;
  name: string;
  type: 'quarter' | 'month' | 'custom';
  start_date: string;
  end_date: string;
  is_active: boolean;
  workspace_id: string;
}

interface IntervalsConfigProps {
  intervals: Interval[];
  onSave: (intervals: Interval[]) => void;
  onAdd: (interval: Omit<Interval, 'id'>) => void;
  onUpdate: (id: string, interval: Partial<Interval>) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string) => void;
  isLoading?: boolean;
  className?: string;
}

export function IntervalsConfig({ 
  intervals, 
  onSave, 
  onAdd, 
  onUpdate, 
  onDelete, 
  onToggleActive,
  isLoading = false,
  className = "" 
}: IntervalsConfigProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newInterval, setNewInterval] = useState({
    name: '',
    type: 'quarter' as const,
    start_date: '',
    end_date: '',
    is_active: true,
    workspace_id: '',
  });

  const handleAddInterval = () => {
    if (newInterval.name && newInterval.start_date && newInterval.end_date) {
      onAdd(newInterval);
      setNewInterval({
        name: '',
        type: 'quarter',
        start_date: '',
        end_date: '',
        is_active: true,
        workspace_id: '',
      });
      setShowAddForm(false);
    }
  };

  const handleUpdateInterval = (id: string, field: keyof Interval, value: any) => {
    onUpdate(id, { [field]: value });
    if (field === 'name' || field === 'start_date' || field === 'end_date') {
      setEditingId(null);
    }
  };

  const getQuarterDates = (quarter: string, year: number) => {
    const quarters = {
      'Q1': { start: `01-01`, end: `03-31` },
      'Q2': { start: `04-01`, end: `06-30` },
      'Q3': { start: `07-01`, end: `09-30` },
      'Q4': { start: `10-01`, end: `12-31` },
    };
    
    const q = quarters[quarter as keyof typeof quarters];
    if (q) {
      return {
        start: `${year}-${q.start}`,
        end: `${year}-${q.end}`,
      };
    }
    return { start: '', end: '' };
  };

  const generateQuarterIntervals = (year: number) => {
    const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
    quarters.forEach(quarter => {
      const dates = getQuarterDates(quarter, year);
      onAdd({
        name: `${quarter} ${year}`,
        type: 'quarter',
        start_date: dates.start,
        end_date: dates.end,
        is_active: true,
        workspace_id: '',
      });
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isDateValid = (startDate: string, endDate: string) => {
    return new Date(startDate) < new Date(endDate);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Time Intervals</h3>
          <p className="text-sm text-gray-600">
            Configure quarters and custom time periods for your objectives
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => generateQuarterIntervals(new Date().getFullYear())}
            disabled={isLoading}
            className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50"
          >
            Generate Q1-Q4
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            disabled={isLoading}
            className="px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            Add Interval
          </button>
        </div>
      </div>

      {/* Add Interval Form */}
      {showAddForm && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-4">
          <h4 className="font-medium text-gray-900">Add New Interval</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                value={newInterval.name}
                onChange={(e) => setNewInterval(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Q1 2024, Sprint 1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                value={newInterval.type}
                onChange={(e) => setNewInterval(prev => ({ ...prev, type: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="quarter">Quarter</option>
                <option value="month">Month</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={newInterval.start_date}
                onChange={(e) => setNewInterval(prev => ({ ...prev, start_date: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={newInterval.end_date}
                onChange={(e) => setNewInterval(prev => ({ ...prev, end_date: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={newInterval.is_active}
                onChange={(e) => setNewInterval(prev => ({ ...prev, is_active: e.target.checked }))}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Active</span>
            </label>
          </div>
          
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setShowAddForm(false)}
              className="px-3 py-2 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={handleAddInterval}
              disabled={!newInterval.name || !newInterval.start_date || !newInterval.end_date || 
                       !isDateValid(newInterval.start_date, newInterval.end_date)}
              className="px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Interval
            </button>
          </div>
        </div>
      )}

      {/* Intervals List */}
      <div className="space-y-3">
        {intervals.length > 0 ? (
          intervals.map((interval) => (
            <div key={interval.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <div className="flex-1">
                      {editingId === interval.id ? (
                        <input
                          type="text"
                          value={interval.name}
                          onChange={(e) => handleUpdateInterval(interval.id, 'name', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          onBlur={() => setEditingId(null)}
                          onKeyPress={(e) => e.key === 'Enter' && setEditingId(null)}
                          autoFocus
                        />
                      ) : (
                        <h4 
                          className="font-medium text-gray-900 cursor-pointer hover:text-blue-600"
                          onClick={() => setEditingId(interval.id)}
                        >
                          {interval.name}
                        </h4>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        interval.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {interval.is_active ? 'Active' : 'Inactive'}
                      </span>
                      
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        {interval.type}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-2 text-sm text-gray-600">
                    {formatDate(interval.start_date)} - {formatDate(interval.end_date)}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => onToggleActive(interval.id)}
                    className={`px-2 py-1 text-xs rounded ${
                      interval.is_active
                        ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {interval.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                  
                  <button
                    onClick={() => onDelete(interval.id)}
                    className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-400 text-4xl mb-4">📅</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No intervals configured</h3>
            <p className="text-gray-500 mb-4">
              Create time intervals to organize your objectives by quarters or custom periods
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Add First Interval
            </button>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      {intervals.length > 0 && (
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Quick Actions</h4>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => generateQuarterIntervals(new Date().getFullYear() + 1)}
              className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
            >
              Generate Next Year Quarters
            </button>
            <button
              onClick={() => intervals.forEach(interval => onToggleActive(interval.id))}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              Toggle All Active/Inactive
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

