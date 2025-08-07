"use client";

import { useState } from 'react';
import { Reply, X, Send, Smile, Paperclip, ChevronDown, ChevronUp } from 'lucide-react';
import type { Comment, CurrentUser, User } from '../../types';
import { getFirstChar } from '../../utils/formatting';
import DealUserSelector from './DealUserSelector';

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
  const [toField, setToField] = useState(originalComment.user_name || originalComment.author || 'Unknown User');
  const [selectedRecipients, setSelectedRecipients] = useState<User[]>([]);
  const [showToDropdown, setShowToDropdown] = useState(false);

  const handleToFieldChange = (newValue: string) => {
    setToField(newValue);
    if (newValue.trim()) {
      setShowToDropdown(true);
    }

    // Parse existing recipients from the field
    const emails = newValue.split(',').map(email => email.trim()).filter(email => email);
    const recipients = emails.map(email => {
      return { id: Date.now() + Math.random(), name: email, email: email };
    });
    setSelectedRecipients(recipients);
  };

  const removeRecipient = (emailToRemove: string) => {
    const currentEmails = toField.split(',').map(email => email.trim()).filter(email => email);
    const filteredEmails = currentEmails.filter(email => email !== emailToRemove);
    setToField(filteredEmails.join(', '));
    
    setSelectedRecipients(prev => prev.filter(r => r.email !== emailToRemove));
  };

  return (
    <div className="border border-blue-200 rounded-lg bg-white shadow-md relative z-10">
      {/* Email-like header with improved styling */}
      <div className="border-b border-blue-100 p-4 bg-blue-50/50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
              <Reply className="w-3 h-3 text-blue-600" />
            </div>
            <span className="text-sm font-semibold text-blue-900">
              Replying to {originalComment.user_name || originalComment.author}
            </span>
          </div>
          <button
            onClick={onCancel}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-white rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <div className="space-y-3 text-sm">
          {/* Enhanced TO field */}
          <div className="flex items-start space-x-3">
            <span className="text-gray-700 font-medium pt-2 min-w-0">TO:</span>
            <div className="flex-1 relative">
              <input
                type="text"
                value={toField}
                onChange={(e) => handleToFieldChange(e.target.value)}
                onFocus={() => setShowToDropdown(true)}
                placeholder="Type to search users..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              />
              
              {/* User Selector Dropdown */}
              <DealUserSelector
                show={showToDropdown}
                onClose={() => setShowToDropdown(false)}
                onUserSelect={(user) => {
                  const currentEmails = toField.split(',').map(email => email.trim()).filter(email => email);
                  if (!currentEmails.includes(user.email)) {
                    const newToField = currentEmails.length > 0 
                      ? `${currentEmails.join(', ')}, ${user.email}`
                      : user.email;
                    setToField(newToField);
                    
                    if (!selectedRecipients.find(r => r.email === user.email)) {
                      setSelectedRecipients(prev => [...prev, user]);
                    }
                  }
                  setShowToDropdown(false);
                }}
                searchTerm={toField}
              />
              
              {/* Selected recipients chips */}
              {selectedRecipients.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedRecipients.map((recipient, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs"
                    >
                      <span className="font-medium">{recipient.name}</span>
                      <button
                        onClick={() => removeRecipient(recipient.email)}
                        className="hover:text-blue-600 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={() => setShowToDropdown(!showToDropdown)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-md transition-colors"
            >
              {showToDropdown ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
          
          <div className="flex items-center space-x-3">
            <span className="text-gray-700 font-medium min-w-0">SUBJECT:</span>
            <span className="text-gray-900 text-xs bg-gray-100 px-2 py-1 rounded">
              Re: Comment on Deal ({originalComment.deal_id ? `#CRM-DEAL-${originalComment.deal_id}` : 'Deal Comment'})
            </span>
          </div>
        </div>
      </div>

      {/* Reply content with improved user info */}
      <div className="p-4">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-blue-700">
              {currentUser ? getFirstChar(currentUser.name) : 'U'}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">
              {currentUser?.name || 'Current User'}
            </p>
            <p className="text-xs text-gray-500">
              {currentUser?.role || 'User'}
            </p>
          </div>
        </div>
        
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyPress}
          placeholder="Type your reply..."
          className="w-full h-24 p-3 border border-gray-200 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          autoFocus
        />
        
        {/* Keyboard shortcut hint */}
        <p className="text-xs text-gray-400 mt-2">
          Press <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs">Enter</kbd> to send
        </p>
      </div>

      {/* Reply actions with improved styling */}
      <div className="flex justify-between items-center px-4 py-3 bg-gray-50 border-t border-gray-200 rounded-b-lg">
        <div className="flex items-center space-x-2">
          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-md transition-colors">
            <Smile className="w-4 h-4" />
          </button>
          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-md transition-colors">
            <Paperclip className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-white rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={!value.trim() || submitting}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-colors shadow-sm"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Sending...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Send Reply</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}