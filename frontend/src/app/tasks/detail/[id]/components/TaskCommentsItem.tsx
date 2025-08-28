"use client";

import { MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { TaskComment, CurrentUser } from '../types';
import { formatDate, getFirstChar } from '../utils/formatting';
import { makeAuthenticatedRequest, TASK_API_ENDPOINTS } from '../utils/constants';
import Swal from 'sweetalert2';

interface TaskCommentItemProps {
  comment: TaskComment;
  currentUser: CurrentUser | null;
  onUpdate: () => void;
  onDelete: () => void;
}

export default function TaskCommentItem({
  comment,
  currentUser,
  onUpdate,
  onDelete
}: TaskCommentItemProps) {
  const [showActions, setShowActions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.comment_text);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const canEdit = currentUser?.id === comment.commented_by || currentUser?.role === 'admin';
  const canDelete = currentUser?.id === comment.commented_by || currentUser?.role === 'admin';

  const handleEdit = () => {
    setIsEditing(true);
    setShowActions(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditText(comment.comment_text);
  };

  const handleSaveEdit = async () => {
    if (!editText.trim()) return;
    
    setIsUpdating(true);
    try {
      const response = await makeAuthenticatedRequest(
        TASK_API_ENDPOINTS.COMMENT_UPDATE(String(comment.id)),
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            comment_text: editText.trim()
          }),
          credentials: 'include',
        }
      );

      if (response.ok) {
        setIsEditing(false);
        onUpdate();
      } else {
        throw new Error('Failed to update comment');
      }
    } catch (error) {
      console.error('Error updating comment:', error);
      alert('Failed to update comment. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await makeAuthenticatedRequest(
        TASK_API_ENDPOINTS.COMMENT_UPDATE(String(comment.id)),
        {
          method: 'DELETE',
          credentials: 'include',
        }
      );

      if (response.ok) {
        onDelete();
      } else {
        throw new Error('Failed to delete comment');
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Failed to delete comment. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-start space-x-3">
        {/* Avatar */}
        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-xs font-medium text-blue-700">
            {getFirstChar(comment.commentedByUser?.name || 'U')}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span className="font-medium text-gray-900 text-sm">
                {comment.commentedByUser?.name || 'Unknown User'}
              </span>
              <span className="text-xs text-gray-500">
                {formatDate(comment.commented_at)}
              </span>
            </div>

            {/* Actions Menu */}
            {(canEdit || canDelete) && (
              <div className="relative">
                <button
                  onClick={() => setShowActions(!showActions)}
                  className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                  disabled={isDeleting}
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>

                {showActions && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowActions(false)} />
                    <div className="absolute right-0 top-full mt-1 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                      <div className="py-1">
                        {canEdit && (
                          <button
                            onClick={handleEdit}
                            className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                          >
                            <Edit className="w-3 h-3" />
                            <span>Edit</span>
                          </button>
                        )}

                        {canDelete && (
                          <button
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2 disabled:opacity-50"
                          >
                            {isDeleting ? (
                              <>
                                <div className="w-3 h-3 border border-red-600 border-t-transparent rounded-full animate-spin" />
                                <span>Deleting...</span>
                              </>
                            ) : (
                              <>
                                <Trash2 className="w-3 h-3" />
                                <span>Delete</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Content */}
          {isEditing ? (
            <div className="space-y-3">
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                rows={3}
                placeholder="Write your comment..."
              />
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleSaveEdit}
                  disabled={!editText.trim() || isUpdating}
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpdating ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={handleCancelEdit}
                  disabled={isUpdating}
                  className="px-3 py-1 text-gray-600 text-sm hover:text-gray-800 disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-700 whitespace-pre-wrap">
              {comment.comment_text}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}