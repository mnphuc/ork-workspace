"use client";
import React, { useState, useRef, useEffect } from 'react';
import { formatDate, formatQuarter } from '@/lib/date-utils';

interface Objective {
  id: string;
  title: string;
  description: string;
  status: 'not_started' | 'on_track' | 'at_risk' | 'behind' | 'completed' | 'abandoned';
  progress: number;
  start_date: string;
  end_date: string;
  quarter: number;
  year: number;
  owner_id: string;
  team_id: string;
  parent_id?: string;
  level: number; // 0 = company, 1 = department, 2 = team, 3 = individual
}

interface RoadmapTimelineProps {
  objectives: Objective[];
  onObjectiveClick: (objective: Objective) => void;
  onObjectiveUpdate: (objectiveId: string, updates: Partial<Objective>) => void;
  className?: string;
}

export function RoadmapTimeline({ 
  objectives, 
  onObjectiveClick, 
  onObjectiveUpdate,
  className = "" 
}: RoadmapTimelineProps) {
  const [selectedObjective, setSelectedObjective] = useState<Objective | null>(null);
  const [draggedObjective, setDraggedObjective] = useState<Objective | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const timelineRef = useRef<HTMLDivElement>(null);

  // Group objectives by quarters
  const groupedObjectives = objectives.reduce((acc, obj) => {
    const key = `${obj.year}-Q${obj.quarter}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(obj);
    return acc;
  }, {} as Record<string, Objective[]>);

  // Sort quarters chronologically
  const sortedQuarters = Object.keys(groupedObjectives).sort((a, b) => {
    const [yearA, quarterA] = a.split('-Q').map(Number);
    const [yearB, quarterB] = b.split('-Q').map(Number);
    if (yearA !== yearB) return yearA - yearB;
    return quarterA - quarterB;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'not_started': return 'bg-gray-200 border-gray-300';
      case 'on_track': return 'bg-green-200 border-green-400';
      case 'at_risk': return 'bg-yellow-200 border-yellow-400';
      case 'behind': return 'bg-orange-200 border-orange-400';
      case 'completed': return 'bg-blue-200 border-blue-400';
      case 'abandoned': return 'bg-red-200 border-red-400';
      default: return 'bg-gray-200 border-gray-300';
    }
  };

  const getLevelColor = (level: number) => {
    switch (level) {
      case 0: return 'bg-purple-100 border-purple-300'; // Company
      case 1: return 'bg-blue-100 border-blue-300'; // Department
      case 2: return 'bg-green-100 border-green-300'; // Team
      case 3: return 'bg-yellow-100 border-yellow-300'; // Individual
      default: return 'bg-gray-100 border-gray-300';
    }
  };

  const getLevelLabel = (level: number) => {
    switch (level) {
      case 0: return 'Company';
      case 1: return 'Department';
      case 2: return 'Team';
      case 3: return 'Individual';
      default: return 'Unknown';
    }
  };

  const calculateTimelinePosition = (objective: Objective) => {
    const startDate = new Date(objective.start_date);
    const endDate = new Date(objective.end_date);
    const now = new Date();
    
    // Calculate position based on quarter and progress
    const quarterStart = new Date(objective.year, (objective.quarter - 1) * 3, 1);
    const quarterEnd = new Date(objective.year, objective.quarter * 3, 0);
    
    const totalDuration = quarterEnd.getTime() - quarterStart.getTime();
    const elapsed = now.getTime() - quarterStart.getTime();
    const progress = Math.max(0, Math.min(1, elapsed / totalDuration));
    
    return {
      left: `${progress * 100}%`,
      width: `${Math.max(10, (endDate.getTime() - startDate.getTime()) / totalDuration * 100)}%`
    };
  };

  const handleMouseDown = (e: React.MouseEvent, objective: Objective) => {
    e.preventDefault();
    setDraggedObjective(objective);
    setIsDragging(true);
    
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !draggedObjective) return;
    
    // Calculate new position based on mouse position
    const timelineRect = timelineRef.current?.getBoundingClientRect();
    if (!timelineRect) return;
    
    const relativeX = e.clientX - timelineRect.left;
    const percentage = Math.max(0, Math.min(100, (relativeX / timelineRect.width) * 100));
    
    // Update objective position (this would trigger API call in real implementation)
    // For now, we'll just update the local state
  };

  const handleMouseUp = () => {
    if (isDragging && draggedObjective) {
      // Here you would call the API to update the objective's dates
      setIsDragging(false);
      setDraggedObjective(null);
    }
  };

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        handleMouseMove(e as any);
      }
    };

    const handleGlobalMouseUp = () => {
      handleMouseUp();
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging, draggedObjective]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Timeline Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Roadmap Timeline</h3>
          <p className="text-sm text-gray-600">
            Drag objectives to adjust timelines. Click to view details.
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-purple-200 border border-purple-300 rounded"></div>
            <span className="text-xs text-gray-600">Company</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-200 border border-blue-300 rounded"></div>
            <span className="text-xs text-gray-600">Department</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-200 border border-green-300 rounded"></div>
            <span className="text-xs text-gray-600">Team</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-200 border border-yellow-300 rounded"></div>
            <span className="text-xs text-gray-600">Individual</span>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div 
        ref={timelineRef}
        className="relative bg-white border border-gray-200 rounded-lg overflow-hidden"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {sortedQuarters.map((quarterKey, quarterIndex) => {
          const [year, quarter] = quarterKey.split('-Q').map(Number);
          const quarterObjectives = groupedObjectives[quarterKey];
          
          return (
            <div key={quarterKey} className="border-b border-gray-100 last:border-b-0">
              {/* Quarter Header */}
              <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h4 className="text-md font-semibold text-gray-900">
                    {formatQuarter(quarter)} {year}
                  </h4>
                  <span className="text-sm text-gray-500">
                    {quarterObjectives.length} objectives
                  </span>
                </div>
              </div>

              {/* Quarter Timeline */}
              <div className="relative p-6">
                <div className="relative h-32">
                  {/* Timeline Grid */}
                  <div className="absolute inset-0 flex">
                    {Array.from({ length: 12 }, (_, i) => (
                      <div key={i} className="flex-1 border-r border-gray-100">
                        <div className="h-full flex items-center justify-center">
                          <span className="text-xs text-gray-400">
                            {i + 1}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Objectives */}
                  {quarterObjectives.map((objective, objIndex) => {
                    const position = calculateTimelinePosition(objective);
                    const isSelected = selectedObjective?.id === objective.id;
                    const isDragged = draggedObjective?.id === objective.id;
                    
                    return (
                      <div
                        key={objective.id}
                        className={`absolute top-${objIndex * 8} h-6 rounded border-2 cursor-pointer transition-all duration-200 ${
                          isDragged ? 'opacity-50 z-50' : 'hover:shadow-md'
                        } ${getStatusColor(objective.status)} ${getLevelColor(objective.level)}`}
                        style={{
                          left: position.left,
                          width: position.width,
                          top: `${objIndex * 32 + 8}px`,
                          zIndex: isSelected ? 10 : 1
                        }}
                        onMouseDown={(e) => handleMouseDown(e, objective)}
                        onClick={() => {
                          setSelectedObjective(objective);
                          onObjectiveClick(objective);
                        }}
                      >
                        <div className="flex items-center h-full px-2">
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-medium text-gray-900 truncate">
                              {objective.title}
                            </div>
                            <div className="text-xs text-gray-600 truncate">
                              {getLevelLabel(objective.level)} • {objective.progress}%
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Quarter Summary */}
                <div className="mt-4 grid grid-cols-4 gap-4 text-sm">
                  <div className="text-center">
                    <div className="font-semibold text-gray-900">
                      {quarterObjectives.filter(o => o.status === 'completed').length}
                    </div>
                    <div className="text-gray-500">Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-green-600">
                      {quarterObjectives.filter(o => o.status === 'on_track').length}
                    </div>
                    <div className="text-gray-500">On Track</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-yellow-600">
                      {quarterObjectives.filter(o => o.status === 'at_risk').length}
                    </div>
                    <div className="text-gray-500">At Risk</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-orange-600">
                      {quarterObjectives.filter(o => o.status === 'behind').length}
                    </div>
                    <div className="text-gray-500">Behind</div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Objective Details */}
      {selectedObjective && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="text-md font-semibold text-blue-900">
                {selectedObjective.title}
              </h4>
              <p className="text-sm text-blue-800 mt-1">
                {selectedObjective.description}
              </p>
              <div className="mt-2 flex items-center space-x-4 text-sm text-blue-700">
                <span>Level: {getLevelLabel(selectedObjective.level)}</span>
                <span>Progress: {selectedObjective.progress}%</span>
                <span>Status: {selectedObjective.status.replace('_', ' ')}</span>
                <span>Owner: {selectedObjective.owner_id}</span>
              </div>
            </div>
            <button
              onClick={() => setSelectedObjective(null)}
              className="text-blue-600 hover:text-blue-800"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <div className="text-gray-600">💡</div>
          <div className="text-sm text-gray-700">
            <strong>Tip:</strong> Drag objectives horizontally to adjust their timeline. 
            Click on objectives to view details. Use the filters above to focus on specific groups or time periods.
          </div>
        </div>
      </div>
    </div>
  );
}


