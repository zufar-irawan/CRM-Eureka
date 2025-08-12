// types.ts - Updated type definitions with user assignment support
import { LucideIcon } from "lucide-react";

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

export interface UserRole {
  user_id: number;
  role_id: number;
  user?: User;
  role?: Role;
}

export interface Comment {
  id: number;
  deal_id?: number;
  lead_id?: number;
  parent_id: number | null;
  reply_level: number;
  user_id: number;
  user_name: string;
  message: string;
  created_at: string;
  replies?: Comment[];
  is_reply?: boolean;
  parent_user?: string | null;
  user?: {
    id: number;
    name: string;
    email?: string;
  };
}

export interface Task {
  id: number;
  lead_id?: number;
  deal_id?: number;
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
  success: boolean;
  data: Comment[];
  stats?: CommentStats;
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
  parent_id?: number;
}

export interface ReplyToCommentRequest extends AddCommentRequest {
  parent_id: number;
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

export interface Company {
  id: number;
  name: string;
  industry?: string;
  website?: string;
  address?: string;
  email?: string;
  phone?: string;
  created_at?: string;
}

export interface Contact {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  position?: string;
  company_id?: number;
  company?: {
    id: number;
    name: string;
  } | null;
  created_at?: string;
}

export interface Lead {
  id?: number;
  company?: string;
  fullname?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  industry?: string;
  job_position?: string;
  website?: string;
  owner?: string | number | null; 
  first_name?: string | null;
  last_name?: string | null;
  stage?: string | null;
  updated_at?: string | null;
  status?: boolean;
  title?: string;
}

export interface Deal {
  id: string;
  title: string;
  value: number;
  stage: string;
  probability?: number;
  owner?: number | null; 
  lead_id?: number | null;
  id_contact?: number | null;
  id_company?: number | null;
  lead?: Lead | null;
  company?: Company | null;
  contact?: Contact | null;
  creator?: {
    id: number;
    name: string;
    email?: string;
  } | null;
  assigned_user?: User | null;
  created_by?: number;
  created_at: string;
  updated_at: string;
  description?: string;
  comments?: Comment[];
}

export interface StatusOption {
  name: string;
  color: string;
  backendStage: string;
}

export interface TabConfig {
  name: string;
  icon: LucideIcon;
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

export interface UserWithRolesResponse {
  message: string;
  data: User[];
  total: number;
}

export interface UserSearchResult {
  users: User[];
  total: number;
  filtered: User[];
}

export interface AssignmentRequest {
  owner: number;
}

export interface AssignmentResponse {
  success: boolean;
  data: Deal | Lead;
  message: string;
}