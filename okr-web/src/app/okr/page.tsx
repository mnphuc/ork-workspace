"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { Layout } from '@/components/layout';
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

type Objective = { 
  id: string; 
  title: string; 
  description: string; 
  status: string; 
  progress: number; 
  owner_id: string; 
  team_id: string; 
  quarter: string; 
  year: number; 
  created_date: string; 
  last_modified_date: string; 
};

export default function ObjectivesPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [filteredObjectives, setFilteredObjectives] = useState<Objective[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
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
    
    apiFetch<Objective[]>('/objectives')
      .then((data) => {
        setObjectives(data);
        setFilteredObjectives(data);
      })
      .catch((e) => {
        setError(e.message || 'Failed to load');
        // If it's an auth error, redirect to login
        if (e.message.includes('Authentication failed')) {
          clearTokens();
          window.location.href = '/login';
        }
      })
      .finally(() => setLoading(false));
  }, []);

  // Apply search and filters
  useEffect(() => {
    let filtered = [...objectives];

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(obj => 
        obj.title.toLowerCase().includes(query) ||
        obj.description.toLowerCase().includes(query) ||
        obj.owner_id.toLowerCase().includes(query) ||
        obj.team_id.toLowerCase().includes(query)
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

    setFilteredObjectives(filtered);
  }, [objectives, searchQuery, filters]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
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
    console.log('Importing objectives:', importData);
    // Implement import logic here
    setShowImportModal(false);
    // Reload objectives after import
    await loadObjectives();
  };

  const handleBulkEdit = async (bulkEditData: any) => {
    console.log('Bulk editing objectives:', bulkEditData);
    // Implement bulk edit logic here
    setShowBulkEditModal(false);
    setSelectedObjectives([]);
    setSelectAll(false);
    // Reload objectives after bulk edit
    await loadObjectives();
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
      setObjectives(objectives.filter(obj => obj.id !== id));
    } catch (e: unknown) {
      console.error('Failed to delete objective:', e);
      alert('Failed to delete objective');
    }
  };


  const handleTypeSelect = (type: ObjectiveType) => {
    setSelectedType(type);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedType(null);
  };

  const handleObjectiveSave = (objective: Objective) => {
    // Add the new objective to the list
    setObjectives(prev => [objective, ...prev]);
    setIsModalOpen(false);
    setSelectedType(null);
  };

  if (loading) {
    return (
      <Layout onLogout={handleLogout}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout onLogout={handleLogout}>
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
          {error}
        </div>
      </Layout>
    );
  }

  return (
    <Layout onLogout={handleLogout}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{t('navigation.objectives')}</h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">{t('dashboard.objectives')}</p>
          </div>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setShowImportModal(true)}
                className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 flex items-center space-x-1"
              >
                <span>📥</span>
                <span>Import</span>
              </button>
              <button
                onClick={() => setShowExportModal(true)}
                className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 flex items-center space-x-1"
              >
                <span>📤</span>
                <span>Export</span>
              </button>
              {selectedObjectives.length > 0 && (
                <button
                  onClick={() => setShowBulkEditModal(true)}
                  className="px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-1"
                >
                  <span>✏️</span>
                  <span>Bulk Edit ({selectedObjectives.length})</span>
                </button>
              )}
            </div>
            <ObjectiveTypeSelector 
              onTypeSelect={handleTypeSelect}
              className="min-h-[44px]"
              buttonText={t('okr.objective.create')}
            />
          </div>
        </div>

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
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <h3 className="text-lg font-semibold text-gray-900">{t('dashboard.objectives')}</h3>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">{filteredObjectives.length} {t('dashboard.objectives').toLowerCase()}</span>
                <button className="text-gray-400 hover:text-gray-600 p-1">
                  <span className="text-lg">⚙️</span>
                </button>
              </div>
            </div>
          </div>
          
          <div className="divide-y divide-gray-200">
            {filteredObjectives.map((obj) => (
              <div key={obj.id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-4 lg:space-y-0">
                  <div className="flex items-start space-x-3 flex-1">
                    <input
                      type="checkbox"
                      checked={selectedObjectives.some(selected => selected.id === obj.id)}
                      onChange={(e) => handleSelectObjective(obj, e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
                    />
                    <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mb-2">
                      <h4 className="text-lg font-semibold text-gray-900">{obj.title}</h4>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium w-fit ${getStatusColor(obj.status)}`}>
                        {formatStatus(obj.status)}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-4 text-sm sm:text-base">{obj.description}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500">
                      <span>{formatQuarter(obj.quarter)} {obj.year}</span>
                      <span>{t('okr.objective.ownerLabel')}: {obj.owner_id}</span>
                      <span>{t('okr.objective.ownerLabel')}: {obj.team_id}</span>
                      <span>{t('common.date')}: {formatDate(obj.last_modified_date)}</span>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end space-y-2 sm:space-y-0 sm:space-x-4 lg:space-x-0 lg:space-y-3">
                    <div className="text-left sm:text-center lg:text-right">
                      <div className="text-xl sm:text-2xl font-bold text-gray-900">{obj.progress}%</div>
                      <div className="text-xs sm:text-sm text-gray-500">{t('okr.objective.progressLabel')}</div>
                    </div>
                    <div className="w-full sm:w-24">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${obj.progress}%` }}
                        ></div>
                      </div>
                    </div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
                  <button 
                    onClick={() => handleViewDetails(obj.id)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium py-2 px-3 rounded-md hover:bg-blue-50 min-h-[44px]"
                  >
                    {t('common.view')} {t('common.details')}
                  </button>
                  <button 
                    onClick={() => handleEdit(obj.id)}
                    className="text-gray-600 hover:text-gray-800 text-sm font-medium py-2 px-3 rounded-md hover:bg-gray-50 min-h-[44px]"
                  >
                    {t('common.edit')}
                  </button>
                  <button 
                    onClick={() => handleDelete(obj.id)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium py-2 px-3 rounded-md hover:bg-red-50 min-h-[44px]"
                  >
                    {t('common.delete')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {filteredObjectives.length === 0 && (
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
    </Layout>
  );
}

function getStatusColor(status: string): string {
  return getStatusColorUtil(status);
}