"use client";

import { useState, useEffect, useRef } from 'react';
import { Reply, X, Send, Smile, Paperclip, ChevronDown, ChevronUp, AtSign, Users } from 'lucide-react';
import type { Comment, CurrentUser, User } from '../../types';
import { displayValue, getFirstChar } from '../../utils/formatting';
import UserSelector from './DealUserSelector';

interface DealReplyFormProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  currentUser: CurrentUser | null;
  submitting: boolean;
  originalComment: Comment;
  depth: number;
}

export default function DealReplyForm({
  value,
  onChange,
  onSubmit,
  onCancel,
  onKeyPress,
  currentUser,
  submitting,
  originalComment,
  depth
}: DealReplyFormProps) {
  const [toField, setToField] = useState('');
  const [selectedRecipients, setSelectedRecipients] = useState<User[]>([]);
  const [showToDropdown, setShowToDropdown] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const toFieldRef = useRef<HTMLInputElement>(null);

  // Initialize with original commenter
  useEffect(() => {
    if (originalComment.user_name) {
      const originalUser = {
        id: originalComment.user_id || 0,
        name: originalComment.user_name,
        email: `${originalComment.user_name.toLowerCase().replace(/\s+/g, '.')}@eureka.com`,
        role: 'user'
      };
      
      setSelectedRecipients([originalUser]);
      setToField(originalComment.user_name);
    }
  }, [originalComment]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);

  const handleToFieldChange = (newValue: string) => {
    setToField(newValue);
    setIsTyping(true);
    
    // Show dropdown if typing and there's content
    if (newValue.trim()) {
      setShowToDropdown(true);
    }

    // Clear typing state after 1 second of no input
    const timer = setTimeout(() => {
      setIsTyping(false);
    }, 1000);

    return () => clearTimeout(timer);
  };

  const handleUserSelect = (user: User) => {
    // Check if user already selected
    const isAlreadySelected = selectedRecipients.find(r => r.id === user.id);
    if (isAlreadySelected) {
      setShowToDropdown(false);
      return;
    }

    // Add to recipients
    const updatedRecipients = [...selectedRecipients, user];
    setSelectedRecipients(updatedRecipients);
    
    // Update TO field to show all selected recipients
    const newToField = updatedRecipients.map(r => r.name).join(', ');
    setToField(newToField);
    
    setShowToDropdown(false);
    
    // Focus back to textarea
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const removeRecipient = (recipientId: number) => {
    const updatedRecipients = selectedRecipients.filter(r => r.id !== recipientId);
    setSelectedRecipients(updatedRecipients);
    
    // Update TO field to show remaining recipients
    const newToField = updatedRecipients.map(r => r.name).join(', ');
    setToField(newToField);
  };

  const handleSubmit = () => {
    // Ensure at least the original commenter is included if no other recipients
    if (selectedRecipients.length === 0 && originalComment.user_name) {
      const originalUser = {
        id: originalComment.user_id || 0,
        name: originalComment.user_name,
        email: `${originalComment.user_name.toLowerCase().replace(/\s+/g, '.')}@eureka.com`,
        role: 'user'
      };
      setSelectedRecipients([originalUser]);
    }
    
    onSubmit();
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

  // Get display text for recipients
  const getRecipientsDisplayText = () => {
    if (selectedRecipients.length === 0) return 'No recipients';
    if (selectedRecipients.length === 1) return `To: ${selectedRecipients[0].name}`;
    
    const originalRecipient = selectedRecipients.find(r => r.id === originalComment.user_id);
    const otherRecipients = selectedRecipients.filter(r => r.id !== originalComment.user_id);
    
    if (originalRecipient && otherRecipients.length > 0) {
      return `Replying to ${originalRecipient.name} and ${otherRecipients.length} other${otherRecipients.length > 1 ? 's' : ''}`;
    } else if (originalRecipient) {
      return `Replying to ${originalRecipient.name}`;
    } else if (otherRecipients.length > 0) {
      return `To: ${otherRecipients.map(r => r.name).join(', ')}`;
    }
    
    return `To: ${selectedRecipients.map(r => r.name).join(', ')}`;
  };

  return (
    <div className="border border-blue-200 rounded-lg bg-white shadow-lg relative z-10 overflow-hidden">
      {/* Header with Frappe-like styling */}
      <div className="border-b border-blue-100 p-4 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center shadow-sm">
              <Reply className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-sm font-semibold text-blue-900">
                Reply to Comment
              </span>
              <p className="text-xs text-blue-600">
                {getRecipientsDisplayText()} • Comment #{originalComment.id}
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white hover:shadow-sm rounded-lg transition-all duration-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        {/* Enhanced TO field */}
        <div className="space-y-3 text-sm">
          <div className="flex items-start space-x-3">
            <div className="flex items-center space-x-2 pt-2">
              <AtSign className="w-4 h-4 text-gray-500" />
              <span className="text-gray-700 font-medium min-w-0">TO:</span>
            </div>
            
            <div className="flex-1 relative">
              <div className="relative">
                <input
                  ref={toFieldRef}
                  type="text"
                  value={toField}
                  onChange={(e) => handleToFieldChange(e.target.value)}
                  onFocus={() => setShowToDropdown(true)}
                  placeholder="Type names or @mention users..."
                  className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm transition-all duration-200"
                />
                
                <button
                  onClick={() => setShowToDropdown(!showToDropdown)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                >
                  {showToDropdown ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                
                {/* Typing indicator */}
                {isTyping && (
                  <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
                    <div className="flex space-x-1">
                      <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce"></div>
                      <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* User Selector Dropdown */}
              <UserSelector
                show={showToDropdown}
                onClose={() => setShowToDropdown(false)}
                onUserSelect={handleUserSelect}
                searchTerm={toField}
                selectedUsers={selectedRecipients}
                placeholder="Search users to add to this reply..."
                maxHeight="max-h-64"
              />
              
              {/* Selected recipients chips with enhanced styling */}
              {selectedRecipients.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {selectedRecipients.map((recipient: User) => {
                    const isOriginalCommenter = recipient.id === originalComment.user_id;
                    return (
                      <div
                        key={recipient.id}
                        className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs shadow-sm hover:shadow-md transition-shadow ${
                          isOriginalCommenter 
                            ? 'bg-blue-100 border border-blue-300 text-blue-900' 
                            : 'bg-white border border-gray-200 text-gray-900'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                          isOriginalCommenter ? 'bg-blue-200' : 'bg-gray-100'
                        }`}>
                         <span className={`text-xs font-medium ${
                            isOriginalCommenter ? 'text-blue-700' : 'text-gray-700'
                          }`}>
                            {getFirstChar(recipient.name)}
                          </span>
                        </div>
                        <span className="font-medium">{recipient.name}</span>
                        {isOriginalCommenter && (
                          <span className="px-1.5 py-0.5 bg-blue-200 text-blue-800 rounded text-xs font-medium">
                            Original
                          </span>
                        )}
                        {recipient.primaryRole && recipient.primaryRole !== 'user' && (
                          <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${getRoleColor(recipient.primaryRole)}`}>
                            {recipient.primaryRole}
                          </span>
                        )}
                        <button
                          onClick={() => removeRecipient(recipient.id)}
                          className="ml-1 hover:text-red-600 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reply content with improved user info */}
      <div className="p-4">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center border border-blue-200">
            <span className="text-sm font-bold text-blue-700">
              {currentUser ? getFirstChar(currentUser.name) : 'U'}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">
              {currentUser?.name || 'Current User'}
            </p>
            <p className="text-xs text-gray-500 flex items-center space-x-1">
              <span>{currentUser?.role || 'User'}</span>
              <span>•</span>
              <span>{new Date().toLocaleString('id-ID', { 
                dateStyle: 'short', 
                timeStyle: 'short' 
              })}</span>
              <span>•</span>
              <span className="text-blue-600">{selectedRecipients.length} recipient{selectedRecipients.length !== 1 ? 's' : ''}</span>
            </p>
          </div>
        </div>
        
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={onKeyPress}
            placeholder="Write your reply here... Use @username to mention specific users"
            className="w-full min-h-[100px] max-h-[300px] p-4 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm leading-relaxed shadow-sm"
            style={{ height: 'auto' }}
            autoFocus
          />
          
          {/* Character count */}
          <div className="absolute bottom-2 right-2 text-xs text-gray-400">
            {value.length} characters
          </div>
        </div>
        
        {/* Enhanced keyboard shortcuts */}
        <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
          <div className="flex flex-wrap items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-4">
              <span className="flex items-center space-x-1">
                <kbd className="px-2 py-1 bg-white border border-gray-200 rounded text-xs font-mono">Ctrl+Enter</kbd>
                <span>to send</span>
              </span>
              <span className="flex items-center space-x-1">
                <kbd className="px-2 py-1 bg-white border border-gray-200 rounded text-xs font-mono">@</kbd>
                <span>to mention</span>
              </span>
            </div>
            <div className="flex items-center space-x-1 mt-2 sm:mt-0">
              <Users className="w-3 h-3" />
              <span>{selectedRecipients.length} recipient{selectedRecipients.length !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced reply actions with better styling */}
      <div className="flex justify-between items-center px-4 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200">
        <div className="flex items-center space-x-2">
          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-all duration-200 shadow-sm hover:shadow">
            <Smile className="w-4 h-4" />
          </button>
          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-all duration-200 shadow-sm hover:shadow">
            <Paperclip className="w-4 h-4" />
          </button>
          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-all duration-200 shadow-sm hover:shadow">
            <AtSign className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-white rounded-lg transition-all duration-200 font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!value.trim() || submitting}
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-blue-600 disabled:hover:to-indigo-600 flex items-center space-x-2 transition-all duration-200 shadow-sm hover:shadow-md font-medium"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Sending Reply...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Send Reply</span>
                {selectedRecipients.length > 0 && (
                  <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
                    {selectedRecipients.length}
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