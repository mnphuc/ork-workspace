'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { LanguageSelector } from '@/components';
import { UserDropdown } from '@/components/UserDropdown';

interface HeaderProps {
  user?: {
    full_name: string;
    email: string;
  };
  onLogout?: () => void;
  onToggleSidebar?: () => void;
}

export function Header({ user, onLogout, onToggleSidebar }: HeaderProps) {
  const pathname = usePathname();
  const { t } = useTranslation();
  
  const getPageTitle = () => {
    if (pathname === '/dashboard') return t('navigation.dashboard');
    if (pathname === '/okr') return t('navigation.objectives');
    if (pathname.startsWith('/okr/')) {
      if (pathname === '/okr/alignment') return t('navigation.alignment');
      if (pathname === '/okr/new') return t('okr.objective.create');
      return t('okr.objective.title');
    }
    if (pathname === '/settings') return t('navigation.settings');
    return 'OKR Management';
  };

  const getBreadcrumbs = () => {
    const crumbs = [];
    if (pathname !== '/dashboard') {
      crumbs.push({ label: t('navigation.dashboard'), href: '/dashboard' });
    }
    if (pathname.startsWith('/okr') && pathname !== '/okr') {
      crumbs.push({ label: t('navigation.objectives'), href: '/okr' });
    }
    return crumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-4 sm:px-6 py-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          {/* Hamburger menu button for mobile */}
          <button
            onClick={(e) => {
              e.preventDefault();
              console.log('Hamburger menu clicked, onToggleSidebar:', !!onToggleSidebar);
              if (onToggleSidebar) {
                onToggleSidebar();
              }
            }}
            className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <h2 className="text-lg font-semibold text-gray-800">{getPageTitle()}</h2>
          
          {/* Breadcrumbs - hidden on mobile, shown on tablet+ */}
          {breadcrumbs.length > 0 && (
            <nav className="hidden md:flex items-center space-x-1 text-sm text-gray-500">
              {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={crumb.href}>
                  <a 
                    href={crumb.href}
                    className="hover:text-gray-700 transition-colors"
                  >
                    {crumb.label}
                  </a>
                  {index < breadcrumbs.length - 1 && <span>/</span>}
                </React.Fragment>
              ))}
            </nav>
          )}
        </div>
        
        <div className="flex items-center space-x-2 sm:space-x-4">
          <LanguageSelector />
          
          {/* User Info */}
          {user && onLogout && (
            <UserDropdown 
              user={user}
              onLogout={onLogout}
              onProfile={() => {
                window.location.href = '/profile';
              }}
              onSettings={() => {
                window.location.href = '/settings';
              }}
            />
          )}
        </div>
      </div>
    </header>
  );
}

