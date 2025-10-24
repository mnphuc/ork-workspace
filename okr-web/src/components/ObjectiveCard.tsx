import React from 'react';

interface ObjectiveCardProps {
  objective: {
    id: string;
    title: string;
    description: string;
    status: string;
    progress: number;
    owner_id: string;
    team_id: string;
    quarter: string;
    created_date: string;
    last_modified_date: string;
  };
  onViewDetails?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function ObjectiveCard({ objective, onViewDetails, onEdit, onDelete }: ObjectiveCardProps) {
  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'not_started': return 'bg-gray-100 text-gray-800';
      case 'at_risk': return 'bg-red-100 text-red-800';
      case 'behind': return 'bg-yellow-100 text-yellow-800';
      case 'on_track': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-blue-100 text-blue-800';
      case 'abandoned': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressColor = (progress: number): string => {
    if (progress >= 70) return 'bg-green-500';
    if (progress >= 30) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-4 space-y-4 lg:space-y-0">
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{objective.title}</h3>
            <span className={`px-3 py-1 rounded-full text-xs font-medium w-fit ${getStatusColor(objective.status)}`}>
              {objective.status.replace('_', ' ')}
            </span>
          </div>
          <p className="text-gray-600 mb-4 line-clamp-2 text-sm sm:text-base">{objective.description}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500">
            <span>Q{objective.quarter}</span>
            <span>Owner: {objective.owner_id}</span>
            <span>Team: {objective.team_id}</span>
            <span>Updated: {new Date(objective.last_modified_date).toLocaleDateString()}</span>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end space-y-2 sm:space-y-0 sm:space-x-4 lg:space-x-0 lg:space-y-3">
          <div className="text-left sm:text-center lg:text-right">
            <div className="text-xl sm:text-2xl font-bold text-gray-900">{objective.progress}%</div>
            <div className="text-xs sm:text-sm text-gray-500">Progress</div>
          </div>
          <div className="w-full sm:w-24">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(objective.progress)}`}
                style={{ width: `${Math.min(objective.progress, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
        {onViewDetails && (
          <button 
            onClick={() => onViewDetails(objective.id)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium py-2 px-3 rounded-md hover:bg-blue-50 min-h-[44px]"
          >
            View Details
          </button>
        )}
        {onEdit && (
          <button 
            onClick={() => onEdit(objective.id)}
            className="text-gray-600 hover:text-gray-800 text-sm font-medium py-2 px-3 rounded-md hover:bg-gray-50 min-h-[44px]"
          >
            Edit
          </button>
        )}
        {onDelete && (
          <button 
            onClick={() => onDelete(objective.id)}
            className="text-red-600 hover:text-red-800 text-sm font-medium py-2 px-3 rounded-md hover:bg-red-50 min-h-[44px]"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}

