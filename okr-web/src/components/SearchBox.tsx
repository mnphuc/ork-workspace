"use client";
import React, { useState, useEffect } from 'react';

interface SearchBoxProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  onClear?: () => void;
  className?: string;
  debounceMs?: number;
}

export function SearchBox({ 
  placeholder = "Search...", 
  onSearch, 
  onClear,
  className = "",
  debounceMs = 300 
}: SearchBoxProps) {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim()) {
        setIsSearching(true);
        onSearch(query.trim());
        setTimeout(() => setIsSearching(false), 200);
      } else {
        onClear?.();
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, onSearch, onClear, debounceMs]);

  const handleClear = () => {
    setQuery('');
    onClear?.();
  };

  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        {isSearching ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        ) : (
          <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        )}
      </div>
      
      <input
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
      />
      
      {query && (
        <button
          onClick={handleClear}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}

