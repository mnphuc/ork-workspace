"use client";
import React, { useState } from 'react';

interface Objective {
  id: string;
  title: string;
  description: string;
  status: 'not_started' | 'on_track' | 'at_risk' | 'behind' | 'completed' | 'abandoned';
  progress: number;
  owner_id: string;
  owner_name: string;
  level: number;
  children?: Objective[];
  parent_id?: string;
  alignment_type?: 'supports' | 'contributes' | 'blocks';
}

interface AlignmentTreeProps {
  objective: Objective;
  onObjectiveClick: (objective: Objective) => void;
  onAddAlignment: (parentId: string, childId: string, type: string) => void;
  onRemoveAlignment: (parentId: string, childId: string) => void;
  availableObjectives: Objective[];
  className?: string;
}

export function AlignmentTree({ 
  objective, 
  onObjectiveClick, 
  onAddAlignment,
  onRemoveAlignment,
  availableObjectives,
  className = "" 
}: AlignmentTreeProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set([objective.id]));
  const [showAddAlignment, setShowAddAlignment] = useState<string | null>(null);
  const [selectedChildId, setSelectedChildId] = useState<string>('');
  const [selectedAlignmentType, setSelectedAlignmentType] = useState<string>('supports');

  const toggleExpanded = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'not_started': return 'bg-gray-100 text-gray-800';
      case 'on_track': return 'bg-green-100 text-green-800';
      case 'at_risk': return 'bg-yellow-100 text-yellow-800';
      case 'behind': return 'bg-orange-100 text-orange-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'abandoned': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLevelColor = (level: number) => {
    switch (level) {
      case 0: return 'border-l-purple-500'; // Company
      case 1: return 'border-l-blue-500'; // Department
      case 2: return 'border-l-green-500'; // Team
      case 3: return 'border-l-yellow-500'; // Individual
      default: return 'border-l-gray-500';
    }
  };

  const getLevelLabel = (level: number) => {
    switch (level) {
      case 0: return 'Company';
      case 1: return 'Department';
      case 2: return 'Team';
      case 3: return 'Individual';
      default: return 'Unknown';
    }
  };

  const getAlignmentTypeIcon = (type: string) => {
    switch (type) {
      case 'supports': return '✅';
      case 'contributes': return '📈';
      case 'blocks': return '🚫';
      default: return '🔗';
    }
  };

  const getAlignmentTypeColor = (type: string) => {
    switch (type) {
      case 'supports': return 'text-green-600';
      case 'contributes': return 'text-blue-600';
      case 'blocks': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const handleAddAlignment = () => {
    if (selectedChildId && showAddAlignment) {
      onAddAlignment(showAddAlignment, selectedChildId, selectedAlignmentType);
      setShowAddAlignment(null);
      setSelectedChildId('');
      setSelectedAlignmentType('supports');
    }
  };

  const getAvailableChildren = (parentId: string) => {
    return availableObjectives.filter(obj => 
      obj.id !== parentId && 
      !hasDescendant(parentId, obj.id) &&
      obj.level > objective.level
    );
  };

  const hasDescendant = (parentId: string, childId: string): boolean => {
    const parent = findObjectiveById(parentId);
    if (!parent || !parent.children) return false;
    
    const hasDirectChild = parent.children.some(child => child.id === childId);
    if (hasDirectChild) return true;
    
    return parent.children.some(child => hasDescendant(child.id, childId));
  };

  const findObjectiveById = (id: string): Objective | null => {
    if (objective.id === id) return objective;
    
    const searchInChildren = (children: Objective[]): Objective | null => {
      for (const child of children) {
        if (child.id === id) return child;
        if (child.children) {
          const found = searchInChildren(child.children);
          if (found) return found;
        }
      }
      return null;
    };
    
    return objective.children ? searchInChildren(objective.children) : null;
  };

  const renderTreeNode = (node: Objective, depth: number = 0) => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children && node.children.length > 0;
    const availableChildren = getAvailableChildren(node.id);
    
    // Debug logging
    console.log(`Node ${node.id}: hasChildren=${hasChildren}, children=`, node.children);

    return (
      <div key={node.id} className="relative">
        {/* Node */}
        <div 
          className={`flex items-center space-x-3 p-3 border-l-4 ${getLevelColor(node.level)} bg-white border border-gray-200 rounded-lg mb-2 hover:shadow-sm transition-shadow cursor-pointer`}
          style={{ marginLeft: `${depth * 20}px` }}
          onClick={() => onObjectiveClick(node)}
        >
          {/* Expand/Collapse Button */}
          <div className="flex-shrink-0">
            {hasChildren ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpanded(node.id);
                }}
                className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600"
              >
                {isExpanded ? '▼' : '▶'}
              </button>
            ) : (
              <div className="w-6 h-6"></div>
            )}
          </div>

          {/* Objective Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h4 className="text-sm font-medium text-gray-900 truncate">
                {node.title}
              </h4>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(node.status)}`}>
                {node.status.replace('_', ' ')}
              </span>
              <span className="text-xs text-gray-500">
                {getLevelLabel(node.level)}
              </span>
            </div>
            
            <div className="flex items-center space-x-4 text-xs text-gray-600">
              <span>Progress: {node.progress}%</span>
              <span>Owner: {node.owner_name}</span>
              {node.alignment_type && (
                <span className={`flex items-center space-x-1 ${getAlignmentTypeColor(node.alignment_type)}`}>
                  <span>{getAlignmentTypeIcon(node.alignment_type)}</span>
                  <span>{node.alignment_type}</span>
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            {availableChildren.length > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAddAlignment(showAddAlignment === node.id ? null : node.id);
                }}
                className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
              >
                Add Alignment
              </button>
            )}
            
            {node.parent_id && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveAlignment(node.parent_id!, node.id);
                }}
                className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
              >
                Remove
              </button>
            )}
          </div>
        </div>

        {/* Add Alignment Form */}
        {showAddAlignment === node.id && (
          <div 
            className="ml-8 mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg"
            style={{ marginLeft: `${(depth + 1) * 20 + 32}px` }}
          >
            <h5 className="text-sm font-medium text-gray-900 mb-3">Add Alignment</h5>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Child Objective
                </label>
                <select
                  value={selectedChildId}
                  onChange={(e) => setSelectedChildId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="">Select objective...</option>
                  {availableChildren.map(child => (
                    <option key={child.id} value={child.id}>
                      {child.title} ({getLevelLabel(child.level)})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Alignment Type
                </label>
                <select
                  value={selectedAlignmentType}
                  onChange={(e) => setSelectedAlignmentType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="supports">Supports</option>
                  <option value="contributes">Contributes</option>
                  <option value="blocks">Blocks</option>
                </select>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={handleAddAlignment}
                  disabled={!selectedChildId}
                  className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Alignment
                </button>
                <button
                  onClick={() => {
                    setShowAddAlignment(null);
                    setSelectedChildId('');
                    setSelectedAlignmentType('supports');
                  }}
                  className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Children */}
        {isExpanded && hasChildren && (
          <div className="ml-4">
            {node.children!.map(child => renderTreeNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Objective Alignment</h3>
          <p className="text-sm text-gray-600">
            View and manage how objectives align with each other
          </p>
        </div>
        <div className="flex items-center space-x-2 text-xs text-gray-500">
          <span>✅ Supports</span>
          <span>📈 Contributes</span>
          <span>🚫 Blocks</span>
        </div>
      </div>

      {/* Tree */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        {renderTreeNode(objective)}
      </div>

      {/* Legend */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Level Legend</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-purple-200 border border-purple-300 rounded"></div>
            <span className="text-gray-700">Company</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-200 border border-blue-300 rounded"></div>
            <span className="text-gray-700">Department</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-200 border border-green-300 rounded"></div>
            <span className="text-gray-700">Team</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-200 border border-yellow-300 rounded"></div>
            <span className="text-gray-700">Individual</span>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-600">
            {countObjectives(objective)}
          </div>
          <div className="text-sm text-gray-600">Total Objectives</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-600">
            {countObjectivesByStatus(objective, 'completed')}
          </div>
          <div className="text-sm text-gray-600">Completed</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-yellow-600">
            {countObjectivesByStatus(objective, 'at_risk')}
          </div>
          <div className="text-sm text-gray-600">At Risk</div>
        </div>
      </div>
    </div>
  );
}

// Helper functions
function countObjectives(objective: Objective): number {
  let count = 1;
  if (objective.children) {
    count += objective.children.reduce((sum, child) => sum + countObjectives(child), 0);
  }
  return count;
}

function countObjectivesByStatus(objective: Objective, status: string): number {
  let count = objective.status === status ? 1 : 0;
  if (objective.children) {
    count += objective.children.reduce((sum, child) => sum + countObjectivesByStatus(child, status), 0);
  }
  return count;
}


