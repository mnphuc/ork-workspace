"use client";
import React, { useState } from 'react';

interface Group {
  id: string;
  name: string;
  type: 'company' | 'department' | 'team' | 'subteam';
  parent_id?: string;
  description?: string;
  user_count: number;
  objective_count: number;
  is_active: boolean;
  created_date: string;
  children?: Group[];
}

interface GroupHierarchyProps {
  groups: Group[];
  onEdit: (group: Group) => void;
  onDelete: (groupId: string) => void;
  onAddChild: (parentId: string) => void;
  onMove: (groupId: string, newParentId: string | null) => void;
  onToggleActive: (groupId: string) => void;
  currentUserId?: string;
  className?: string;
}

export function GroupHierarchy({ 
  groups, 
  onEdit, 
  onDelete, 
  onAddChild,
  onMove,
  onToggleActive,
  currentUserId,
  className = "" 
}: GroupHierarchyProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [draggedGroup, setDraggedGroup] = useState<string | null>(null);
  const [dragOverGroup, setDragOverGroup] = useState<string | null>(null);

  const toggleExpanded = (groupId: string) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) {
        newSet.delete(groupId);
      } else {
        newSet.add(groupId);
      }
      return newSet;
    });
  };

  const handleDragStart = (e: React.DragEvent, groupId: string) => {
    setDraggedGroup(groupId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, groupId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverGroup(groupId);
  };

  const handleDragLeave = () => {
    setDragOverGroup(null);
  };

  const handleDrop = (e: React.DragEvent, targetGroupId: string) => {
    e.preventDefault();
    if (draggedGroup && draggedGroup !== targetGroupId) {
      onMove(draggedGroup, targetGroupId);
    }
    setDraggedGroup(null);
    setDragOverGroup(null);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'company': return '🏢';
      case 'department': return '🏛️';
      case 'team': return '👥';
      case 'subteam': return '🔗';
      default: return '📁';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'company': return 'bg-blue-100 text-blue-800';
      case 'department': return 'bg-green-100 text-green-800';
      case 'team': return 'bg-purple-100 text-purple-800';
      case 'subteam': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const canManage = (group: Group) => {
    // Add permission logic here
    return true; // For now, allow all
  };

  const renderGroupNode = (group: Group, level: number = 0) => {
    const isExpanded = expandedNodes.has(group.id);
    const hasChildren = group.children && group.children.length > 0;
    const isDraggedOver = dragOverGroup === group.id;

    return (
      <div key={group.id} className="select-none">
        <div
          className={`flex items-center space-x-2 p-3 rounded-lg border transition-colors ${
            isDraggedOver 
              ? 'border-blue-300 bg-blue-50' 
              : 'border-gray-200 hover:bg-gray-50'
          }`}
          style={{ marginLeft: `${level * 20}px` }}
          draggable={canManage(group)}
          onDragStart={(e) => handleDragStart(e, group.id)}
          onDragOver={(e) => handleDragOver(e, group.id)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, group.id)}
        >
          {/* Expand/Collapse Button */}
          <button
            onClick={() => toggleExpanded(group.id)}
            className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600"
            disabled={!hasChildren}
          >
            {hasChildren ? (
              isExpanded ? '▼' : '▶'
            ) : (
              <div className="w-2 h-2 bg-gray-300 rounded-full" />
            )}
          </button>

          {/* Group Icon */}
          <div className="text-lg">{getTypeIcon(group.type)}</div>

          {/* Group Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h4 className="text-sm font-medium text-gray-900 truncate">
                {group.name}
              </h4>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(group.type)}`}>
                {group.type}
              </span>
              {!group.is_active && (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                  Inactive
                </span>
              )}
            </div>
            {group.description && (
              <p className="text-xs text-gray-500 truncate mt-1">
                {group.description}
              </p>
            )}
            <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
              <span>{group.user_count} users</span>
              <span>{group.objective_count} objectives</span>
            </div>
          </div>

          {/* Actions */}
          {canManage(group) && (
            <div className="flex items-center space-x-1">
              <button
                onClick={() => onAddChild(group.id)}
                className="p-1 text-gray-400 hover:text-blue-600"
                title="Add child group"
              >
                ➕
              </button>
              <button
                onClick={() => onEdit(group)}
                className="p-1 text-gray-400 hover:text-blue-600"
                title="Edit group"
              >
                ✏️
              </button>
              <button
                onClick={() => onToggleActive(group.id)}
                className={`p-1 ${
                  group.is_active 
                    ? 'text-gray-400 hover:text-yellow-600' 
                    : 'text-gray-400 hover:text-green-600'
                }`}
                title={group.is_active ? 'Deactivate' : 'Activate'}
              >
                {group.is_active ? '⏸️' : '▶️'}
              </button>
              <button
                onClick={() => onDelete(group.id)}
                className="p-1 text-gray-400 hover:text-red-600"
                title="Delete group"
              >
                🗑️
              </button>
            </div>
          )}
        </div>

        {/* Children */}
        {isExpanded && hasChildren && (
          <div className="mt-2 space-y-2">
            {group.children!.map(child => renderGroupNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const buildHierarchy = (groups: Group[]): Group[] => {
    const groupMap = new Map<string, Group>();
    const rootGroups: Group[] = [];

    // Create a map of all groups
    groups.forEach(group => {
      groupMap.set(group.id, { ...group, children: [] });
    });

    // Build hierarchy
    groups.forEach(group => {
      const groupWithChildren = groupMap.get(group.id)!;
      if (group.parent_id) {
        const parent = groupMap.get(group.parent_id);
        if (parent) {
          parent.children!.push(groupWithChildren);
        }
      } else {
        rootGroups.push(groupWithChildren);
      }
    });

    return rootGroups;
  };

  const hierarchy = buildHierarchy(groups);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Group Hierarchy</h3>
          <p className="text-sm text-gray-600">
            Drag and drop to reorganize groups. Click to expand/collapse.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              const allIds = groups.map(g => g.id);
              setExpandedNodes(new Set(allIds));
            }}
            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            Expand All
          </button>
          <button
            onClick={() => setExpandedNodes(new Set())}
            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* Hierarchy Tree */}
      <div className="space-y-2">
        {hierarchy.length > 0 ? (
          hierarchy.map(group => renderGroupNode(group))
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-400 text-4xl mb-4">👥</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No groups found</h3>
            <p className="text-gray-500">
              Create your first group to get started
            </p>
          </div>
        )}
      </div>

      {/* Drag Instructions */}
      {groups.length > 1 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <div className="text-blue-600">💡</div>
            <div className="text-sm text-blue-800">
              <strong>Tip:</strong> Drag groups to reorganize the hierarchy. 
              Drop on another group to make it a child, or drop on empty space to make it a root group.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


