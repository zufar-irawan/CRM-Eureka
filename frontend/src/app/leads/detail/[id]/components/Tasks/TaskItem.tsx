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
import { useEffect, useState } from 'react';
import type { Task, CurrentUser } from '../../types';
import { formatDate, getFirstChar } from '../../utils/formatting';
import axios from 'axios';
import Swal from 'sweetalert2';
import { makeAuthenticatedRequest, RESULT_TYPES, TASK_API_ENDPOINTS } from '@/app/tasks/detail/[id]/utils/constants';

interface TaskItemProps {
  task: Task;
  currentUser: CurrentUser | null;
  onUpdateStatus: (taskId: number, status: 'pending' | 'completed' | 'cancelled') => Promise<void>;
  onDelete: (taskId: number) => void;
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
  const [isResult, setIsResult] = useState(false)

  const [result, setResult] = useState<any>()

  const isCompleted = task.status === 'completed';
  const isOverdue = new Date(task.due_date) < new Date() && !isCompleted;

  const getTaskResult = () => {
    axios.get(`http://localhost:3000/api/tasks/${task.id}/results`)
      .then(res => {
        if (res.data.success && res.data.data.length > 0) {
          const r = res.data.data[0]; // ambil data pertama
          const dateObj = new Date(r.result_date);
          const formatted = {
            result_text: r.result_text,
            result_type: r.result_type,
            result_date: dateObj.toLocaleDateString(), // hanya tanggal
            result_time: dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) // hanya jam
          };
          setResult(formatted);
          setIsResult(true)
        }
      })
      .catch(err => Swal.fire({ icon: 'error', title: 'Error', text: err.message }));
  };


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
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    if (isCompleted) {
      setShowResultModal(true)
    } else {
      setShowResultModal(false)
    }
  }, [isCompleted])

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      onDelete(task.id);
    }
  };

  return (
    <>
      <div className={`border p-4 bg-white hover:shadow-md transition-all duration-200 ${isCompleted ? 'bg-gray-50 border-gray-200 rounded-t-lg' : 'border-gray-200 rounded-lg'
        } ${isOverdue ? 'border-l-4 border-l-red-500' : ''}`}>
        <div className="flex items-start justify-between">
          {/* Task Info */}
          <div className="flex items-start space-x-4 flex-1">
            {/* Status Toggle */}
            <button
              onClick={handleStatusToggle}
              disabled={isUpdating}
              className={`mt-1 transition-colors duration-200 ${isUpdating ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'
                }`}
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
                      onClick={handleStatusToggle}
                      disabled={isUpdating}
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

                    {(currentUser?.role === 'admin' || task.assigned_to === currentUser?.id) && (
                      <button
                        onClick={handleDelete}
                        className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete</span>
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {showResultModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Add Task Result</h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                // logika submit mirip AddTaskResult.tsx
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

                  // Reset form and notify parent
                  setResultText('');
                  setResultType('note');
                  getTaskResult()
                } catch (err) {
                  Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to add result' });
                }
              }}
            >
              {/* Pilih tipe */}
              <label className="block text-sm font-medium text-gray-700 mb-1">Result Type</label>
              <select
                value={resultType}
                onChange={(e) => setResultType(e.target.value)}
                className="w-full mb-3 px-3 py-2 border rounded"
              >
                {RESULT_TYPES.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>

              {/* Input text */}
              <textarea
                value={resultText}
                onChange={(e) => setResultText(e.target.value)}
                placeholder="Describe the result..."
                className="w-full mb-3 px-3 py-2 border rounded resize-none"
                rows={4}
              />

              {/* Tombol aksi */}
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowResultModal(false)}
                  className="px-3 py-1 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {isResult ? (
        <div className='border-green-600 rounded-b-lg p-4 border bg-green-200 flex items-start space-x-4 flex-1'>
          <div className="ml-6">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-3 mb-2">
                <h4 className={`font-medium `}>
                  Task Result
                </h4>
              </div>

              <p className={`text-sm mb-3 ${isCompleted ? 'text-gray-400' : 'text-gray-600'}`}>
                {result.result_text}
              </p>

              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <div className="flex items-center space-x-1">
                  <Tag className="w-3 h-3" />
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(task.category)}`}>
                    {result.result_type}
                  </span>
                </div>

                <div className={`flex items-center space-x-1 ${isOverdue ? 'text-red-600' : ''}`}>
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
        </div>
      ) : (
        <></>
      )}
    </>



  );
}
