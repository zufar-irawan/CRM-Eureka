// types.ts - Type definitions for deals, users, comments, contacts, companies, and UI config

import { LucideIcon } from "lucide-react"; // ⬅️ Wajib untuk TabConfig

// -------------------- USERS --------------------

export interface CurrentUser {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar?: string; // ✅ Ditambahkan agar bisa digunakan di useAuth
}

export interface User {
  id: number;
  name: string;
  email: string;
  role?: string;
}

// -------------------- COMMENTS --------------------

export interface Comment {
  id: number;
  message: string;
  user_id: number;
  user_name: string;
  created_at: string;
  parent_id: number | null;
  parent_user: string | null;
  replies: Comment[];
  deal_id?: number;
  lead_id?: number;
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
  phone?: string;   // ✅ Ditambahkan agar bisa diakses oleh OrganizationDetails.tsx
  mobile?: string;
  industry?: string;
}

// -------------------- DEAL --------------------

export interface Deal {
  id: string;
  title: string;
  value: number;
  stage: string;
  probability: number;
  lead: Lead | null;
  company: Company | null;
  contact: Contact | null;
  creator: {
    id: number;
    name: string;
  } | null;
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
