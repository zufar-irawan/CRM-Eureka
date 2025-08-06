"use client";

import React from 'react';
import { Reply, MoreHorizontal, Trash2 } from 'lucide-react';
import type { Comment, CurrentUser } from '../../types';
import { formatDate, getFirstChar } from '../../utils/formatting';
import { MAX_REPLY_DEPTH } from '../../utils/constants';
import ReplyForm from './ReplyForm';

interface CommentItemProps {
  comment: Comment;
  currentUser: CurrentUser | null;
  replyingTo: number | null;
  replyMessage: string;
  replySubmitting: boolean;
  onReply: (commentId: number) => void;
  onReplyMessageChange: (message: string) => void;
  onReplySubmit: () => void;
  onReplyCancel: () => void;
  onReplyKeyPress: (e: React.KeyboardEvent) => void;
  onDelete: (commentId: number) => void;
  depth?: number;
}

export default function CommentItem({
  comment,
  currentUser,
  replyingTo,
  replyMessage,
  replySubmitting,
  onReply,
  onReplyMessageChange,
  onReplySubmit,
  onReplyCancel,
  onReplyKeyPress,
  onDelete,
  depth = 0,
}: CommentItemProps) {
  const maxDepth = MAX_REPLY_DEPTH;
  const indentClass = depth > 0 ? `ml-${Math.min(depth * 8, 32)}` : "";

  return (
    <div className={`space-y-4 ${indentClass}`}>
      {/* Comment */}
      <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-blue-700">
                {comment.user_name?.charAt(0).toUpperCase() || "U"}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {comment.user_name || "Unknown User"}
              </p>
              <p className="text-xs text-gray-500">
                {formatDate(comment.created_at)}
                {comment.user_id === currentUser?.id && (
                  <span className="ml-2 text-blue-600">(You)</span>
                )}
                {depth > 0 && (
                  <span className="ml-2 text-purple-600">• Reply</span>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {depth < maxDepth && (
              <button
                onClick={() => onReply(comment.id)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <Reply className="w-4 h-4" />
              </button>
            )}
            <div className="relative group">
              <button className="p-1 text-gray-400 hover:text-gray-600">
                <MoreHorizontal className="w-4 h-4" />
              </button>
              <div className="absolute right-0 top-full mt-1 w-32 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                {(comment.user_id === currentUser?.id ||
                  currentUser?.role === "admin") && (
                  <button
                    onClick={() => onDelete(comment.id)}
                    className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
          {comment.message}
        </div>
      </div>

      {/* Reply Form */}
      {replyingTo === comment.id && (
        <ReplyForm
          value={replyMessage}
          onChange={onReplyMessageChange}
          onSubmit={onReplySubmit}
          onCancel={onReplyCancel}
          onKeyPress={onReplyKeyPress}
          currentUser={currentUser}
          submitting={replySubmitting}
          originalComment={comment}
          depth={depth}
        />
      )}

      {/* Render nested replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="space-y-4">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              currentUser={currentUser}
              replyingTo={replyingTo}
              replyMessage={replyMessage}
              replySubmitting={replySubmitting}
              onReply={onReply}
              onReplyMessageChange={onReplyMessageChange}
              onReplySubmit={onReplySubmit}
              onReplyCancel={onReplyCancel}
              onReplyKeyPress={onReplyKeyPress}
              onDelete={onDelete}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}