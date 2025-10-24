'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '@/contexts/UserContext';
import { useTranslation } from 'react-i18next';
import { WorkspaceSelector } from '@/components/WorkspaceSelector';

interface SidebarProps {
  onLogout?: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ onLogout, isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useUser();
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  const menuItems = [
    { path: '/home', label: mounted ? t('navigation.home') : 'Home', icon: '🏠' },
    { path: '/workspaces', label: mounted ? t('navigation.workspaces') : 'Workspaces', icon: '🏢' },
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
      transform transition-transform duration-300 ease-in-out
      ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
    `}>
      <div className="p-4 sm:p-6 flex-1">
        {/* Logo and close button */}
        <div className="flex items-center justify-between mb-6 lg:mb-8">
          <div className="text-xl sm:text-2xl font-bold">
            <span className="text-orange-500">o</span>
            <span className="text-pink-500">b</span>
            <span className="text-blue-500">o</span>
            <span className="text-green-500">a</span>
            <span className="text-purple-500">r</span>
            <span className="text-red-500">d</span>
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
                (item.path === '/okr' && pathname.startsWith('/okr')) ||
                (item.path === '/workspaces' && pathname.startsWith('/workspaces'))}
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

function NavLink({ href, icon, children, active = false }: { 
  href: string; 
  icon: string; 
  children: React.ReactNode; 
  active?: boolean; 
}) {
  return (
    <Link 
      href={href}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
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
