"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { Layout } from '@/components/layout';
import { WorkspaceRequired } from '@/components/WorkspaceRequired';
import { apiFetch } from '@/lib/api';
import { clearTokens } from '@/lib/api';
import { logout } from '@/lib/auth';
import { formatDate, formatQuarter } from '@/lib/date-utils';
import { formatStatus, getStatusColor as getStatusColorUtil } from '@/lib/format-utils';
import { ObjectiveTypeSelector, ObjectiveType } from '@/components/ObjectiveTypeSelector';
import { ObjectiveModal } from '@/components/ObjectiveModal';
import { SearchBox } from '@/components/SearchBox';
import { FilterPanel } from '@/components/FilterPanel';
import { AdvancedFilters } from '@/components/AdvancedFilters';
import { ExportModal } from '@/components/ExportModal';
import { ImportModal } from '@/components/ImportModal';
import { BulkEditModal } from '@/components/BulkEditModal';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useUser } from '@/contexts/UserContext';
import { OKRHeader } from '@/components/OKRHeader';
import { OKRTable } from '@/components/OKRTable';

type Objective = { 
  id: string; 
  title: string; 
  description: string; 
  status: string; 
  progress: number; 
  weight?: number;
  owner_id: string; 
  team_id: string; 
  quarter: string; 
  year: number; 
  created_date: string; 
  last_modified_date: string;
  groups: string[];
  last_check_in_date?: string;
  comments_count: number;
  key_results?: any[];
  kpis?: any[];
};

function ObjectivesContent() {
  const { t } = useTranslation();
  const router = useRouter();
  const { currentWorkspace, loading: workspaceLoading } = useWorkspace();
  const { user } = useUser();
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [filteredObjectives, setFilteredObjectives] = useState<Objective[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOwner, setSelectedOwner] = useState<string>('All owners');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<ObjectiveType | null>(null);
  
  // Export/Import/Bulk Edit state
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showBulkEditModal, setShowBulkEditModal] = useState(false);
  const [selectedObjectives, setSelectedObjectives] = useState<Objective[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    quarter: null,
    owner: null,
    status: null,
    groups: null,
    progressRange: null,
    dateRange: null
  });

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      window.location.href = '/login';
      return;
    }
    
    // Wait for workspace to load
    if (workspaceLoading) {
      return;
    }
    
    if (!currentWorkspace) {
      setError('No workspace selected');
      setLoading(false);
      return;
    }
    
    // Always reload objectives when workspace changes
    loadObjectives();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentWorkspace?.id, workspaceLoading]);

  // Apply search and filters
  useEffect(() => {
    let filtered = [...objectives];

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(obj => 
        obj.title.toLowerCase().includes(query) ||
        (obj.description && obj.description.toLowerCase().includes(query)) ||
        obj.owner_id.toLowerCase().includes(query) ||
        (obj.team_id && obj.team_id.toLowerCase().includes(query))
      );
    }

    // Apply filters
    if (filters.quarter) {
      filtered = filtered.filter(obj => obj.quarter === filters.quarter);
    }
    
    if (filters.owner) {
      filtered = filtered.filter(obj => obj.owner_id === filters.owner);
    }
    
    if (filters.status) {
      filtered = filtered.filter(obj => obj.status === filters.status);
    }
    
    if (filters.groups && Array.isArray(filters.groups)) {
      filtered = filtered.filter(obj => filters.groups.includes(obj.team_id));
    }
    
    if (filters.progressRange) {
      const { min, max } = filters.progressRange;
      filtered = filtered.filter(obj => {
        const progress = obj.progress;
        return (min === null || progress >= min) && (max === null || progress <= max);
      });
    }
    
    if (filters.dateRange) {
      const { from, to } = filters.dateRange;
      filtered = filtered.filter(obj => {
        const createdDate = new Date(obj.created_date);
        return (from === null || createdDate >= new Date(from)) && 
               (to === null || createdDate <= new Date(to));
      });
    }

    // Filter by owner
    if (selectedOwner !== 'All owners') {
      filtered = filtered.filter(obj => obj.owner_id === selectedOwner);
    }

    setFilteredObjectives(filtered);
  }, [objectives, searchQuery, filters, selectedOwner]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleOwnerFilter = (owner: string) => {
    setSelectedOwner(owner);
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      quarter: null,
      owner: null,
      status: null,
      groups: null,
      progressRange: null,
      dateRange: null
    });
    setSearchQuery('');
  };

  // Export/Import/Bulk Edit handlers
  const handleExport = async (exportData: any) => {
    console.log('Exporting objectives:', exportData);
    // Implement export logic here
    setShowExportModal(false);
  };

  const handleImport = async (importData: any) => {
    try {
      console.log('Importing objectives:', importData);
      // TODO: Implement import logic here
      setShowImportModal(false);
      // Reload objectives after import
      await loadObjectives();
    } catch (e: any) {
      console.error('Failed to import objectives:', e);
      alert('Failed to import objectives: ' + (e.message || 'Unknown error'));
    }
  };

  const handleBulkEdit = async (bulkEditData: any) => {
    try {
      console.log('Bulk editing objectives:', bulkEditData);
      // TODO: Implement bulk edit logic here
      setShowBulkEditModal(false);
      setSelectedObjectives([]);
      setSelectAll(false);
      // Reload objectives after bulk edit
      await loadObjectives();
    } catch (e: any) {
      console.error('Failed to bulk edit objectives:', e);
      alert('Failed to bulk edit objectives: ' + (e.message || 'Unknown error'));
    }
  };

  const handleSelectObjective = (objective: Objective, selected: boolean) => {
    if (selected) {
      setSelectedObjectives(prev => [...prev, objective]);
    } else {
      setSelectedObjectives(prev => prev.filter(obj => obj.id !== objective.id));
    }
  };

  const handleSelectAll = (selected: boolean) => {
    setSelectAll(selected);
    if (selected) {
      setSelectedObjectives([...filteredObjectives]);
    } else {
      setSelectedObjectives([]);
    }
  };

  const handleViewDetails = (id: string) => {
    router.push(`/okr/${id}`);
  };

  const handleEdit = (id: string) => {
    // TODO: Implement edit functionality
    console.log('Edit objective:', id);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this objective?')) {
      return;
    }
    
    try {
      await apiFetch(`/objectives/${id}`, { method: 'DELETE' });
      // Reload objectives to refresh the list
      await loadObjectives();
    } catch (e: unknown) {
      console.error('Failed to delete objective:', e);
      alert('Failed to delete objective');
    }
  };

  const handleTypeSelect = (type: ObjectiveType | string) => {
    // Convert string to ObjectiveType if needed
    let objectiveType: ObjectiveType;
    if (typeof type === 'string') {
      // Map string to ObjectiveType
      objectiveType = {
        type: type as 'COMPANY' | 'DEPARTMENT' | 'TEAM' | 'KPI',
        label: type === 'COMPANY' ? 'Company' : type === 'DEPARTMENT' ? 'Department' : type === 'TEAM' ? 'Team' : 'KPI',
        icon: type === 'COMPANY' ? 'C' : type === 'DEPARTMENT' ? 'Dp' : type === 'TEAM' ? 'T' : 'KPI',
        color: type === 'COMPANY' ? 'bg-blue-600' : type === 'DEPARTMENT' ? 'bg-blue-500' : type === 'TEAM' ? 'bg-blue-400' : 'bg-red-500'
      };
    } else {
      objectiveType = type;
    }
    setSelectedType(objectiveType);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedType(null);
  };

  const handleObjectiveSave = async (objective: Objective) => {
    try {
      // Objective already created by ObjectiveModal, just reload data
      await loadObjectives();
      
      setIsModalOpen(false);
      setSelectedType(null);
    } catch (e: any) {
      console.error('Failed to reload objectives:', e);
      alert('Failed to reload objectives: ' + (e.message || 'Unknown error'));
    }
  };

  const loadObjectives = async () => {
    if (!currentWorkspace) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await apiFetch<Objective[]>(`/objectives?workspaceId=${currentWorkspace.id}`);
      
      // Remove duplicates based on id
      const uniqueData = data.filter((objective, index, self) => 
        index === self.findIndex(obj => obj.id === objective.id)
      );
      
      // Map backend response to frontend format
      const mappedData = uniqueData.map(objective => ({
        ...objective,
        // Convert status from uppercase to lowercase with underscore
        status: objective.status.toLowerCase().replace(/([A-Z])/g, '_$1').replace(/^_/, ''),
        // Convert date fields from Instant to string
        created_date: objective.created_date ? new Date(objective.created_date).toISOString().split('T')[0] : '',
        last_modified_date: objective.last_modified_date ? new Date(objective.last_modified_date).toISOString().split('T')[0] : '',
        last_check_in_date: objective.last_check_in_date ? new Date(objective.last_check_in_date).toISOString().split('T')[0] : undefined,
        // Map key results status
        key_results: objective.key_results?.map(kr => ({
          ...kr,
          status: kr.status ? kr.status.toLowerCase().replace(/([A-Z])/g, '_$1').replace(/^_/, '') : 'not_started',
          created_date: kr.created_date ? new Date(kr.created_date).toISOString().split('T')[0] : '',
          last_modified_date: kr.last_modified_date ? new Date(kr.last_modified_date).toISOString().split('T')[0] : ''
        })) || [],
        // Map KPIs status
        kpis: objective.kpis?.map(kpi => ({
          ...kpi,
          status: kpi.status.toLowerCase().replace(/([A-Z])/g, '_$1').replace(/^_/, ''),
          created_date: kpi.created_date ? new Date(kpi.created_date).toISOString().split('T')[0] : '',
          last_modified_date: kpi.last_modified_date ? new Date(kpi.last_modified_date).toISOString().split('T')[0] : '',
          last_check_in_date: kpi.last_check_in_date ? new Date(kpi.last_check_in_date).toISOString().split('T')[0] : undefined,
          key_results: [],
          kpis: []
        })) || []
      }));
      
      setObjectives(mappedData);
      setFilteredObjectives(mappedData);
    } catch (e: any) {
      setError(e.message || 'Failed to load objectives');
    } finally {
      setLoading(false);
    }
  };

  // Don't show full page loading, let it render and show loading inside table

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* OKR Header */}
      <OKRHeader
        onQuarterChange={(quarter) => console.log('Quarter changed:', quarter)}
        onOwnerFilter={handleOwnerFilter}
        onGroupFilter={(group) => console.log('Group filter:', group)}
        onSearch={(query) => handleSearch(query)}
        onShare={() => console.log('Share')}
        onExport={() => setShowExportModal(true)}
        onCreate={handleTypeSelect}
      />

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex-1">
            <SearchBox
              placeholder="Search objectives, owners, teams..."
              onSearch={handleSearch}
              onClear={() => setSearchQuery('')}
              className="w-full"
            />
          </div>
        </div>

        <FilterPanel
          filters={[
            {
              key: 'quarter',
              label: 'Quarter',
              type: 'select',
              options: [
                { value: 'Q1', label: 'Q1' },
                { value: 'Q2', label: 'Q2' },
                { value: 'Q3', label: 'Q3' },
                { value: 'Q4', label: 'Q4' }
              ]
            },
            {
              key: 'status',
              label: 'Status',
              type: 'select',
              options: [
                { value: 'draft', label: 'Draft' },
                { value: 'active', label: 'Active' },
                { value: 'completed', label: 'Completed' },
                { value: 'cancelled', label: 'Cancelled' }
              ]
            },
            {
              key: 'owner',
              label: 'Owner',
              type: 'select',
              options: Array.from(new Set(objectives.map(obj => obj.owner_id))).map(owner => ({
                value: owner,
                label: owner
              }))
            },
            {
              key: 'groups',
              label: 'Groups',
              type: 'multiselect',
              options: Array.from(new Set(objectives.map(obj => obj.team_id))).map(team => ({
                value: team,
                label: team
              }))
            }
          ]}
          values={filters}
          onChange={handleFilterChange}
          onClear={handleClearFilters}
        />

        <AdvancedFilters
          filters={[
            {
              key: 'progressRange',
              label: 'Progress Range',
              type: 'range',
              min: 0,
              max: 100,
              step: 1
            },
            {
              key: 'dateRange',
              label: 'Created Date',
              type: 'daterange'
            }
          ]}
          values={filters}
          onChange={handleFilterChange}
          onClear={handleClearFilters}
        />
      </div>
      
      {/* OKR Table */}
      <OKRTable
        objectives={filteredObjectives}
        onViewDetails={(objective) => handleViewDetails(objective.id)}
        onEdit={(objective) => handleEdit(objective.id)}
        onDelete={(objective) => handleDelete(objective.id)}
        loading={loading || workspaceLoading}
      />
      {!loading && !workspaceLoading && filteredObjectives.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="text-gray-400 text-6xl mb-4">🎯</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">{t('okr.objective.title')} {t('common.no')}</h3>
          <p className="text-gray-500 mb-6">{t('okr.objective.create')} {t('okr.objective.title').toLowerCase()} {t('common.first')} {t('common.to')} {t('common.get')} {t('common.started')}</p>
          <ObjectiveTypeSelector 
            onTypeSelect={handleTypeSelect}
            className="max-w-md mx-auto"
            buttonText={t('okr.objective.create')}
          />
        </div>
      )}

      <ObjectiveModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSave={handleObjectiveSave}
        selectedType={selectedType}
      />

      {/* Export/Import/Bulk Edit Modals */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExport={handleExport}
        dataType="objectives"
        dataCount={filteredObjectives.length}
      />

      <ImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={handleImport}
        dataType="objectives"
      />

      <BulkEditModal
        isOpen={showBulkEditModal}
        onClose={() => setShowBulkEditModal(false)}
        onBulkEdit={handleBulkEdit}
        selectedItems={selectedObjectives}
        dataType="objectives"
      />
    </div>
  );
}

function getStatusColor(status: string): string {
  return getStatusColorUtil(status);
}

function getOwnerName(ownerId: string, currentUser: any): string {
  // If it's the current user, show their name
  if (currentUser && currentUser.id === ownerId) {
    return currentUser.name || currentUser.email || 'Current User';
  }
  // For other users, we'd need to fetch their info
  // For now, show a truncated ID
  return ownerId.substring(0, 8) + '...';
}

export default function ObjectivesPage() {
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

  return (
    <Layout onLogout={handleLogout}>
      <WorkspaceRequired>
        <ObjectivesContent />
      </WorkspaceRequired>
    </Layout>
  );
}