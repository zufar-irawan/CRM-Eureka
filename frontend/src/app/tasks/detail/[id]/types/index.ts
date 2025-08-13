// types/index.ts - Task Detail Types
export interface Task {
  id: number;
  lead_id: number;
  assigned_to: number;
  assigned_user_name?: string;
  created_by_name?: string;       
  created_by_user_name?: string;
  title: string;
  description?: string;
  category: string;
  due_date: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
  // Relations
  assignee?: User;
  comments?: TaskComment[];
  results?: TaskResult[];
}

export interface TaskComment {
  id: number;
  task_id: number;
  comment_text: string;
  commented_by: number | null;
  commented_by_name?: string;
  commented_at: string;
  created_at: string;
  updated_at: string;
}

export interface TaskResult {
  id: number | string;  // Updated to accept both number and string
  task_id: number;
  result_text: string;
  result_type: 'meeting' | 'call' | 'email' | 'visit' | 'note';
  result_date: string;
  created_by: number | null;
  created_by_name?: string;
  created_at: string;
  updated_at: string;
}

export interface CurrentUser {
  id: number;
  name: string;
  email: string;
  role: string;
  roles?: Role[];
  roleNames?: string[];
  primaryRole?: string;
  avatar?: string;
  isAdmin?: boolean;
  isSales?: boolean;
  isPartnership?: boolean;
  isAkunting?: boolean;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role?: string;
  roles?: Role[];
  roleNames?: string[];
  primaryRole?: string;
  created_at?: string;
}

export interface Role {
  id: number;
  name: string;
}

export interface TaskStatusOption {
  value: string;
  label: string;
  color: string;
}

export interface TaskPriorityOption {
  value: string;
  label: string;
  color: string;
}

export interface TaskCategory {
  value: string;
  label: string;
}

export interface ResultType {
  value: string;
  label: string;
  icon: any;
  color: string;
  bgColor: string;
  textColor: string;
}

export interface TaskCommentForm {
  comment_text: string;
  commented_by?: number;
  commented_by_name?: string;
}

export interface TaskResultForm {
  result_text: string;
  result_type: string;
  created_by?: number;
  created_by_name?: string;
}

export interface TaskDetailResponse {
  success: boolean;
  data: Task;
  message?: string;
}

export interface TaskCommentsResponse {
  success: boolean;
  data: TaskComment[];
  message?: string;
}

export interface TaskResultsResponse {
  success: boolean;
  data: TaskResult[];
  message?: string;
}

export interface TaskHeaderProps {
  task: Task | null;
  isLoading: boolean;
  onTaskUpdate: () => void;
  onStatusChange: (taskId: number, status: string) => Promise<void>;
  onAssignmentChange: (taskId: number, userId: number) => Promise<void>;
}

export interface TaskSidebarProps {
  task: Task | null;
  currentUser: CurrentUser | null;
}

export interface TaskCommentsTabProps {
  taskId: number | string | undefined; 
  currentUser: CurrentUser | null;
}

export interface TaskResultsTabProps {
  taskId: number | string | undefined;  // Updated to accept both types
  currentUser: CurrentUser | null;
}

// Utility type for API responses that might return string IDs
export type ApiResponseWithStringIds<T> = {
  success: boolean;
  data: T;
  message?: string;
};

// Type guard for checking number IDs
export function isNumberId(id: unknown): id is number {
  return typeof id === 'number';
}

// Conversion utility
export function ensureNumberId(id: number | string): number {
  return typeof id === 'string' ? parseInt(id, 10) : id;
}