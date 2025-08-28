"use client";

import { FileText, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { CurrentUser, TaskResult } from '../types';
import { useTaskResults } from '../hooks/useTaskResults';
import TaskResultItem from './TaskResultItem';
import TaskResultWithAttachment from './TaskResultWithAttachment';

interface TaskResultsTabProps {
  taskId: string | string[] | undefined;
  currentUser: CurrentUser | null;
  refreshComments: () => void;
}

export default function TaskResultsTab({ taskId, currentUser, refreshComments }: TaskResultsTabProps) {
  const [showAddResult, setShowAddResult] = useState(false);

  const {
    results,
    resultsLoading,
    resultsError,
    fetchResults,
    addResult,
    updateResult,
    deleteResult,
  } = useTaskResults(taskId);

  useEffect(() => {
    if (taskId) {
      fetchResults();
    }
  }, [taskId, fetchResults]);

  const handleResultAdded = async () => {
    try {
      // Refresh results first
      await fetchResults();
      
      // Hide the add result form
      setShowAddResult(false);
      
      // Refresh comments in parent component
      if (refreshComments) {
        refreshComments();
      }
      
      console.log('✅ Auto-refresh completed after adding result');
    } catch (error) {
      console.error('Error during auto-refresh:', error);
    }
  };

  const handleResultUpdated = async () => {
    try {
      await fetchResults();
      console.log('✅ Auto-refresh completed after updating result');
    } catch (error) {
      console.error('Error refreshing after update:', error);
    }
  };

  const handleResultDeleted = async () => {
    try {
      await fetchResults();
      console.log('✅ Auto-refresh completed after deleting result');
    } catch (error) {
      console.error('Error refreshing after delete:', error);
    }
  };

  const handleAddResultClick = () => {
    setShowAddResult(true);
  };

  const handleCancelAdd = () => {
    setShowAddResult(false);
  };

  // Ensure results is always an array
  const resultsArray = Array.isArray(results) ? results : [];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center space-x-6">
          <h2 className="text-xl font-semibold text-gray-900">Results & Outcomes</h2>
          {resultsArray.length > 0 && (
            <div className="flex items-center space-x-1 text-sm text-gray-600">
              <FileText className="w-4 h-4" />
              <span>{resultsArray.length} result{resultsArray.length !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
        
        {!showAddResult && (
          <button
            onClick={handleAddResultClick}
            className="bg-black text-white px-4 py-2 rounded-md text-sm font-medium flex items-center space-x-2 hover:bg-gray-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Result</span>
          </button>
        )}
      </div>

      {/* Add Result Form */}
      {showAddResult && (
        <div className="mb-6">
          <TaskResultWithAttachment
            taskId={taskId as string}
            currentUser={currentUser}
            onSuccess={handleResultAdded}
          />
        </div>
      )}

      {/* Loading */}
      {resultsLoading && (
        <div className="flex justify-center py-8">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-black rounded-full animate-spin"></div>
        </div>
      )}

      {/* Error */}
      {resultsError && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <p className="text-red-700 text-sm">{resultsError}</p>
          <button
            onClick={fetchResults}
            className="text-red-700 text-sm underline mt-2 hover:text-red-800"
          >
            Try again
          </button>
        </div>
      )}

      {/* Empty State */}
      {!resultsLoading && resultsArray.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-lg flex items-center justify-center">
            <FileText className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">No Results Yet</h3>
          <p className="text-gray-600 mb-6">Document the outcomes and results of this task</p>
          <button
            onClick={handleAddResultClick}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Add the first result
          </button>
        </div>
      ) : (
        /* Results List */
        <div className="space-y-4">
          {resultsArray.map((result) => (
              <TaskResultItem
                key={result.id}
                result={result}
                currentUser={currentUser}
                onUpdate={handleResultUpdated}
                onDelete={handleResultDeleted}
                attachments={result.attachments || []}
              />
            ))}
        </div>
      )}

      {/* Footer Stats - Only show if there are results */}
      {resultsArray.length > 0 && (
        <div className="mt-8 pt-4 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-500">
            {resultsArray.length} result{resultsArray.length !== 1 ? 's' : ''} recorded for this task
          </p>
        </div>
      )}
    </div>
  );
}