"use client";
import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout';
import { WorkspaceRequired } from '@/components/WorkspaceRequired';
import { apiFetch } from '@/lib/api';
import { clearTokens } from '@/lib/api';
import { logout } from '@/lib/auth';
import { useTranslation } from 'react-i18next';
import { formatDate } from '@/lib/date-utils';

interface HomeSummary {
  personal_progress: number;
  metrics_progress: number;
  last_week_change: number;
  status_distribution: {
    not_started: number;
    at_risk: number;
    behind: number;
    on_track: number;
    closed: number;
    abandoned: number;
  };
}

interface PersonalObjective {
  id: string;
  title: string;
  progress: number;
  status: string;
  last_check_in?: string;
  due_date?: string;
  owner: string;
}

interface GroupInfo {
  id: string;
  name: string;
  objectives_count: number;
  metrics_count: number;
  avg_objectives_progress: number;
  avg_metrics_progress: number;
}

function HomeContent() {
  const { t } = useTranslation();
  const [summary, setSummary] = useState<HomeSummary | null>(null);
  const [personalObjectives, setPersonalObjectives] = useState<PersonalObjective[]>([]);
  const [groups, setGroups] = useState<GroupInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      window.location.href = '/login';
      return;
    }
    
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load home summary data
      const summaryData = await apiFetch<HomeSummary>('/home/summary');
      setSummary(summaryData);
      
      // Load personal objectives
      const objectivesData = await apiFetch<PersonalObjective[]>('/home/personal-objectives');
      setPersonalObjectives(objectivesData);
      
      // Load group information
      const groupsData = await apiFetch<GroupInfo[]>('/home/groups');
      setGroups(groupsData);
    } catch (e: any) {
      setError(e.message || 'Failed to load home data');
      if (e.message.includes('Authentication failed')) {
        clearTokens();
        window.location.href = '/login';
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'on track':
        return 'text-green-600 bg-green-100';
      case 'behind':
        return 'text-red-600 bg-red-100';
      case 'at risk':
        return 'text-yellow-600 bg-yellow-100';
      case 'not started':
        return 'text-gray-600 bg-gray-100';
      case 'closed':
        return 'text-blue-600 bg-blue-100';
      case 'abandoned':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getProgressColor = (progress: number): string => {
    if (progress >= 100) return 'bg-green-500';
    if (progress >= 75) return 'bg-blue-500';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading home...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={loadHomeData}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Home</h1>
          <div className="text-sm text-gray-500">
            Last updated: {formatDate(new Date())}
          </div>
        </div>

        {/* Progress Overview */}
        {summary && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Objectives' Progress</h3>
              <p className="text-2xl font-bold text-gray-900">{summary.personal_progress}%</p>
            </div>
            
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Metrics Progress</h3>
              <p className="text-2xl font-bold text-gray-900">{summary.metrics_progress}%</p>
            </div>
            
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Last Week Change</h3>
              <p className={`text-2xl font-bold ${summary.last_week_change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {summary.last_week_change >= 0 ? '+' : ''}{summary.last_week_change}%
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Status Distribution */}
          {summary && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Distribution</h3>
              <div className="space-y-3">
                {[
                  { key: 'not_started', label: 'Not Started', count: summary.status_distribution.not_started },
                  { key: 'at_risk', label: 'At Risk', count: summary.status_distribution.at_risk },
                  { key: 'behind', label: 'Behind', count: summary.status_distribution.behind },
                  { key: 'on_track', label: 'On Track', count: summary.status_distribution.on_track },
                  { key: 'closed', label: 'Closed', count: summary.status_distribution.closed },
                  { key: 'abandoned', label: 'Abandoned', count: summary.status_distribution.abandoned },
                ].map(({ key, label, count }) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{label}</span>
                    <span className="text-sm font-medium text-gray-900">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Personal Objectives */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Objectives</h3>
            {personalObjectives.length === 0 ? (
              <div className="text-center py-6">
                <div className="text-gray-400 text-4xl mb-2">🎯</div>
                <p className="text-gray-500 text-sm">No personal objectives yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {personalObjectives.slice(0, 5).map((objective) => (
                  <div key={objective.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900 truncate">{objective.title}</h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(objective.status)}`}>
                          {objective.status}
                        </span>
                        {objective.last_check_in && (
                          <span className="text-xs text-gray-500">
                            Last check-in: {formatDate(objective.last_check_in)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-right">
                        <div className="text-sm font-semibold text-gray-900">{objective.progress}%</div>
                        <div className="w-16 bg-gray-200 rounded-full h-2 mt-1">
                          <div 
                            className={`h-2 rounded-full ${getProgressColor(objective.progress)}`}
                            style={{ width: `${Math.min(objective.progress, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {personalObjectives.length > 5 && (
                  <div className="text-center">
                    <span className="text-sm text-gray-500">
                      +{personalObjectives.length - 5} more objectives
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Groups Information */}
        {groups.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Groups</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {groups.map((group) => (
                <div key={group.id} className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">{group.name}</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Objectives:</span>
                      <span className="font-medium">{group.objectives_count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Metrics:</span>
                      <span className="font-medium">{group.metrics_count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Avg Progress:</span>
                      <span className="font-medium">{group.avg_objectives_progress}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Metrics Progress:</span>
                      <span className="font-medium">{group.avg_metrics_progress}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <a
              href="/okr"
              className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <span className="text-2xl mr-3">🎯</span>
              <div>
                <div className="font-medium text-gray-900">Objectives</div>
                <div className="text-sm text-gray-600">Manage your goals</div>
              </div>
            </a>
            
            <a
              href="/check-ins"
              className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            >
              <span className="text-2xl mr-3">📊</span>
              <div>
                <div className="font-medium text-gray-900">Check-ins</div>
                <div className="text-sm text-gray-600">Update progress</div>
              </div>
            </a>
            
            <a
              href="/okr/alignment"
              className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <span className="text-2xl mr-3">🔗</span>
              <div>
                <div className="font-medium text-gray-900">Alignment</div>
                <div className="text-sm text-gray-600">View connections</div>
              </div>
            </a>
            
            <a
              href="/dashboard"
              className="flex items-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
            >
              <span className="text-2xl mr-3">📈</span>
              <div>
                <div className="font-medium text-gray-900">Dashboard</div>
                <div className="text-sm text-gray-600">View analytics</div>
              </div>
            </a>
          </div>
        </div>
      </div>
  );
}

export default function HomePage() {
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.warn('Logout failed:', error);
    } finally {
      clearTokens();
      window.location.href = '/login';
    }
  };

  return (
    <Layout onLogout={handleLogout}>
      <WorkspaceRequired>
        <HomeContent />
      </WorkspaceRequired>
    </Layout>
  );
}
