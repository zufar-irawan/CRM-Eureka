"use client";

import { MoreHorizontal, Edit, Trash2, Calendar } from 'lucide-react';
import { useState } from 'react';
import type { TaskResult, CurrentUser } from '../types';
import { formatDate, getFirstChar } from '../utils/formatting';
import { RESULT_TYPES, makeAuthenticatedRequest, TASK_API_ENDPOINTS } from '../utils/constants';

type ResultType = typeof RESULT_TYPES[number]["value"];

interface TaskResultItemProps {
  result: TaskResult;
  currentUser: CurrentUser | null;
  onUpdate: () => void;
  onDelete: () => void;
}

export default function TaskResultItem({
  result,
  currentUser,
  onUpdate,
  onDelete
}: TaskResultItemProps) {
  const [showActions, setShowActions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(result.result_text);
  const [editType, setEditType] = useState<ResultType>(result.result_type as ResultType || 'note');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const canEdit = currentUser?.id === result.created_by || currentUser?.role === 'admin';
  const canDelete = currentUser?.id === result.created_by || currentUser?.role === 'admin';

  const getResultTypeInfo = (type: string) => {
    const typeInfo = RESULT_TYPES.find(t => t.value === type);
    return typeInfo || RESULT_TYPES.find(t => t.value === 'note')!;
  };

  const handleEdit = () => {
    setIsEditing(true);
    setShowActions(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditText(result.result_text);
    setEditType(result.result_type as ResultType || 'note');
  };

  const handleSaveEdit = async () => {
    if (!editText.trim()) return;

    setIsUpdating(true);
    try {
      const response = await makeAuthenticatedRequest(
        TASK_API_ENDPOINTS.RESULT_UPDATE(String(result.id)),
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            result_text: editText.trim(),
            result_type: editType
          }),
        }
      );

      if (response.ok) {
        setIsEditing(false);
        onUpdate();
      } else {
        throw new Error('Failed to update result');
      }
    } catch (error) {
      console.error('Error updating result:', error);
      alert('Failed to update result. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this result?')) return;

    setIsDeleting(true);
    try {
      const response = await makeAuthenticatedRequest(
        TASK_API_ENDPOINTS.RESULT_UPDATE(String(result.id)),
        {
          method: 'DELETE',
        }
      );

      if (response.ok) {
        onDelete();
      } else {
        throw new Error('Failed to delete result');
      }
    } catch (error) {
      console.error('Error deleting result:', error);
      alert('Failed to delete result. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const typeInfo = getResultTypeInfo(result.result_type || 'note');

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-start space-x-3">
        {/* Type Icon */}
        <div className={`w-8 h-8 ${typeInfo.color} rounded-full flex items-center justify-center flex-shrink-0`}>
          <typeInfo.icon className="w-4 h-4" />
        </div>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-3">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${typeInfo.bgColor} ${typeInfo.textColor}`}>
                {typeInfo.label}
              </span>
              <span className="flex items-center space-x-1 text-xs text-gray-500">
                <Calendar className="w-3 h-3" />
                <span>{formatDate(result.result_date)}</span>
              </span>
              {result.created_by_name && (
                <span className="flex items-center space-x-1 text-xs text-gray-500">
                  <div className="w-4 h-4 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium">
                      {getFirstChar(result.created_by_name)}
                    </span>
                  </div>
                  <span>{result.created_by_name}</span>
                </span>
              )}
            </div>

            {/* Actions Menu */}
            {(canEdit || canDelete) && (
              <div className="relative">
                <button
                  onClick={() => setShowActions(!showActions)}
                  className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                  disabled={isDeleting}
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>

                {showActions && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowActions(false)} />
                    <div className="absolute right-0 top-full mt-1 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                      <div className="py-1">
                        {canEdit && (
                          <button
                            onClick={handleEdit}
                            className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                          >
                            <Edit className="w-3 h-3" />
                            <span>Edit</span>
                          </button>
                        )}

                        {canDelete && (
                          <button
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2 disabled:opacity-50"
                          >
                            {isDeleting ? (
                              <>
                                <div className="w-3 h-3 border border-red-600 border-t-transparent rounded-full animate-spin" />
                                <span>Deleting...</span>
                              </>
                            ) : (
                              <>
                                <Trash2 className="w-3 h-3" />
                                <span>Delete</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Content */}
          {isEditing ? (
            <div className="space-y-3">
              <select
                value={editType}
                onChange={(e) => setEditType(e.target.value as ResultType)}
                className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                {RESULT_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                rows={3}
                placeholder="Describe the result or outcome..."
              />
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleSaveEdit}
                  disabled={!editText.trim() || isUpdating}
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpdating ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={handleCancelEdit}
                  disabled={isUpdating}
                  className="px-3 py-1 text-gray-600 text-sm hover:text-gray-800 disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-700 whitespace-pre-wrap">
              {result.result_text}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}