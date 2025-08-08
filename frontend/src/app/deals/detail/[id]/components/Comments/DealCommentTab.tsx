"use client";

import React, { useEffect } from 'react';
import { MessageSquare, Plus, RefreshCw, AlertCircle, MessageCircle, Reply } from 'lucide-react';
import type { Comment, CurrentUser } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { useDealsComments } from '../../hooks/useComments';
import { getFirstChar, displayValue, formatTimeAgo } from '../../utils/formatting';
import CommentForm from './DealCommentForm';
import ReplyForm from './DealReplyForm';

interface DealCommentTabProps {
  dealId: string | string[];
  currentUser?: CurrentUser | null;
}

export default function DealCommentTab({ dealId, currentUser: propCurrentUser }: DealCommentTabProps) {
  const { currentUser: authUser } = useAuth();
  const currentUser = propCurrentUser || authUser;
  
  const {
    comments,
    commentsLoading,
    commentsError,
    showNewComment,
    newComment,
    submitting,
    replyingTo,
    replyMessages,
    replySubmitting,
    totalComments,
    topLevelComments,
    setShowNewComment,
    setNewComment,
    fetchComments,
    handleAddComment,
    handleReplyToComment,
    handleDeleteComment,
    handleStartReply,
    handleCancelReply,
    setReplyMessage,
    handleReplyKeyPress
  } = useDealsComments(dealId);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleAddComment(currentUser);
    }
  };

  const renderComment = (comment: Comment, depth: number = 0): React.ReactElement => {
    const isReplying = replyingTo === comment.id;
    const hasReplies = comment.replies && comment.replies.length > 0;
    const isSubmittingReply = replySubmitting[comment.id] || false;
    const replyMessage = replyMessages[comment.id] || '';

    return (
      <div
        key={comment.id}
        className={`${
          depth > 0 
            ? `ml-8 border-l-2 border-gray-100 pl-4 ${depth > 2 ? 'bg-gray-50' : ''}` 
            : ''
        } mb-4`}
      >
        <div className="bg-white border border-gray-100 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
          {/* Comment header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center border border-blue-200">
                <span className="text-sm font-bold text-blue-700">
                  {getFirstChar(comment.user_name || 'Unknown')}
                </span>
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-semibold text-gray-900">
                    {displayValue(comment.user_name, 'Anonymous')}
                  </p>
                  {depth > 0 && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      <Reply className="w-3 h-3 mr-1" />
                      Reply
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  {formatTimeAgo(comment.created_at)}
                  {depth > 0 && comment.parent_user && (
                    <span className="ml-2">
                      • replying to <span className="font-medium">{comment.parent_user}</span>
                    </span>
                  )}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {hasReplies && (
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  {comment.replies!.length} {comment.replies!.length === 1 ? 'reply' : 'replies'}
                </span>
              )}
              <button
                onClick={() => handleDeleteComment(comment.id)}
                className="text-xs text-red-600 hover:text-red-800 font-medium"
              >
                Delete
              </button>
            </div>
          </div>

          {/* Comment content */}
          <div className="mb-4">
            <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
              {comment.message}
            </p>
          </div>

          {/* Comment actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => handleStartReply(comment.id)}
                className="flex items-center space-x-1 text-sm text-gray-600 hover:text-blue-600 transition-colors"
                disabled={depth >= 3} // Limit reply depth
              >
                <Reply className="w-4 h-4" />
                <span>Reply</span>
              </button>
              
              {hasReplies && (
                <div className="flex items-center space-x-1 text-sm text-gray-500">
                  <MessageCircle className="w-4 h-4" />
                  <span>{comment.replies!.length} replies</span>
                </div>
              )}
            </div>
            
            {depth > 0 && (
              <div className="text-xs text-gray-400">
                Level {depth + 1} reply
              </div>
            )}
          </div>
        </div>

        {/* Reply form */}
        {isReplying && (
          <div className="mt-4">
            <ReplyForm
              value={replyMessage}
              onChange={(value) => setReplyMessage(comment.id, value)}
              onSubmit={() => handleReplyToComment(comment.id, currentUser)}
              onCancel={handleCancelReply}
              onKeyPress={(e) => handleReplyKeyPress(e, comment.id, currentUser)}
              currentUser={currentUser}
              submitting={isSubmittingReply}
              originalComment={comment}
              depth={depth}
            />
          </div>
        )}

        {/* Nested replies */}
        {hasReplies && (
          <div className="mt-4">
            {comment.replies!.map(reply => renderComment(reply, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  if (commentsLoading && comments.length === 0) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Loading comments...</p>
          </div>
        </div>
      </div>
    );
  }

  if (commentsError) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center max-w-md">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Comments</h3>
            <p className="text-gray-600 mb-4">{commentsError}</p>
            <button
              onClick={fetchComments}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <MessageSquare className="w-6 h-6 text-blue-600" />
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Comments</h2>
            <p className="text-sm text-gray-500">
              {totalComments} total comment{totalComments !== 1 ? 's' : ''} 
              {topLevelComments !== totalComments && ` (${topLevelComments} top-level)`}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchComments}
            disabled={commentsLoading}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Refresh comments"
          >
            <RefreshCw className={`w-5 h-5 ${commentsLoading ? 'animate-spin' : ''}`} />
          </button>
          
          {!showNewComment && (
            <button
              onClick={() => setShowNewComment(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Comment</span>
            </button>
          )}
        </div>
      </div>

      {/* Add comment form */}
      {showNewComment && (
        <CommentForm
          value={newComment}
          onChange={setNewComment}
          onSubmit={() => handleAddComment(currentUser)}
          onCancel={() => {
            setShowNewComment(false);
            setNewComment('');
          }}
          onKeyPress={handleKeyPress}
          currentUser={currentUser}
          submitting={submitting}
          placeholder="Share your thoughts about this deal..."
        />
      )}

      {/* Comments list */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Comments Yet</h3>
            <p className="text-gray-600 mb-4">
              Start the conversation by adding the first comment.
            </p>
            {!showNewComment && (
              <button
                onClick={() => setShowNewComment(true)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add First Comment
              </button>
            )}
          </div>
        ) : (
          comments.map(comment => renderComment(comment, 0))
        )}
      </div>

      {/* Loading indicator for refresh */}
      {commentsLoading && comments.length > 0 && (
        <div className="flex justify-center mt-6">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Updating comments...</span>
          </div>
        </div>
      )}
    </div>
  );
}