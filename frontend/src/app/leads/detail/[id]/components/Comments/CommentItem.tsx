// Updated CommentItem.tsx dengan support nested replies
"use client";

import { Reply, MoreHorizontal, Trash2, ChevronDown, ChevronUp, MessageCircle } from 'lucide-react';
import { useState } from 'react';
import type { Comment, CurrentUser } from '../../types';
import { formatDate, getFirstChar } from '../../utils/formatting';
import ReplyForm from './ReplyForm';

interface CommentItemProps {
  comment: Comment;
  currentUser: CurrentUser | null;
  replyingTo: number | null;
  replyMessage: string;
  replySubmitting: boolean;
  onReply: (commentId: number, parentId?: number) => void;
  onReplyMessageChange: (message: string) => void;
  onReplySubmit: (parentId?: number) => void;
  onReplyCancel: () => void;
  onReplyKeyPress: (e: React.KeyboardEvent) => void;
  onDelete: (commentId: number) => void;
  depth?: number;
  maxDepth?: number;
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
  maxDepth = 3
}: CommentItemProps) {
  const [showReplies, setShowReplies] = useState(true);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const hasReplies = comment.replies && comment.replies.length > 0;
  const canReply = depth < maxDepth;
  const isTopLevel = depth === 0;

  const getIndentStyles = (depth: number) => {
    const baseIndent = 16;
    const indentStep = 24;
    const marginLeft = depth * indentStep + (depth > 0 ? baseIndent : 0);
    
    return {
      marginLeft: `${marginLeft}px`,
      position: 'relative' as const
    };
  };

  const getConnectorLine = (depth: number) => {
    if (depth === 0) return null;
    
    return (
      <div 
        className="absolute left-0 top-0 bottom-0 w-px bg-gray-200"
        style={{ left: `-${12}px` }}
      />
    );
  };

  const toggleReplies = () => {
    setShowReplies(!showReplies);
  };

  const handleReplyClick = () => {
    onReply(comment.id, comment.parent_id || comment.id);
  };

  const handleReplySubmit = () => {
    onReplySubmit(comment.id);
  };

  return (
    <div className="relative">
      {/* Connector line for nested comments */}
      {getConnectorLine(depth)}
      
      {/* Main Comment */}
      <div 
        className={`mb-3 ${depth > 0 ? 'border-l-2 border-gray-100 pl-4' : ''}`}
        style={getIndentStyles(depth)}
      >
        {/* Comment Card */}
        <div className={`border border-gray-200 rounded-lg p-4 bg-white hover:bg-gray-50 transition-colors duration-150 ${depth > 0 ? 'shadow-sm' : 'shadow-md'}`}>
          <div className="flex justify-between items-start mb-3">
            {/* User Info */}
            <div className="flex items-center space-x-3">
              <div className={`${depth === 0 ? 'w-10 h-10' : 'w-8 h-8'} bg-blue-100 rounded-full flex items-center justify-center`}>
                <span className={`${depth === 0 ? 'text-sm' : 'text-xs'} font-medium text-blue-700`}>
                  {getFirstChar(comment.user_name || "U")}
                </span>
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <p className={`${depth === 0 ? 'text-sm' : 'text-xs'} font-medium text-gray-900`}>
                    {comment.user_name || "Unknown User"}
                  </p>
                  {comment.parent_id && comment.parent_user && (
                    <span className="text-xs text-gray-500">
                      replying to <span className="font-medium">{comment.parent_user}</span>
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <p className="text-xs text-gray-500">
                    {formatDate(comment.created_at)}
                  </p>
                  {comment.user_id === currentUser?.id && (
                    <span className="text-xs text-blue-600 font-medium">(You)</span>
                  )}
                  {depth > 0 && (
                    <span className="text-xs text-gray-400">
                      • Level {depth + 1}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center space-x-1">
              {canReply && (
                <button
                  onClick={handleReplyClick}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-150"
                  title="Reply to this comment"
                >
                  <Reply className="w-4 h-4" />
                </button>
              )}
              <div className="relative group">
                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors duration-150">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
                <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                  {(comment.user_id === currentUser?.id || currentUser?.role === "admin") && (
                    <button
                      onClick={() => onDelete(comment.id)}
                      className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Comment Message */}
          <div className={`${depth === 0 ? 'text-sm' : 'text-xs'} text-gray-700 leading-relaxed whitespace-pre-wrap mb-3`}>
            {comment.message}
          </div>

          {/* Replies Toggle */}
          {hasReplies && (
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <button
                onClick={toggleReplies}
                className="flex items-center space-x-2 text-xs text-gray-600 hover:text-gray-800 transition-colors"
              >
                <MessageCircle className="w-3 h-3" />
                <span>{comment.replies?.length} {comment.replies?.length === 1 ? 'reply' : 'replies'}</span>
                {showReplies ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            </div>
          )}
        </div>

        {/* Reply Form - Show right after the comment */}
        {replyingTo === comment.id && (
          <div className="mt-3">
            <ReplyForm
              value={replyMessage}
              onChange={onReplyMessageChange}
              onSubmit={handleReplySubmit}
              onCancel={onReplyCancel}
              onKeyPress={onReplyKeyPress}
              currentUser={currentUser}
              submitting={replySubmitting}
              originalComment={comment}
              depth={depth}
            />
          </div>
        )}

        {/* Nested Replies */}
        {hasReplies && showReplies && (
          <div className="mt-4 space-y-2">
            {comment.replies?.map((reply) => (
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
                maxDepth={maxDepth}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}