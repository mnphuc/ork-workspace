"use client";
import React from 'react';

interface StatusPillProps {
  status: string;
  className?: string;
}

export function StatusPill({ status, className = "" }: StatusPillProps) {
  const getStatusConfig = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'ON_TRACK':
        return {
          text: 'ON TRACK',
          className: 'bg-green-100 text-green-800 border-green-200'
        };
      case 'BEHIND':
        return {
          text: 'BEHIND',
          className: 'bg-orange-100 text-orange-800 border-orange-200'
        };
      case 'AT_RISK':
        return {
          text: 'AT RISK',
          className: 'bg-red-100 text-red-800 border-red-200'
        };
      case 'NOT_STARTED':
        return {
          text: 'NOT STARTED',
          className: 'bg-gray-100 text-gray-800 border-gray-200'
        };
      case 'CLOSED':
        return {
          text: 'CLOSED',
          className: 'bg-blue-100 text-blue-800 border-blue-200'
        };
      case 'ABANDONED':
        return {
          text: 'ABANDONED',
          className: 'bg-gray-100 text-gray-600 border-gray-200'
        };
      default:
        return {
          text: status || 'UNKNOWN',
          className: 'bg-gray-100 text-gray-600 border-gray-200'
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.className} ${className}`}>
      {config.text}
    </span>
  );
}
