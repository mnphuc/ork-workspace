"use client";
import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout';
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

export default function CheckInsPage() {
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

  const handleOpenCheckInForm = (keyResult: KeyResult) => {
    setSelectedKeyResult(keyResult);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedKeyResult(null);
  };

  const handleSubmitCheckIn = async (value: number, note?: string) => {
    if (!selectedKeyResult) return;

    try {
      setIsSubmitting(true);
      
      const checkInData = {
        keyResultId: selectedKeyResult.id,
        value: value,
        note: note
      };

      const newCheckIn = await apiFetch<CheckIn>('/check-ins', {
        method: 'POST',
        body: JSON.stringify(checkInData)
      });

      // Add to the beginning of the list
      setCheckIns(prev => [newCheckIn, ...prev]);
      
      // Update the key result's current value
      setKeyResults(prev => 
        prev.map(kr => 
          kr.id === selectedKeyResult.id 
            ? { ...kr, current_value: value }
            : kr
        )
      );

      handleCloseForm();
    } catch (e: any) {
      console.error('Failed to submit check-in:', e);
      alert('Failed to submit check-in: ' + (e.message || 'Unknown error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Layout onLogout={handleLogout}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading check-ins...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout onLogout={handleLogout}>
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadCheckIns}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout onLogout={handleLogout}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Check-ins</h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">
              Track progress and update your objectives
            </p>
          </div>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            <button 
              onClick={() => setIsFormOpen(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium min-h-[44px]"
            >
              Quick Check-in
            </button>
          </div>
        </div>

        {/* Check-ins Feed */}
        <CheckInFeed 
          checkIns={checkIns}
          keyResults={keyResults}
          onOpenCheckInForm={handleOpenCheckInForm}
        />

        {/* Check-in Form Modal */}
        {isFormOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl p-4 sm:p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Quick Check-in</h3>
                <button
                  onClick={handleCloseForm}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-3">
                {keyResults.map((keyResult) => (
                  <button
                    key={keyResult.id}
                    onClick={() => handleOpenCheckInForm(keyResult)}
                    className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="font-medium text-gray-900">{keyResult.title}</div>
                    <div className="text-sm text-gray-500">
                      {keyResult.objective_title} • Current: {keyResult.current_value} {keyResult.unit}
                    </div>
                  </button>
                ))}
              </div>
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
    </Layout>
  );
}


