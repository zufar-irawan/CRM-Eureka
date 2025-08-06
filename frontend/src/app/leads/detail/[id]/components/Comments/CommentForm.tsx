"use client";

import { Send, Smile, Paperclip } from 'lucide-react';
import type { CurrentUser } from '../../types';
import { getFirstChar } from '../../utils/formatting';

interface CommentFormProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  currentUser: CurrentUser | null;
  submitting: boolean;
  placeholder: string;
}

export default function CommentForm({
  value,
  onChange,
  onSubmit,
  onCancel,
  onKeyPress,
  currentUser,
  submitting,
  placeholder
}: CommentFormProps) {
  return (
    <div className="border border-gray-200 rounded-lg mb-6">
      <div className="p-4">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-blue-700">
              {currentUser ? getFirstChar(currentUser.name) : 'U'}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">
              {currentUser?.name || 'Current User'}
            </p>
            <p className="text-xs text-gray-500">
              Commenting as {currentUser?.role || 'user'}
            </p>
          </div>
        </div>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyPress}
          placeholder={placeholder}
          className="w-full h-24 p-3 border border-gray-200 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          autoFocus
        />
      </div>
      <div className="flex justify-between items-center px-4 py-3 bg-gray-50 border-t border-gray-200 rounded-b-lg">
        <div className="flex items-center space-x-2">
          <button className="p-1 text-gray-400 hover:text-gray-600">
            <Smile className="w-5 h-5" />
          </button>
          <button className="p-1 text-gray-400 hover:text-gray-600">
            <Paperclip className="w-5 h-5" />
          </button>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
          >
            Discard
          </button>
          <button
            onClick={onSubmit}
            disabled={!value.trim() || submitting}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Adding...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Comment</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}