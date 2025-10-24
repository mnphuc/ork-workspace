'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '@/contexts/UserContext';
import { useTranslation } from 'react-i18next';
import { WorkspaceSelector } from '@/components/WorkspaceSelector';
import { useWorkspace } from '@/contexts/WorkspaceContext';

interface SidebarProps {
  onLogout?: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ onLogout, isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useUser();
  const { t } = useTranslation();
  const { refreshWorkspaces, workspaces, loading, error } = useWorkspace();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Load workspaces when sidebar opens (only if not already loaded)
  useEffect(() => {
    if (isOpen && workspaces.length === 0 && !loading && !error) {
      refreshWorkspaces();
    }
  }, [isOpen, refreshWorkspaces, workspaces.length, loading, error]);
  
  const menuItems = [
    { path: '/home', label: mounted ? t('navigation.home') : 'Home', icon: '🏠' },
    { path: '/dashboard', label: mounted ? t('navigation.dashboard') : 'Dashboard', icon: '📈' },
    { path: '/okr', label: mounted ? t('navigation.objectives') : 'Objectives', icon: '🎯' },
    { path: '/okr/roadmap', label: mounted ? t('navigation.roadmap') : 'Roadmap', icon: '🗺️' },
    { path: '/check-ins', label: mounted ? t('navigation.checkIns') : 'Check-ins', icon: '📊' },
    { path: '/okr/alignment', label: mounted ? t('navigation.alignment') : 'Alignment', icon: '🔗' },
    { path: '/settings', label: mounted ? t('navigation.settings') : 'Settings', icon: '⚙️' },
  ];

  return (
    <aside className={`
      fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col
      transform transition-transform duration-200 ease-in-out
      ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
    `}>
      <div className="p-4 sm:p-6 flex-1">
        {/* Logo and close button */}
        <div className="flex items-center justify-between mb-6 lg:mb-8">
          <div className="text-xl sm:text-2xl font-bold">
            <span className="text-orange-500">TS</span>
            <span className="text-red-500"> </span>
            <span className="text-pink-500">OKR</span>
          
          </div>
          {/* Close button for mobile */}
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Workspace Selector */}
        <div className="mb-6">
          <WorkspaceSelector />
        </div>

        {/* Navigation */}
        <nav className="space-y-1">
          {menuItems.map((item) => (
            <NavLink 
              key={item.path}
              href={item.path} 
              icon={item.icon}
              active={pathname === item.path || 
                (item.path === '/okr' && pathname.startsWith('/okr'))}
              onWorkspaceRefresh={refreshWorkspaces}
              shouldRefreshWorkspaces={workspaces.length === 0 && !loading}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

      </div>

      {/* Bottom section - Logout only */}
      <div className="p-4 border-t border-gray-200">
        {onLogout && (
          <button 
            onClick={onLogout} 
            className="w-full flex items-center justify-center gap-2 text-gray-600 hover:text-red-600 py-2 text-sm hover:bg-gray-100 rounded-lg transition-colors"
          >
            <span>🚪</span>
            <span>{mounted ? t('navigation.logout') : 'Logout'}</span>
          </button>
        )}
      </div>
    </aside>
  );
}

function NavLink({ href, icon, children, active = false, onWorkspaceRefresh, shouldRefreshWorkspaces }: { 
  href: string; 
  icon: string; 
  children: React.ReactNode; 
  active?: boolean;
  onWorkspaceRefresh?: () => void;
  shouldRefreshWorkspaces?: boolean;
}) {
  const handleClick = async (e: React.MouseEvent) => {
    // Only refresh workspaces if needed to avoid blink
    if (onWorkspaceRefresh && shouldRefreshWorkspaces) {
      await onWorkspaceRefresh();
    }
  };

  return (
    <Link 
      href={href}
      onClick={handleClick}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors duration-150 ${
        active 
          ? 'bg-blue-100 text-blue-700 font-medium' 
          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
      }`}
    >
      <span className="text-lg">{icon}</span>
      <span className="flex-1">{children}</span>
    </Link>
  );
}
