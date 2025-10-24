import React from 'react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function StatusBadge({ status, size = 'md', className = '' }: StatusBadgeProps) {
  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'not_started': return 'bg-gray-100 text-gray-800';
      case 'at_risk': return 'bg-red-100 text-red-800';
      case 'behind': return 'bg-yellow-100 text-yellow-800';
      case 'on_track': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-blue-100 text-blue-800';
      case 'abandoned': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSizeClasses = (): string => {
    switch (size) {
      case 'sm': return 'px-2 py-1 text-xs';
      case 'md': return 'px-3 py-1 text-sm';
      case 'lg': return 'px-4 py-2 text-base';
      default: return 'px-3 py-1 text-sm';
    }
  };

  const formatStatus = (status: string): string => {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <span className={`inline-flex items-center rounded-full font-medium ${getStatusColor(status)} ${getSizeClasses()} ${className}`}>
      {formatStatus(status)}
    </span>
  );
}

