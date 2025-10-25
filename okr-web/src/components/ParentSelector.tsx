"use client";
import React, { useState, useEffect, useRef } from 'react';
import { apiFetch } from '@/lib/api';

interface Objective {
  id: string;
  title: string;
  type: string;
  status: string;
}

interface ParentSelectorProps {
  value?: string;
  onChange: (parentId: string | null) => void;
  currentObjectiveId?: string; // Exclude current objective from parent options
}

export function ParentSelector({ value, onChange, currentObjectiveId }: ParentSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedObjective, setSelectedObjective] = useState<Objective | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load objectives when component mounts
  useEffect(() => {
    loadObjectives();
  }, []);

  // Load selected objective when value changes
  useEffect(() => {
    if (value && objectives.length > 0) {
      const objective = objectives.find(obj => obj.id === value);
      setSelectedObjective(objective || null);
    } else {
      setSelectedObjective(null);
    }
  }, [value, objectives]);

  // Close dropdown when clicking outside
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

  const loadObjectives = async () => {
    try {
      setLoading(true);
      const data = await apiFetch<Objective[]>('/objectives');
      // Filter out current objective to prevent self-parenting
      const filteredData = currentObjectiveId 
        ? data.filter(obj => obj.id !== currentObjectiveId)
        : data;
      setObjectives(filteredData);
    } catch (error) {
      console.error('Failed to load objectives:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredObjectives = objectives.filter(objective =>
    objective.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (objective: Objective) => {
    setSelectedObjective(objective);
    onChange(objective.id);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleClear = () => {
    setSelectedObjective(null);
    onChange(null);
    setIsOpen(false);
    setSearchQuery('');
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'COMPANY':
        return 'C';
      case 'DEPARTMENT':
        return 'Dp';
      case 'TEAM':
        return 'T';
      case 'KPI':
        return 'KPI';
      default:
        return 'O';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'COMPANY':
        return 'bg-blue-600';
      case 'DEPARTMENT':
        return 'bg-blue-400';
      case 'TEAM':
        return 'bg-blue-500';
      case 'KPI':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Parent Objective
      </label>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          placeholder="Search for parent objective..."
          value={isOpen ? searchQuery : (selectedObjective?.title || '')}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            if (!isOpen) {
              setIsOpen(true);
            }
          }}
          onFocus={() => setIsOpen(true)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          {selectedObjective && (
            <button
              onClick={handleClear}
              className="text-gray-400 hover:text-gray-600 mr-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          <svg 
            className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {loading ? (
            <div className="px-4 py-3 text-sm text-gray-500 text-center">
              Loading objectives...
            </div>
          ) : filteredObjectives.length === 0 ? (
            <div className="px-4 py-3 text-sm text-gray-500 text-center">
              {searchQuery ? 'No objectives found' : 'No objectives available'}
            </div>
          ) : (
            <div className="py-1">
              {filteredObjectives.map((objective) => (
                <button
                  key={objective.id}
                  onClick={() => handleSelect(objective)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                >
                  <div className="flex items-center">
                    <div className={`w-6 h-6 rounded-full ${getTypeColor(objective.type)} flex items-center justify-center text-white text-xs font-bold mr-3`}>
                      {getTypeIcon(objective.type)}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">
                        {objective.title}
                      </div>
                      <div className="text-xs text-gray-500">
                        {objective.type} • {objective.status}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
