export interface Comment {
  id: number;
  task_id: number;
  parent_id: number | null;       
  reply_level: number;             
  user_id: number | null;
  user_name: string | null;
  message: string;
  created_at: string;
  replies?: Comment[];             
  is_reply?: boolean;              
  parent_user?: string | null;      
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  // Add other task properties as needed
}
export interface Role {
  id: number;
  name: string;
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