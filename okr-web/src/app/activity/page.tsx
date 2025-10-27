"use client";
import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout';
import { apiFetch } from '@/lib/api';
import { clearTokens } from '@/lib/api';
import { logout } from '@/lib/auth';
import { useUser } from '@/contexts/UserContext';
import { Loading } from '@/components/Loading';
import { formatDate } from '@/lib/date-utils';

type Activity = {
  id: string;
  type: 'objective_created' | 'objective_updated' | 'key_result_created' | 'key_result_updated' | 'check_in' | 'comment';
  title: string;
  description: string;
  user_id: string;
  user_name: string;
  created_date: string;
  metadata?: any;
};

export default function ActivityLogPage() {
  const { user } = useUser();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    loadActivities();
  }, [filter]);

  const loadActivities = async () => {
    try {
      setLoading(true);
      const response = await apiFetch('/activity-log', {
        method: 'GET'
      });
      setActivities(response);
    } catch (e: any) {
      console.error('Failed to load activities:', e);
      setError(e.message || 'Failed to load activities');
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'objective_created': return '🎯';
      case 'objective_updated': return '📝';
      case 'key_result_created': return '📊';
      case 'key_result_updated': return '📈';
      case 'check_in': return '✅';
      case 'comment': return '💬';
      default: return '📋';
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'objective_created': return 'bg-blue-100 text-blue-800';
      case 'objective_updated': return 'bg-green-100 text-green-800';
      case 'key_result_created': return 'bg-purple-100 text-purple-800';
      case 'key_result_updated': return 'bg-orange-100 text-orange-800';
      case 'check_in': return 'bg-green-100 text-green-800';
      case 'comment': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredActivities = activities.filter(activity => {
    if (filter === 'all') return true;
    return activity.type === filter;
  });

  if (loading) {
    return (
      <Layout onLogout={logout}>
        <div className="flex items-center justify-center min-h-screen">
          <Loading />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout onLogout={logout}>
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error loading activities</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout onLogout={logout}>
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Activity Log</h1>
          <p className="mt-2 text-gray-600">
            Track all activities and changes across your OKR workspace
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'all' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Activities
            </button>
            <button
              onClick={() => setFilter('objective_created')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'objective_created' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Objectives
            </button>
            <button
              onClick={() => setFilter('key_result_created')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'key_result_created' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Key Results
            </button>
            <button
              onClick={() => setFilter('check_in')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'check_in' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Check-ins
            </button>
            <button
              onClick={() => setFilter('comment')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'comment' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Comments
            </button>
          </div>
        </div>

        {/* Activities List */}
        <div className="space-y-4">
          {filteredActivities.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📋</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No activities found</h3>
              <p className="text-gray-600">
                {filter === 'all' 
                  ? 'No activities have been recorded yet.' 
                  : `No ${filter.replace('_', ' ')} activities found.`
                }
              </p>
            </div>
          ) : (
            filteredActivities.map((activity) => (
              <div key={activity.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-lg">
                      {getActivityIcon(activity.type)}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-900">
                        {activity.title}
                      </h3>
                      <span className="text-xs text-gray-500">
                        {formatDate(activity.created_date)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {activity.description}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActivityColor(activity.type)}`}>
                          {activity.type.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        by {activity.user_name}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}

