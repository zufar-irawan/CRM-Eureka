"use client";

import { MessageSquare, Plus } from 'lucide-react';
import { useState } from 'react';
import type { CurrentUser } from '../types';
import { useTaskComments } from '../hooks/useTaskComments';
import TaskCommentItem from './TaskCommentsItem';
import AddTaskComment from './AddTaskComments';

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
    return <div className="p-6">Loading comments...</div>;
  }

  if (commentsError) {
    return <div className="p-6 text-red-500">Error loading comments: {commentsError}</div>;
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
          className="flex items-center space-x-1 text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          <Plus className="h-4 w-4" />
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
          <div className="text-center py-8 text-gray-500">
            No comments yet. Add the first one!
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