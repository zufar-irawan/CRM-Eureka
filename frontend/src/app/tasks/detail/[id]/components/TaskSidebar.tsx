"use client";

import { Calendar, User, Tag, AlertTriangle, Clock, Edit } from "lucide-react";
import type { Task, CurrentUser } from "../types";
import {
  TASK_STATUS_OPTIONS,
  TASK_PRIORITY_OPTIONS,
  TASK_CATEGORIES,
} from "../utils/constants";
import { displayValue, getFirstChar, formatDate } from "../utils/formatting";
import axios from 'axios';
import { useEffect, useState } from 'react';

interface TaskSidebarProps {
  task: Task | null;
  currentUser: CurrentUser | null;
}

// Helper function to format date with time
const formatDateWithTime = (dateString: string, isDueDate: boolean = false) => {
  if (!dateString) {
    return {
      date: "Not set",
      time: "",
      relative: "",
      isOverdue: false,
    };
  }


  const date = new Date(dateString);
  const now = new Date();


  // Format date
  const dateOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };


  // Format time
  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  };

  const formattedDate = date.toLocaleDateString('en-US', dateOptions);
  const formattedTime = date.toLocaleTimeString('en-US', timeOptions);

  // Calculate time difference for relative time display
  const diffInMs = date.getTime() - now.getTime();
  const diffInHours = Math.round(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.round(diffInMs / (1000 * 60 * 60 * 24));

  let relativeTime = '';
  if (isDueDate) {
    // Due date logic
    if (diffInDays < 0) {
      relativeTime = `${Math.abs(diffInDays)} day${Math.abs(diffInDays) !== 1 ? "s" : ""
        } ago`;
    } else if (diffInDays === 0) {
      if (diffInHours < 0) {
        relativeTime = `${Math.abs(diffInHours)} hour${Math.abs(diffInHours) !== 1 ? "s" : ""
          } ago`;
      } else if (diffInHours === 0) {
        relativeTime = "Due now";
      } else {
        relativeTime = `In ${diffInHours} hour${diffInHours !== 1 ? "s" : ""}`;
      }
    } else if (diffInDays === 1) {
      relativeTime = "Tomorrow";
    } else if (diffInDays > 1) {
      relativeTime = `In ${diffInDays} days`;
    }
  } else {
    // Created date logic (past tense)
    if (diffInDays > 0) {
      relativeTime = `In ${diffInDays} day${diffInDays !== 1 ? "s" : ""}`;
    } else if (diffInDays === 0) {
      if (diffInHours > 0) {
        relativeTime = `In ${diffInHours} hour${diffInHours !== 1 ? "s" : ""}`;
      } else if (diffInHours === 0) {
        relativeTime = "Just now";
      } else {
        relativeTime = `${Math.abs(diffInHours)} hour${Math.abs(diffInHours) !== 1 ? "s" : ""
          } ago`;
      }
    } else if (diffInDays === -1) {
      relativeTime = "Yesterday";
    } else if (diffInDays < -1) {
      relativeTime = `${Math.abs(diffInDays)} day${Math.abs(diffInDays) !== 1 ? "s" : ""
        } ago`;
    }
  }


  return {
    date: formattedDate,
    time: formattedTime,
    relative: relativeTime,
    isOverdue: isDueDate && diffInMs < 0,
  };
};

export default function TaskSidebar({ task, currentUser }: TaskSidebarProps) {
  if (!task) {
    return (
      <div className="w-80 bg-white border-l border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="w-12 h-12 bg-gray-200 rounded-full mb-8"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    const statusOption = TASK_STATUS_OPTIONS.find((s) => s.value === status);
    return statusOption?.color || "bg-gray-500";
  };

  const getPriorityColor = (priority: string) => {
    const priorityOption = TASK_PRIORITY_OPTIONS.find(
      (p) => p.value === priority
    );
    return priorityOption?.color || "bg-gray-100 text-gray-800";
  };

  const getCategoryLabel = (category: string) => {
    const categoryOption = TASK_CATEGORIES.find((c) => c.value === category);
    return categoryOption?.label || category;
  };

  const isOverdue =
    new Date(task.due_date) < new Date() && task.status !== "completed";
  const dueDateInfo = formatDateWithTime(task.due_date, true);
  const createdInfo = formatDateWithTime(task.created_at, false);

  const [leadName, setLeadName] = useState("")

  useEffect(() => {
    const fetchLeadName = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/api/leads/${task.lead_id}`)

        setLeadName(response.data.fullname)
      } catch (e) {
        console.log(e)
      }
    }

    if (task?.lead_id) {
      fetchLeadName();
    }
  }, [task?.lead_id])

  return (
    <div className="w-80 bg-white border-l border-gray-200 p-6">
      {/* Header with task icon */}
      <div className="flex items-center justify-between mb-8">
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
          <Tag className="w-6 h-6 text-blue-600" />
        </div>

        {/* Action icons */}
        <div className="flex items-center space-x-4">
          <button
            className="p-2 text-gray-400 hover:text-gray-600"
            onClick={() => console.log("Edit task")}
          >
            <Edit className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Task Details section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Task Details</h3>
        </div>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Status</span>
            <div className="flex items-center space-x-2">
              <div
                className={`w-2 h-2 rounded-full ${getStatusColor(
                  task.status
                )}`}
              ></div>
              <span className="text-sm text-gray-900 font-medium capitalize">
                {task.status}
              </span>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Priority</span>
            <span
              className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(
                task.priority
              )}`}
            >
              {task.priority?.toUpperCase()}
            </span>
          </div>

          <div className="flex justify-between items-start">
            <span className="text-sm text-gray-600 flex-shrink-0">
              Category
            </span>
            <div className="text-right max-w-48">
              <span className="text-sm text-gray-900 font-medium break-words">
                {getCategoryLabel(task.category)}
              </span>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Lead</span>
            <span className="text-sm text-gray-900 font-medium">
              {leadName}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Assigned To</span>
            <div className="flex items-center space-x-2">
              <span className="w-6 h-6 bg-blue-100 text-blue-700 rounded-sm flex items-center justify-center text-xs font-medium">
                {getFirstChar(task.assigned_user_name, "?")}
              </span>
              <span className="text-sm text-gray-900 font-medium">
                {displayValue(task.assigned_user_name, "Unassigned")}
              </span>
            </div>
          </div>

          {/* Enhanced Due Date with Time */}
          <div className="flex justify-between items-start">
            <span className="text-sm text-gray-600 flex items-center space-x-1 flex-shrink-0">
              <Calendar className="w-3 h-3" />
              <span>Due Date</span>
            </span>
            <div className="text-right">
              <div className={`text-sm font-medium ${dueDateInfo.isOverdue ? 'text-red-600' : 'text-gray-900'
                }`}>
                {dueDateInfo.date}
              </div>
              {dueDateInfo.time && (
                <div className={`text-xs font-medium ${dueDateInfo.isOverdue ? 'text-red-500' : 'text-gray-500'
                  } mt-1`}>
                  {dueDateInfo.time}
                </div>
              )}
              {dueDateInfo.relative && (
                <div className={`text-xs ${dueDateInfo.isOverdue ? 'text-red-500' : 'text-blue-600'
                  } mt-1`}>
                  {dueDateInfo.relative}
                </div>
              )}
              {dueDateInfo.isOverdue && task.status !== "completed" && (
                <div className="flex items-center justify-end space-x-1 text-red-600 text-xs mt-2">
                  <AlertTriangle className="w-3 h-3" />
                  <span>Overdue</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-between items-start">
            <span className="text-sm text-gray-600 flex items-center space-x-1 flex-shrink-0">
              <Clock className="w-3 h-3" />
              <span>Created</span>
            </span>
            <div className="text-right">
              <div className="text-sm text-gray-900 font-medium">
                {createdInfo.date}
              </div>
              {createdInfo.time && (
                <div className="text-xs text-gray-500 font-medium mt-1">
                  {createdInfo.time}
                </div>
              )}
              {createdInfo.relative && (
                <div className="text-xs text-gray-400 mt-1">
                  {createdInfo.relative}
                </div>
              )}
            </div>
          </div>

          {task.updated_at && task.updated_at !== task.created_at && (
            <div className="flex justify-between items-start">
              <span className="text-sm text-gray-600 flex-shrink-0">
                Last Updated
              </span>
              <div className="text-right">
                <div className="text-sm text-gray-900 font-medium">
                  {formatDateWithTime(task.updated_at, false).date}
                </div>
                {formatDateWithTime(task.updated_at, false).time && (
                  <div className="text-xs text-gray-500 font-medium mt-1">
                    {formatDateWithTime(task.updated_at, false).time}
                  </div>
                )}
                {formatDateWithTime(task.updated_at, false).relative && (
                  <div className="text-xs text-gray-400 mt-1">
                    {formatDateWithTime(task.updated_at, false).relative}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Description section */}
      {task.description && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Description</h3>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-700 whitespace-pre-wrap">
              {task.description}
            </p>
          </div>
        </div>
      )}

      {/* Progress section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Progress</h3>
        </div>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Completion</span>
            <span className="text-sm text-gray-900 font-medium">
              {task.status === "completed"
                ? "100%"
                : task.status === "cancelled"
                  ? "0%"
                  : task.status === "pending"
                    ? "50%"
                    : "50%"}
            </span>
          </div>


          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${task.status === 'completed' ? 'bg-green-500' :
                task.status === 'pending' ? 'bg-gray-400' : 'bg-yellow-500'
                }`}
              style={{
                width: task.status === 'completed' ? '100%' :
                  task.status === 'pending' ? '0%' : '50%'
              }}
            ></div>
          </div>

          {task.status === "completed" && (
            <div className="flex items-center space-x-2 text-green-600 text-sm">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Task completed</span>
            </div>
          )}

          {dueDateInfo.isOverdue && task.status !== "completed" && (
            <div className="flex items-center space-x-2 text-red-600 text-sm">
              <AlertTriangle className="w-4 h-4" />
              <span>Task is overdue</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
