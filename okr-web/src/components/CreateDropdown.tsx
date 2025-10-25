"use client";
import React, { useState, useRef, useEffect } from 'react';

interface CreateOption {
  id: string;
  label: string;
  icon: string;
  type: string;
  color: string;
}

interface CreateDropdownProps {
  onCreate: (type: string) => void;
}

const createOptions: CreateOption[] = [
  {
    id: 'company',
    label: 'Company',
    icon: 'C',
    type: 'COMPANY',
    color: 'bg-blue-600'
  },
  {
    id: 'department',
    label: 'Department',
    icon: 'Dp',
    type: 'DEPARTMENT',
    color: 'bg-blue-400'
  },
  {
    id: 'team',
    label: 'Team',
    icon: 'T',
    type: 'TEAM',
    color: 'bg-blue-500'
  },
  {
    id: 'kpi',
    label: 'KPI',
    icon: 'KPI',
    type: 'KPI',
    color: 'bg-red-500'
  }
];

export function CreateDropdown({ onCreate }: CreateDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleOptionClick = (option: CreateOption) => {
    onCreate(option.type);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Create button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <span className="mr-2">+</span>
        Create
        <svg 
          className={`ml-2 h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1">
            {createOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => handleOptionClick(option)}
                className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
              >
                <div className={`w-8 h-8 rounded-full ${option.color} flex items-center justify-center text-white text-xs font-bold mr-3`}>
                  {option.icon}
                </div>
                <span className="font-medium">{option.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
