"use client";

import { useState } from 'react';
import type { CurrentUser } from '../types';
import { getFirstChar } from '../utils/formatting';
import { makeAuthenticatedRequest, TASK_API_ENDPOINTS } from '../utils/constants';
import Swal from 'sweetalert2';

interface AddTaskCommentProps {
  taskId: string | string[] | undefined;
  currentUser: CurrentUser | null;
  onCommentAdded: () => void;
  onCancel: () => void;
}

export default function AddTaskComment({
  taskId,
  currentUser,
  onCommentAdded,
  onCancel
}: AddTaskCommentProps) {
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Normalize taskId
  const normalizedTaskId = Array.isArray(taskId) ? taskId[0] : taskId;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!commentText.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Comment Required',
        text: 'Please enter a comment before submitting.',
        confirmButtonColor: '#3b82f6'
      });
      return;
    }

    if (!normalizedTaskId) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Task ID is required to add a comment.',
        confirmButtonColor: '#3b82f6'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await makeAuthenticatedRequest(
        TASK_API_ENDPOINTS.TASK_COMMENTS(normalizedTaskId),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            comment_text: commentText.trim(),
            commented_by: currentUser?.id,
            commented_by_name: currentUser?.name
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to add comment');
      }

      // Reset form and notify parent
      setCommentText('');
      onCommentAdded();

      // Show success message
      Swal.fire({
        icon: 'success',
        title: 'Comment Added!',
        text: 'Your comment has been successfully added.',
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false
      });

    } catch (err) {
      console.error('Error adding comment:', err);
      
      Swal.fire({
        icon: 'error',
        title: 'Failed to Add Comment',
        text: err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.',
        confirmButtonColor: '#3b82f6'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
            {/* Comment Input */}
            <div className="mb-3">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                rows={3}
                disabled={isSubmitting}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-500">
                Commenting as <span className="font-medium">{currentUser?.name || 'Unknown User'}</span>
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
                  disabled={!commentText.trim() || isSubmitting}
                  className="px-4 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                      <span>Adding...</span>
                    </>
                  ) : (
                    <span>Add Comment</span>
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