import React from 'react';

interface QuarterPickerProps {
  selectedQuarter: string;
  onQuarterChange: (quarter: string) => void;
  className?: string;
}

export function QuarterPicker({ selectedQuarter, onQuarterChange, className = '' }: QuarterPickerProps) {
  const currentYear = new Date().getFullYear();
  const quarters = [
    { value: `${currentYear}-Q1`, label: `Q1 ${currentYear}` },
    { value: `${currentYear}-Q2`, label: `Q2 ${currentYear}` },
    { value: `${currentYear}-Q3`, label: `Q3 ${currentYear}` },
    { value: `${currentYear}-Q4`, label: `Q4 ${currentYear}` },
    { value: `${currentYear + 1}-Q1`, label: `Q1 ${currentYear + 1}` },
    { value: `${currentYear + 1}-Q2`, label: `Q2 ${currentYear + 1}` },
    { value: `${currentYear + 1}-Q3`, label: `Q3 ${currentYear + 1}` },
    { value: `${currentYear + 1}-Q4`, label: `Q4 ${currentYear + 1}` },
  ];

  return (
    <select
      value={selectedQuarter}
      onChange={(e) => onQuarterChange(e.target.value)}
      className={`px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white ${className}`}
    >
      {quarters.map((quarter) => (
        <option key={quarter.value} value={quarter.value}>
          {quarter.label}
        </option>
      ))}
    </select>
  );
}

