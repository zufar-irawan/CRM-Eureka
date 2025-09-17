"use client";

import { useState } from 'react';
import { FileText } from 'lucide-react';
import type { CurrentUser } from '../types';
import { RESULT_TYPES, makeAuthenticatedRequest, TASK_API_ENDPOINTS } from '../utils/constants';
import { getFirstChar } from '../utils/formatting';
import Swal from 'sweetalert2'

interface AddTaskResultProps {
  taskId: string | string[] | undefined;
  currentUser: CurrentUser | null;
  onResultAdded: () => void;
  onCancel: () => void;
}

export default function AddTaskResult({
  taskId,
  currentUser,
  onResultAdded,
  onCancel
}: AddTaskResultProps) {
  const [resultText, setResultText] = useState('');
  const [resultType, setResultType] = useState('note');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const normalizedTaskId = Array.isArray(taskId) ? taskId[0] : taskId;

  // Di dalam AddTaskResult (setelah state2 dan sebelum handleSubmit)
  const handleUpdateTaskStatus = async (
    taskId: string,
    status: 'pending' | 'completed' | 'cancelled'
  ) => {
    try {
      const response = await makeAuthenticatedRequest(
        `http://localhost:5000/api/tasks/${taskId}/updateStatus`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update task status');
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || 'Failed to update task status');
      }

      // Optional: tampilkan notifikasi
      Swal.fire({
        icon: 'success',
        title: 'Status Updated',
        text: `Task status changed to ${status}`,
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error('Error updating task status:', error);
      Swal.fire({
        icon: 'error',
        title: 'Update Failed',
        text:
          error instanceof Error
            ? error.message
            : 'Failed to update task status. Please try again.',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!resultText.trim()) {
      setError('Result description cannot be empty');

      Swal.fire({
        icon: 'warning',
        title: 'Missing Information',
        text: 'Result description cannot be empty',
      });
      return;
    }

    if (!normalizedTaskId) {
      setError('Task ID is required');

      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Task ID is required',
      });
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await makeAuthenticatedRequest(
        TASK_API_ENDPOINTS.TASK_RESULTS(normalizedTaskId),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            result_text: resultText.trim(),
            result_type: resultType,
            created_by: currentUser?.id,
            created_by_name: currentUser?.name
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to add result');
      }

      if (normalizedTaskId) {
        await handleUpdateTaskStatus(normalizedTaskId, 'completed');
      }

      // Reset form and notify parent
      setResultText('');
      setResultType('note');
      onResultAdded();

      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Result added successfully!',
        timer: 2000,
        showConfirmButton: false
      });

    } catch (err) {
      console.error('Error adding result:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to add result';
      setError(errorMessage);

      Swal.fire({
        icon: 'error',
        title: 'Failed to Add Result',
        text: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedType = RESULT_TYPES.find(t => t.value === resultType) || RESULT_TYPES[4]; // default to 'note'

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
      <div className="flex items-start space-x-3">
        {/* User Avatar */}
        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-xs font-medium text-blue-700">
            {getFirstChar(currentUser?.name || 'U')}
          </span>
        </div>

        <div className="flex-1">
          <form onSubmit={handleSubmit}>
            {/* Type Selection */}
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Result Type
              </label>
              <select
                value={resultType}
                onChange={(e) => setResultType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                disabled={isSubmitting}
              >
                {RESULT_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Result Input */}
            <div className="mb-3">
              <textarea
                value={resultText}
                onChange={(e) => setResultText(e.target.value)}
                placeholder={`Describe the ${selectedType.label.toLowerCase()} outcome...`}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                rows={4}
                disabled={isSubmitting}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-500">
                Recording as <span className="font-medium">{currentUser?.name || 'Unknown User'}</span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={onCancel}
                  disabled={isSubmitting}
                  className="px-3 py-1 text-gray-600 text-sm hover:text-gray-800 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!resultText.trim() || isSubmitting}
                  className="px-4 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                      <span>Adding...</span>
                    </>
                  ) : (
                    <>
                      <FileText className="w-3 h-3" />
                      <span>Add Result</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}