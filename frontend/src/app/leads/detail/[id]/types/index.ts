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

export interface Comment {
  id: number;
  lead_id: number;
  user_id?: number;
  user_name?: string;
  message: string;
  created_at: string;
  parent_id?: number | null;
  replies?: Comment[];
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

export interface ReplyState {
  [key: number]: string;
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