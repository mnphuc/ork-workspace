"use client";
import React, { useState } from 'react';
import { formatDateTime } from '@/lib/date-utils';

interface Activity {
  id: string;
  type: 'created' | 'updated' | 'checkin' | 'comment' | 'status_change' | 'assigned' | 'aligned';
  title: string;
  description: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  timestamp: string;
  metadata?: {
    field?: string;
    old_value?: any;
    new_value?: any;
    checkin_id?: string;
    comment_id?: string;
    objective_id?: string;
  };
}

interface ActivityLogProps {
  activities: Activity[];
  onLoadMore?: () => void;
  hasMore?: boolean;
  loading?: boolean;
  className?: string;
}

export function ActivityLog({ 
  activities, 
  onLoadMore, 
  hasMore = false, 
  loading = false,
  className = "" 
}: ActivityLogProps) {
  const [expandedActivity, setExpandedActivity] = useState<string | null>(null);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'created': return '🎯';
      case 'updated': return '✏️';
      case 'checkin': return '📊';
      case 'comment': return '💬';
      case 'status_change': return '🔄';
      case 'assigned': return '👤';
      case 'aligned': return '🔗';
      default: return '📝';
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'created': return 'bg-green-100 text-green-800';
      case 'updated': return 'bg-blue-100 text-blue-800';
      case 'checkin': return 'bg-purple-100 text-purple-800';
      case 'comment': return 'bg-yellow-100 text-yellow-800';
      case 'status_change': return 'bg-orange-100 text-orange-800';
      case 'assigned': return 'bg-indigo-100 text-indigo-800';
      case 'aligned': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getActivityTitle = (activity: Activity) => {
    switch (activity.type) {
      case 'created':
        return 'Objective created';
      case 'updated':
        return activity.metadata?.field 
          ? `Updated ${activity.metadata.field}`
          : 'Objective updated';
      case 'checkin':
        return 'Check-in submitted';
      case 'comment':
        return 'Comment added';
      case 'status_change':
        return 'Status changed';
      case 'assigned':
        return 'Assigned to user';
      case 'aligned':
        return 'Objective aligned';
      default:
        return activity.title;
    }
  };

  const getActivityDescription = (activity: Activity) => {
    if (activity.description) {
      return activity.description;
    }

    switch (activity.type) {
      case 'status_change':
        return `Changed from "${activity.metadata?.old_value}" to "${activity.metadata?.new_value}"`;
      case 'updated':
        if (activity.metadata?.field && activity.metadata?.old_value !== undefined) {
          return `Changed ${activity.metadata.field} from "${activity.metadata.old_value}" to "${activity.metadata.new_value}"`;
        }
        return 'Updated objective details';
      case 'assigned':
        return `Assigned to ${activity.metadata?.new_value}`;
      case 'aligned':
        return `Aligned with ${activity.metadata?.new_value}`;
      default:
        return activity.description || 'No description available';
    }
  };

  const toggleExpanded = (activityId: string) => {
    setExpandedActivity(expandedActivity === activityId ? null : activityId);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Activity Log</h3>
        <span className="text-sm text-gray-500">
          {activities.length} activities
        </span>
      </div>

      {/* Activities List */}
      <div className="space-y-3">
        {activities.map((activity) => {
          const isExpanded = expandedActivity === activity.id;
          const hasMetadata = activity.metadata && Object.keys(activity.metadata).length > 0;
          
          return (
            <div
              key={activity.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start space-x-3">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {activity.user_avatar ? (
                    <img
                      src={activity.user_avatar}
                      alt={activity.user_name}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600">
                        {activity.user_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-lg">{getActivityIcon(activity.type)}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActivityColor(activity.type)}`}>
                      {getActivityTitle(activity)}
                    </span>
                    <span className="text-sm text-gray-500">
                      {formatDateTime(activity.timestamp)}
                    </span>
                  </div>

                  <div className="text-sm text-gray-700 mb-2">
                    <span className="font-medium">{activity.user_name}</span>
                    {' '}
                    {getActivityDescription(activity)}
                  </div>

                  {/* Metadata */}
                  {hasMetadata && (
                    <div className="mt-2">
                      <button
                        onClick={() => toggleExpanded(activity.id)}
                        className="text-sm text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                      >
                        <span>{isExpanded ? 'Hide' : 'Show'} details</span>
                        <span className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                          ▼
                        </span>
                      </button>

                      {isExpanded && (
                        <div className="mt-2 p-3 bg-gray-50 rounded-md">
                          <div className="text-xs text-gray-600 space-y-1">
                            {activity.metadata?.field && (
                              <div>
                                <span className="font-medium">Field:</span> {activity.metadata.field}
                              </div>
                            )}
                            {activity.metadata?.old_value !== undefined && (
                              <div>
                                <span className="font-medium">Previous:</span> {String(activity.metadata.old_value)}
                              </div>
                            )}
                            {activity.metadata?.new_value !== undefined && (
                              <div>
                                <span className="font-medium">New:</span> {String(activity.metadata.new_value)}
                              </div>
                            )}
                            {activity.metadata?.checkin_id && (
                              <div>
                                <span className="font-medium">Check-in ID:</span> {activity.metadata.checkin_id}
                              </div>
                            )}
                            {activity.metadata?.comment_id && (
                              <div>
                                <span className="font-medium">Comment ID:</span> {activity.metadata.comment_id}
                              </div>
                            )}
                            {activity.metadata?.objective_id && (
                              <div>
                                <span className="font-medium">Objective ID:</span> {activity.metadata.objective_id}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Load More */}
      {hasMore && (
        <div className="text-center">
          <button
            onClick={onLoadMore}
            disabled={loading}
            className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Loading...' : 'Load More Activities'}
          </button>
        </div>
      )}

      {/* Empty State */}
      {activities.length === 0 && (
        <div className="text-center py-8">
          <div className="text-gray-400 text-4xl mb-4">📝</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No activities yet</h3>
          <p className="text-gray-500">
            Activities will appear here as users interact with this objective
          </p>
        </div>
      )}

      {/* Activity Summary */}
      {activities.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Activity Summary</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="font-semibold text-green-600">
                {activities.filter(a => a.type === 'created').length}
              </div>
              <div className="text-gray-500">Created</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-blue-600">
                {activities.filter(a => a.type === 'updated').length}
              </div>
              <div className="text-gray-500">Updated</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-purple-600">
                {activities.filter(a => a.type === 'checkin').length}
              </div>
              <div className="text-gray-500">Check-ins</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-yellow-600">
                {activities.filter(a => a.type === 'comment').length}
              </div>
              <div className="text-gray-500">Comments</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

