"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Layout } from '@/components/layout';
import { apiFetch } from '@/lib/api';
import { clearTokens } from '@/lib/api';
import { logout } from '@/lib/auth';
import { useUser } from '@/contexts/UserContext';
import { ObjectiveTypeSelector, ObjectiveType } from '@/components/ObjectiveTypeSelector';
import { ObjectiveModal } from '@/components/ObjectiveModal';

export default function CreateObjectivePage() {
  const router = useRouter();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<ObjectiveType | null>(null);

  const handleTypeSelect = (type: ObjectiveType) => {
    setSelectedType(type);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedType(null);
  };

  const handleObjectiveSave = (objective: any) => {
    // Redirect to the new objective detail page
    router.push(`/okr/${objective.id}`);
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

  const handleCancel = () => {
    router.back();
  };

  return (
    <Layout onLogout={handleLogout}>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Create New Objective</h1>
          <p className="text-gray-600 mt-1">Choose the type of objective you want to create</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Objective Type</h2>
            <p className="text-gray-600 mb-6">Choose the type of objective you want to create. Each type has different characteristics and use cases.</p>
            
            <ObjectiveTypeSelector 
              onTypeSelect={handleTypeSelect}
              className="max-w-md"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Cancel
            </button>
          </div>
        </div>

        <ObjectiveModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onSave={handleObjectiveSave}
          selectedType={selectedType}
        />
      </div>
    </Layout>
  );
}
