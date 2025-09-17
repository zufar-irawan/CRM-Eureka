// DealCommentTab.tsx - Updated to match CommentTab.tsx design exactly
"use client";

import { Plus, MessageSquare, Users, MessageCircle } from 'lucide-react';
import { useEffect } from 'react';
import type { CurrentUser } from '../../types';
import { useDealsComments } from '../../hooks/useComments';
import DealCommentForm from './DealCommentForm';
import DealCommentItem from './DealCommentItem';

interface DealCommentsTabProps {
  dealId: string | string[] | undefined;
  currentUser: CurrentUser | null;
}

export default function DealCommentsTab({ dealId, currentUser }: DealCommentsTabProps) {
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
    handleStartReply,
    handleCancelReply,
    setReplyMessage,
    fetchComments,
    handleAddComment,
    handleReplyToComment,
    handleDeleteComment,
    handleReplyKeyPress,
  } = useDealsComments(dealId);

  // Fetch comments on initial load and when dealId changes
  useEffect(() => {
    if (dealId) {
      fetchComments();
    }
  }, [dealId, fetchComments]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleAddComment(currentUser);
    }
  };

  return (
    <div className="p-6">
      {/* Header with Statistics */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center space-x-6">
          <h2 className="text-xl font-semibold text-gray-900">Activity</h2>
          {totalComments > 0 && (
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <MessageSquare className="w-4 h-4" />
                <span>{topLevelComments} comments</span>
              </div>
              {totalComments !== topLevelComments && (
                <div className="flex items-center space-x-1">
                  <MessageCircle className="w-4 h-4" />
                  <span>{totalComments - topLevelComments} replies</span>
                </div>
              )}
              <div className="flex items-center space-x-1">
                <Users className="w-4 h-4" />
                <span>{totalComments} total</span>
              </div>
            </div>
          )}
        </div>
        <button
          onClick={() => setShowNewComment(true)}
          disabled={showNewComment}
          className="bg-black text-white px-4 py-2 rounded-md text-sm font-medium flex items-center space-x-2 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
          <span>New Comment</span>
        </button>
      </div>

      {/* Loading State */}
      {commentsLoading && (
        <div className="flex justify-center py-8">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-black rounded-full animate-spin"></div>
        </div>
      )}

      {/* Error State */}
      {commentsError && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <p className="text-red-700 text-sm">{commentsError}</p>
          <button
            onClick={fetchComments}
            className="text-red-700 text-sm underline mt-2 hover:text-red-800"
          >
            Try again
          </button>
        </div>
      )}

      {/* New Comment Form */}
      {showNewComment && (
        <div className="mb-6">
          <DealCommentForm
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
            placeholder="Add a comment..."
          />
        </div>
      )}

      {/* Empty State */}
      {!commentsLoading && comments.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-lg flex items-center justify-center">
            <MessageSquare className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">No Comments Yet</h3>
          <p className="text-gray-600 mb-6">Start a conversation about this deal</p>
          <button
            onClick={() => setShowNewComment(true)}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Add the first comment
          </button>
        </div>
      ) : (
        /* Comments List with Nested Structure */
        <div className="space-y-4">
          {comments.map((comment) => (
            <DealCommentItem
              key={comment.id}
              comment={comment}
              currentUser={currentUser}
              replyingTo={replyingTo}
              replyMessage={replyMessages[comment.id] || ''}
              replySubmitting={replySubmitting[comment.id] || false}
              onReply={handleStartReply}
              onReplyMessageChange={(message) => setReplyMessage(comment.id, message)}
              onReplySubmit={() => handleReplyToComment(comment.id, currentUser)}
              onReplyCancel={handleCancelReply}
              onReplyKeyPress={(e) => handleReplyKeyPress(e, comment.id, currentUser)}
              onDelete={handleDeleteComment}
              depth={0}
              maxDepth={3}
            />
          ))}
        </div>
      )}

      {/* Footer Stats */}
      {totalComments > 0 && (
        <div className="mt-8 pt-4 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-500">
            Showing {topLevelComments} comments with {totalComments - topLevelComments} replies
          </p>
        </div>
      )}
    </div>
  );
}