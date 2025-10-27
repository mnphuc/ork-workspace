"use client";
import React, { useState, useEffect } from 'react';
import { StatusPill } from './StatusPill';
import { GroupPills } from './GroupPill';
import { formatDate } from '@/lib/date-utils';
import { duplicateObjective, duplicateKeyResult, moveObjective, deleteObjective, deleteKeyResult, createCheckIn } from '@/lib/okr-api';
import { MoveDialog } from './MoveDialog';
import { ObjectiveDetailModal } from './ObjectiveDetailModal';
import { KPICheckInModal } from './KPICheckInModal';
import { useUsers } from '@/contexts/UsersContext';

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
  type?: string;
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
  type?: string;
}

interface OKRTableProps {
  objectives: Objective[];
  onEdit?: (objective: Objective) => void;
  onDelete?: (objective: Objective) => void;
  onViewDetails?: (objective: Objective) => void;
  loading?: boolean;
}

export function OKRTable({ objectives, onEdit, onDelete, onViewDetails, loading = false }: OKRTableProps) {
  const { getUserName } = useUsers();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [showMoveDialog, setShowMoveDialog] = useState(false);
  const [moveDialogItem, setMoveDialogItem] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedObjective, setSelectedObjective] = useState<Objective | null>(null);
  const [showKPICheckInModal, setShowKPICheckInModal] = useState(false);
  const [selectedKPI, setSelectedKPI] = useState<Objective | null>(null);
  const [isSubmittingCheckIn, setIsSubmittingCheckIn] = useState(false);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activeMenu) {
        setActiveMenu(null);
      }
    };

    if (activeMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeMenu]);

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const toggleMenu = (itemId: string) => {
    setActiveMenu(activeMenu === itemId ? null : itemId);
  };

  const closeMenu = () => {
    setActiveMenu(null);
  };

  const handleMove = async (teamId?: string, workspaceId?: string) => {
    if (!moveDialogItem) return;
    
    try {
      await moveObjective(moveDialogItem.id, teamId, workspaceId);
      window.location.reload();
    } catch (error) {
      console.error('Move failed:', error);
      alert('Failed to move item. Please try again.');
    }
  };

  const handleObjectiveClick = (objective: Objective) => {
    // Check if this is a KPI
    if (objective.type === 'KPI') {
      setSelectedKPI(objective);
      setShowKPICheckInModal(true);
    } else {
      setSelectedObjective(objective);
      setShowDetailModal(true);
    }
  };

  const handleAction = async (action: string, item: any) => {
    closeMenu();
    
    switch (action) {
      case 'view':
        onViewDetails?.(item);
        break;
      case 'edit':
        onEdit?.(item);
        break;
      case 'delete':
        if (confirm('Are you sure you want to delete this item?')) {
          try {
            const isObjective = item.key_results || item.kpis;
            if (isObjective) {
              await deleteObjective(item.id);
            } else {
              await deleteKeyResult(item.id);
            }
            // Reload page to refresh data
            window.location.reload();
          } catch (error) {
            console.error('Delete failed:', error);
            alert('Failed to delete item. Please try again.');
          }
        }
        break;
      case 'duplicate':
        try {
          const isObjective = item.key_results || item.kpis;
          if (isObjective) {
            await duplicateObjective(item.id);
          } else {
            await duplicateKeyResult(item.id);
          }
          // Reload page to refresh data
          window.location.reload();
        } catch (error) {
          console.error('Duplicate failed:', error);
          alert('Failed to duplicate item. Please try again.');
        }
        break;
      case 'move':
        setMoveDialogItem(item);
        setShowMoveDialog(true);
        break;
      case 'addToDashboard':
        console.log('Add to dashboard:', item);
        break;
      case 'customWeights':
        console.log('Custom weights:', item);
        break;
      case 'createObjective':
        console.log('Create objective under:', item);
        break;
      case 'createMetric':
        console.log('Create metric under:', item);
        break;
      default:
        console.log('Unknown action:', action);
    }
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

  const getItemTypeIcon = (type: 'objective' | 'keyresult' | 'kpi' | 'task') => {
    switch (type) {
      case 'objective':
        return <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 text-xs font-bold rounded mr-2">C</span>;
      case 'keyresult':
        return <span className="inline-flex items-center justify-center w-6 h-6 bg-green-100 text-green-600 text-xs font-bold rounded mr-2">KR</span>;
      case 'kpi':
        return <span className="inline-flex items-center justify-center w-6 h-6 bg-purple-100 text-purple-600 text-xs font-bold rounded mr-2">KPI</span>;
      case 'task':
        return <span className="inline-flex items-center justify-center w-6 h-6 bg-orange-100 text-orange-600 text-xs font-bold rounded mr-2">T</span>;
      default:
        return <span className="inline-flex items-center justify-center w-6 h-6 bg-gray-100 text-gray-600 text-xs font-bold rounded mr-2">?</span>;
    }
  };

  const ActionMenu = ({ item, isOpen, onClose }: { item: any; isOpen: boolean; onClose: () => void }) => {
    if (!isOpen) return null;

    const isObjective = item.key_results || item.kpis;
    
    return (
      <div className="absolute right-0 top-0 z-50 mt-8 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
        {isObjective && (
          <>
            <button
              onClick={() => handleAction('createObjective', item)}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
            >
              <span className="w-4 h-4 bg-blue-100 text-blue-600 rounded mr-3 flex items-center justify-center text-xs font-bold">+</span>
              <span>Create objective</span>
              <svg className="w-4 h-4 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
            <button
              onClick={() => handleAction('createMetric', item)}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
            >
              <span className="w-4 h-4 bg-orange-100 text-orange-600 rounded mr-3 flex items-center justify-center text-xs font-bold">+</span>
              <span>Create metric</span>
              <svg className="w-4 h-4 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          </>
        )}
        
        <button
          onClick={() => handleAction('edit', item)}
          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
        >
          <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          <span>Edit</span>
        </button>
        
        <button
          onClick={() => handleAction('customWeights', item)}
          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
        >
          <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l-2.5 2.5M6 7l2.5 2.5m0 0L9 16m-2.5-6.5L4 9.5" />
          </svg>
          <span>Custom weights</span>
        </button>
        
        <button
          onClick={() => handleAction('addToDashboard', item)}
          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
        >
          <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>Add to dashboard</span>
        </button>
        
        <button
          onClick={() => handleAction('duplicate', item)}
          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
        >
          <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <span>Duplicate</span>
        </button>
        
        <button
          onClick={() => handleAction('move', item)}
          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
        >
          <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
          <span>Move</span>
        </button>
        
        <div className="border-t border-gray-200 my-1"></div>
        
        <button
          onClick={() => handleAction('delete', item)}
          className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center"
        >
          <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          <span>Delete</span>
        </button>
      </div>
    );
  };

  const renderObjectiveRow = (objective: Objective, level = 0) => {
    const isExpanded = expandedItems.has(objective.id);
    const hasChildren = (objective.key_results?.length || 0) + (objective.kpis?.length || 0) > 0;

    return (
      <React.Fragment key={objective.id}>
        {/* Objective Row */}
        <tr className="border-b border-gray-200 hover:bg-gray-50">
          <td className="px-6 py-4">
            <div className="flex items-center">
              <div className="flex items-center" style={{ marginLeft: `${level * 24}px` }}>
                {hasChildren && (
                  <button
                    onClick={() => toggleExpanded(objective.id)}
                    className="mr-2 text-gray-500 hover:text-gray-700 w-4 h-4 flex items-center justify-center"
                  >
                    {isExpanded ? (
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                )}
                {!hasChildren && <div className="w-6 mr-2"></div>}
                {objective.type === 'KPI' ? getItemTypeIcon('kpi') : getItemTypeIcon('objective')}
                <button
                  onClick={() => handleObjectiveClick(objective)}
                  className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors text-left"
                >
                  {objective.title}
                </button>
              </div>
            </div>
          </td>
          <td className="px-6 py-4 text-sm text-gray-600">
            {formatCurrentTarget()}
          </td>
          <td className="px-6 py-4 text-sm text-gray-600">
            {objective.progress}%{objective.weight && ` x ${objective.weight}`}
          </td>
          <td className="px-6 py-4">
            <StatusPill status={objective.status} />
          </td>
          <td className="px-6 py-4 text-sm text-gray-600">
            {objective.quarter}
          </td>
          <td className="px-6 py-4">
            <GroupPills groups={objective.groups} maxDisplay={2} />
          </td>
          <td className="px-6 py-4 text-sm text-gray-600">
            {objective.owner_id ? getUserName(objective.owner_id) : 'N/A'}
          </td>
          <td className="px-6 py-4 text-sm text-gray-600">
            <div className="flex items-center">
              <span className="mr-1">📅</span>
              {formatCheckIn(objective.last_check_in_date)}
            </div>
          </td>
          <td className="px-6 py-4 text-sm text-gray-600">
            <div className="flex items-center">
              <span className="mr-1">💬</span>
              {objective.comments_count}
            </div>
          </td>
          <td className="px-6 py-4">
            <div className="relative">
              <button
                onClick={() => toggleMenu(objective.id)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
              </button>
              <ActionMenu 
                item={objective} 
                isOpen={activeMenu === objective.id} 
                onClose={closeMenu} 
              />
            </div>
          </td>
        </tr>

        {/* Key Results and KPIs */}
        {isExpanded && (
          <>
            {objective.key_results?.map((kr) => (
              <tr key={`kr-${kr.id}`} className="border-b border-gray-100 bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center" style={{ marginLeft: `${(level + 1) * 24}px` }}>
                    <div className="w-6 mr-2"></div>
                    {getItemTypeIcon('keyresult')}
                    <span className="text-sm text-gray-700">
                      {kr.title}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {formatCurrentTarget(kr.current_value, kr.target_value)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {kr.progress}%
                </td>
                <td className="px-6 py-4">
                  <StatusPill status={kr.status} />
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {kr.quarter}
                </td>
                <td className="px-6 py-4">
                  <GroupPills groups={kr.groups} maxDisplay={2} />
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {kr.owner_id ? getUserName(kr.owner_id) : 'N/A'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <span className="mr-1">📅</span>
                    {formatCheckIn(kr.last_check_in_date)}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <span className="mr-1">💬</span>
                    {kr.comments_count}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="relative">
                    <button
                      onClick={() => toggleMenu(`kr-${kr.id}`)}
                      className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                      </svg>
                    </button>
                    <ActionMenu 
                      item={kr} 
                      isOpen={activeMenu === `kr-${kr.id}`} 
                      onClose={closeMenu} 
                    />
                  </div>
                </td>
              </tr>
            ))}

            {objective.kpis?.map((kpi) => (
              <tr key={`kpi-${kpi.id}`} className="border-b border-gray-100 bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center" style={{ marginLeft: `${(level + 1) * 24}px` }}>
                    <div className="w-6 mr-2"></div>
                    {getItemTypeIcon('kpi')}
                    <button
                      onClick={() => handleObjectiveClick({ ...kpi, type: 'KPI' })}
                      className="text-sm text-gray-700 hover:text-blue-600 transition-colors text-left"
                    >
                      {kpi.title}
                    </button>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {formatCurrentTarget(kpi.current_value, kpi.target_value)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {kpi.progress}%
                </td>
                <td className="px-6 py-4">
                  <StatusPill status={kpi.status} />
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {kpi.quarter}
                </td>
                <td className="px-6 py-4">
                  <GroupPills groups={kpi.groups} maxDisplay={2} />
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {kpi.owner_id ? getUserName(kpi.owner_id) : 'N/A'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <span className="mr-1">📅</span>
                    {formatCheckIn(kpi.last_check_in_date)}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <span className="mr-1">💬</span>
                    {kpi.comments_count}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="relative">
                    <button
                      onClick={() => toggleMenu(`kpi-${kpi.id}`)}
                      className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                      </svg>
                    </button>
                    <ActionMenu 
                      item={kpi} 
                      isOpen={activeMenu === `kpi-${kpi.id}`} 
                      onClose={closeMenu} 
                    />
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
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-auto max-h-[calc(100vh-300px)]">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Objectives and Metrics
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Current / Target
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Progress x Wgt
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Interval
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Groups
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Owner
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Check-in
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Comment
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={10} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <p className="text-sm text-gray-600">Loading objectives...</p>
                    </div>
                  </td>
                </tr>
              ) : (
                objectives.map((objective) => renderObjectiveRow(objective))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <MoveDialog
        isOpen={showMoveDialog}
        item={moveDialogItem}
        onClose={() => setShowMoveDialog(false)}
        onMove={handleMove}
      />
      
      <ObjectiveDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        objective={selectedObjective}
      />
      
      <KPICheckInModal
        isOpen={showKPICheckInModal}
        onClose={() => setShowKPICheckInModal(false)}
        kpi={selectedKPI}
        onSubmit={async (keyResultId, value, note) => {
          setIsSubmittingCheckIn(true);
          try {
            await createCheckIn(keyResultId, value, note);
            setShowKPICheckInModal(false);
            // Reload page to refresh data
            window.location.reload();
          } catch (error) {
            console.error('Check-in failed:', error);
            alert('Failed to submit check-in. Please try again.');
          } finally {
            setIsSubmittingCheckIn(false);
          }
        }}
        isLoading={isSubmittingCheckIn}
      />
    </>
  );
}
