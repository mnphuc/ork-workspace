'use client';

import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { WorkspaceProvider } from '@/contexts/WorkspaceContext';

interface LayoutProps {
  children: React.ReactNode;
  user?: {
    full_name: string;
    email: string;
  };
  onLogout?: () => void;
}

export function Layout({ children, user, onLogout }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    console.log('toggleSidebar called, current state:', sidebarOpen);
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    console.log('closeSidebar called');
    setSidebarOpen(false);
  };

  return (
    <WorkspaceProvider>
      <div className="min-h-screen bg-gray-50">
        <div className="flex h-screen">
          {/* Mobile sidebar overlay */}
          {sidebarOpen && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
              onClick={closeSidebar}
            />
          )}
          
          {/* Sidebar */}
          <Sidebar 
            onLogout={onLogout} 
            isOpen={sidebarOpen}
            onClose={closeSidebar}
          />
          
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header 
              user={user} 
              onLogout={onLogout}
              onToggleSidebar={toggleSidebar}
            />
            
            <main className="flex-1 overflow-y-auto p-4 sm:p-6">
              {children}
            </main>
          </div>
        </div>
      </div>
    </WorkspaceProvider>
  );
}
