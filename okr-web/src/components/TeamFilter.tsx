import React from 'react';

interface TeamFilterProps {
  teams: Array<{ id: string; name: string }>;
  selectedTeamId: string | null;
  onTeamChange: (teamId: string | null) => void;
  className?: string;
}

export function TeamFilter({ teams, selectedTeamId, onTeamChange, className = '' }: TeamFilterProps) {
  return (
    <select
      value={selectedTeamId || ''}
      onChange={(e) => onTeamChange(e.target.value || null)}
      className={`px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white ${className}`}
    >
      <option value="">All Teams</option>
      {teams.map((team) => (
        <option key={team.id} value={team.id}>
          {team.name}
        </option>
      ))}
    </select>
  );
}

