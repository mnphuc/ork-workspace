import React from 'react';

interface ProgressBarProps {
  progress: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export function ProgressBar({ 
  progress, 
  size = 'md', 
  showLabel = true, 
  className = '' 
}: ProgressBarProps) {
  const getHeight = (): string => {
    switch (size) {
      case 'sm': return 'h-1';
      case 'md': return 'h-2';
      case 'lg': return 'h-3';
      default: return 'h-2';
    }
  };

  const getProgressColor = (progress: number): string => {
    if (progress >= 70) return 'bg-green-500';
    if (progress >= 30) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Progress</span>
          <span>{clampedProgress.toFixed(1)}%</span>
        </div>
      )}
      <div className={`w-full bg-gray-200 rounded-full ${getHeight()}`}>
        <div 
          className={`${getHeight()} rounded-full transition-all duration-300 ${getProgressColor(clampedProgress)}`}
          style={{ width: `${clampedProgress}%` }}
        ></div>
      </div>
    </div>
  );
}

