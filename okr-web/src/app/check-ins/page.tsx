"use client";
import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout';
import { WorkspaceRequired } from '@/components/WorkspaceRequired';
import { CheckInFeed } from '@/components/CheckInFeed';
import { CheckInForm } from '@/components/CheckInForm';
import { apiFetch } from '@/lib/api';
import { clearTokens } from '@/lib/api';
import { logout } from '@/lib/auth';
import { useTranslation } from 'react-i18next';

interface CheckIn {
  id: string;
  key_result_id: string;
  value: number;
  note?: string;
  created_by: string;
  created_date: string;
  last_modified_date: string;
}

interface KeyResult {
  id: string;
  title: string;
  metric_type: string;
  unit: string;
  target_value: number;
  current_value: number;
  objective_id: string;
  objective_title: string;
}

interface CheckInFeedData {
  check_ins: CheckIn[];
  key_results: KeyResult[];
}

function CheckInsContent() {
  const { t } = useTranslation();
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [keyResults, setKeyResults] = useState<KeyResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedKeyResult, setSelectedKeyResult] = useState<KeyResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      window.location.href = '/login';
      return;
    }
    
    loadCheckIns();
  }, []);

  const loadCheckIns = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load recent check-ins
      const checkInsData = await apiFetch<CheckIn[]>('/check-ins');
      setCheckIns(checkInsData);
      
      // Load key results for check-in form
      const keyResultsData = await apiFetch<KeyResult[]>('/key-results');
      setKeyResults(keyResultsData);
    } catch (e: any) {
      setError(e.message || 'Failed to load check-ins');
      if (e.message.includes('Authentication failed')) {
        clearTokens();
        window.location.href = '/login';
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitCheckIn = async (keyResultId: string, value: number, note?: string) => {
    try {
      setIsSubmitting(true);
      
      const checkInData = {
        key_result_id: keyResultId,
        value: value,
        note: note
      };
      
      await apiFetch('/check-ins', {
        method: 'POST',
        body: JSON.stringify(checkInData)
      });
      
      // Reload check-ins after successful submission
      await loadCheckIns();
      
      // Close form
      setSelectedKeyResult(null);
      setIsFormOpen(false);
    } catch (e: any) {
      setError(e.message || 'Failed to submit check-in');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenForm = (keyResult: KeyResult) => {
    setSelectedKeyResult(keyResult);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setSelectedKeyResult(null);
    setIsFormOpen(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading check-ins...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={loadCheckIns}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Check-ins</h1>
        <button
          onClick={() => setIsFormOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          New Check-in
        </button>
      </div>

      {/* Check-in Feed */}
      <CheckInFeed 
        checkIns={checkIns}
        onRefresh={loadCheckIns}
      />

      {/* Key Results for Check-in */}
      {keyResults.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Available Key Results</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {keyResults.map((keyResult) => (
              <div key={keyResult.id} className="p-4 border border-gray-200 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">{keyResult.title}</h3>
                <p className="text-sm text-gray-600 mb-2">
                  {keyResult.objective_title}
                </p>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm text-gray-500">
                    {keyResult.current_value} / {keyResult.target_value} {keyResult.unit}
                  </span>
                  <span className="text-sm font-medium text-blue-600">
                    {Math.round((keyResult.current_value / keyResult.target_value) * 100)}%
                  </span>
                </div>
                <button
                  onClick={() => handleOpenForm(keyResult)}
                  className="w-full px-3 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
                >
                  Check-in
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Individual Check-in Form */}
      {selectedKeyResult && (
        <CheckInForm
          keyResult={selectedKeyResult}
          onSubmit={handleSubmitCheckIn}
          onCancel={handleCloseForm}
          isLoading={isSubmitting}
        />
      )}
    </div>
  );
}

export default function CheckInsPage() {
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.warn('Logout failed:', error);
    } finally {
      clearTokens();
      window.location.href = '/login';
    }
  };

  return (
    <Layout onLogout={handleLogout}>
      <WorkspaceRequired>
        <CheckInsContent />
      </WorkspaceRequired>
    </Layout>
  );
}