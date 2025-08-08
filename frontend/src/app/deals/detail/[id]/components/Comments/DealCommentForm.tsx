"use client";

import { useState, useRef, useEffect } from 'react';
import { Send, Smile, Paperclip, AtSign, Users } from 'lucide-react';
import type { CurrentUser, User } from '../../types';
import { getFirstChar } from '../../utils/formatting';
import DealUserSelector from './DealUserSelector';

interface DealCommentFormProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  currentUser: CurrentUser | null;
  submitting: boolean;
  placeholder: string;
}

export default function DealCommentForm({
  value,
  onChange,
  onSubmit,
  onCancel,
  onKeyPress,
  currentUser,
  submitting,
  placeholder
}: DealCommentFormProps) {
  const [showMentionDropdown, setShowMentionDropdown] = useState(false);
  const [mentionSearch, setMentionSearch] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  const [mentionedUsers, setMentionedUsers] = useState<User[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);

  // Handle @ mention detection
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const cursorPos = e.target.selectionStart;
    
    onChange(newValue);
    setCursorPosition(cursorPos);

    // Check if user typed @ for mentions
    const beforeCursor = newValue.substring(0, cursorPos);
    const mentionMatch = beforeCursor.match(/@(\w*)$/);
    
    if (mentionMatch) {
      setMentionSearch(mentionMatch[1]);
      setShowMentionDropdown(true);
    } else {
      setShowMentionDropdown(false);
      setMentionSearch('');
    }
  };

  // Handle user mention selection
  const handleUserMention = (user: User) => {
    if (!textareaRef.current) return;

    const beforeCursor = value.substring(0, cursorPosition);
    const afterCursor = value.substring(cursorPosition);
    
    // Find the @ symbol position
    const mentionMatch = beforeCursor.match(/@(\w*)$/);
    if (!mentionMatch) return;

    const mentionStart = beforeCursor.lastIndexOf('@');
    const beforeMention = beforeCursor.substring(0, mentionStart);
    const mentionText = `@${user.name} `;
    
    const newValue = beforeMention + mentionText + afterCursor;
    const newCursorPos = beforeMention.length + mentionText.length;
    
    onChange(newValue);
    setShowMentionDropdown(false);
    setMentionSearch('');
    
    if (!mentionedUsers.find(u => u.id === user.id)) {
      setMentionedUsers(prev => [...prev, user]);
    }

    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showMentionDropdown) {
      if (e.key === 'Escape') {
        setShowMentionDropdown(false);
        setMentionSearch('');
        return;
      }
    }
    onKeyPress(e);
  };

  const getRoleColor = (role?: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-700';
      case 'sales': return 'bg-blue-100 text-blue-700';
      case 'partnership': return 'bg-green-100 text-green-700';
      case 'akunting': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg mb-6 bg-white shadow-sm">
      {/* Header with user info */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center border border-blue-200">
              <span className="text-sm font-bold text-blue-700">
                {currentUser ? getFirstChar(currentUser.name) : 'U'}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {currentUser?.name || 'Current User'}
              </p>
              <div className="flex items-center space-x-2">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getRoleColor(currentUser?.role)}`}>
                  {currentUser?.role || 'user'}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date().toLocaleString('id-ID', { 
                    dateStyle: 'short', 
                    timeStyle: 'short' 
                  })}
                </span>
              </div>
            </div>
          </div>
          
          {/* Mentioned users indicator */}
          {mentionedUsers.length > 0 && (
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-gray-400" />
              <span className="text-xs text-gray-500">
                {mentionedUsers.length} user{mentionedUsers.length !== 1 ? 's' : ''} mentioned
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Comment input area */}
      <div className="p-4">
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
            placeholder={`${placeholder} Use @username to mention users`}
            className="w-full min-h-[100px] max-h-[300px] p-4 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm leading-relaxed"
            style={{ height: 'auto' }}
            autoFocus
          />
          
          {/* Character count */}
          <div className="absolute bottom-2 right-2 text-xs text-gray-400">
            {value.length} characters
          </div>

          {/* Mention dropdown */}
          {showMentionDropdown && (
            <div className="absolute bottom-full left-0 right-0 mb-2">
              <DealUserSelector
                show={showMentionDropdown}
                onClose={() => setShowMentionDropdown(false)}
                onUserSelect={handleUserMention}
                searchTerm={mentionSearch}
                placeholder="Search users to mention..."
                maxHeight="max-h-48"
              />
            </div>
          )}
        </div>

        {/* Mentioned users display */}
        {mentionedUsers.length > 0 && (
          <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
            <div className="flex items-center space-x-2 mb-2">
              <AtSign className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Mentioned Users:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {mentionedUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center space-x-2 bg-white border border-blue-200 text-blue-900 px-3 py-1 rounded-full text-xs shadow-sm"
                >
                  <div className="w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-blue-700">
                      {getFirstChar(user.name)}
                    </span>
                  </div>
                  <span className="font-medium">{user.name}</span>
                  {user.primaryRole && user.primaryRole !== 'user' && (
                    <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${getRoleColor(user.primaryRole)}`}>
                      {user.primaryRole}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Helper text */}
        <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
          <div className="flex flex-wrap items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-4">
              <span className="flex items-center space-x-1">
                <kbd className="px-2 py-1 bg-white border border-gray-200 rounded text-xs font-mono">Ctrl+Enter</kbd>
                <span>to post</span>
              </span>
              <span className="flex items-center space-x-1">
                <kbd className="px-2 py-1 bg-white border border-gray-200 rounded text-xs font-mono">@</kbd>
                <span>to mention</span>
              </span>
            </div>
            {mentionedUsers.length > 0 && (
              <div className="flex items-center space-x-1 mt-2 sm:mt-0">
                <Users className="w-3 h-3" />
                <span>{mentionedUsers.length} mention{mentionedUsers.length !== 1 ? 's' : ''}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex justify-between items-center px-4 py-3 bg-gray-50 border-t border-gray-200 rounded-b-lg">
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setShowMentionDropdown(true)}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-all duration-200 shadow-sm hover:shadow"
            title="Mention users"
          >
            <AtSign className="w-4 h-4" />
          </button>
          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-all duration-200 shadow-sm hover:shadow">
            <Smile className="w-4 h-4" />
          </button>
          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-all duration-200 shadow-sm hover:shadow">
            <Paperclip className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-white rounded-lg transition-all duration-200 font-medium"
          >
            Discard
          </button>
          <button
            onClick={onSubmit}
            disabled={!value.trim() || submitting}
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-blue-600 disabled:hover:to-indigo-600 flex items-center space-x-2 transition-all duration-200 shadow-sm hover:shadow-md font-medium"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Posting...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Post Comment</span>
                {mentionedUsers.length > 0 && (
                  <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
                    {mentionedUsers.length}
                  </span>
                )}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}