"use client";
import React, { useState, useRef, useEffect, useCallback } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface MentionInputProps {
  value: string;
  onChange: (value: string) => void;
  onMention: (userId: string, userName: string) => void;
  placeholder?: string;
  className?: string;
  rows?: number;
  disabled?: boolean;
  users: User[];
  maxLength?: number;
}

export function MentionInput({
  value,
  onChange,
  onMention,
  placeholder = "Type a message...",
  className = "",
  rows = 3,
  disabled = false,
  users = [],
  maxLength = 2000
}: MentionInputProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<User[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mentionStart, setMentionStart] = useState(-1);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const suggestionRef = useRef<HTMLDivElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    onChange(newValue);

    // Check for @mention
    const cursorPos = e.target.selectionStart;
    const textBeforeCursor = newValue.substring(0, cursorPos);
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/);

    if (mentionMatch) {
      const query = mentionMatch[1].toLowerCase();
      setMentionStart(cursorPos - mentionMatch[0].length);
      
      if (query.length > 0) {
        const filteredUsers = users.filter(user => 
          user.name.toLowerCase().includes(query) || 
          user.email.toLowerCase().includes(query)
        );
        setSuggestions(filteredUsers);
        setShowSuggestions(true);
        setSelectedIndex(0);
      } else {
        setSuggestions(users.slice(0, 5)); // Show first 5 users
        setShowSuggestions(true);
        setSelectedIndex(0);
      }
    } else {
      setShowSuggestions(false);
      setMentionStart(-1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (suggestions.length > 0) {
          selectUser(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setMentionStart(-1);
        break;
    }
  };

  const selectUser = useCallback((user: User) => {
    if (mentionStart === -1) return;

    const beforeMention = value.substring(0, mentionStart);
    const afterMention = value.substring(textareaRef.current?.selectionStart || 0);
    const newValue = `${beforeMention}@${user.name} ${afterMention}`;
    
    onChange(newValue);
    onMention(user.id, user.name);
    setShowSuggestions(false);
    setMentionStart(-1);

    // Focus back to textarea
    setTimeout(() => {
      if (textareaRef.current) {
        const newCursorPos = beforeMention.length + user.name.length + 2;
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  }, [value, mentionStart, onChange, onMention]);

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (suggestionRef.current && !suggestionRef.current.contains(e.target as Node)) {
      setShowSuggestions(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleClickOutside]);

  const renderMentionedText = (text: string) => {
    const parts = text.split(/(@\w+)/g);
    return parts.map((part, index) => {
      if (part.startsWith('@')) {
        return (
          <span key={index} className="bg-blue-100 text-blue-800 px-1 rounded text-sm font-medium">
            {part}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${className}`}
        rows={rows}
        disabled={disabled}
        maxLength={maxLength}
      />
      
      {/* Character count */}
      {maxLength && (
        <div className="text-xs text-gray-500 mt-1 text-right">
          {value.length}/{maxLength}
        </div>
      )}

      {/* Mention suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionRef}
          className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto"
        >
          {suggestions.map((user, index) => (
            <div
              key={user.id}
              className={`px-3 py-2 cursor-pointer flex items-center space-x-3 ${
                index === selectedIndex 
                  ? 'bg-blue-50 border-l-4 border-blue-500' 
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => selectUser(user)}
            >
              <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                {user.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt={user.name}
                    className="w-6 h-6 rounded-full"
                  />
                ) : (
                  <span className="text-xs font-medium text-gray-600">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {user.name}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {user.email}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview of mentioned text */}
      {value && (
        <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-700">
          <div className="font-medium text-xs text-gray-500 mb-1">Preview:</div>
          {renderMentionedText(value)}
        </div>
      )}
    </div>
  );
}
