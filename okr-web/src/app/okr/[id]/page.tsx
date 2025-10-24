"use client";
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Layout } from '@/components/layout';
import { apiFetch } from '@/lib/api';
import { clearTokens } from '@/lib/api';
import { logout } from '@/lib/auth';
import { useUser } from '@/contexts/UserContext';
import { Loading } from '@/components/Loading';
import { KeyResultItem } from '@/components/KeyResultItem';
import { KeyResultModal } from '@/components/KeyResultModal';
import { CheckInForm } from '@/components/CheckInForm';
import { CheckInHistoryChart } from '@/components/CheckInHistoryChart';
import { CommentBox } from '@/components/CommentBox';
import { ShareModal } from '@/components/ShareModal';
import { StatusBadge } from '@/components/StatusBadge';
import { ProgressBar } from '@/components/ProgressBar';
import { Button } from '@/components/Button';
import { Modal } from '@/components/Modal';
import { Input } from '@/components/Input';
import { Textarea } from '@/components/Textarea';
import { ActivityLog } from '@/components/ActivityLog';
import { AlignmentTree } from '@/components/AlignmentTree';
import { StakeholdersList } from '@/components/StakeholdersList';
import { formatDate, formatQuarter } from '@/lib/date-utils';

type Objective = {
  id: string;
  title: string;
  description: string;
  status: string;
  progress: number;
  owner_id: string;
  team_id: string;
  quarter: string;
  created_date: string;
  last_modified_date: string;
  level: number;
  parent_id?: string;
  children?: Objective[];
  alignment_type?: string;
};

type KeyResult = {
  id: string;
  title: string;
  metric_type: string;
  unit: string;
  target_value: number;
  current_value: number;
  objective_id: string;
  created_date: string;
  last_modified_date: string;
};

type Comment = {
  id: string;
  content: string;
  author_id: string;
  created_by: string;
  created_date: string;
  last_modified_date?: string;
  replies?: Comment[];
};

export default function ObjectiveDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const objectiveId = params.id as string;

  const [objective, setObjective] = useState<Objective | null>(null);
  const [keyResults, setKeyResults] = useState<KeyResult[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [checkInHistory, setCheckInHistory] = useState<{[keyResultId: string]: any[]}>({});
  const [activities, setActivities] = useState<any[]>([]);
  const [stakeholders, setStakeholders] = useState<any[]>([]);
  const [availableObjectives, setAvailableObjectives] = useState<Objective[]>([]);
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'alignment' | 'stakeholders' | 'activity'>('overview');
  
  // Modal states
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [showKeyResultModal, setShowKeyResultModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedKeyResult, setSelectedKeyResult] = useState<KeyResult | null>(null);
  const [editingKeyResult, setEditingKeyResult] = useState<KeyResult | null>(null);
  
  // Form states
  const [checkInValue, setCheckInValue] = useState('');
  const [checkInNote, setCheckInNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadObjectiveData();
  }, [objectiveId]);

  const loadObjectiveData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      if (!token) {
        window.location.href = '/login';
        return;
      }

      const [objectiveData, keyResultsData, commentsData] = await Promise.all([
        apiFetch<Objective>(`/objectives/${objectiveId}`),
        apiFetch<KeyResult[]>(`/objectives/${objectiveId}/key-results`),
        apiFetch<Comment[]>(`/comments?objective_id=${objectiveId}`)
      ]);

      setObjective(objectiveData);
      setKeyResults(keyResultsData);
      setComments(commentsData);
      setActivities([]); // Empty for now
      setStakeholders([]); // Empty for now
      setAvailableObjectives([]); // Empty for now
      setAvailableUsers([]); // Empty for now

      // Load check-in history for each key result
      const historyPromises = keyResultsData.map(async (kr) => {
        try {
          const history = await apiFetch(`/check-ins/history/${kr.id}`);
          return { keyResultId: kr.id, history };
        } catch (e) {
          console.warn(`Failed to load check-in history for ${kr.id}:`, e);
          return { keyResultId: kr.id, history: [] };
        }
      });

      const historyResults = await Promise.all(historyPromises);
      const historyMap = historyResults.reduce((acc, { keyResultId, history }) => {
        acc[keyResultId] = history;
        return acc;
      }, {} as {[keyResultId: string]: any[]});

      setCheckInHistory(historyMap);
    } catch (e: any) {
      setError(e.message || 'Failed to load objective');
      if (e.message.includes('Authentication failed')) {
        clearTokens();
        window.location.href = '/login';
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = (keyResultId: string) => {
    const kr = keyResults.find(kr => kr.id === keyResultId);
    if (kr) {
      setSelectedKeyResult(kr);
      setCheckInValue(kr.current_value.toString());
      setShowCheckInModal(true);
    }
  };

  const handleSubmitCheckIn = async (value: number, note?: string) => {
    if (!selectedKeyResult) return;
    
    try {
      setSubmitting(true);
      await apiFetch(`/check-ins`, {
        method: 'POST',
        body: {
          key_result_id: selectedKeyResult.id,
          value: value,
          note: note
        }
      });
      
      // Reload data
      await loadObjectiveData();
      setShowCheckInModal(false);
      setSelectedKeyResult(null);
      setCheckInValue('');
      setCheckInNote('');
    } catch (e: any) {
      console.error('Failed to submit check-in:', e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddKeyResult = () => {
    setEditingKeyResult(null);
    setShowKeyResultModal(true);
  };

  const handleEditKeyResult = (keyResultId: string) => {
    const keyResult = keyResults.find(kr => kr.id === keyResultId);
    if (keyResult) {
      setEditingKeyResult(keyResult);
      setShowKeyResultModal(true);
    }
  };

  const handleDeleteKeyResult = async (keyResultId: string) => {
    if (!confirm('Are you sure you want to delete this key result?')) return;
    
    try {
      await apiFetch(`/key-results/${keyResultId}`, {
        method: 'DELETE'
      });
      await loadObjectiveData();
    } catch (e: any) {
      console.error('Failed to delete key result:', e);
    }
  };

  const handleKeyResultSaved = async () => {
    await loadObjectiveData();
  };

  const handleAddComment = async (content: string, parentId?: string) => {
    if (!objective) return;
    
    try {
      setSubmitting(true);
      await apiFetch(`/comments`, {
        method: 'POST',
        body: {
          objective_id: objective.id,
          content: content,
          author_id: user?.id || 'current-user-id'
        }
      });
      
      // Reload data
      await loadObjectiveData();
    } catch (e: any) {
      console.error('Failed to add comment:', e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditComment = async (id: string, content: string) => {
    try {
      setSubmitting(true);
      await apiFetch(`/comments/${id}`, {
        method: 'PATCH',
        body: {
          content: content
        }
      });
      
      // Reload data
      await loadObjectiveData();
    } catch (e: any) {
      console.error('Failed to edit comment:', e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (id: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;
    
    try {
      setSubmitting(true);
      await apiFetch(`/comments/${id}`, {
        method: 'DELETE'
      });
      
      // Reload data
      await loadObjectiveData();
    } catch (e: any) {
      console.error('Failed to delete comment:', e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async (parentId: string, content: string) => {
    // For now, treat replies as new comments
    // In a full implementation, you'd have a parent_id field
    await handleAddComment(content);
  };

  const handleShare = async (shareData: any) => {
    console.log('Sharing objective:', shareData);
    // Implement sharing logic here
    setShowShareModal(false);
  };

  const handleAddAlignment = async (parentId: string, childId: string, type: string) => {
    try {
      await apiFetch(`/objectives/${parentId}/alignments`, {
        method: 'POST',
        body: {
          child_objective_id: childId,
          alignment_type: type
        }
      });
      await loadObjectiveData();
    } catch (e: any) {
      console.error('Failed to add alignment:', e);
    }
  };

  const handleRemoveAlignment = async (parentId: string, childId: string) => {
    try {
      await apiFetch(`/objectives/${parentId}/alignments/${childId}`, {
        method: 'DELETE'
      });
      await loadObjectiveData();
    } catch (e: any) {
      console.error('Failed to remove alignment:', e);
    }
  };

  const handleAddStakeholder = async (userId: string, role: string, permissions: any) => {
    try {
      await apiFetch(`/objectives/${objectiveId}/stakeholders`, {
        method: 'POST',
        body: {
          user_id: userId,
          role: role,
          permissions: permissions
        }
      });
      await loadObjectiveData();
    } catch (e: any) {
      console.error('Failed to add stakeholder:', e);
    }
  };

  const handleUpdateStakeholder = async (stakeholderId: string, updates: any) => {
    try {
      await apiFetch(`/objectives/${objectiveId}/stakeholders/${stakeholderId}`, {
        method: 'PATCH',
        body: updates
      });
      await loadObjectiveData();
    } catch (e: any) {
      console.error('Failed to update stakeholder:', e);
    }
  };

  const handleRemoveStakeholder = async (stakeholderId: string) => {
    try {
      await apiFetch(`/objectives/${objectiveId}/stakeholders/${stakeholderId}`, {
        method: 'DELETE'
      });
      await loadObjectiveData();
    } catch (e: any) {
      console.error('Failed to remove stakeholder:', e);
    }
  };

  const handleObjectiveClick = (clickedObjective: Objective) => {
    router.push(`/okr/${clickedObjective.id}`);
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

  if (loading) {
    return (
      <Layout onLogout={handleLogout}>
        <Loading text="Loading objective..." />
      </Layout>
    );
  }

  if (error || !objective) {
    return (
      <Layout onLogout={handleLogout}>
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
          {error || 'Objective not found'}
        </div>
      </Layout>
    );
  }

  return (
    <Layout onLogout={handleLogout}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{objective.title}</h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">{objective.description}</p>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
            <StatusBadge status={objective.status} />
            <Button variant="outline" onClick={() => setShowShareModal(true)}>
              Share
            </Button>
            <Button variant="outline" onClick={() => router.back()}>
              Back
            </Button>
          </div>
        </div>

        {/* Progress Overview */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Overall Progress</h3>
          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <div className="text-3xl sm:text-4xl font-bold text-gray-900">{objective.progress}%</div>
            <div className="flex-1">
              <ProgressBar progress={objective.progress} size="lg" />
            </div>
          </div>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-sm text-gray-600">
            <div>
              <span className="font-medium">Owner:</span> {objective.owner_id}
            </div>
            <div>
              <span className="font-medium">Team:</span> {objective.team_id}
            </div>
            <div>
              <span className="font-medium">Quarter:</span> {formatQuarter(objective.quarter)}
            </div>
            <div>
              <span className="font-medium">Updated:</span> {formatDate(objective.last_modified_date)}
            </div>
          </div>
        </div>

        {/* Key Results */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
              <h3 className="text-lg font-semibold text-gray-900">Key Results</h3>
              <Button onClick={handleAddKeyResult}>
                Add Key Result
              </Button>
            </div>
          </div>
          <div className="p-4 sm:p-6 space-y-4">
            {keyResults.length > 0 ? (
              keyResults.map((kr) => (
                <KeyResultItem
                  key={kr.id}
                  keyResult={kr}
                  onCheckIn={handleCheckIn}
                  onEdit={handleEditKeyResult}
                  onDelete={handleDeleteKeyResult}
                />
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">No key results yet</p>
            )}
          </div>
        </div>

        {/* Check-in History Charts */}
        {keyResults.length > 0 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Progress Tracking</h3>
            {keyResults.map((kr) => (
              <CheckInHistoryChart
                key={kr.id}
                keyResultId={kr.id}
                checkIns={checkInHistory[kr.id] || []}
                metricType={kr.metric_type}
                unit={kr.unit}
              />
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('alignment')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'alignment'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Alignment
            </button>
            <button
              onClick={() => setActiveTab('stakeholders')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'stakeholders'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Stakeholders
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'activity'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Activity Log
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Key Results */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-4 sm:p-6 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                  <h3 className="text-lg font-semibold text-gray-900">Key Results</h3>
                  <Button onClick={handleAddKeyResult}>
                    Add Key Result
                  </Button>
                </div>
              </div>
              <div className="p-4 sm:p-6 space-y-4">
                {keyResults.length > 0 ? (
                  keyResults.map((kr) => (
                    <KeyResultItem
                      key={kr.id}
                      keyResult={kr}
                      onCheckIn={handleCheckIn}
                      onEdit={handleEditKeyResult}
                      onDelete={handleDeleteKeyResult}
                    />
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-8">No key results yet</p>
                )}
              </div>
            </div>

            {/* Check-in History Charts */}
            {keyResults.length > 0 && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Progress Tracking</h3>
                {keyResults.map((kr) => (
                  <CheckInHistoryChart
                    key={kr.id}
                    keyResultId={kr.id}
                    checkIns={checkInHistory[kr.id] || []}
                    metricType={kr.metric_type}
                    unit={kr.unit}
                  />
                ))}
              </div>
            )}

            {/* Comments */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-4 sm:p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Comments</h3>
              </div>
              <div className="p-4 sm:p-6">
                <CommentBox
                  comments={comments}
                  onAddComment={handleAddComment}
                  onEditComment={handleEditComment}
                  onDeleteComment={handleDeleteComment}
                  onReply={handleReply}
                  currentUserId={user?.id}
                />
              </div>
            </div>
          </div>
        )}

        {/* Alignment Tab */}
        {activeTab === 'alignment' && objective && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <AlignmentTree
              objective={objective}
              onObjectiveClick={handleObjectiveClick}
              onAddAlignment={handleAddAlignment}
              onRemoveAlignment={handleRemoveAlignment}
              availableObjectives={availableObjectives}
            />
          </div>
        )}

        {/* Stakeholders Tab */}
        {activeTab === 'stakeholders' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <StakeholdersList
              stakeholders={stakeholders}
              onAddStakeholder={handleAddStakeholder}
              onUpdateStakeholder={handleUpdateStakeholder}
              onRemoveStakeholder={handleRemoveStakeholder}
              availableUsers={availableUsers}
            />
          </div>
        )}

        {/* Activity Log Tab */}
        {activeTab === 'activity' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <ActivityLog
              activities={activities}
              onLoadMore={() => {}}
              hasMore={false}
              loading={false}
            />
          </div>
        )}
      </div>

      {/* Check-in Modal */}
      {showCheckInModal && selectedKeyResult && (
        <CheckInForm
          keyResult={selectedKeyResult}
          onSubmit={handleSubmitCheckIn}
          onCancel={() => setShowCheckInModal(false)}
          isLoading={submitting}
        />
      )}

      {/* Key Result Modal */}
      <KeyResultModal
        isOpen={showKeyResultModal}
        onClose={() => setShowKeyResultModal(false)}
        onSave={handleKeyResultSaved}
        objectiveId={objectiveId}
        editKeyResult={editingKeyResult}
      />

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        onShare={handleShare}
        title={objective.title}
        type="objective"
        itemId={objective.id}
        currentUser={user}
      />
    </Layout>
  );
}