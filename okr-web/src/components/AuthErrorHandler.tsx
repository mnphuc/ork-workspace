"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { handleAuthError } from '@/lib/api';

interface AuthErrorHandlerProps {
  error?: string | null;
  onClearError?: () => void;
}

export function AuthErrorHandler({ error, onClearError }: AuthErrorHandlerProps) {
  const router = useRouter();

  useEffect(() => {
    if (error && (
      error.includes('401') || 
      error.includes('403') || 
      error.includes('Authentication') ||
      error.includes('Unauthorized')
    )) {
      console.warn('Authentication error detected, redirecting to login...');
      handleAuthError();
    }
  }, [error]);

  // Don't render anything, this is just a handler
  return null;
}
