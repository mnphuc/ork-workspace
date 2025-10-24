"use client";
import React, { memo, useMemo } from 'react';

interface CheckInData {
  id: string;
  value: number;
  note: string;
  created_date: string;
  created_by: string;
}

interface CheckInHistoryChartProps {
  keyResultId: string;
  checkIns: CheckInData[];
  metricType: string;
  unit: string;
}

export const CheckInHistoryChart = memo(function CheckInHistoryChart({ 
  keyResultId, 
  checkIns, 
  metricType, 
  unit 
}: CheckInHistoryChartProps) {
  if (checkIns.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Check-in History</h3>
        <div className="text-center py-6 sm:py-8 text-gray-500">
          <div className="text-3xl sm:text-4xl mb-2">📊</div>
          <p className="text-sm sm:text-base">No check-ins yet</p>
          <p className="text-xs sm:text-sm">Start tracking progress to see your history</p>
        </div>
      </div>
    );
  }

  const formatValue = useMemo(() => (value: number): string => {
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
  }, [metricType, unit]);

  const formatDate = useMemo(() => (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }, []);

  // Sort check-ins by date (oldest first for chart)
  const sortedCheckIns = useMemo(() => 
    [...checkIns].sort((a, b) => 
      new Date(a.created_date).getTime() - new Date(b.created_date).getTime()
    ), [checkIns]
  );

  const maxValue = useMemo(() => Math.max(...checkIns.map(ci => ci.value)), [checkIns]);
  const minValue = useMemo(() => Math.min(...checkIns.map(ci => ci.value)), [checkIns]);
  const valueRange = maxValue - minValue || 1;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Check-in History</h3>
      
      {/* Chart */}
      <div className="mb-4 sm:mb-6">
        <div className="h-32 sm:h-48 flex items-end justify-between space-x-1 bg-gray-50 rounded-lg p-2 sm:p-4 overflow-x-auto">
          {sortedCheckIns.map((checkIn, index) => {
            const height = ((checkIn.value - minValue) / valueRange) * 100;
            const isLatest = index === sortedCheckIns.length - 1;
            
            return (
              <div key={checkIn.id} className="flex flex-col items-center flex-1 min-w-[32px]">
                <div className="relative group">
                  <div
                    className={`w-6 sm:w-8 rounded-t transition-all duration-300 ${
                      isLatest ? 'bg-blue-600' : 'bg-blue-400'
                    } hover:bg-blue-700 cursor-pointer`}
                    style={{ height: `${Math.max(height, 8)}%` }}
                    title={`${formatValue(checkIn.value)} - ${formatDate(checkIn.created_date)}`}
                  />
                  
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    <div className="font-medium">{formatValue(checkIn.value)}</div>
                    <div className="text-gray-300">{formatDate(checkIn.created_date)}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Chart Legend */}
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span className="truncate">{formatValue(minValue)}</span>
          <span className="truncate">{formatValue(maxValue)}</span>
        </div>
      </div>

      {/* Recent Check-ins List */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-700">Recent Check-ins</h4>
        {checkIns.slice(0, 5).map((checkIn) => (
          <div key={checkIn.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-gray-50 rounded-lg space-y-2 sm:space-y-0">
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-3">
                <span className="text-base sm:text-lg font-semibold text-gray-900">
                  {formatValue(checkIn.value)}
                </span>
                <span className="text-xs sm:text-sm text-gray-500">
                  {formatDate(checkIn.created_date)}
                </span>
              </div>
              {checkIn.note && (
                <p className="text-xs sm:text-sm text-gray-600 mt-1">{checkIn.note}</p>
              )}
            </div>
            <div className="text-xs text-gray-400">
              by {checkIn.created_by}
            </div>
          </div>
        ))}
        
        {checkIns.length > 5 && (
          <div className="text-center">
            <span className="text-sm text-gray-500">
              +{checkIns.length - 5} more check-ins
            </span>
          </div>
        )}
      </div>
    </div>
  );
});
