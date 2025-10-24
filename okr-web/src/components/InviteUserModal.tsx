"use client";
import React, { useState } from 'react';
import { Modal } from './Modal';

interface InviteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (inviteData: InviteData) => void;
  workspaceName?: string;
}

interface InviteData {
  emails: string[];
  role: 'admin' | 'manager' | 'user' | 'viewer';
  message?: string;
  groups?: string[];
}

interface Group {
  id: string;
  name: string;
  type: 'company' | 'department' | 'team' | 'subteam';
}

export function InviteUserModal({ 
  isOpen, 
  onClose, 
  onInvite, 
  workspaceName = "this workspace" 
}: InviteUserModalProps) {
  const [emails, setEmails] = useState<string[]>([]);
  const [emailInput, setEmailInput] = useState('');
  const [role, setRole] = useState<'admin' | 'manager' | 'user' | 'viewer'>('user');
  const [message, setMessage] = useState('');
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [isValidating, setIsValidating] = useState(false);

  // Mock groups data
  const groups: Group[] = [
    { id: '1', name: 'Engineering', type: 'department' },
    { id: '2', name: 'Product', type: 'department' },
    { id: '3', name: 'Marketing', type: 'department' },
    { id: '4', name: 'Frontend Team', type: 'team' },
    { id: '5', name: 'Backend Team', type: 'team' },
    { id: '6', name: 'Design Team', type: 'team' },
  ];

  const handleAddEmail = () => {
    const email = emailInput.trim().toLowerCase();
    
    if (email && isValidEmail(email) && !emails.includes(email)) {
      setEmails([...emails, email]);
      setEmailInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddEmail();
    }
  };

  const handleRemoveEmail = (emailToRemove: string) => {
    setEmails(emails.filter(email => email !== emailToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (emails.length === 0) return;

    setIsValidating(true);
    
    try {
      const inviteData: InviteData = {
        emails,
        role,
        message: message.trim() || undefined,
        groups: selectedGroups.length > 0 ? selectedGroups : undefined,
      };

      await onInvite(inviteData);
      onClose();
      
      // Reset form
      setEmails([]);
      setEmailInput('');
      setMessage('');
      setSelectedGroups([]);
    } catch (error) {
      console.error('Failed to send invites:', error);
    } finally {
      setIsValidating(false);
    }
  };

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Full access to workspace settings and all features';
      case 'manager':
        return 'Can manage objectives, users, and most features';
      case 'user':
        return 'Can create and manage their own objectives';
      case 'viewer':
        return 'Read-only access to objectives and reports';
      default:
        return '';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Invite Users">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Addresses
          </label>
          <div className="flex space-x-2">
            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter email address"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <button
              type="button"
              onClick={handleAddEmail}
              disabled={!emailInput.trim() || !isValidEmail(emailInput.trim())}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              Add
            </button>
          </div>
          
          {/* Added Emails */}
          {emails.length > 0 && (
            <div className="mt-3 space-y-2">
              <div className="text-sm font-medium text-gray-700">
                Inviting {emails.length} user{emails.length !== 1 ? 's' : ''}:
              </div>
              <div className="flex flex-wrap gap-2">
                {emails.map(email => (
                  <div
                    key={email}
                    className="flex items-center space-x-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                  >
                    <span>{email}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveEmail(email)}
                      className="text-blue-600 hover:text-blue-800 ml-1"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Role Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Role
          </label>
          <div className="space-y-3">
            {[
              { value: 'admin', label: 'Administrator' },
              { value: 'manager', label: 'Manager' },
              { value: 'user', label: 'User' },
              { value: 'viewer', label: 'Viewer' }
            ].map(roleOption => (
              <label key={roleOption.value} className="flex items-start">
                <input
                  type="radio"
                  value={roleOption.value}
                  checked={role === roleOption.value}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="mt-1 mr-3"
                />
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {roleOption.label}
                  </div>
                  <div className="text-xs text-gray-500">
                    {getRoleDescription(roleOption.value)}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Groups Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Assign to Groups (optional)
          </label>
          <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-200 rounded-md p-3">
            {groups.map(group => (
              <label key={group.id} className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedGroups.includes(group.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedGroups([...selectedGroups, group.id]);
                    } else {
                      setSelectedGroups(selectedGroups.filter(id => id !== group.id));
                    }
                  }}
                  className="mr-3"
                />
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-900">{group.name}</span>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {group.type}
                  </span>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Message */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Personal Message (optional)
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={`Welcome to ${workspaceName}!`}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            rows={3}
          />
        </div>

        {/* Preview */}
        {emails.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm font-medium text-gray-700 mb-2">Invitation Preview:</div>
            <div className="text-sm text-gray-600">
              <p className="mb-2">
                <strong>To:</strong> {emails.join(', ')}
              </p>
              <p className="mb-2">
                <strong>Role:</strong> {role.charAt(0).toUpperCase() + role.slice(1)}
              </p>
              {selectedGroups.length > 0 && (
                <p className="mb-2">
                  <strong>Groups:</strong> {selectedGroups.map(id => 
                    groups.find(g => g.id === id)?.name
                  ).join(', ')}
                </p>
              )}
              {message && (
                <p>
                  <strong>Message:</strong> {message}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 text-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={emails.length === 0 || isValidating}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {isValidating ? 'Sending...' : `Send ${emails.length} Invitation${emails.length !== 1 ? 's' : ''}`}
          </button>
        </div>
      </form>
    </Modal>
  );
}

