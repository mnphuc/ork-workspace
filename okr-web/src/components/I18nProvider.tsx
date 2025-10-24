'use client';

import { useEffect } from 'react';
import '@/i18n/config';

interface I18nProviderProps {
  children: React.ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
  useEffect(() => {
    // i18n is already initialized in config.ts
    // This component just ensures the config is loaded on the client side
  }, []);

  return <>{children}</>;
}
