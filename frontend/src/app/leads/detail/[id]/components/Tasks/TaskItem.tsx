"use client";

import {
  Calendar,
  User,
  Tag,
  MoreHorizontal,
  Trash2,
  CheckCircle2,
  Circle,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { useEffect, useState, useCallback, useRef } from 'react';
import type { Task, CurrentUser } from '../../types';
import { formatDate, getFirstChar } from '../../utils/formatting';
import Swal from 'sweetalert2';
import { makeAuthenticatedRequest, RESULT_TYPES, TASK_API_ENDPOINTS } from '@/app/tasks/detail/[id]/utils/constants';

interface TaskItemProps {
  task: Task;
  currentUser: CurrentUser | null;
  onUpdateStatus: (taskId: number, status: 'pending' | 'completed' | 'cancelled') => Promise<void>;
  onDelete: (taskId: number) => void;
}

interface TaskResult {
  result_text: string;
  result_type: string;
  result_date: string;
  result_time: string;
}

export default function TaskItem({
  task,
  currentUser,
  onUpdateStatus,
  onDelete
}: TaskItemProps) {
  const [showActions, setShowActions] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [resultText, setResultText] = useState('');
  const [resultType, setResultType] = useState('note');
  const [result, setResult] = useState<any>();
  const [isLoadingResult, setIsLoadingResult] = useState(false);

  // Ref untuk cancel request jika component unmount
  const abortControllerRef = useRef<AbortController | null>(null);

  const isCompleted = task.status === 'completed';
  const isOverdue = new Date(task.due_date) < new Date() && !isCompleted;

  // Memoized function untuk get task result
  const getTaskResult = useCallback(async () => {
    if (isLoadingResult) return; // Prevent multiple calls

    setIsLoadingResult(true);

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    try {
      const response = await makeAuthenticatedRequest(
        TASK_API_ENDPOINTS.TASK_RESULTS(task.id),
        {
          method: 'GET',
          signal: abortControllerRef.current.signal
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch task result');
      }

      const data = await response.json();

      if (data.success && data.data.length > 0) {
        const r = data.data[0];
        const dateObj = new Date(r.result_date);

        const formatted: TaskResult = {
          result_text: r.result_text,
          result_type: r.result_type,
          result_date: dateObj.toLocaleDateString(),
          result_time: dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setResult(formatted);
      } else {
        setResult(null);
        // Show modal only if task is completed but no result exists
        if (isCompleted) {
          setShowResultModal(true);
        }
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('Failed to fetch task result:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to fetch task result'
        });
      }
    } finally {
      setIsLoadingResult(false);
    }
  }, [task.id, isCompleted, isLoadingResult]);

  // Effect untuk handle completed task
  useEffect(() => {
    if (isCompleted && !result && !isLoadingResult) {
      getTaskResult();
    } else if (!isCompleted) {
      setShowResultModal(false);
      setResult(null);
    }
  }, [isCompleted]); // Hanya depend pada isCompleted

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'kanvasing': return 'bg-blue-100 text-blue-800';
      case 'followup': return 'bg-purple-100 text-purple-800';
      case 'penawaran': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStatusToggle = async () => {
    setIsUpdating(true);
    try {
      const newStatus: 'pending' | 'completed' = isCompleted ? 'pending' : 'completed';
      await onUpdateStatus(task.id, newStatus);

      // Jika mengubah ke completed dan belum ada result, tampilkan modal
      if (newStatus === 'completed' && !result) {
        setShowResultModal(true);
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      onDelete(task.id);
    }
  };

  const handleResultSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!resultText.trim()) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Please enter a result' });
      return;
    }

    try {
      const response = await makeAuthenticatedRequest(
        TASK_API_ENDPOINTS.TASK_RESULTS(task.id),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            result_text: resultText.trim(),
            result_type: resultType,
            created_by: currentUser?.id,
            created_by_name: currentUser?.name
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to add result');
      }

      // Reset form dan fetch result terbaru
      setResultText('');
      setResultType('note');
      setShowResultModal(false);

      // Refresh result data
      await getTaskResult();

      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Task result added successfully!'
      });

    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message || 'Failed to add result'
      });
    }
  };

  const canEditTask = currentUser?.role === 'admin' || task.assigned_to === currentUser?.id;

  return (
    <div>
      <div className={`border p-4 bg-white hover:shadow-md transition-all duration-200 ${isCompleted ? 'bg-gray-50 border-gray-200 rounded-t-lg' : 'border-gray-200 rounded-lg'
        } ${isOverdue ? 'border-l-4 border-l-red-500' : ''}`}>
        <div className="flex items-start justify-between">
          {/* Task Info */}
          <div className="flex items-start space-x-4 flex-1">
            {/* Status Toggle */}
            <button
              onClick={handleStatusToggle}
              disabled={result}
              className={`mt-1 transition-colors duration-200 ${isUpdating ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'
                } ${result && isCompleted ? 'cursor-not-allowed opacity-50' : ''}`}
              title={result && isCompleted ? 'Cannot change status when result exists' : ''}
            >
              {isUpdating ? (
                <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
              ) : isCompleted ? (
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              ) : (
                <Circle className="w-5 h-5 text-gray-400 hover:text-blue-600" />
              )}
            </button>

            {/* Task Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-3 mb-2">
                <h4 className={`font-medium ${isCompleted ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                  {task.title}
                </h4>

                <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </span>

                {isOverdue && (
                  <div className="flex items-center space-x-1 text-red-600">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-xs font-medium">Overdue</span>
                  </div>
                )}
              </div>

              {task.description && (
                <p className={`text-sm mb-3 ${isCompleted ? 'text-gray-400' : 'text-gray-600'}`}>
                  {task.description}
                </p>
              )}

              {/* Meta */}
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <div className="flex items-center space-x-1">
                  <Tag className="w-3 h-3" />
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(task.category)}`}>
                    {task.category}
                  </span>
                </div>

                <div className={`flex items-center space-x-1 ${isOverdue ? 'text-red-600' : ''}`}>
                  <Calendar className="w-3 h-3" />
                  <span className="font-medium">Due: {formatDate(task.due_date)}</span>
                </div>

                <div className="flex items-center space-x-1">
                  <User className="w-3 h-3" />
                  <div className="flex items-center space-x-1">
                    <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-blue-700">
                        {getFirstChar(task.assigned_user_name || 'U')}
                      </span>
                    </div>
                    <span>{task.assigned_user_name || 'Unassigned'}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>Created {formatDate(task.created_at)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions Menu */}
          {canEditTask && (
            <div className="relative">
              <button
                onClick={() => setShowActions(!showActions)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>

              {showActions && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowActions(false)} />
                  <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                    <div className="py-1">
                      <button
                        onClick={() => {
                          setShowActions(false);
                          handleStatusToggle();
                        }}
                        disabled={result}
                        className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2 disabled:opacity-50"
                      >
                        {isCompleted ? (
                          <>
                            <Circle className="w-4 h-4" />
                            <span>Mark Pending</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Mark Complete</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => {
                          setShowActions(false);
                          handleDelete();
                        }}
                        className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Result Modal */}
      {showResultModal && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={() => { setShowResultModal(false); handleStatusToggle() }}
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Add Task Result</h2>
              <form onSubmit={handleResultSubmit}>
                <label className="block text-sm font-medium text-gray-700 mb-1">Result Type</label>
                <select
                  value={resultType}
                  onChange={(e) => setResultType(e.target.value)}
                  className="w-full mb-3 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {RESULT_TYPES.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>

                <label className="block text-sm font-medium text-gray-700 mb-1">Result Description</label>
                <textarea
                  value={resultText}
                  onChange={(e) => setResultText(e.target.value)}
                  placeholder="Describe the result..."
                  className="w-full mb-4 px-3 py-2 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  required
                />

                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => { setShowResultModal(false); handleStatusToggle() }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Save Result
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>


      )}

      {/* Result Display */}
      {result && (
        <div className="border-green-600 rounded-b-lg p-4 border bg-green-50 flex items-start space-x-4">
          <div className="ml-6 flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h4 className="font-medium text-green-800">Task Result</h4>
            </div>

            <p className="text-sm mb-3 text-gray-700">
              {result.result_text}
            </p>

            <div className="flex items-center space-x-4 text-xs text-gray-600">
              <div className="flex items-center space-x-1">
                <Tag className="w-3 h-3" />
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-200 text-green-800">
                  {result.result_type}
                </span>
              </div>

              <div className="flex items-center space-x-1">
                <Calendar className="w-3 h-3" />
                <span className="font-medium">{result.result_date}</span>
              </div>

              <div className="flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>{result.result_time}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading Result */}
      {isLoadingResult && (
        <div className="border-gray-300 rounded-b-lg p-4 border bg-gray-50 flex items-center justify-center">
          <div className="flex items-center space-x-2 text-gray-600">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
            <span className="text-sm">Loading result...</span>
          </div>
        </div>
      )}
    </div>
  );
}