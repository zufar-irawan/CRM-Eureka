// Updated useComments hook untuk nested replies
import { useState, useCallback } from 'react';
import type { Comment, CurrentUser, CommentResponse } from '../types';
import { makeAuthenticatedRequest } from '../utils/auth';
import { API_ENDPOINTS } from '../utils/constants';

export const useComments = (leadId: string | string[] | undefined) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsError, setCommentsError] = useState<string | null>(null);
  const [showNewComment, setShowNewComment] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  // Nested replies state
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyMessages, setReplyMessages] = useState<{[key: number]: string}>({});
  const [replySubmitting, setReplySubmitting] = useState<{[key: number]: boolean}>({});

  // Fetch comments with nested structure
  const fetchComments = useCallback(async () => {
    if (!leadId) return;

    setCommentsLoading(true);
    setCommentsError(null);

    try {
      const response = await makeAuthenticatedRequest(
        `${API_ENDPOINTS.LEADS}/${leadId}/comments`
      );

      if (response.ok) {
        const data: CommentResponse = await response.json();
        setComments(data.comments || []);
      } else {
        throw new Error('Failed to fetch comments');
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      setCommentsError('Failed to load comments. Please try again.');
    } finally {
      setCommentsLoading(false);
    }
  }, [leadId]);

  // Add top-level comment
  const handleAddComment = useCallback(async (currentUser: CurrentUser | null) => {
    if (!newComment.trim() || !leadId || !currentUser) return;

    setSubmitting(true);

    try {
      const response = await makeAuthenticatedRequest(
        `${API_ENDPOINTS.LEADS}/${leadId}/comments`,
        {
          method: 'POST',
          body: JSON.stringify({
            message: newComment.trim(),
            user_id: currentUser.id,
            user_name: currentUser.name
          })
        }
      );

      if (response.ok) {
        const data = await response.json();
        
        // Add new comment to the beginning of the list
        setComments(prev => [
          {
            ...data.comment,
            replies: []
          },
          ...prev
        ]);
        
        setNewComment('');
        setShowNewComment(false);
      } else {
        throw new Error('Failed to add comment');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      setCommentsError('Failed to add comment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }, [newComment, leadId]);

  // Add reply to a comment
  const handleReplyToComment = useCallback(async (commentId: number, currentUser: CurrentUser | null) => {
    const replyMessage = replyMessages[commentId];
    
    if (!replyMessage?.trim() || !leadId || !currentUser) return;

    setReplySubmitting(prev => ({ ...prev, [commentId]: true }));

    try {
      const response = await makeAuthenticatedRequest(
        `${API_ENDPOINTS.LEADS}/${leadId}/comments`,
        {
          method: 'POST',
          body: JSON.stringify({
            message: replyMessage.trim(),
            user_id: currentUser.id,
            user_name: currentUser.name,
            parent_id: commentId
          })
        }
      );

      if (response.ok) {
        const data = await response.json();
        
        // Add reply to the specific comment in the tree
        const addReplyToTree = (comments: Comment[]): Comment[] => {
          return comments.map(comment => {
            if (comment.id === commentId) {
              return {
                ...comment,
                replies: [
                  ...(comment.replies || []),
                  {
                    ...data.comment,
                    replies: []
                  }
                ]
              };
            }
            
            // Recursively search in replies
            if (comment.replies && comment.replies.length > 0) {
              return {
                ...comment,
                replies: addReplyToTree(comment.replies)
              };
            }
            
            return comment;
          });
        };

        setComments(prev => addReplyToTree(prev));
        
        // Clear reply state
        setReplyMessages(prev => ({ ...prev, [commentId]: '' }));
        setReplyingTo(null);
      } else {
        throw new Error('Failed to add reply');
      }
    } catch (error) {
      console.error('Error adding reply:', error);
      setCommentsError('Failed to add reply. Please try again.');
    } finally {
      setReplySubmitting(prev => ({ ...prev, [commentId]: false }));
    }
  }, [replyMessages, leadId]);

  // Delete comment (handles nested deletion)
  const handleDeleteComment = useCallback(async (commentId: number) => {

    try {
      const response = await makeAuthenticatedRequest(
        `${API_ENDPOINTS.LEADS}/comments/${commentId}`,
        {
          method: 'DELETE'
        }
      );

      if (response.ok) {
        // Remove comment from tree (including all nested replies)
        const removeFromTree = (comments: Comment[]): Comment[] => {
          return comments
            .filter(comment => comment.id !== commentId)
            .map(comment => ({
              ...comment,
              replies: comment.replies ? removeFromTree(comment.replies) : []
            }));
        };

        setComments(prev => removeFromTree(prev));
      } else {
        throw new Error('Failed to delete comment');
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      setCommentsError('Failed to delete comment. Please try again.');
    }
  }, []);

  // Start replying to a comment
  const handleStartReply = useCallback((commentId: number, parentId?: number) => {
    setReplyingTo(commentId);
    setReplyMessages(prev => ({
      ...prev,
      [commentId]: prev[commentId] || ''
    }));
  }, []);

  // Cancel reply
  const handleCancelReply = useCallback(() => {
    setReplyingTo(null);
    setReplyMessages({});
  }, []);

  // Set reply message for specific comment
  const setReplyMessage = useCallback((commentId: number, message: string) => {
    setReplyMessages(prev => ({
      ...prev,
      [commentId]: message
    }));
  }, []);

  // Keyboard shortcuts
  const handleReplyKeyPress = useCallback((e: React.KeyboardEvent, commentId: number, currentUser: CurrentUser | null) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleReplyToComment(commentId, currentUser);
    }
    if (e.key === 'Escape') {
      handleCancelReply();
    }
  }, [handleReplyToComment, handleCancelReply]);

  // Get comment thread (for expanded view)
  const getCommentThread = useCallback(async (commentId: number) => {
    if (!leadId) return null;

    try {
      const response = await makeAuthenticatedRequest(
        `${API_ENDPOINTS.LEADS}/${leadId}/comments/${commentId}/thread`
      );

      if (response.ok) {
        const data = await response.json();
        return data.thread;
      }
    } catch (error) {
      console.error('Error fetching comment thread:', error);
    }
    return null;
  }, [leadId]);

  // Count total comments including replies
  const getTotalCommentCount = useCallback((comments: Comment[]): number => {
    return comments.reduce((total, comment) => {
      return total + 1 + (comment.replies ? getTotalCommentCount(comment.replies) : 0);
    }, 0);
  }, []);

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
    
    // Setters
    setShowNewComment,
    setNewComment,
    setReplyingTo,
    setReplyMessages,
    
    // Actions
    fetchComments,
    handleAddComment,
    handleReplyToComment,
    handleDeleteComment,
    handleStartReply,
    handleCancelReply,
    setReplyMessage,
    handleReplyKeyPress,
    getCommentThread,
    
    // Computed
    totalComments: getTotalCommentCount(comments),
    topLevelComments: comments.length
  };
};