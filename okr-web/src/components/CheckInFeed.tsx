"use client";
import React, { useState } from 'react';
import { formatDateTime } from '@/lib/date-utils';

interface CheckIn {
  id: string;
  key_result_id: string;
  value: number;
  note?: string;
  created_by: string;
  created_date: string;
  last_modified_date: string;
}

interface KeyResult {
  id: string;
  title: string;
  metric_type: string;
  unit: string;
  target_value: number;
  current_value: number;
  objective_id: string;
  objective_title: string;
}

interface CheckInFeedProps {
  checkIns: CheckIn[];
  keyResults: KeyResult[];
  onOpenCheckInForm: (keyResult: KeyResult) => void;
}

export function CheckInFeed({ checkIns, keyResults, onOpenCheckInForm }: CheckInFeedProps) {
  const [filter, setFilter] = useState<'all' | 'recent' | 'my'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Get key result info for each check-in
  const getKeyResultInfo = (keyResultId: string) => {
    return keyResults.find(kr => kr.id === keyResultId);
  };

  // Filter check-ins based on current filter
  const getFilteredCheckIns = () => {
    let filtered = checkIns;

    if (filter === 'recent') {
      // Show only last 7 days
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      filtered = checkIns.filter(ci => new Date(ci.created_date) > weekAgo);
    } else if (filter === 'my') {
      // Show only current user's check-ins
      const currentUser = localStorage.getItem('user_email') || 'system';
      filtered = checkIns.filter(ci => ci.created_by === currentUser);
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(ci => {
        const keyResult = getKeyResultInfo(ci.key_result_id);
        return keyResult?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
               ci.note?.toLowerCase().includes(searchTerm.toLowerCase()) ||
               ci.created_by.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }

    return filtered;
  };

  const formatValue = (value: number, metricType: string, unit: string): string => {
    switch (metricType) {
      case 'CURRENCY':
        return `$${value.toLocaleString()}`;
      case 'PERCENT':
        return `${value}%`;
      case 'BOOLEAN':
        return value === 1 ? 'Yes' : 'No';
      default:
        return `${value} ${unit}`;
    }
  };

  const getStatusColor = (value: number, target: number, metricType: string): string => {
    if (metricType === 'BOOLEAN') {
      return value === 1 ? 'text-green-600' : 'text-red-600';
    }
    
    const percentage = (value / target) * 100;
    if (percentage >= 100) return 'text-green-600';
    if (percentage >= 75) return 'text-blue-600';
    if (percentage >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const filteredCheckIns = getFilteredCheckIns();

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="flex space-x-2">
              {[
                { key: 'all', label: 'All Check-ins' },
                { key: 'recent', label: 'Recent (7 days)' },
                { key: 'my', label: 'My Check-ins' }
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key as any)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    filter === key
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search check-ins..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Check-ins List */}
      <div className="space-y-4">
        {filteredCheckIns.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="text-gray-400 text-6xl mb-4">📊</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No check-ins found</h3>
            <p className="text-gray-500 mb-6">
              {filter === 'all' 
                ? "No check-ins have been made yet. Start by creating your first check-in."
                : "No check-ins match your current filter. Try adjusting your search or filter."
              }
            </p>
            <button
              onClick={() => onOpenCheckInForm(keyResults[0])}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              disabled={keyResults.length === 0}
            >
              Create First Check-in
            </button>
          </div>
        ) : (
          filteredCheckIns.map((checkIn) => {
            const keyResult = getKeyResultInfo(checkIn.key_result_id);
            if (!keyResult) return null;

            return (
              <div key={checkIn.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-4 lg:space-y-0">
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mb-3">
                      <h4 className="text-lg font-semibold text-gray-900">{keyResult.title}</h4>
                      <span className="text-sm text-gray-500">• {keyResult.objective_title}</span>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl font-bold text-gray-900">
                          {formatValue(checkIn.value, keyResult.metric_type, keyResult.unit)}
                        </span>
                        <span className={`text-sm font-medium ${getStatusColor(checkIn.value, keyResult.target_value, keyResult.metric_type)}`}>
                          ({Math.round((checkIn.value / keyResult.target_value) * 100)}% of target)
                        </span>
                      </div>
                    </div>

                    {checkIn.note && (
                      <div className="bg-gray-50 rounded-lg p-3 mb-3">
                        <p className="text-sm text-gray-700">{checkIn.note}</p>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm text-gray-500">
                      <div className="flex items-center space-x-4">
                        <span>by {checkIn.created_by}</span>
                        <span>•</span>
                        <span>{formatDateTime(checkIn.created_date)}</span>
                      </div>
                      <div className="flex items-center space-x-2 mt-2 sm:mt-0">
                        <button
                          onClick={() => onOpenCheckInForm(keyResult)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Update
                        </button>
                        <span>•</span>
                        <button className="text-gray-600 hover:text-gray-800 text-sm font-medium">
                          View History
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Load More Button */}
      {filteredCheckIns.length > 0 && (
        <div className="text-center">
          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            Load More Check-ins
          </button>
        </div>
      )}
    </div>
  );
}

