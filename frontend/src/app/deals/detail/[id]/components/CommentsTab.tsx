"use client";

import { Deal, Comment } from '../types';
import { MessageSquare, Plus } from 'lucide-react';

interface CommentsTabProps {
  deal: Deal;
  comments: Comment[];
  commentsLoading: boolean;
  displayValue: (value: any, fallback?: string) => string;
  formatTimeAgo: (dateString: string | null | undefined) => string;
  getFirstChar: (value: any, fallback?: string) => string;
  addComment: (text: string) => Promise<void>;
}

export default function CommentsTab({ 
  deal, 
  comments, 
  commentsLoading, 
  displayValue, 
  formatTimeAgo, 
  getFirstChar, 
  addComment 
}: CommentsTabProps) {
  const handleAddComment = () => {
    const commentText = prompt('Enter your comment:');
    if (commentText) {
      addComment(commentText).catch(() => alert('Failed to add comment'));
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl font-semibold text-gray-900">Comments</h2>
        <button 
          onClick={handleAddComment}
          className="bg-black text-white px-4 py-2 rounded-md text-sm font-medium flex items-center space-x-2 hover:bg-gray-800"
        >
          <Plus className="w-4 h-4" />
          <span>Add Comment</span>
        </button>
      </div>

      {commentsLoading ? (
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading comments...</p>
        </div>
      ) : comments.length > 0 ? (
        <div className="space-y-6">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-semibold text-blue-600">
                    {getFirstChar(comment.author)}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-gray-900">{comment.author}</span>
                    <span className="text-sm text-gray-500">
                      {formatTimeAgo(comment.created_at)}
                    </span>
                  </div>
                  <p className="text-gray-700">{comment.text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-lg flex items-center justify-center">
            <MessageSquare className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">
            Comments for {displayValue(deal.title, 'this deal')}
          </h3>
          <button 
            onClick={handleAddComment}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Add Comment
          </button>
        </div>
      )}
    </div>
  );
}
