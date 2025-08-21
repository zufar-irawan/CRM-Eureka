// utils/constants.ts - Task Detail Constants
import {
  CheckCircle2,
  Clock,
  XCircle,
  Phone,
  Mail,
  Calendar,
  MapPin,
  FileText,
  AlertTriangle
} from "lucide-react";

import type { TaskStatusOption, TaskPriorityOption, TaskCategory, ResultType } from "../types";

export const TASK_STATUS_OPTIONS: TaskStatusOption[] = [
  { value: "pending", label: "Pending", color: "bg-yellow-500" },
  { value: "completed", label: "Completed", color: "bg-green-500" },
  { value: "cancelled", label: "Cancelled", color: "bg-red-500" },
];

export const TASK_PRIORITY_OPTIONS: TaskPriorityOption[] = [
  { value: "low", label: "Low", color: "bg-green-100 text-green-800 border-green-200" },
  { value: "medium", label: "Medium", color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  { value: "high", label: "High", color: "bg-red-100 text-red-800 border-red-200" },
];

export const TASK_CATEGORIES: TaskCategory[] = [
  { value: "Kanvasing", label: "Kanvasing" },
  { value: "Followup", label: "Follow Up" },
  { value: "Penawaran", label: "Penawaran" },
  { value: "Lainnya", label: "Lainnya" },
];

export const RESULT_TYPES: ResultType[] = [
  {
    value: "meeting",
    label: "Meeting",
    icon: Calendar,
    color: "bg-blue-500 text-white",
    bgColor: "bg-blue-100",
    textColor: "text-blue-800"
  },
  {
    value: "call",
    label: "Phone Call",
    icon: Phone,
    color: "bg-green-500 text-white",
    bgColor: "bg-green-100",
    textColor: "text-green-800"
  },
  {
    value: "email",
    label: "Email",
    icon: Mail,
    color: "bg-purple-500 text-white",
    bgColor: "bg-purple-100",
    textColor: "text-purple-800"
  },
  {
    value: "visit",
    label: "Site Visit",
    icon: MapPin,
    color: "bg-orange-500 text-white",
    bgColor: "bg-orange-100",
    textColor: "text-orange-800"
  },
  {
    value: "note",
    label: "General Note",
    icon: FileText,
    color: "bg-gray-500 text-white",
    bgColor: "bg-gray-100",
    textColor: "text-gray-800"
  }
];

// Task API Endpoints
export const TASK_API_ENDPOINTS = {
  TASKS: 'http://localhost:5000/api/tasks',
  TASK_COMMENTS: (taskId: string) => `http://localhost:5000/api/tasks/${taskId}/comments`,
  TASK_RESULTS: (taskId: any) => `http://localhost:5000/api/tasks/${taskId}/results`,
  UPDATE_STATUS: (taskId: string) => `http://localhost:5000/api/tasks/${taskId}/updateStatus`,
  COMMENT_UPDATE: (commentId: string) => `http://localhost:5000/api/tasks/task-comments/${commentId}`,
  RESULT_UPDATE: (resultId: string) => `http://localhost:5000/api/tasks/task-results/${resultId}`,
  TASK_ATTACHMENTS: (taskId: string) => `http://localhost:5000/api/tasks/${taskId}/attachments`,
  ATTACHMENT_DOWNLOAD: (attachmentId: string) => `http://localhost:5000/api/tasks/attachments/${attachmentId}/download`,
  ATTACHMENT_VIEW: (attachmentId: string) => `http://localhost:5000/api/tasks/attachments/${attachmentId}/view`,
  ATTACHMENT_DELETE: (attachmentId: string) => `http://localhost:5000/api/tasks/attachments/${attachmentId}`,
  ADD_RESULT_WITH_ATTACHMENTS: (taskId: string) => `http://localhost:5000/api/tasks/${taskId}/results/with-attachments`,
} as const;

export const TASK_STATUS_COLORS = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  completed: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
} as const;

export const TASK_PRIORITY_COLORS = {
  low: "bg-green-100 text-green-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-red-100 text-red-800",
} as const;

export const DEFAULT_TASK_VALUES = {
  status: 'pending',
  priority: 'medium',
  category: 'Lainnya',
  result_type: 'note'
} as const;

export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
};

export const makeAuthenticatedRequest = async (url: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };

  return fetch(url, {
    ...options,
    headers,
    mode: 'cors',
  });
};

export const safeString = (value: any): string => {
  if (value === null || value === undefined) return '';
  return String(value);
};

export const getFirstChar = (value: any, fallback: string = ''): string => {
  const str = safeString(value);
  return str.length > 0 ? str.charAt(0).toUpperCase() : fallback;
};

export const displayValue = (value: any, fallback: string = 'Not specified'): string => {
  const str = safeString(value);
  return str.length > 0 ? str : fallback;
};

export const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  } catch {
    return 'Unknown date';
  }
};

export const getTaskStatusInfo = (status: string) => {
  return TASK_STATUS_OPTIONS.find(s => s.value === status) || TASK_STATUS_OPTIONS[0];
};

export const getTaskPriorityInfo = (priority: string) => {
  return TASK_PRIORITY_OPTIONS.find(p => p.value === priority) || TASK_PRIORITY_OPTIONS[1];
};

export const getResultTypeInfo = (type: string) => {
  return RESULT_TYPES.find(t => t.value === type) || RESULT_TYPES[4];
};

export const isTaskOverdue = (dueDate: string, status: string): boolean => {
  return new Date(dueDate) < new Date() && status !== 'completed';
};

export const getTaskCompletionPercentage = (status: string): number => {
  switch (status) {
    case 'completed': return 100;
    case 'pending': return 0;
    case 'cancelled': return 0;
    default: return 0;
  }
};