"use client";

import { useState, useEffect } from 'react';
import { Reply, X, Send, Smile, Paperclip, ChevronDown, ChevronUp } from 'lucide-react';
import type { Comment, CurrentUser, User } from '../../types';
import { displayValue, getFirstChar } from '../../utils/formatting';
import UserSelector from './UserSelector';

interface ReplyFormProps {
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

export default function ReplyForm({
  value,
  onChange,
  onSubmit,
  onCancel,
  onKeyPress,
  currentUser,
  submitting,
  originalComment,
  depth
}: ReplyFormProps) {
  const [toField, setToField] = useState(originalComment.user_name || 'Unknown User');
  const [selectedRecipients, setSelectedRecipients] = useState<User[]>([]);
  const [showToDropdown, setShowToDropdown] = useState(false);

  const marginClass = depth > 0 ? 'ml-4' : 'ml-8';

  const handleToFieldChange = (newValue: string) => {
    setToField(newValue);
    if (newValue.trim()) {
      setShowToDropdown(true);
    }

    // Parse existing recipients from the field
    const emails = newValue.split(',').map(email => email.trim()).filter(email => email);
    const recipients = emails.map(email => {
      // Try to find user by email or create a temporary user object
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
    <div className={`${marginClass} border border-gray-200 rounded-lg bg-white shadow-sm`}>
      {/* Email-like header */}
      <div className="border-b border-gray-200 p-4 bg-gray-50">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Reply className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Reply</span>
          </div>
          <button
            onClick={onCancel}
            className="p-1 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <div className="space-y-2 text-sm">
          {/* Enhanced TO field */}
          <div className="flex items-start space-x-2">
            <span className="text-gray-600 font-medium pt-2">TO:</span>
            <div className="flex-1 to-field-container relative">
              <input
                type="text"
                value={toField}
                onChange={(e) => handleToFieldChange(e.target.value)}
                onFocus={() => setShowToDropdown(true)}
                placeholder="Type to search users..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              
              {/* User Selector Dropdown */}
              <UserSelector
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
                      <span>{recipient.name}</span>
                      <button
                        onClick={() => removeRecipient(recipient.email)}
                        className="hover:text-blue-600"
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
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              {showToDropdown ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-gray-600 font-medium">SUBJECT:</span>
            <span className="text-gray-900">
              Re: Comment on Lead (#CRM-LEAD-{originalComment.lead_id})
            </span>
          </div>
        </div>
      </div>

      {/* Reply content */}
      <div className="p-4">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-xs font-medium text-blue-700">
              {currentUser ? getFirstChar(currentUser.name) : 'U'}
            </span>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-900">
              {currentUser?.name || 'Current User'}
            </p>
          </div>
        </div>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyPress}
          placeholder="Type your reply..."
          className="w-full h-24 p-3 border border-gray-200 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          autoFocus
        />
      </div>

      {/* Reply actions */}
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
                <span>Sending...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Send</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}