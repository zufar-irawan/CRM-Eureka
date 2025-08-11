// src/hooks/useTaskComments.ts
"use client";

import { useState, useEffect, useCallback } from 'react';
import { makeAuthenticatedRequest } from '../utils/auth';
import { TASK_API_ENDPOINTS } from '../utils/constants';
import type { TaskComment } from '../types';

export function useTaskComments(taskId: string | string[] | undefined) {
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsError, setCommentsError] = useState<string | null>(null);

  // Normalize taskId to string
  const normalizedTaskId = Array.isArray(taskId) ? taskId[0] : taskId;

  // Function to fetch comments
  const fetchComments = useCallback(async () => {
    if (!normalizedTaskId) return;
    
    try {
      setCommentsLoading(true);
      setCommentsError(null);
      
      const response = await makeAuthenticatedRequest(
        TASK_API_ENDPOINTS.TASK_COMMENTS(normalizedTaskId)
      );
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch comments');
      }
      
      const data = await response.json();
      
      // Handle different response formats
      const commentsData = data.success ? data.data : data;
      const commentsArray = Array.isArray(commentsData) ? commentsData : [];
      
      setComments(commentsArray);
    } catch (err) {
      console.error('Error fetching comments:', err);
      setCommentsError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setCommentsLoading(false);
    }
  }, [normalizedTaskId]);

  // Function to add comment
  const addComment = async (content: string): Promise<void> => {
    if (!normalizedTaskId) throw new Error('Task ID is required');
    
    try {
      const response = await makeAuthenticatedRequest(
        TASK_API_ENDPOINTS.TASK_COMMENTS(normalizedTaskId),
        {
          method: 'POST',
          body: JSON.stringify({ comment_text: content }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to add comment');
      }

      // Refresh comments after successful addition
      await fetchComments();
    } catch (err) {
      console.error('Error adding comment:', err);
      setCommentsError(err instanceof Error ? err.message : 'Failed to add comment');
      throw err; // Re-throw for component handling
    }
  };

  // Function to update comment
  const updateComment = async (commentId: string | number, content: string): Promise<void> => {
    try {
      const response = await makeAuthenticatedRequest(
        TASK_API_ENDPOINTS.COMMENT_UPDATE(String(commentId)),
        {
          method: 'PUT',
          body: JSON.stringify({ comment_text: content }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update comment');
      }

      // Refresh comments after successful update
      await fetchComments();
    } catch (err) {
      console.error('Error updating comment:', err);
      setCommentsError(err instanceof Error ? err.message : 'Failed to update comment');
      throw err;
    }
  };

  // Function to delete comment
  const deleteComment = async (commentId: string | number): Promise<void> => {
    try {
      const response = await makeAuthenticatedRequest(
        TASK_API_ENDPOINTS.COMMENT_UPDATE(String(commentId)),
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to delete comment');
      }

      // Refresh comments after successful deletion
      await fetchComments();
    } catch (err) {
      console.error('Error deleting comment:', err);
      setCommentsError(err instanceof Error ? err.message : 'Failed to delete comment');
      throw err;
    }
  };

  // Auto-fetch comments when taskId changes
  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  return {
    comments,
    commentsLoading,
    commentsError,
    fetchComments,
    addComment,
    updateComment,
    deleteComment,
  };
}