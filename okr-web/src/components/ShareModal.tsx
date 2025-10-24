"use client";
import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShare: (shareData: ShareData) => void;
  title: string;
  type: 'objective' | 'keyresult' | 'checkin';
  itemId: string;
  currentUser?: {
    id: string;
    name: string;
    email: string;
  };
}

interface ShareData {
  type: 'link' | 'email' | 'workspace';
  permissions: 'view' | 'comment' | 'edit';
  recipients?: string[];
  message?: string;
  expiresAt?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export function ShareModal({ 
  isOpen, 
  onClose, 
  onShare, 
  title, 
  type, 
  itemId,
  currentUser 
}: ShareModalProps) {
  const [shareType, setShareType] = useState<'link' | 'email' | 'workspace'>('link');
  const [permissions, setPermissions] = useState<'view' | 'comment' | 'edit'>('view');
  const [recipients, setRecipients] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserList, setShowUserList] = useState(false);
  const [shareLink, setShareLink] = useState('');

  useEffect(() => {
    if (isOpen) {
      // Generate share link
      const baseUrl = window.location.origin;
      const shareUrl = `${baseUrl}/${type}/${itemId}`;
      setShareLink(shareUrl);
      
      // Load users (mock data for now)
      setUsers([
        { id: '1', name: 'John Doe', email: 'john@example.com' },
        { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
        { id: '3', name: 'Bob Johnson', email: 'bob@example.com' },
      ]);
    }
  }, [isOpen, type, itemId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const shareData: ShareData = {
      type: shareType,
      permissions,
      recipients: shareType !== 'link' ? recipients : undefined,
      message: message.trim() || undefined,
      expiresAt: expiresAt || undefined,
    };

    onShare(shareData);
    onClose();
  };

  const handleAddRecipient = (user: User) => {
    if (!recipients.includes(user.email)) {
      setRecipients([...recipients, user.email]);
    }
    setSearchQuery('');
    setShowUserList(false);
  };

  const handleRemoveRecipient = (email: string) => {
    setRecipients(recipients.filter(r => r !== email));
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTypeLabel = () => {
    switch (type) {
      case 'objective': return 'Objective';
      case 'keyresult': return 'Key Result';
      case 'checkin': return 'Check-in';
      default: return 'Item';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Share ${getTypeLabel()}`}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Share Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            How would you like to share?
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                value="link"
                checked={shareType === 'link'}
                onChange={(e) => setShareType(e.target.value as 'link')}
                className="mr-3"
              />
              <span className="text-sm">Share via link</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="email"
                checked={shareType === 'email'}
                onChange={(e) => setShareType(e.target.value as 'email')}
                className="mr-3"
              />
              <span className="text-sm">Send via email</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="workspace"
                checked={shareType === 'workspace'}
                onChange={(e) => setShareType(e.target.value as 'workspace')}
                className="mr-3"
              />
              <span className="text-sm">Share within workspace</span>
            </label>
          </div>
        </div>

        {/* Link Sharing */}
        {shareType === 'link' && (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Share Link
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={shareLink}
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
              >
                Copy
              </button>
            </div>
          </div>
        )}

        {/* Email/Workspace Recipients */}
        {shareType !== 'link' && (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Recipients
            </label>
            
            {/* Search and Add Users */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowUserList(e.target.value.length > 0);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              
              {showUserList && filteredUsers.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                  {filteredUsers.map(user => (
                    <div
                      key={user.id}
                      onClick={() => handleAddRecipient(user)}
                      className="px-3 py-2 hover:bg-gray-50 cursor-pointer flex items-center space-x-3"
                    >
                      <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-gray-600">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Selected Recipients */}
            {recipients.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-700">Selected recipients:</div>
                <div className="flex flex-wrap gap-2">
                  {recipients.map(email => (
                    <div
                      key={email}
                      className="flex items-center space-x-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm"
                    >
                      <span>{email}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveRecipient(email)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Permissions */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Permissions
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                value="view"
                checked={permissions === 'view'}
                onChange={(e) => setPermissions(e.target.value as 'view')}
                className="mr-3"
              />
              <span className="text-sm">View only</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="comment"
                checked={permissions === 'comment'}
                onChange={(e) => setPermissions(e.target.value as 'comment')}
                className="mr-3"
              />
              <span className="text-sm">View and comment</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="edit"
                checked={permissions === 'edit'}
                onChange={(e) => setPermissions(e.target.value as 'edit')}
                className="mr-3"
              />
              <span className="text-sm">View, comment, and edit</span>
            </label>
          </div>
        </div>

        {/* Message */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Message (optional)
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Add a message..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            rows={3}
          />
        </div>

        {/* Expiration */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Expires (optional)
          </label>
          <input
            type="datetime-local"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>

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
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
          >
            Share
          </button>
        </div>
      </form>
    </Modal>
  );
}

