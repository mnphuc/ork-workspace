"use client";
import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { Layout } from '@/components/layout';
import { WorkspaceRequired } from '@/components/WorkspaceRequired';
// import { ObjectiveCard } from '@/components';
import { DashboardSummary, TopPerformer, RecentCheckIn } from '@/types';
import { clearTokens } from '@/lib/api';
import { logout } from '@/lib/auth';
import { useCachedAPI } from '@/hooks/useCachedAPI';
import { formatDateTime, formatDate } from '@/lib/date-utils';
import { useWorkspace } from '@/contexts/WorkspaceContext';

// Lazy load heavy components - removed unused import

function DashboardContent() {
  const { currentWorkspace, loading: workspaceLoading } = useWorkspace();
  const [quarter] = useState(() => {
    const now = new Date();
    return `2025-Q${Math.ceil((now.getMonth() + 1) / 3)}`;
  });

  const { 
    data: summary, 
    loading: summaryLoading, 
    error: summaryError 
  } = useCachedAPI<DashboardSummary>(
    currentWorkspace ? `/dashboard/summary?workspaceId=${currentWorkspace.id}&quarter=${quarter}` : null,
    {
      ttl: 2 * 60 * 1000 // 2 minutes cache
    }
  );

  const { 
    data: topPerformers, 
    loading: performersLoading, 
    error: performersError 
  } = useCachedAPI<TopPerformer[]>(
    currentWorkspace ? `/dashboard/top-performers?workspaceId=${currentWorkspace.id}&quarter=${quarter}` : null,
    {
      ttl: 5 * 60 * 1000 // 5 minutes cache
    }
  );

  const [recentCheckIns] = useState<RecentCheckIn[]>([]);
  const loading = summaryLoading || performersLoading || workspaceLoading;
  const error = summaryError || performersError;

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !currentWorkspace) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error || 'No workspace selected'}</p>
        <button
          onClick={() => window.location.reload()}
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
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="text-sm text-gray-500">
          Last updated: {formatDateTime(new Date())}
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Objectives</h3>
            <p className="text-2xl font-bold text-gray-900">
              {(summary.status_counts?.not_started || 0) + 
               (summary.status_counts?.on_track || 0) + 
               (summary.status_counts?.at_risk || 0) + 
               (summary.status_counts?.behind || 0) + 
               (summary.status_counts?.closed || 0) + 
               (summary.status_counts?.abandoned || 0)}
            </p>
          </div>
          
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Average Progress</h3>
            <p className="text-2xl font-bold text-gray-900">
              {summary.objectives_progress || 0}%
            </p>
          </div>
          
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500 mb-2">On Track</h3>
            <p className="text-2xl font-bold text-green-600">
              {summary.status_counts?.on_track || 0}
            </p>
          </div>
        </div>
      )}

      {/* Top Performers */}
      {topPerformers && topPerformers.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Top Performers</h2>
          </div>
          <div className="p-4 sm:p-6">
            <div className="space-y-3 sm:space-y-4">
              {topPerformers.map((performer) => (
                <div key={performer.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 sm:p-4 bg-gray-50 rounded-lg space-y-2 sm:space-y-0">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{performer.title}</h3>
                    <p className="text-sm text-gray-500">Owner: {performer.owner_id}</p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-lg font-semibold text-green-600">
                      {performer.progress.toFixed(1)}%
                    </p>
                    <p className="text-sm text-gray-500">{performer.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recent Check-ins */}
      {recentCheckIns.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Check-ins</h2>
          </div>
          <div className="p-4 sm:p-6">
            <div className="space-y-3 sm:space-y-4">
              {recentCheckIns.map((checkIn) => (
                <div key={checkIn.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 sm:p-4 bg-gray-50 rounded-lg space-y-2 sm:space-y-0">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Value: {checkIn.value}</p>
                    {checkIn.note && (
                      <p className="text-sm text-gray-500 mt-1">{checkIn.note}</p>
                    )}
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-sm text-gray-500">
                      {formatDate(checkIn.created_date)}
                    </p>
                    <p className="text-sm text-gray-500">by {checkIn.created_by}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
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
        <DashboardContent />
      </WorkspaceRequired>
    </Layout>
  );
}