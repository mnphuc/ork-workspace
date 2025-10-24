import React, { memo } from 'react';

interface KeyResultItemProps {
  keyResult: {
    id: string;
    title: string;
    metric_type: string;
    unit: string;
    target_value: number;
    current_value: number;
    objective_id: string;
    created_date: string;
    last_modified_date: string;
  };
  onCheckIn?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  showActions?: boolean;
}

export const KeyResultItem = memo(function KeyResultItem({ 
  keyResult, 
  onCheckIn, 
  onEdit, 
  onDelete, 
  showActions = true 
}: KeyResultItemProps) {
  const progress = keyResult.target_value > 0 
    ? Math.min((keyResult.current_value / keyResult.target_value) * 100, 100)
    : 0;

  const getProgressColor = (progress: number): string => {
    if (progress >= 70) return 'bg-green-500';
    if (progress >= 30) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const formatValue = (value: number, metricType: string, unit: string): string => {
    switch (metricType) {
      case 'CURRENCY':
        return `$${value.toLocaleString()}`;
      case 'PERCENT':
        return `${value}%`;
      case 'NUMBER':
        return `${value} ${unit}`;
      case 'BOOLEAN':
        return value === 1 ? 'Yes' : 'No';
      default:
        return `${value} ${unit}`;
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 hover:bg-gray-50 transition-colors">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-4 lg:space-y-0">
        <div className="flex-1">
          <h4 className="text-md font-medium text-gray-900 mb-2">{keyResult.title}</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 mb-3">
            <span>
              Current: <span className="font-medium">{formatValue(keyResult.current_value, keyResult.metric_type, keyResult.unit)}</span>
            </span>
            <span>
              Target: <span className="font-medium">{formatValue(keyResult.target_value, keyResult.metric_type, keyResult.unit)}</span>
            </span>
            <span>
              Progress: <span className="font-medium">{progress.toFixed(1)}%</span>
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(progress)}`}
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
        
        {showActions && (
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 lg:ml-4">
            {onCheckIn && (
              <button
                onClick={() => onCheckIn(keyResult.id)}
                className="px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors min-h-[44px]"
              >
                Check-in
              </button>
            )}
            {onEdit && (
              <button
                onClick={() => onEdit(keyResult.id)}
                className="px-3 py-2 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700 transition-colors min-h-[44px]"
              >
                Edit
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(keyResult.id)}
                className="px-3 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors min-h-[44px]"
              >
                Delete
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

