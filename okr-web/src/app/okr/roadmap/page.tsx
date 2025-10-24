"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Layout } from '@/components/layout';
import { WorkspaceRequired } from '@/components/WorkspaceRequired';
import { logout } from '@/lib/auth';
import { clearTokens } from '@/lib/api';
import { RoadmapTimeline } from '@/components/RoadmapTimeline';
import { RoadmapFilters } from '@/components/RoadmapFilters';
import { ExportModal } from '@/components/ExportModal';
import { Loading } from '@/components/Loading';

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
  level: number;
}

interface RoadmapFilters {
  quarters: string[];
  years: number[];
  groups: string[];
  owners: string[];
  statuses: string[];
  levels: number[];
  dateRange: {
    start: string;
    end: string;
  };
}

export default function RoadmapPage() {
  const router = useRouter();
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [filteredObjectives, setFilteredObjectives] = useState<Objective[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedObjective, setSelectedObjective] = useState<Objective | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  
  const [filters, setFilters] = useState<RoadmapFilters>({
    quarters: [],
    years: [],
    groups: [],
    owners: [],
    statuses: [],
    levels: [],
    dateRange: {
      start: '',
      end: ''
    }
  });

  useEffect(() => {
    loadObjectives();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [objectives, filters]);

  const loadObjectives = async () => {
    try {
      setLoading(true);
      // Mock data for now - replace with actual API call
      const mockObjectives: Objective[] = [
        {
          id: '1',
          title: 'Increase Customer Satisfaction',
          description: 'Improve customer satisfaction scores across all touchpoints',
          status: 'on_track',
          progress: 75,
          start_date: '2024-01-01',
          end_date: '2024-03-31',
          quarter: 1,
          year: 2024,
          owner_id: 'john.doe',
          team_id: 'customer-success',
          level: 0, // Company level
        },
        {
          id: '2',
          title: 'Launch Mobile App',
          description: 'Release mobile application for iOS and Android',
          status: 'at_risk',
          progress: 45,
          start_date: '2024-01-15',
          end_date: '2024-06-30',
          quarter: 2,
          year: 2024,
          owner_id: 'jane.smith',
          team_id: 'engineering',
          level: 1, // Department level
        },
        {
          id: '3',
          title: 'Reduce Support Tickets',
          description: 'Decrease support ticket volume by 30%',
          status: 'behind',
          progress: 20,
          start_date: '2024-02-01',
          end_date: '2024-04-30',
          quarter: 2,
          year: 2024,
          owner_id: 'bob.johnson',
          team_id: 'support',
          level: 2, // Team level
        },
        {
          id: '4',
          title: 'Improve API Performance',
          description: 'Reduce API response time by 50%',
          status: 'completed',
          progress: 100,
          start_date: '2024-01-01',
          end_date: '2024-02-29',
          quarter: 1,
          year: 2024,
          owner_id: 'alice.brown',
          team_id: 'engineering',
          level: 3, // Individual level
        },
        {
          id: '5',
          title: 'Expand to European Market',
          description: 'Launch product in 5 European countries',
          status: 'not_started',
          progress: 0,
          start_date: '2024-07-01',
          end_date: '2024-12-31',
          quarter: 3,
          year: 2024,
          owner_id: 'charlie.wilson',
          team_id: 'business-development',
          level: 1, // Department level
        },
        {
          id: '6',
          title: 'Implement AI Chatbot',
          description: 'Deploy AI-powered chatbot for customer support',
          status: 'on_track',
          progress: 60,
          start_date: '2024-03-01',
          end_date: '2024-08-31',
          quarter: 2,
          year: 2024,
          owner_id: 'diana.prince',
          team_id: 'engineering',
          level: 2, // Team level
        },
        {
          id: '7',
          title: 'Increase Revenue by 25%',
          description: 'Achieve 25% revenue growth through new features',
          status: 'on_track',
          progress: 40,
          start_date: '2024-01-01',
          end_date: '2024-12-31',
          quarter: 4,
          year: 2024,
          owner_id: 'bruce.wayne',
          team_id: 'sales',
          level: 0, // Company level
        },
        {
          id: '8',
          title: 'Improve Code Quality',
          description: 'Increase test coverage to 90%',
          status: 'at_risk',
          progress: 30,
          start_date: '2024-02-15',
          end_date: '2024-05-15',
          quarter: 2,
          year: 2024,
          owner_id: 'peter.parker',
          team_id: 'engineering',
          level: 3, // Individual level
        },
      ];
      
      setObjectives(mockObjectives);
    } catch (e: any) {
      setError(e.message || 'Failed to load objectives');
      if (e.message.includes('Authentication failed')) {
        clearTokens();
        window.location.href = '/login';
      }
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...objectives];

    // Apply quarter filters
    if (filters.quarters.length > 0) {
      filtered = filtered.filter(obj => 
        filters.quarters.includes(`Q${obj.quarter}`)
      );
    }

    // Apply year filters
    if (filters.years.length > 0) {
      filtered = filtered.filter(obj => 
        filters.years.includes(obj.year)
      );
    }

    // Apply group filters
    if (filters.groups.length > 0) {
      filtered = filtered.filter(obj => 
        filters.groups.includes(obj.team_id)
      );
    }

    // Apply owner filters
    if (filters.owners.length > 0) {
      filtered = filtered.filter(obj => 
        filters.owners.includes(obj.owner_id)
      );
    }

    // Apply status filters
    if (filters.statuses.length > 0) {
      filtered = filtered.filter(obj => 
        filters.statuses.includes(obj.status)
      );
    }

    // Apply level filters
    if (filters.levels.length > 0) {
      filtered = filtered.filter(obj => 
        filters.levels.includes(obj.level)
      );
    }

    // Apply date range filters
    if (filters.dateRange.start) {
      filtered = filtered.filter(obj => 
        new Date(obj.start_date) >= new Date(filters.dateRange.start)
      );
    }

    if (filters.dateRange.end) {
      filtered = filtered.filter(obj => 
        new Date(obj.end_date) <= new Date(filters.dateRange.end)
      );
    }

    setFilteredObjectives(filtered);
  };

  const handleFiltersChange = (newFilters: RoadmapFilters) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({
      quarters: [],
      years: [],
      groups: [],
      owners: [],
      statuses: [],
      levels: [],
      dateRange: {
        start: '',
        end: ''
      }
    });
  };

  const handleObjectiveClick = (objective: Objective) => {
    setSelectedObjective(objective);
    // Navigate to objective detail page
    router.push(`/okr/${objective.id}`);
  };

  const handleObjectiveUpdate = async (objectiveId: string, updates: Partial<Objective>) => {
    setObjectives(prev => prev.map(obj => 
      obj.id === objectiveId ? { ...obj, ...updates } : obj
    ));
  };

  const handleExport = async (format: string, options: any) => {
    console.log('Exporting roadmap:', format, options);
    // Implement export functionality
    setShowExportModal(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.warn('Logout failed:', error);
    } finally {
      clearTokens();
      window.location.href = '/login';
    }
  };

  // Get unique values for filter options
  const availableGroups = [...new Set(objectives.map(obj => obj.team_id))];
  const availableOwners = [...new Set(objectives.map(obj => obj.owner_id))];

  if (loading) {
    return (
      <Layout onLogout={handleLogout}>
        <WorkspaceRequired>
          <Loading text="Loading roadmap..." />
        </WorkspaceRequired>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout onLogout={handleLogout}>
        <WorkspaceRequired>
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
            {error}
          </div>
        </WorkspaceRequired>
      </Layout>
    );
  }

  return (
    <Layout onLogout={handleLogout}>
      <WorkspaceRequired>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Roadmap</h1>
            <p className="text-gray-600 mt-1">
              Visualize objectives across time with interactive timeline
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowExportModal(true)}
              className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            >
              Export Roadmap
            </button>
            <button
              onClick={() => router.push('/okr')}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Back to Objectives
            </button>
          </div>
        </div>

        {/* Filters */}
        <RoadmapFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onClearFilters={handleClearFilters}
          availableGroups={availableGroups}
          availableOwners={availableOwners}
        />

        {/* Timeline */}
        <RoadmapTimeline
          objectives={filteredObjectives}
          onObjectiveClick={handleObjectiveClick}
          onObjectiveUpdate={handleObjectiveUpdate}
        />

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-2xl font-bold text-blue-600">{filteredObjectives.length}</div>
            <div className="text-sm text-gray-600">Total Objectives</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-2xl font-bold text-green-600">
              {filteredObjectives.filter(o => o.status === 'completed').length}
            </div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-2xl font-bold text-yellow-600">
              {filteredObjectives.filter(o => o.status === 'at_risk').length}
            </div>
            <div className="text-sm text-gray-600">At Risk</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-2xl font-bold text-orange-600">
              {filteredObjectives.filter(o => o.status === 'behind').length}
            </div>
            <div className="text-sm text-gray-600">Behind</div>
          </div>
        </div>

        {/* Export Modal */}
        <ExportModal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          onExport={handleExport}
          dataType="roadmap"
          dataCount={filteredObjectives.length}
        />
      </div>
      </WorkspaceRequired>
    </Layout>
  );
}


