// types.ts - Type definitions for deals, users, comments, contacts, companies, and UI config

import { LucideIcon } from "lucide-react";

// -------------------- USERS --------------------

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

// Role interfaces sesuai dengan SQL structure
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

// -------------------- COMMENTS --------------------

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

// NEW: Task interfaces
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

// -------------------- COMPANY --------------------

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

// -------------------- CONTACT --------------------

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

// -------------------- LEAD --------------------

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
  owner?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  stage?: string | null;
  updated_at?: string | null;
  status?: boolean;
}

// -------------------- DEAL --------------------

export interface Deal {
  id: string;
  title: string;
  value: number;
  stage: string;
  probability?: number;
  owner?: number;
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
  created_by?: number;
  created_at: string;
  updated_at: string;
  description?: string;
  comments?: Comment[];
}

// -------------------- UI CONFIG TYPES --------------------

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

// Interface untuk response API users dengan roles
export interface UserWithRolesResponse {
  message: string;
  data: User[];
  total: number;
}

// Interface untuk user search dan selection
export interface UserSearchResult {
  users: User[];
  total: number;
  filtered: User[];
}