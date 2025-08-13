"use client";

import { useState, useEffect } from 'react';
import { CheckSquare, User, ChevronDown, AlertTriangle } from 'lucide-react';
import type { Task, CurrentUser, User as UserType } from '../types';
import { TASK_STATUS_OPTIONS, TASK_PRIORITY_OPTIONS } from '../utils/constants';
import { displayValue } from "../utils/formatting";
import { useUsers } from "../../../../leads/detail/[id]/hooks/useUsers";
import Swal from 'sweetalert2';

interface TaskHeaderProps {
  task: Task | null;
  isLoading: boolean;
  onTaskUpdate: () => void;
  onStatusChange: (taskId: number, status: string) => Promise<void>;
  onAssignmentChange: (taskId: number, userId: number) => Promise<void>;
}

export default function TaskHeader({
  task,
  isLoading,
  onTaskUpdate,
  onStatusChange,
  onAssignmentChange
}: TaskHeaderProps) {
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isAssignDropdownOpen, setIsAssignDropdownOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignedUser, setAssignedUser] = useState<UserType | null>(null);

  const { users, isLoading: isLoadingUsers } = useUsers();

  // Update assigned user when task or users change
  useEffect(() => {
    if (task?.assigned_to && users.length > 0) {
      const currentUser = users.find(user =>
        user.id.toString() === task.assigned_to?.toString()
      );
      setAssignedUser(currentUser || null);
    }
  }, [task?.assigned_to, users]);

  // Handle status change
  const handleStatusChange = async (newStatus: string) => {
    const confirm = await Swal.fire({
      title: 'Update Status?',
      text: `Do you want to change the status to "${newStatus}"?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Confirm',
      cancelButtonText: 'Cancel',
      reverseButtons: true
    });

    if (confirm.isConfirmed) {
      if (!task || newStatus === task.status) {
        setIsStatusDropdownOpen(false);
        return;
      }

      setIsUpdating(true);
      try {
        await onStatusChange(task.id, newStatus);

        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: `Task status updated to "${newStatus}" successfully!`,
          timer: 2000,
          showConfirmButton: false
        });
      } catch (error) {
        console.error('Error updating status:', error);
        Swal.fire({
          icon: 'error',
          title: 'Failed',
          text: 'Failed to update task status. Please try again.'
        });
      } finally {
        setIsUpdating(false);
        setIsStatusDropdownOpen(false);
      }
    }
  };

  // Handle user assignment
  const handleAssignToUser = async (userId: number) => {
    if (!task || isAssigning) return;

    if (userId.toString() === task.assigned_to?.toString()) {
      setIsAssignDropdownOpen(false);
      return;
    }

    setIsAssigning(true);
    try {
      await onAssignmentChange(task.id, userId);

      const selectedUser = users.find(user => user.id === userId);
      setAssignedUser(selectedUser || null);

      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: `Task assigned to ${selectedUser?.name || 'user'} successfully!`,
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error assigning user:', error);
      Swal.fire({
        icon: 'error',
        title: 'Failed',
        text: 'Failed to assign user. Please try again.'
      });
    } finally {
      setIsAssigning(false);
      setIsAssignDropdownOpen(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    const priorityOption = TASK_PRIORITY_OPTIONS.find(p => p.value === priority);
    return priorityOption?.color || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string) => {
    const statusOption = TASK_STATUS_OPTIONS.find(s => s.value === status);
    return statusOption?.color || 'bg-gray-500';
  };

  const isOverdue = task && new Date(task.due_date) < new Date() && task.status !== 'completed';

  if (!task) {
    return (
      <div className="border-b border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="border-b border-gray-200 p-6">
        {/* Breadcrumb */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-2 text-gray-600 text-sm">
            <span>Tasks</span>
            <span>/</span>
            <span className="text-gray-900">{displayValue(task.title)}</span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500">TASK-{task.id}</div>
            {task.status === 'completed' && (
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                Completed
              </span>
            )}
            {isOverdue && (
              <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full flex items-center space-x-1">
                <AlertTriangle className="w-3 h-3" />
                <span>Overdue</span>
              </span>
            )}
          </div>
        </div>

        {/* Header Content */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-semibold text-gray-900">
              {displayValue(task.title)}
            </h1>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
              {task.priority?.toUpperCase()}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-3">
            {/* Assign To Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsAssignDropdownOpen(!isAssignDropdownOpen)}
                disabled={isAssigning}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-700 flex items-center space-x-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px]"
              >
                {isAssigning ? (
                  <>
                    <div className="w-2 h-2 border border-gray-500 border-t-transparent rounded-full animate-spin"></div>
                    <span>Assigning...</span>
                  </>
                ) : (
                  <>
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="truncate">
                      {assignedUser ? assignedUser.name : 'Assign to'}
                    </span>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </>
                )}
              </button>

              {isAssignDropdownOpen && !isAssigning && (
                <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-md shadow-lg z-20 max-h-64 overflow-y-auto">
                  <div className="py-1">
                    {isLoadingUsers ? (
                      <div className="px-4 py-2 text-sm text-gray-500 text-center">
                        Loading users...
                      </div>
                    ) : users.length === 0 ? (
                      <div className="px-4 py-2 text-sm text-gray-500 text-center">
                        No users available
                      </div>
                    ) : (
                      users.map((user) => (
                        <button
                          key={user.id}
                          onClick={() => handleAssignToUser(user.id)}
                          className={`w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 ${assignedUser?.id === user.id ? 'bg-gray-50 font-medium' : ''
                            }`}
                        >
                          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium text-blue-700">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1 text-left">
                            <div className="font-medium">{user.name}</div>
                            <div className="text-xs text-gray-500">{user.email}</div>
                          </div>
                          {assignedUser?.id === user.id && (
                            <span className="text-blue-600">✓</span>
                          )}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Status Dropdown */}
            <div className="relative">
              <button
                onClick={() => !isUpdating && setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                disabled={isUpdating}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-700 flex items-center space-x-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdating ? (
                  <>
                    <div className="w-2 h-2 border border-gray-500 border-t-transparent rounded-full animate-spin"></div>
                    <span>Updating...</span>
                  </>
                ) : (
                  <>
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(task.status)}`}></div>
                    <span className="capitalize">{task.status}</span>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </>
                )}
              </button>

              {isStatusDropdownOpen && !isUpdating && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                  <div className="py-1">
                    {TASK_STATUS_OPTIONS.map((status) => (
                      <button
                        key={status.value}
                        onClick={() => handleStatusChange(status.value)}
                        className={`w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 ${status.value === task.status ? 'bg-gray-50 font-medium' : ''
                          }`}
                      >
                        <div className={`w-2 h-2 rounded-full ${status.color}`}></div>
                        <span className="capitalize">{status.label}</span>
                        {status.value === task.status && (
                          <span className="ml-auto text-blue-600">✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}