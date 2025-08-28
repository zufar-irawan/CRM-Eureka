"use client";

import { MessageSquare, Plus } from 'lucide-react';
import { useState } from 'react';
import type { CurrentUser } from '../types';
import { useTaskComments } from '../hooks/useTaskComments';
import TaskCommentItem from './TaskCommentsItem';
import AddTaskComment from './AddTaskComments';
import Swal from 'sweetalert2';

interface TaskCommentsTabProps {
  taskId: string | string[] | undefined;
  currentUser: CurrentUser | null;
  refreshComments: () => void;
}

export default function TaskCommentsTab({ taskId, currentUser, refreshComments }: TaskCommentsTabProps) {
  const [showAddComment, setShowAddComment] = useState(false);

  const {
    comments,
    commentsLoading,
    commentsError,
    fetchComments,
    addComment,
    updateComment,
    deleteComment,
  } = useTaskComments(taskId, currentUser);

  const handleCommentAdded = () => {
    fetchComments();
    setShowAddComment(false);
  };

  const handleCommentUpdated = () => {
    fetchComments();
  };

  const handleCommentDeleted = () => {
    fetchComments();
  };

  // Ensure comments is always an array
  const commentsArray = Array.isArray(comments) ? comments : [];

  if (commentsLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex flex-col items-center space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-sm text-gray-500">Loading comments...</p>
        </div>
      </div>
    );
  }

  if (commentsError) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <div className="text-red-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L5.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-medium text-red-800">Error Loading Comments</h3>
              <p className="text-sm text-red-700 mt-1">{commentsError}</p>
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={() => fetchComments()}
              className="text-sm bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
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
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          {/* <MessageSquare className="h-5 w-5 text-gray-500" /> */}
          <h2 className="text-xl font-semibold text-gray-900">Comments</h2>
          <span className="text-sm text-gray-500">({commentsArray.length})</span>
        </div>
        <button
          onClick={() => setShowAddComment(true)}
         className="inline-flex items-center px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          <span>Add Comment</span>
        </button>
      </div>

      {showAddComment && (
        <div className="mb-6">
          <AddTaskComment
            taskId={taskId}
            currentUser={currentUser}
            onCommentAdded={handleCommentAdded}
            onCancel={() => setShowAddComment(false)}
          />
        </div>
      )}

      <div className="space-y-4">
        {commentsArray.length === 0 && !showAddComment ? (
          <div className="text-center py-12">
            <MessageSquare className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No comments</h3>
            <p className="mt-1 text-sm text-gray-500">Get the conversation started!</p>
          </div>
        ) : (
          commentsArray.map((comment) => (
            <TaskCommentItem
              key={comment.id}
              comment={comment}
              currentUser={currentUser}
              onUpdate={handleCommentUpdated}
              onDelete={handleCommentDeleted}
            />
          ))
        )}
      </div>
    </div>
  );
}