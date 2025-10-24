import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  onClick, 
  disabled = false, 
  loading = false,
  className = '',
  type = 'button'
}: ButtonProps) {
  const getVariantClasses = (): string => {
    switch (variant) {
      case 'primary':
        return 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500';
      case 'secondary':
        return 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500';
      case 'danger':
        return 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500';
      case 'outline':
        return 'border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-blue-500';
      default:
        return 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500';
    }
  };

  const getSizeClasses = (): string => {
    switch (size) {
      case 'sm': return 'px-3 py-2 text-sm min-h-[44px]';
      case 'md': return 'px-4 py-2.5 text-sm min-h-[44px]';
      case 'lg': return 'px-6 py-3 text-base min-h-[48px]';
      default: return 'px-4 py-2.5 text-sm min-h-[44px]';
    }
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center rounded-md font-medium
        focus:outline-none focus:ring-2 focus:ring-offset-2
        transition-colors duration-200
        ${getVariantClasses()}
        ${getSizeClasses()}
        ${disabled || loading ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  );
}

