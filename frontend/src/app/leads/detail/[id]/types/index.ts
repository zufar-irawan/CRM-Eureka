// types/index.ts
export interface Lead {
  id: string | number;
  title?: string | null;
  fullname?: string | null;
  company?: string | null;
  email?: string | null;
  mobile?: string | null;
  industry?: string | null;
  job_position?: string | null;
  website?: string | null;
  owner?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  stage?: string | null;
  updated_at?: string | null;
  status?: boolean;
}

// Updated types.ts untuk support nested comments
export interface Comment {
  id: number;
  lead_id: number;
  parent_id: number | null;         // NEW: Parent comment ID
  reply_level: number;              // NEW: Nesting level
  user_id: number | null;
  user_name: string | null;
  message: string;
  created_at: string;
  replies?: Comment[];              // NEW: Nested replies
  is_reply?: boolean;               // NEW: Helper flag
  parent_user?: string | null;      // NEW: Parent comment user name
}

// NEW: Task interfaces
export interface Task {
  id: number;
  lead_id: number;
  assigned_to: number;
  assigned_user_name?: string;
  title: string;
  description?: string;
  category: string;
  due_date: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface TaskStats {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
}

export interface CommentStats {
  total_comments: number;
  top_level_comments: number;
  total_replies: number;
}

export interface CommentResponse {
  comments: Comment[];
  stats: CommentStats;
}

export interface CommentThread {
  thread: Comment;
  stats: {
    total_comments: number;
    replies_count: number;
  };
}

// Updated request interfaces
export interface AddCommentRequest {
  message: string;
  user_id?: number;
  user_name?: string;
  parent_id?: number;               // NEW: For replies
}

export interface ReplyToCommentRequest extends AddCommentRequest {
  parent_id: number;                // Required for replies
}

// Helper interfaces for frontend state
export interface CommentFormState {
  message: string;
  submitting: boolean;
  parentId?: number;
}

export interface ReplyState {
  [commentId: number]: {
    message: string;
    submitting: boolean;
    visible: boolean;
  };
}

export interface CurrentUser {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role?: string;
}

export interface StatusOption {
  name: string;
  color: string;
  backendStage: string;
}

export interface TabConfig {
  name: string;
  icon: any; // LucideIcon type
}

export interface SubmittingState {
  [key: number]: boolean;
}

export interface DropdownState {
  [key: number]: boolean;
}

export interface RecipientsState {
  [key: number]: User[];
}

export interface ToFieldsState {
  [key: number]: string;
}