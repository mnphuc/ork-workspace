"use client";
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

export interface ObjectiveType {
  type: 'COMPANY' | 'DEPARTMENT' | 'TEAM' | 'KPI';
  label: string;
  icon: string;
  color: string;
}

interface ObjectiveTypeSelectorProps {
  onTypeSelect: (type: ObjectiveType) => void;
  className?: string;
  buttonText?: string;
}

const getObjectiveTypes = (t: any): ObjectiveType[] => [
  {
    type: 'COMPANY',
    label: t('okr.objective.types.company'),
    icon: 'C',
    color: 'bg-blue-600'
  },
  {
    type: 'DEPARTMENT',
    label: t('okr.objective.types.department'),
    icon: 'Dp',
    color: 'bg-blue-500'
  },
  {
    type: 'TEAM',
    label: t('okr.objective.types.team'),
    icon: 'T',
    color: 'bg-blue-400'
  },
  {
    type: 'KPI',
    label: t('okr.objective.types.kpi'),
    icon: 'KPI',
    color: 'bg-red-500'
  }
];

export function ObjectiveTypeSelector({ onTypeSelect, className = '', buttonText = 'Add nested item' }: ObjectiveTypeSelectorProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const objectiveTypes = getObjectiveTypes(t);

  const handleTypeClick = (type: ObjectiveType) => {
    onTypeSelect(type);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium min-h-[44px] flex items-center gap-2 w-full justify-center"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        <span>{buttonText}</span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50">
          {objectiveTypes.map((type) => (
            <button
              key={type.type}
              onClick={() => handleTypeClick(type)}
              className="w-full flex items-center px-4 py-3 text-left hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg"
            >
              <div className={`w-8 h-8 ${type.color} rounded flex items-center justify-center text-white font-semibold text-sm mr-3`}>
                {type.icon}
              </div>
              <span className="text-gray-900 font-medium">{type.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Overlay to close dropdown when clicking outside */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
