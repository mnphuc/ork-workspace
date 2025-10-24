"use client";
import React, { useState } from 'react';
import { StatusPill } from './StatusPill';
import { GroupPills } from './GroupPill';
import { formatDate } from '@/lib/date-utils';

interface KeyResult {
  id: string;
  title: string;
  current_value?: number;
  target_value?: number;
  progress: number;
  status: string;
  quarter: string;
  groups: string[];
  owner_id?: string;
  last_check_in_date?: string;
  comments_count: number;
}

interface KPI {
  id: string;
  title: string;
  current_value?: number;
  target_value?: number;
  progress: number;
  status: string;
  quarter: string;
  groups: string[];
  owner_id?: string;
  last_check_in_date?: string;
  comments_count: number;
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
}

interface OKRTableProps {
  objectives: Objective[];
  onEdit?: (objective: Objective) => void;
  onDelete?: (objective: Objective) => void;
  onViewDetails?: (objective: Objective) => void;
}

export function OKRTable({ objectives, onEdit, onDelete, onViewDetails }: OKRTableProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const formatCurrentTarget = (current?: number, target?: number) => {
    if (current === undefined || target === undefined) {
      return 'N/A';
    }
    return `${current} / ${target}`;
  };

  const formatCheckIn = (date?: string) => {
    if (!date) return 'Not yet';
    // Simple relative time for now
    return 'a day ago';
  };

  const renderObjectiveRow = (objective: Objective, level = 0) => {
    const isExpanded = expandedItems.has(objective.id);
    const hasChildren = (objective.key_results?.length || 0) + (objective.kpis?.length || 0) > 0;

    return (
      <React.Fragment key={objective.id}>
        {/* Objective Row */}
        <tr className="border-b border-gray-200 hover:bg-gray-50">
          <td className="px-4 py-3">
            <div className="flex items-center">
              <div className="flex items-center" style={{ marginLeft: `${level * 20}px` }}>
                {hasChildren && (
                  <button
                    onClick={() => toggleExpanded(objective.id)}
                    className="mr-2 text-gray-500 hover:text-gray-700"
                  >
                    {isExpanded ? '▼' : '▶'}
                  </button>
                )}
                <span className="text-sm font-medium text-gray-900">
                  {objective.title}
                </span>
              </div>
            </div>
          </td>
          <td className="px-4 py-3 text-sm text-gray-600">
            {formatCurrentTarget()}
          </td>
          <td className="px-4 py-3 text-sm text-gray-600">
            {objective.progress}%{objective.weight && ` x ${objective.weight}`}
          </td>
          <td className="px-4 py-3">
            <StatusPill status={objective.status} />
          </td>
          <td className="px-4 py-3 text-sm text-gray-600">
            {objective.quarter}
          </td>
          <td className="px-4 py-3">
            <GroupPills groups={objective.groups} maxDisplay={2} />
          </td>
          <td className="px-4 py-3 text-sm text-gray-600">
            {objective.owner_id ? objective.owner_id.substring(0, 8) + '...' : 'N/A'}
          </td>
          <td className="px-4 py-3 text-sm text-gray-600">
            <div className="flex items-center">
              <span className="mr-1">📅</span>
              {formatCheckIn(objective.last_check_in_date)}
            </div>
          </td>
          <td className="px-4 py-3 text-sm text-gray-600">
            <div className="flex items-center">
              <span className="mr-1">💬</span>
              {objective.comments_count}
            </div>
          </td>
          <td className="px-4 py-3">
            <div className="flex space-x-2">
              {onViewDetails && (
                <button
                  onClick={() => onViewDetails(objective)}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  View Details
                </button>
              )}
              {onEdit && (
                <button
                  onClick={() => onEdit(objective)}
                  className="text-indigo-600 hover:text-indigo-800 text-sm"
                >
                  Edit
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(objective)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Delete
                </button>
              )}
            </div>
          </td>
        </tr>

        {/* Key Results and KPIs */}
        {isExpanded && (
          <>
            {objective.key_results?.map((kr) => (
              <tr key={`kr-${kr.id}`} className="border-b border-gray-100 bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center" style={{ marginLeft: `${(level + 1) * 20}px` }}>
                    <span className="text-sm text-gray-700">
                      {kr.title}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {formatCurrentTarget(kr.current_value, kr.target_value)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {kr.progress}%
                </td>
                <td className="px-4 py-3">
                  <StatusPill status={kr.status} />
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {kr.quarter}
                </td>
                <td className="px-4 py-3">
                  <GroupPills groups={kr.groups} maxDisplay={2} />
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {kr.owner_id ? kr.owner_id.substring(0, 8) + '...' : 'N/A'}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  <div className="flex items-center">
                    <span className="mr-1">📅</span>
                    {formatCheckIn(kr.last_check_in_date)}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  <div className="flex items-center">
                    <span className="mr-1">💬</span>
                    {kr.comments_count}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex space-x-2">
                    {onViewDetails && (
                      <button
                        onClick={() => onViewDetails(kr as any)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        View Details
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}

            {objective.kpis?.map((kpi) => (
              <tr key={`kpi-${kpi.id}`} className="border-b border-gray-100 bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center" style={{ marginLeft: `${(level + 1) * 20}px` }}>
                    <span className="text-sm text-gray-700">
                      {kpi.title}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {formatCurrentTarget(kpi.current_value, kpi.target_value)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {kpi.progress}%
                </td>
                <td className="px-4 py-3">
                  <StatusPill status={kpi.status} />
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {kpi.quarter}
                </td>
                <td className="px-4 py-3">
                  <GroupPills groups={kpi.groups} maxDisplay={2} />
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {kpi.owner_id ? kpi.owner_id.substring(0, 8) + '...' : 'N/A'}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  <div className="flex items-center">
                    <span className="mr-1">📅</span>
                    {formatCheckIn(kpi.last_check_in_date)}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  <div className="flex items-center">
                    <span className="mr-1">💬</span>
                    {kpi.comments_count}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex space-x-2">
                    {onViewDetails && (
                      <button
                        onClick={() => onViewDetails(kpi as any)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        View Details
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </>
        )}
      </React.Fragment>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Objectives and Metrics
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Current / Target
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Progress x Wgt
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Interval
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Groups
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Owner
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Check-in
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Comments
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {objectives.map((objective) => renderObjectiveRow(objective))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
