"use client";

import { Plus, MessageSquare } from 'lucide-react';
import type { CurrentUser } from '../../types';
import { useComments } from '../../hooks/useComments';
import CommentForm from './CommentForm';
import CommentItem from './CommentItem';

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
    setShowNewComment,
    setNewComment,
    setReplyingTo,
    setReplyMessages,
    fetchComments,
    handleAddComment,
    handleReplyToComment,
    handleDeleteComment,
    findCommentById
  } = useComments(leadId);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleAddComment(currentUser);
    }
  };

  const handleReplyKeyPress = (e: React.KeyboardEvent, commentId: number) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleReplyToComment(commentId, currentUser);
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl font-semibold text-gray-900">Comments</h2>
        <button
          onClick={() => setShowNewComment(true)}
          className="bg-black text-white px-4 py-2 rounded-md text-sm font-medium flex items-center space-x-2 hover:bg-gray-800"
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
            className="text-red-700 text-sm underline mt-2"
          >
            Try again
          </button>
        </div>
      )}

      {/* New Comment Form */}
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
          placeholder="Add a comment..."
        />
      )}

      {/* Comments List */}
      {!commentsLoading && comments.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-lg flex items-center justify-center">
            <MessageSquare className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">No Comments</h3>
          <button
            onClick={() => setShowNewComment(true)}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            New Comment
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              currentUser={currentUser}
              replyingTo={replyingTo}
              replyMessage={replyMessages[comment.id] || ''}
              replySubmitting={replySubmitting[comment.id] || false}
              onReply={setReplyingTo}
              onReplyMessageChange={(message) => 
                setReplyMessages(prev => ({ ...prev, [comment.id]: message }))
              }
              onReplySubmit={() => handleReplyToComment(comment.id, currentUser)}
              onReplyCancel={() => {
                setReplyingTo(null);
                setReplyMessages(prev => ({ ...prev, [comment.id]: '' }));
              }}
              onReplyKeyPress={(e) => handleReplyKeyPress(e, comment.id)}
              onDelete={handleDeleteComment}
              depth={0}
            />
          ))}
        </div>
      )}

      {/* Bottom Action Buttons */}
      {!showNewComment && comments.length > 0 && !replyingTo && (
        <div className="flex items-center space-x-4 mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={() => {
              if (comments.length > 0) {
                setReplyingTo(comments[0].id);
              }
            }}
            className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Reply</span>
          </button>
          <button
            onClick={() => setShowNewComment(true)}
            className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Comment</span>
          </button>
        </div>
      )}
    </div>
  );
}