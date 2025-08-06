// hooks/useComments.ts
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Comment, CurrentUser, ReplyState, SubmittingState } from '../types';
import { makeAuthenticatedRequest } from '../utils/auth';
import { API_ENDPOINTS } from '../utils/constants';

export const useComments = (leadId: string | string[] | undefined) => {
  const router = useRouter();
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsError, setCommentsError] = useState<string | null>(null);
  
  // Comment form states
  const [showNewComment, setShowNewComment] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  // Reply states
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyMessages, setReplyMessages] = useState<ReplyState>({});
  const [replySubmitting, setReplySubmitting] = useState<SubmittingState>({});

  // Function to organize comments into nested structure
  const organizeComments = (comments: Comment[]): Comment[] => {
    const commentMap = new Map<number, Comment>();
    const rootComments: Comment[] = [];

    // First, create a map of all comments
    comments.forEach(comment => {
      commentMap.set(comment.id, { ...comment, replies: [] });
    });

    // Then, organize them into parent-child relationships
    comments.forEach(comment => {
      if (comment.parent_id) {
        const parentComment = commentMap.get(comment.parent_id);
        if (parentComment) {
          parentComment.replies!.push(commentMap.get(comment.id)!);
        }
      } else {
        rootComments.push(commentMap.get(comment.id)!);
      }
    });

    return rootComments;
  };

  // Fetch comments
  const fetchComments = async () => {
    if (!leadId) return;

    setCommentsLoading(true);
    setCommentsError(null);

    try {
      const response = await makeAuthenticatedRequest(`${API_ENDPOINTS.LEADS}/${leadId}/comments`);

      if (!response.ok) {
        if (response.status === 401) {
          console.error('Unauthorized access to comments');
          setCommentsError('Unauthorized access to comments');
          return;
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const commentsArray = Array.isArray(data) ? data : [];
      setComments(organizeComments(commentsArray));
    } catch (error) {
      console.error('Error fetching comments:', error);
      setCommentsError('Failed to load comments');
      setComments([]);
    } finally {
      setCommentsLoading(false);
    }
  };

  // Add new comment
  const handleAddComment = async (currentUser: CurrentUser | null) => {
    if (!newComment.trim() || !leadId || !currentUser) return;

    setSubmitting(true);

    try {
      const response = await makeAuthenticatedRequest(`${API_ENDPOINTS.LEADS}/${leadId}/comments`, {
        method: 'POST',
        body: JSON.stringify({
          message: newComment.trim(),
          user_name: currentUser.name,
          user_id: currentUser.id
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          console.error('Unauthorized access - redirecting to login');
          router.push('/login');
          return;
        }
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.comment) {
        await fetchComments();
      }

      setNewComment('');
      setShowNewComment(false);

    } catch (error) {
      console.error('Error adding comment:', error);
      alert(`Failed to add comment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Helper function to find comment by ID in nested structure
  const findCommentById = (comments: Comment[], id: number): Comment | null => {
    for (const comment of comments) {
      if (comment.id === id) return comment;
      if (comment.replies) {
        const found = findCommentById(comment.replies, id);
        if (found) return found;
      }
    }
    return null;
  };

  // Handle reply to comment
  const handleReplyToComment = async (commentId: number, currentUser: CurrentUser | null) => {
    const replyMessage = replyMessages[commentId];
    if (!replyMessage?.trim() || !leadId || !currentUser) return;

    setReplySubmitting(prev => ({ ...prev, [commentId]: true }));

    try {
      const originalComment = findCommentById(comments, commentId);
      const replyText = `@${originalComment?.user_name || 'Unknown User'} ${replyMessage.trim()}`;

      const response = await makeAuthenticatedRequest(`${API_ENDPOINTS.LEADS}/${leadId}/comments`, {
        method: 'POST',
        body: JSON.stringify({
          message: replyText,
          user_name: currentUser.name,
          user_id: currentUser.id,
          parent_id: commentId
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          console.error('Unauthorized access - redirecting to login');
          router.push('/login');
          return;
        }
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.comment) {
        await fetchComments();
      }

      setReplyMessages(prev => ({ ...prev, [commentId]: '' }));
      setReplyingTo(null);

    } catch (error) {
      console.error('Error adding reply:', error);
      alert(`Failed to add reply: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setReplySubmitting(prev => ({ ...prev, [commentId]: false }));
    }
  };

  // Delete comment
  const handleDeleteComment = async (commentId: number) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      const response = await makeAuthenticatedRequest(`${API_ENDPOINTS.LEADS}/${leadId}/comments/${commentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        if (response.status === 401) {
          console.error('Unauthorized access - redirecting to login');
          router.push('/login');
          return;
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      await fetchComments();

    } catch (error) {
      console.error('Error deleting comment:', error);
      alert(`Failed to delete comment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return {
    // State
    comments,
    commentsLoading,
    commentsError,
    showNewComment,
    newComment,
    submitting,
    replyingTo,
    replyMessages,
    replySubmitting,
    
    // Actions
    setShowNewComment,
    setNewComment,
    setReplyingTo,
    setReplyMessages,
    fetchComments,
    handleAddComment,
    handleReplyToComment,
    handleDeleteComment,
    findCommentById
  };
};