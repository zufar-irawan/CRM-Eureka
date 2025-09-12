"use client";

import { Plus, MessageSquare, Users, MessageCircle } from 'lucide-react';
import { useEffect } from 'react';
import type { CurrentUser } from '../../types';
import { useComments } from '../../hooks/useComments';
import CommentForm from './CommentForm';
import CommentItem from './CommentItem';
import Swal from 'sweetalert2';
import useUser from '../../../../../../../hooks/useUser';

interface CommentsTabProps {
  leadId: string | string[] | undefined;
  currentUser: CurrentUser | null;
}

export default function CommentsTab({ leadId, currentUser }: CommentsTabProps) {
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
  } = useComments(leadId);

  const { user } = useUser()

  // Fetch comments on initial load and when leadId changes
  useEffect(() => {
    if (leadId) {
      fetchComments();
    }
    const handle = () => {
      fetchComments()
    }
    window.addEventListener("lead", handle)
    return () => window.removeEventListener("lead", handle)

  }, [leadId, fetchComments]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleAddComment(currentUser);
    }
  };

  // Enhanced comment submission with SweetAlert2
  const handleCommentSubmit = async () => {
    if (!newComment.trim()) {
      await Swal.fire({
        title: 'Empty Comment',
        text: 'Please write something before posting your comment.',
        icon: 'warning',
        confirmButtonColor: '#3b82f6',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'rounded-lg',
          title: 'text-lg font-semibold text-gray-900',
          confirmButton: 'rounded-lg font-medium px-4 py-2'
        }
      });
      return;
    }

    if (!currentUser) {
      await Swal.fire({
        title: 'Authentication Required',
        text: 'You need to be logged in to post a comment.',
        icon: 'error',
        confirmButtonColor: '#dc2626',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'rounded-lg',
          title: 'text-lg font-semibold text-gray-900',
          confirmButton: 'rounded-lg font-medium px-4 py-2'
        }
      });
      return;
    }

    try {
      await handleAddComment(currentUser);

      // Success notification
      Swal.fire({
        title: 'Comment Posted!',
        text: 'Your comment has been added successfully.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
        customClass: {
          popup: 'rounded-lg',
          title: 'text-lg font-semibold text-gray-900'
        }
      });
    } catch (error) {
      // Error notification
      Swal.fire({
        title: 'Failed to Post',
        text: 'There was an error posting your comment. Please try again.',
        icon: 'error',
        confirmButtonColor: '#dc2626',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'rounded-lg',
          title: 'text-lg font-semibold text-gray-900',
          confirmButton: 'rounded-lg font-medium px-4 py-2'
        }
      });
    }
  };

  // Handle cancel new comment with confirmation if there's content
  const handleCancelNewComment = async () => {
    if (newComment.trim()) {
      const result = await Swal.fire({
        title: 'Discard Comment?',
        html: `
          <div class="text-left">
            <p class="text-gray-600 mb-3">You have unsaved changes. Are you sure you want to discard this comment?</p>
            <div class="bg-gray-50 p-3 rounded-lg border-l-4 border-orange-400 max-h-20 overflow-y-auto">
              <p class="text-sm text-gray-700">"${newComment.substring(0, 150)}${newComment.length > 150 ? '...' : ''}"</p>
            </div>
          </div>
        `,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc2626',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Yes, Discard',
        cancelButtonText: 'Keep Writing',
        focusCancel: true,
        customClass: {
          popup: 'rounded-lg',
          title: 'text-lg font-semibold text-gray-900',
          confirmButton: 'rounded-lg font-medium px-4 py-2',
          cancelButton: 'rounded-lg font-medium px-4 py-2'
        }
      });

      if (result.isConfirmed) {
        setShowNewComment(false);
        setNewComment('');
      }
    } else {
      setShowNewComment(false);
      setNewComment('');
    }
  };

  const userValidation = user?.isAdmin || user?.isGl || user?.isSales

  return (
    <div className="p-6">
      {/* Header with Statistics */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center space-x-6">
          <h2 className="text-xl font-semibold text-gray-900">Comments</h2>
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

        <div className="flex items-center space-x-3">
          {/* New Comment Button */}
          <button
            onClick={() => setShowNewComment(true)}
            disabled={showNewComment}
            className="bg-black text-white px-4 py-2 rounded-md text-sm font-medium flex items-center space-x-2 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
          >
            <Plus className="w-4 h-4" />
            <span>New Comment</span>
          </button>
        </div>
      </div>

      {/* Loading State */}
      {commentsLoading && (
        <div className="flex justify-center py-8">
          <div className="flex flex-col items-center space-y-3">
            <div className="w-6 h-6 border-2 border-gray-300 border-t-black rounded-full animate-spin"></div>
            <p className="text-sm text-gray-500">Loading comments...</p>
          </div>
        </div>
      )}

      {/* Error State with Retry */}
      {commentsError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 text-red-500 flex-shrink-0">
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-800 mb-1">Error Loading Comments</h3>
              <p className="text-sm text-red-700 mb-3">{commentsError}</p>
              <button
                onClick={fetchComments}
                className="text-sm text-red-700 bg-red-100 hover:bg-red-200 px-3 py-1 rounded-md transition-colors duration-150 font-medium"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Comment Form */}
      {showNewComment && (
        <div className="mb-6">
          <CommentForm
            value={newComment}
            onChange={setNewComment}
            onSubmit={handleCommentSubmit}
            onCancel={handleCancelNewComment}
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
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Start a conversation about this lead. Comments help track important discussions and decisions.
          </p>
          <button
            onClick={() => setShowNewComment(true)}
            className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm font-medium hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors duration-150"
          >
            <Plus className="w-4 h-4" />
            <span>Add the first comment</span>
          </button>
        </div>
      ) : (
        /* Comments List with Nested Structure */
        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentItem
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

      {/* Quick Action Buttons */}
      {/* {!showNewComment && comments.length > 0 && !replyingTo && (
        <div className="flex items-center justify-center space-x-4 mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={() => setShowNewComment(true)}
            className="flex items-center space-x-2 px-6 py-3 text-sm text-gray-700 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-150"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Add Comment</span>
          </button>

          {comments.length > 0 && (
            <button
              onClick={() => handleStartReply(comments[0].id)}
              className="flex items-center space-x-2 px-6 py-3 text-sm text-blue-700 hover:text-blue-800 border border-blue-300 rounded-md hover:bg-blue-50 transition-colors duration-150"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Quick Reply</span>
            </button>
          )}
        </div>
      )} */}

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