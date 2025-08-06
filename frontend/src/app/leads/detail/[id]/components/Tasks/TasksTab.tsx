"use client";

import { Plus, CheckSquare, Calendar, User, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import type { Task, CurrentUser } from '@/app/leads/detail/[id]/types';
import { useTasks } from '../../hooks/useTasks';
import CreateTaskModal from './CreateTaskModal';
import TaskItem from './TaskItem';

interface TasksTabProps {
  currentUser: CurrentUser | null;
}

export default function TasksTab({ currentUser }: TasksTabProps) {
  const { id } = useParams();
  const leadId = typeof id === 'string' ? id : id?.[0];

  const {
    tasks,
    tasksLoading,
    tasksError,
    taskStats,
    fetchTasks,
    handleUpdateTaskStatus,
    handleDeleteTask,
  } = useTasks(leadId);

  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    if (leadId) {
      fetchTasks();
    }
  }, [leadId, fetchTasks]);

  const handleTaskCreated = () => {
    fetchTasks();
    setShowCreateModal(false);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center space-x-6">
          <h2 className="text-xl font-semibold text-gray-900">Tasks</h2>
          {taskStats.total > 0 && (
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <CheckSquare className="w-4 h-4 text-green-600" />
                <span>{taskStats.completed} completed</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span>{taskStats.pending} pending</span>
              </div>
              <div className="flex items-center space-x-1">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span>{taskStats.overdue} overdue</span>
              </div>
              <div className="flex items-center space-x-1">
                <User className="w-4 h-4" />
                <span>{taskStats.total} total</span>
              </div>
            </div>
          )}
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-black text-white px-4 py-2 rounded-md text-sm font-medium flex items-center space-x-2 hover:bg-gray-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Task</span>
        </button>
      </div>

      {/* Loading */}
      {tasksLoading && (
        <div className="flex justify-center py-8">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-black rounded-full animate-spin"></div>
        </div>
      )}

      {/* Error */}
      {tasksError && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <p className="text-red-700 text-sm">{tasksError}</p>
          <button 
            onClick={fetchTasks}
            className="text-red-700 text-sm underline mt-2 hover:text-red-800"
          >
            Try again
          </button>
        </div>
      )}

      {/* Empty */}
      {!tasksLoading && tasks.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-lg flex items-center justify-center">
            <CheckSquare className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">No Tasks Yet</h3>
          <p className="text-gray-600 mb-6">Create tasks to track activities for this lead</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Create the first task
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {tasks.map((task: Task) => (
            <TaskItem
              key={task.id}
              task={task}
              currentUser={currentUser}
              onUpdateStatus={handleUpdateTaskStatus}
              onDelete={handleDeleteTask}
            />
          ))}
        </div>
      )}

      {/* Footer Action */}
      {!showCreateModal && tasks.length > 0 && (
        <div className="flex items-center justify-center mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-6 py-3 text-sm text-gray-700 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            <CheckSquare className="w-4 h-4" />
            <span>Add Task</span>
          </button>
        </div>
      )}

      {/* Footer Stats */}
      {taskStats.total > 0 && (
        <div className="mt-8 pt-4 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-500">
            {taskStats.completed} of {taskStats.total} tasks completed
            {taskStats.overdue > 0 && (
              <span className="text-red-600 ml-2">• {taskStats.overdue} overdue</span>
            )}
          </p>
        </div>
      )}

      {/* Modal */}
      {showCreateModal && (
        <CreateTaskModal
          leadId={leadId}
          currentUser={currentUser}
          onClose={() => setShowCreateModal(false)}
          onTaskCreated={handleTaskCreated}
        />
      )}
    </div>
  );
}
