import {
  BarChart3,
  Mail,
  MessageSquare,
  Database,
  Phone,
  CheckSquare,
  StickyNote,
  Paperclip,
} from "lucide-react";

import type { StatusOption, TabConfig } from "../types";

// Status yang digunakan di form dan tampilan leads
export const STATUS_OPTIONS: StatusOption[] = [
  { name: "New", color: "bg-gray-500", backendStage: "New" },
  { name: "Contacted", color: "bg-orange-500", backendStage: "Contacted" },
  { name: "Qualification", color: "bg-green-500", backendStage: "Qualification" },
  { name: "Unqualified", color: "bg-red-500", backendStage: "Unqualified" },
  { name: "Converted", color: "bg-purple-500", backendStage: "Converted" },
];

// Tab navigasi pada halaman detail lead
export const TABS: TabConfig[] = [
  { name: "Activity", icon: BarChart3 },
  { name: "Comments", icon: MessageSquare },
  { name: "Tasks", icon: CheckSquare },
  //{ name: "Attachments", icon: Paperclip, disabled: true },
];

// Endpoint API yang digunakan di seluruh aplikasi
export const API_ENDPOINTS = {
  LEADS: 'http://localhost:5000/api/leads',
  AUTH_ME: 'http://localhost:5000/api/auth/me',
  USERS: 'http://localhost:5000/api/users',
  USERS_WITH_ROLES: 'http://localhost:5000/api/users/with-roles',
  TASKS: 'http://localhost:5000/api/tasks',
} as const;

// Data fallback user sesuai dengan SQL database (7 users dari id 1-7)
export const FALLBACK_USERS = [
  { id: 1, name: 'Admin User', email: 'admin@eureka.com', role: 'admin', roleNames: ['admin'] },
  { id: 2, name: 'Sales One', email: 'sales1@eureka.com', role: 'sales', roleNames: ['sales'] },
  { id: 3, name: 'Partnership One', email: 'partner1@eureka.com', role: 'partnership', roleNames: ['partnership'] },
  { id: 4, name: 'Akunting One', email: 'finance1@eureka.com', role: 'akunting', roleNames: ['akunting'] },
  { id: 5, name: 'Sales Two', email: 'sales2@eureka.com', role: 'user', roleNames: [] },
  { id: 6, name: 'GL One', email: 'gl1@eureka.com', role: 'user', roleNames: [] },
  { id: 7, name: 'ASM One', email: 'asm1@eureka.com', role: 'user', roleNames: [] },
];

// Role mapping sesuai dengan database
export const ROLE_MAPPING = {
  1: 'admin',
  2: 'sales', 
  3: 'partnership',
  4: 'akunting'
};

// User role assignments sesuai dengan user_roles table
export const USER_ROLE_ASSIGNMENTS = {
  1: [1], // Admin User -> admin role
  2: [2], // Sales One -> sales role  
  3: [3], // Partnership One -> partnership role
  4: [4], // Akunting One -> akunting role
  // Users 5,6,7 tidak punya role khusus
};

// Mapping tahap leads dari frontend ke backend
export const STAGE_MAPPING: { [key: string]: string } = {
  'New': 'New',
  'Contacted': 'Contacted',
  'Qualification': 'Qualification',
  'Unqualified': 'Unqualified',
  'Converted': 'Converted',
};

// Maksimum level reply untuk komentar (threaded)
export const MAX_REPLY_DEPTH = 5;