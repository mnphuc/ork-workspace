"use client";
import React, { useState } from 'react';
import { Modal } from './Modal';
import { StatusPill } from './StatusPill';
import { GroupPills } from './GroupPill';
import { formatDate } from '@/lib/date-utils';
import { KPICheckInModal } from './KPICheckInModal';

interface KeyResult {
  id: string;
  title: string;
  current_value?: number;
  target_value?: number;
  progress: number;
  status: string;
  weight: number;
  owner_id?: string;
}

interface KPI {
  id: string;
  title: string;
  progress: number;
  status: string;
  weight: number;
  owner_id?: string;
}

interface Objective {
  id: string;
  title: string;
  description?: string;
  progress: number;
  weight?: number;
  status: string;
  quarter: string;
  groups: string[];
  owner_id: string;
  last_check_in_date?: string;
  comments_count: number;
  key_results?: KeyResult[];
  kpis?: KPI[];
  start_date?: string;
  end_date?: string;
  type?: string;
}

interface ObjectiveDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  objective: Objective | null;
}

export function ObjectiveDetailModal({ isOpen, onClose, objective }: ObjectiveDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'comments' | 'activity'>('comments');
  const [commentText, setCommentText] = useState('');
  const [showKPICheckIn, setShowKPICheckIn] = useState(false);

  if (!objective) return null;

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'on_track': return 'bg-green-100 text-green-800';
      case 'behind': return 'bg-orange-100 text-orange-800';
      case 'not_started': return 'bg-gray-100 text-gray-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'at_risk': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'on_track': return '▲';
      case 'behind': return '▼';
      case 'not_started': return '○';
      case 'completed': return '✓';
      case 'at_risk': return '⚠';
      default: return '○';
    }
  };

  const getItemTypeIcon = (type: 'objective' | 'keyresult' | 'kpi') => {
    switch (type) {
      case 'objective':
        return <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 text-xs font-bold rounded mr-2">C</span>;
      case 'keyresult':
        return <span className="inline-flex items-center justify-center w-6 h-6 bg-orange-100 text-orange-600 text-xs font-bold rounded mr-2">KR</span>;
      case 'kpi':
        return <span className="inline-flex items-center justify-center w-6 h-6 bg-purple-100 text-purple-600 text-xs font-bold rounded mr-2">KPI</span>;
      default:
        return <span className="inline-flex items-center justify-center w-6 h-6 bg-gray-100 text-gray-600 text-xs font-bold rounded mr-2">?</span>;
    }
  };

  const formatProgress = (progress: number) => {
    return `${Math.round(progress)}%`;
  };

  const formatCurrentTarget = (current?: number, target?: number) => {
    if (current === undefined || target === undefined) {
      return 'N/A';
    }
    return `${current} / ${target}`;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" className="!max-w-7xl" title=" ">
      <div className="flex h-[80vh] bg-white rounded-lg overflow-hidden">
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </button>
              <span className="text-sm text-gray-500">Link to parent element</span>
            </div>
            <div className="flex items-center space-x-2">
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Objective Title and Description */}
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {objective.title}
            </h1>
            <div className="text-gray-500">
              {objective.description || (
                <span className="italic">Add a description...</span>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto">
            {/* Progress Section */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center space-x-2 mb-4">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <h2 className="text-lg font-semibold text-gray-900">Progress</h2>
              </div>
              {/* Progress chart placeholder */}
              <div className="h-32 bg-gray-50 rounded-lg flex items-center justify-center">
                <span className="text-gray-500">Progress chart will be displayed here</span>
              </div>
            </div>

            {/* Nested Items Section */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                  </svg>
                  <h2 className="text-lg font-semibold text-gray-900">Nested items</h2>
                </div>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => {
                      // TODO: Implement add key result functionality
                      console.log('Add key result clicked');
                    }}
                    className="text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 px-2 py-1 rounded"
                  >
                    Custom weights +
                  </button>
                </div>
              </div>

              {/* Key Results */}
              <div className="space-y-3">
                {objective.key_results?.map((kr) => (
                  <div key={kr.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <button className="text-gray-400 hover:text-gray-600">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                    {getItemTypeIcon('keyresult')}
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">{kr.title}</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(kr.status)}`}>
                        {kr.status.toUpperCase()}
                      </span>
                      <span className="text-sm text-gray-600">{formatProgress(kr.progress)}</span>
                      <span className="text-sm text-gray-500">× {kr.weight}</span>
                      <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  </div>
                ))}

                {/* KPIs */}
                {objective.kpis?.map((kpi) => (
                  <div key={kpi.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <button className="text-gray-400 hover:text-gray-600">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                    {getItemTypeIcon('kpi')}
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">{kpi.title}</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(kpi.status)}`}>
                        {kpi.status.toUpperCase()}
                      </span>
                      <span className="text-sm text-gray-600">{formatProgress(kpi.progress)}</span>
                      <span className="text-sm text-gray-500">× {kpi.weight}</span>
                      <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                <button
                  onClick={() => setActiveTab('comments')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'comments'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Comments
                </button>
                <button
                  onClick={() => setActiveTab('activity')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'activity'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Activity log
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'comments' ? (
                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      placeholder="Type @ to mention and notify someone."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="text-sm text-gray-500">
                    No comments yet. Be the first to comment!
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-500">
                  Activity log will be displayed here.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-80 bg-gray-50 border-l border-gray-200 p-6">
          {/* Overall Status */}
          <div className="mb-6">
            <div className="flex items-center space-x-2 mb-3">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(objective.status)}`}>
                {getStatusIcon(objective.status)} {objective.status.toUpperCase()}
              </span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {formatProgress(objective.progress)}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(objective.progress, 100)}%` }}
              ></div>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Predicted ≥ 100%
            </div>
          </div>

          {/* Check-in Section */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Check-in</h3>
            <div className="text-sm text-gray-600 mb-3">
              {objective.last_check_in_date ? formatDate(objective.last_check_in_date) : 'Not yet'}
            </div>
            {objective.type === 'KPI' ? (
              <button 
                onClick={() => setShowKPICheckIn(true)}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Check-in
              </button>
            ) : (
              <button 
                onClick={() => {
                  // TODO: Implement check-in functionality for regular objectives
                  alert('Check-in functionality will be implemented here');
                }}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Check-in
              </button>
            )}
          </div>

          {/* Details Section */}
          <div className="space-y-4">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 text-xs font-bold rounded">C</span>
                <span className="text-sm font-medium text-gray-900">Company</span>
              </div>
            </div>

            <div>
              <div className="flex items-center space-x-2 mb-2">
                <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                <span className="text-sm text-gray-900">{objective.owner_id}</span>
              </div>
            </div>

            <div>
              <div className="flex items-center space-x-2 mb-2">
                <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
                <span className="text-sm text-gray-900">Groups</span>
              </div>
              <GroupPills groups={objective.groups} maxDisplay={3} />
            </div>

            <div>
              <div className="text-sm text-gray-500 mb-1">Interval</div>
              <div className="text-sm text-gray-900">{objective.quarter}</div>
            </div>

            <div>
              <div className="text-sm text-gray-500 mb-1">Dates</div>
              <div className="flex items-center space-x-2">
                <div className="text-sm text-gray-900">
                  {objective.start_date && objective.end_date 
                    ? `${formatDate(objective.start_date)} – ${formatDate(objective.end_date)}`
                    : 'Not set'
                  }
                </div>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                </svg>
              </div>
            </div>

            <div>
              <input
                type="text"
                placeholder="Add label..."
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <input
                type="text"
                placeholder="Add stakeholder..."
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>
      
      <KPICheckInModal
        isOpen={showKPICheckIn}
        onClose={() => setShowKPICheckIn(false)}
        kpi={objective.type === 'KPI' ? objective : null}
        onSubmit={async (keyResultId, value, note) => {
          try {
            // TODO: Implement check-in API call
            alert(`Check-in submitted: ${value}, note: ${note || 'none'}`);
            setShowKPICheckIn(false);
          } catch (error) {
            console.error('Check-in failed:', error);
            alert('Failed to submit check-in. Please try again.');
          }
        }}
      />
    </Modal>
  );
}
