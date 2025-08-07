// hooks/useComments.ts - Adapted for both leads and deals
"use client";

import { useState, useCallback } from 'react';
import type { Comment, CurrentUser } from '../types';

interface UseCommentsReturn {
  comments: Comment[];
  commentsLoading: boolean;
  commentsError: string | null;
  showNewComment: boolean;
  newComment: string;
  submitting: boolean;
  replyingTo: number | null;
  replyMessages: { [key: number]: string };
  replySubmitting: { [key: number]: boolean };
  totalComments: number;
  topLevelComments: number;
  setShowNewComment: (show: boolean) => void;
  setNewComment: (comment: string) => void;
  handleStartReply: (commentId: number, parentId?: number) => void;
  handleCancelReply: () => void;
  setReplyMessage: (commentId: number, message: string) => void;
  fetchComments: () => Promise<void>;
  handleAddComment: (currentUser: CurrentUser | null) => Promise<void>;
  handleReplyToComment: (commentId: number, currentUser: CurrentUser | null) => Promise<void>;
  handleDeleteComment: (commentId: number) => Promise<void>;
  handleReplyKeyPress: (e: React.KeyboardEvent, commentId: number, currentUser: CurrentUser | null) => void;
}

export function useComments(
  entityId: string | string[] | undefined,
  entityType: 'lead' | 'deal' = 'lead'
): UseCommentsReturn {
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsError, setCommentsError] = useState<string | null>(null);
  const [showNewComment, setShowNewComment] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyMessages, setReplyMessages] = useState<{ [key: number]: string }>({});
  const [replySubmitting, setReplySubmitting] = useState<{ [key: number]: boolean }>({});

  const actualEntityId = Array.isArray(entityId) ? entityId[0] : entityId;
  const parsedEntityId = actualEntityId ? parseInt(actualEntityId) : undefined;

  const getCommentsEndpoint = () => {
    return entityType === 'deal'
      ? `http://localhost:5000/api/deals/${actualEntityId}/comments`
      : `http://localhost:5000/api/leads/${actualEntityId}/comments`;
  };

  const makeAuthenticatedRequest = async (url: string, options: RequestInit = {}) => {
    return fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers,
      },
      mode: 'cors',
    });
  };

  const fetchComments = useCallback(async () => {
    if (!actualEntityId) return;

    setCommentsLoading(true);
    setCommentsError(null);

    try {
      const response = await makeAuthenticatedRequest(getCommentsEndpoint());

      if (response.ok) {
        const result = await response.json();
        const commentsData = result.data || result;

        if (Array.isArray(commentsData)) {
          const transformedComments = commentsData.map((comment: any) => ({
            id: comment.id,
            message: comment.message,
            user_id: comment.user_id,
            user_name: comment.user?.name || comment.user_name || 'Unknown User',
            created_at: comment.created_at,
            parent_id: comment.parent_id,
            parent_user: comment.parent_user,
            replies: comment.replies || [],
            deal_id: comment.deal_id,
            lead_id: comment.lead_id
          }));

          const nestedComments = buildNestedComments(transformedComments);
          setComments(nestedComments);
        } else {
          setComments([]);
        }
      } else if (response.status === 404) {
        setComments([]);
      } else {
        throw new Error(`Failed to fetch comments: ${response.status}`);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      setCommentsError('Failed to load comments. Please try again.');
      setComments([]);
    } finally {
      setCommentsLoading(false);
    }
  }, [actualEntityId, entityType]);

  const buildNestedComments = (flatComments: any[]): Comment[] => {
    const commentMap = new Map();
    const rootComments: Comment[] = [];

    flatComments.forEach(comment => {
      commentMap.set(comment.id, { ...comment, replies: [] });
    });

    flatComments.forEach(comment => {
      if (comment.parent_id && commentMap.has(comment.parent_id)) {
        const parentComment = commentMap.get(comment.parent_id);
        const childComment = commentMap.get(comment.id);
        parentComment.replies.push(childComment);
      } else {
        rootComments.push(commentMap.get(comment.id));
      }
    });

    return rootComments;
  };

  const handleStartReply = (commentId: number, parentId?: number) => {
    setReplyingTo(commentId);
    if (!replyMessages[commentId]) {
      setReplyMessages(prev => ({ ...prev, [commentId]: '' }));
    }
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
  };

  const setReplyMessage = (commentId: number, message: string) => {
    setReplyMessages(prev => ({ ...prev, [commentId]: message }));
  };

  const handleAddComment = async (currentUser: CurrentUser | null) => {
    if (!newComment.trim() || !actualEntityId || !currentUser) return;

    setSubmitting(true);

    try {
      const response = await makeAuthenticatedRequest(getCommentsEndpoint(), {
        method: 'POST',
        body: JSON.stringify({
          message: newComment.trim(),
          user_id: currentUser.id,
          user_name: currentUser.name,
          parent_id: null
        }),
      });

      if (response.ok) {
        const result = await response.json();
        const newCommentData = result.data || result;

        const comment: Comment = {
          id: newCommentData.id,
          message: newCommentData.message,
          user_id: currentUser.id,
          user_name: currentUser.name,
          created_at: newCommentData.created_at || new Date().toISOString(),
          parent_id: null,
          parent_user: null,
          replies: [],
          deal_id: entityType === 'deal' ? parsedEntityId : undefined,
          lead_id: entityType === 'lead' ? parsedEntityId : undefined
        };

        setComments(prev => [comment, ...prev]);
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
  };

  const handleReplyToComment = async (commentId: number, currentUser: CurrentUser | null) => {
    const message = replyMessages[commentId];
    if (!message?.trim() || !currentUser) return;

    setReplySubmitting(prev => ({ ...prev, [commentId]: true }));

    try {
      const response = await makeAuthenticatedRequest(getCommentsEndpoint(), {
        method: 'POST',
        body: JSON.stringify({
          message: message.trim(),
          user_id: currentUser.id,
          user_name: currentUser.name,
          parent_id: commentId
        }),
      });

      if (response.ok) {
        const result = await response.json();
        const newReplyData = result.data || result;

        const reply: Comment = {
          id: newReplyData.id,
          message: newReplyData.message,
          user_id: currentUser.id,
          user_name: currentUser.name,
          created_at: newReplyData.created_at || new Date().toISOString(),
          parent_id: commentId,
          parent_user: null,
          replies: [],
          deal_id: entityType === 'deal' ? parsedEntityId : undefined,
          lead_id: entityType === 'lead' ? parsedEntityId : undefined
        };

        setComments(prev => addReplyToComment(prev, commentId, reply));
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
  };

  const addReplyToComment = (comments: Comment[], parentId: number, reply: Comment): Comment[] => {
    return comments.map(comment => {
      if (comment.id === parentId) {
        return { ...comment, replies: [reply, ...comment.replies] };
      }
      if (comment.replies.length > 0) {
        return { ...comment, replies: addReplyToComment(comment.replies, parentId, reply) };
      }
      return comment;
    });
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    try {
      const deleteEndpoint = entityType === 'deal'
        ? `http://localhost:5000/api/deals/${actualEntityId}/comments/${commentId}`
        : `http://localhost:5000/api/leads/${actualEntityId}/comments/${commentId}`;

      const response = await makeAuthenticatedRequest(deleteEndpoint, {
        method: 'DELETE',
      });

      if (response.ok) {
        setComments(prev => removeCommentById(prev, commentId));
      } else {
        throw new Error('Failed to delete comment');
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      setCommentsError('Failed to delete comment. Please try again.');
    }
  };

  const removeCommentById = (comments: Comment[], commentId: number): Comment[] => {
    return comments.filter(comment => {
      if (comment.id === commentId) return false;
      if (comment.replies.length > 0) {
        comment.replies = removeCommentById(comment.replies, commentId);
      }
      return true;
    });
  };

  const handleReplyKeyPress = (e: React.KeyboardEvent, commentId: number, currentUser: CurrentUser | null) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleReplyToComment(commentId, currentUser);
    }
  };

  const calculateCommentStats = (comments: Comment[]): { total: number; topLevel: number } => {
    let total = 0;
    let topLevel = comments.length;

    const countReplies = (comments: Comment[]) => {
      comments.forEach(comment => {
        total++;
        if (comment.replies.length > 0) {
          countReplies(comment.replies);
        }
      });
    };

    countReplies(comments);
    return { total, topLevel };
  };

  const stats = calculateCommentStats(comments);

  return {
    comments,
    commentsLoading,
    commentsError,
    showNewComment,
    newComment,
    submitting,
    replyingTo,
    replyMessages,
    replySubmitting,
    totalComments: stats.total,
    topLevelComments: stats.topLevel,
    setShowNewComment,
    setNewComment,
    handleStartReply,
    handleCancelReply,
    setReplyMessage,
    fetchComments,
    handleAddComment,
    handleReplyToComment,
    handleDeleteComment,
    handleReplyKeyPress,
  };
}
