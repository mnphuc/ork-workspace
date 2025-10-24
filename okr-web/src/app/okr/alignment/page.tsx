"use client";
import { useEffect, useMemo, useState } from 'react';
import { Layout } from '@/components/layout';
import { WorkspaceRequired } from '@/components/WorkspaceRequired';
import { apiFetch, clearTokens } from '@/lib/api';
import { logout } from '@/lib/auth';
import { formatQuarter } from '@/lib/date-utils';
import { formatStatus, getStatusColor as getStatusColorUtil } from '@/lib/format-utils';

// Types
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
  last_modified_date: string 
};

type User = { id: string; full_name?: string; email?: string };
type Team = { id: string; name?: string };

export default function AlignmentPage() {
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedQuarter, setSelectedQuarter] = useState('Q4 2025');
  const [selectedOwnerId, setSelectedOwnerId] = useState<string>('');
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'list' | 'roadmap'>('list');

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      window.location.href = '/login';
      return;
    }

    Promise.all([
      apiFetch<Objective[]>('/objectives'),
      apiFetch<User[]>('/users').catch(() => [] as User[]),
      apiFetch<Team[]>('/teams').catch(() => [] as Team[]),
    ])
      .then(([objs, us, ts]) => {
        setObjectives(objs);
        setUsers(us);
        setTeams(ts);
      })
      .catch((e) => {
        setError(e.message || 'Failed to load');
        if (e.message.includes('Authentication failed')) {
          clearTokens();
          window.location.href = '/login';
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return objectives
      .filter((o) => !selectedOwnerId || o.owner_id === selectedOwnerId)
      .filter((o) => !selectedTeamId || o.team_id === selectedTeamId)
      .filter((o) =>
        o.title.toLowerCase().includes(search.toLowerCase()) ||
        (o.description || '').toLowerCase().includes(search.toLowerCase())
      );
  }, [objectives, selectedOwnerId, selectedTeamId, search]);

  const ownerNameById = (id?: string) => users.find(u => u.id === id)?.full_name || users.find(u => u.id === id)?.email || '—';
  const teamNameById = (id?: string) => teams.find(t => t.id === id)?.name || '—';

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

  if (loading) {
    return (
      <Layout onLogout={handleLogout}>
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
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
            {/* Toolbar filters */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-wrap items-center gap-3">
              <button className="flex items-center space-x-2 border border-gray-300 rounded-lg px-3 py-2 hover:bg-gray-50">
                <span>📅</span>
                <span className="font-medium">{selectedQuarter}</span>
                <span>▼</span>
              </button>

              <div className="flex items-center space-x-2 border border-gray-300 rounded-lg px-3 py-2 bg-white">
                <span>👤</span>
                <select 
                  className="outline-none bg-transparent text-sm"
                  value={selectedOwnerId}
                  onChange={(e) => setSelectedOwnerId(e.target.value)}
                >
                  <option value="">All owners</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.full_name || u.email}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-2 border border-gray-300 rounded-lg px-3 py-2 bg-white">
                <span>👥</span>
                <select 
                  className="outline-none bg-transparent text-sm"
                  value={selectedTeamId}
                  onChange={(e) => setSelectedTeamId(e.target.value)}
                >
                  <option value="">All groups</option>
                  {teams.map(t => (
                    <option key={t.id} value={t.id}>{t.name || t.id}</option>
                  ))}
                </select>
              </div>

              <button className="ml-auto flex items-center space-x-2 border border-gray-300 rounded-lg px-3 py-2 hover:bg-gray-50">
                <span>⋯</span>
                <span className="font-medium">More</span>
              </button>
              <div className="w-full md:w-auto md:ml-4 flex items-center gap-2">
                <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 bg-white w-full md:w-80">
                  <span className="mr-2">🔎</span>
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search"
                    className="w-full outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Secondary toolbar */}
            <div className="bg-white border border-gray-200 rounded-xl p-3 flex flex-wrap items-center gap-3">
              <div className="flex items-center space-x-2 border border-gray-200 rounded-lg px-2 py-1">
                <button 
                  className={`px-3 py-1 rounded-md text-sm font-medium ${view === 'list' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:text-gray-900'}`}
                  onClick={() => setView('list')}
                >
                  List
                </button>
                <button 
                  className={`px-3 py-1 rounded-md text-sm font-medium ${view === 'roadmap' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:text-gray-900'}`}
                  onClick={() => setView('roadmap')}
                >
                  Roadmap
                </button>
              </div>
              <button className="flex items-center space-x-2 border border-gray-300 rounded-lg px-3 py-2 hover:bg-gray-50">
                <span>↕</span>
                <span className="font-medium">Sort</span>
              </button>
              <button className="flex items-center space-x-2 border border-gray-300 rounded-lg px-3 py-2 hover:bg-gray-50">
                <span>✏️</span>
                <span className="font-medium">Bulk edit</span>
              </button>
              <div className="ml-auto flex items-center gap-2">
                <button className="flex items-center space-x-2 border border-gray-300 rounded-lg px-3 py-2 hover:bg-gray-50">
                  <span>🔗</span>
                  <span className="font-medium">Share</span>
                </button>
                <button className="flex items-center space-x-2 border border-gray-300 rounded-lg px-3 py-2 hover:bg-gray-50">
                  <span>⬇️</span>
                  <span className="font-medium">Download .xlsx</span>
                </button>
                <button className="flex items-center space-x-2 bg-blue-600 text-white rounded-lg px-3 py-2 hover:bg-blue-700">
                  <span>＋</span>
                  <span className="font-medium">Create</span>
                </button>
              </div>
            </div>

            {view === 'list' ? (
              <ListTable 
                objectives={filtered}
                ownerNameById={ownerNameById}
                teamNameById={teamNameById}
              />
            ) : (
              <RoadmapView 
                objectives={filtered}
                ownerNameById={ownerNameById}
                teamNameById={teamNameById}
              />
            )}
      </div>
    </Layout>
  );
}

function ListTable({ objectives, ownerNameById, teamNameById }: { objectives: Objective[]; ownerNameById: (id?: string) => string; teamNameById: (id?: string) => string; }) {
  const [expandedSections, setExpandedSections] = useState({
    company: true,
    team: true,
    individual: true
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <div className="bg-white border border-gray-200 rounded-t-xl">
      <div className="grid grid-cols-12 gap-2 px-4 py-3 border-b border-gray-200 text-sm text-gray-500">
        <div className="col-span-4 font-medium flex items-center gap-2">
          <button className="p-1 hover:bg-gray-100 rounded">☰</button>
          <span>Objectives and Metrics</span>
        </div>
        <div className="col-span-2">Current / Target</div>
        <div className="col-span-1">Progress</div>
        <div className="col-span-1">Status</div>
        <div className="col-span-1">Interval</div>
        <div className="col-span-1">Groups</div>
        <div className="col-span-1">Owner</div>
      </div>

      <div className="divide-y divide-gray-100">
        {/* Company Objectives Parent */}
        <div className="grid grid-cols-12 gap-2 px-4 py-4 bg-blue-50 border-l-4 border-blue-500">
          <div className="col-span-4 flex items-center gap-3">
            <button 
              onClick={() => toggleSection('company')}
              className="p-1 hover:bg-blue-100 rounded transition-colors"
            >
              <span className={`text-blue-600 transition-transform ${expandedSections.company ? 'rotate-90' : ''}`}>
                ▶
              </span>
            </button>
            <div className="w-10 h-10 rounded-md bg-blue-100 flex items-center justify-center text-sm font-semibold text-blue-700">C</div>
            <div className="flex-1">
              <div className="text-sm text-blue-600 font-medium">Company Objectives</div>
              <div className="text-sm text-blue-500">Strategic company-wide goals</div>
            </div>
            <button className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 text-sm font-medium">
              <span>+</span>
              <span>Add</span>
            </button>
          </div>
          <div className="col-span-8"></div>
        </div>

        {/* Child Objectives */}
        {expandedSections.company && objectives.slice(0, 3).map((o) => (
          <div 
            key={o.id} 
            className="grid grid-cols-12 gap-2 px-4 py-4 hover:bg-gray-50 cursor-pointer border-l-4 border-blue-200 ml-4"
            onClick={() => { window.location.href = `/okr/${o.id}`; }}
            role="button"
          >
            {/* Objectives and Metrics */}
            <div className="col-span-4 flex items-start gap-3">
              <div className="w-8 h-8 rounded-md bg-gray-100 flex items-center justify-center text-sm font-semibold text-gray-600">{getPrefix(o.title)}</div>
              <div>
                <div className="text-sm text-gray-400">C</div>
                <div className="font-medium text-gray-900 truncate max-w-xl" title={o.title}>{o.title}</div>
                <div className="text-sm text-gray-500 truncate max-w-xl" title={o.description}>{o.description}</div>
              </div>
            </div>

            {/* Current / Target (placeholder) */}
            <div className="col-span-2 text-sm text-gray-700">—</div>

            {/* Progress */}
            <div className="col-span-1">
              <div className="flex items-center gap-2">
                <div className="text-sm font-semibold text-gray-900">{Math.round(o.progress)}%</div>
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      o.progress >= 80 ? 'bg-green-500' : 
                      o.progress >= 50 ? 'bg-blue-500' : 
                      o.progress >= 25 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(Math.max(o.progress, 0), 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="col-span-1">
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(o.status)}`}>
                {formatStatus(o.status)}
              </span>
            </div>

            {/* Interval */}
            <div className="col-span-1 text-sm text-gray-700">{formatQuarter(o.quarter)} {o.year}</div>

            {/* Groups */}
            <div className="col-span-1">
              <div className="flex items-center gap-1">
                <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-700 text-xs font-bold">{teamNameById(o.team_id).charAt(0)}</span>
                </div>
                <span className="text-sm text-gray-700">{teamNameById(o.team_id)}</span>
              </div>
            </div>

            {/* Owner */}
            <div className="col-span-1 text-sm text-gray-700">{ownerNameById(o.owner_id)}</div>
          </div>
        ))}

        {/* Team Objectives Parent */}
        <div className="grid grid-cols-12 gap-2 px-4 py-4 bg-green-50 border-l-4 border-green-500">
          <div className="col-span-4 flex items-center gap-3">
            <button 
              onClick={() => toggleSection('team')}
              className="p-1 hover:bg-green-100 rounded transition-colors"
            >
              <span className={`text-green-600 transition-transform ${expandedSections.team ? 'rotate-90' : ''}`}>
                ▶
              </span>
            </button>
            <div className="w-10 h-10 rounded-md bg-green-100 flex items-center justify-center text-sm font-semibold text-green-700">T</div>
            <div className="flex-1">
              <div className="text-sm text-green-600 font-medium">Team Objectives</div>
              <div className="text-sm text-green-500">Department and team specific goals</div>
            </div>
            <button className="flex items-center gap-2 bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 text-sm font-medium">
              <span>+</span>
              <span>Add</span>
            </button>
          </div>
          <div className="col-span-8"></div>
        </div>

        {/* Individual Objectives Parent */}
        <div className="grid grid-cols-12 gap-2 px-4 py-4 bg-purple-50 border-l-4 border-purple-500">
          <div className="col-span-4 flex items-center gap-3">
            <button 
              onClick={() => toggleSection('individual')}
              className="p-1 hover:bg-purple-100 rounded transition-colors"
            >
              <span className={`text-purple-600 transition-transform ${expandedSections.individual ? 'rotate-90' : ''}`}>
                ▶
              </span>
            </button>
            <div className="w-10 h-10 rounded-md bg-purple-100 flex items-center justify-center text-sm font-semibold text-purple-700">I</div>
            <div className="flex-1">
              <div className="text-sm text-purple-600 font-medium">Individual Objectives</div>
              <div className="text-sm text-purple-500">Personal development and performance goals</div>
            </div>
            <button className="flex items-center gap-2 bg-purple-600 text-white px-3 py-1.5 rounded-lg hover:bg-purple-700 text-sm font-medium">
              <span>+</span>
              <span>Add</span>
            </button>
          </div>
          <div className="col-span-8"></div>
        </div>

        {/* KPI Objectives */}
        {objectives.slice(3).map((o) => (
          <div 
            key={o.id} 
            className="grid grid-cols-12 gap-2 px-4 py-4 hover:bg-gray-50 cursor-pointer"
            onClick={() => { window.location.href = `/okr/${o.id}`; }}
            role="button"
          >
            {/* Objectives and Metrics */}
            <div className="col-span-4 flex items-start gap-3">
              <div className="w-8 h-8 rounded-md bg-gray-100 flex items-center justify-center text-sm font-semibold text-gray-600">{getPrefix(o.title)}</div>
              <div>
                <div className="text-sm text-gray-400">KPI</div>
                <div className="font-medium text-gray-900 truncate max-w-xl" title={o.title}>{o.title}</div>
                <div className="text-sm text-gray-500 truncate max-w-xl" title={o.description}>{o.description}</div>
              </div>
            </div>

            {/* Current / Target */}
            <div className="col-span-2 text-sm text-gray-700">
              {o.team_id === 'finance' ? '4 / < 4' : '0 / ≥ 100000'}
            </div>

            {/* Progress */}
            <div className="col-span-1">
              <div className="flex items-center gap-2">
                <div className="text-sm font-semibold text-gray-900">{Math.round(o.progress)}%</div>
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      o.progress >= 80 ? 'bg-green-500' : 
                      o.progress >= 50 ? 'bg-blue-500' : 
                      o.progress >= 25 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(Math.max(o.progress, 0), 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="col-span-1">
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(o.status)}`}>
                {formatStatus(o.status)}
              </span>
            </div>

            {/* Interval */}
            <div className="col-span-1 text-sm text-gray-700">{formatQuarter(o.quarter)} {o.year}</div>

            {/* Groups */}
            <div className="col-span-1">
              <div className="flex items-center gap-1">
                <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-700 text-xs font-bold">{teamNameById(o.team_id).charAt(0)}</span>
                </div>
                <span className="text-sm text-gray-700">{teamNameById(o.team_id)}</span>
              </div>
            </div>

            {/* Owner */}
            <div className="col-span-1 text-sm text-gray-700">{ownerNameById(o.owner_id)}</div>
          </div>
        ))}

        {objectives.length === 0 && (
          <div className="px-4 py-12 text-center text-gray-500">No objectives found</div>
        )}
      </div>
    </div>
  );
}

function RoadmapView({ objectives, ownerNameById, teamNameById }: { objectives: Objective[]; ownerNameById: (id?: string) => string; teamNameById: (id?: string) => string; }) {
  // Build simple timeline across the year quarters
  const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
  const currentQuarterIndex = Math.max(0, Math.min(3, quarters.indexOf((`Q${new Date().getMonth() / 3 + 1}` as unknown as string).split('.')[0])));

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      {/* Header timeline scale */}
      <div className="grid grid-cols-12 text-xs text-gray-500 px-2 mb-2">
        {quarters.map((q, idx) => (
          <div key={q} className="col-span-3 text-center">{q}</div>
        ))}
      </div>
      <div className="space-y-3">
        {objectives.map((o) => {
          const qIndex = Math.max(0, Math.min(3, parseInt((o.quarter || '1').toString().replace(/[^0-9]/g, '')) - 1));
          return (
            <div key={o.id} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 cursor-pointer" onClick={() => { window.location.href = `/okr/${o.id}`; }}>
              <div className="flex items-center justify-between mb-2">
                <div className="font-medium text-gray-900 truncate pr-4">{o.title}</div>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span className={`px-2 py-0.5 rounded-full ${getStatusColor(o.status)}`}>{formatStatus(o.status)}</span>
                  <span>Owner: {ownerNameById(o.owner_id)}</span>
                  <span>Group: {teamNameById(o.team_id)}</span>
                  <span>{formatQuarter(o.quarter)} {o.year}</span>
                </div>
              </div>
              <div className="grid grid-cols-12 items-center gap-2">
                {/* Bar occupying quarter */}
                <div className={`col-start-${qIndex * 3 + 1} col-span-3 h-3 bg-blue-200 rounded-full relative`}>
                  <div className="absolute top-0 left-0 h-3 bg-blue-600 rounded-full" style={{ width: `${Math.min(Math.max(o.progress, 0), 100)}%` }}></div>
                </div>
              </div>
            </div>
          );
        })}

        {objectives.length === 0 && (
          <div className="px-4 py-12 text-center text-gray-500">No objectives to display</div>
        )}
      </div>
    </div>
  );
}




function getStatusColor(status: string): string {
  // Alignment page uses different color scheme with borders
  switch (status?.toLowerCase()) {
    case 'not_started': return 'bg-gray-100 text-gray-700 border border-gray-200';
    case 'at_risk': return 'bg-red-50 text-red-700 border border-red-200';
    case 'behind': return 'bg-yellow-50 text-yellow-700 border border-yellow-200';
    case 'on_track': return 'bg-green-50 text-green-700 border border-green-200';
    case 'closed': return 'bg-blue-50 text-blue-700 border border-blue-200';
    case 'abandoned': return 'bg-gray-100 text-gray-600 border border-gray-200';
    default: return 'bg-gray-100 text-gray-700 border border-gray-200';
  }
}

function getPrefix(title: string): string {
  if (!title) return '?';
  const match = title.match(/\b([A-Z]{2,}-\d+)\b/);
  if (match) return match[1].split('-')[0].slice(0, 3);
  return (title[0] || '?').toUpperCase();
}
