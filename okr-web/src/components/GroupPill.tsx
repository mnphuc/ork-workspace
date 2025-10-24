"use client";
import React from 'react';

interface GroupPillProps {
  group: string;
  className?: string;
}

export function GroupPill({ group, className = "" }: GroupPillProps) {
  const getGroupConfig = (group: string) => {
    const groupLower = group?.toLowerCase() || '';
    
    if (groupLower.includes('tech') || groupLower.includes('engineering')) {
      return {
        text: group,
        className: 'bg-orange-100 text-orange-800 border-orange-200',
        icon: '📄' // Document icon
      };
    }
    if (groupLower.includes('finance') || groupLower.includes('money')) {
      return {
        text: group,
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: '💰' // Money icon
      };
    }
    if (groupLower.includes('eng') || groupLower.includes('dev')) {
      return {
        text: group,
        className: 'bg-green-100 text-green-800 border-green-200',
        icon: '📄' // Document icon
      };
    }
    if (groupLower.includes('marketing') || groupLower.includes('sales')) {
      return {
        text: group,
        className: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: '📈' // Chart icon
      };
    }
    if (groupLower.includes('hr') || groupLower.includes('human')) {
      return {
        text: group,
        className: 'bg-purple-100 text-purple-800 border-purple-200',
        icon: '👥' // People icon
      };
    }
    
    // Default
    return {
      text: group,
      className: 'bg-gray-100 text-gray-800 border-gray-200',
      icon: '📁' // Folder icon
    };
  };

  const config = getGroupConfig(group);

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.className} ${className}`}>
      <span className="mr-1">{config.icon}</span>
      {config.text}
    </span>
  );
}

interface GroupPillsProps {
  groups: string[];
  maxDisplay?: number;
  className?: string;
}

export function GroupPills({ groups, maxDisplay = 2, className = "" }: GroupPillsProps) {
  if (!groups || groups.length === 0) {
    return null;
  }

  const displayGroups = groups.slice(0, maxDisplay);
  const remainingCount = groups.length - maxDisplay;

  return (
    <div className={`flex flex-wrap gap-1 ${className}`}>
      {displayGroups.map((group, index) => (
        <GroupPill key={index} group={group} />
      ))}
      {remainingCount > 0 && (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
          +{remainingCount}
        </span>
      )}
    </div>
  );
}
