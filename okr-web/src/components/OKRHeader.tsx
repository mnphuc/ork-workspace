"use client";
import React, { useState } from 'react';

interface OKRHeaderProps {
  onQuarterChange?: (quarter: string) => void;
  onOwnerFilter?: (owner: string) => void;
  onGroupFilter?: (group: string) => void;
  onSearch?: (query: string) => void;
  onShare?: () => void;
  onExport?: () => void;
  onCreate?: () => void;
}

export function OKRHeader({
  onQuarterChange,
  onOwnerFilter,
  onGroupFilter,
  onSearch,
  onShare,
  onExport,
  onCreate
}: OKRHeaderProps) {
  const [selectedQuarter, setSelectedQuarter] = useState('Q4 2025');
  const [selectedOwner, setSelectedOwner] = useState('All owners');
  const [selectedGroup, setSelectedGroup] = useState('All groups');
  const [searchQuery, setSearchQuery] = useState('');

  const handleQuarterChange = (quarter: string) => {
    setSelectedQuarter(quarter);
    onQuarterChange?.(quarter);
  };

  const handleOwnerChange = (owner: string) => {
    setSelectedOwner(owner);
    onOwnerFilter?.(owner);
  };

  const handleGroupChange = (group: string) => {
    setSelectedGroup(group);
    onGroupFilter?.(group);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch?.(query);
  };

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      {/* Top Row */}
      <div className="flex items-center justify-between mb-4">
        {/* Left side filters */}
        <div className="flex items-center space-x-4">
          {/* Quarter selector */}
          <div className="relative">
            <button className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <span className="mr-2">📅</span>
              {selectedQuarter}
              <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {/* Owner filter */}
          <div className="relative">
            <button className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <span className="mr-2">👤</span>
              {selectedOwner}
              <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {/* Group filter */}
          <div className="relative">
            <button className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <span className="mr-2">👥</span>
              {selectedGroup}
              <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {/* More button */}
          <button className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <span className="mr-2">+</span>
            More
          </button>
        </div>

        {/* Right side actions */}
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={handleSearchChange}
              className="block w-64 pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          {/* Share button */}
          <button
            onClick={onShare}
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <span className="mr-2">🔗</span>
            Share
          </button>

          {/* Export button */}
          <button
            onClick={onExport}
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <span className="mr-2">📥</span>
            Download .xlsx
          </button>

          {/* Create button */}
          <button
            onClick={onCreate}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <span className="mr-2">+</span>
            Create
          </button>
        </div>
      </div>

      {/* Secondary Navigation */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          {/* Alignment view */}
          <button className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <span className="mr-2">☰</span>
            Alignment view
            <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* List view */}
          <button className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <span className="mr-2">📋</span>
            List
          </button>

          {/* Roadmap view */}
          <button className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <span className="mr-2">🗺️</span>
            Roadmap
          </button>

          {/* Sort */}
          <button className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <span className="mr-2">↕️</span>
            Sort
          </button>

          {/* Bulk edit */}
          <button className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <input type="checkbox" className="mr-2" />
            Bulk edit
          </button>
        </div>
      </div>
    </div>
  );
}
