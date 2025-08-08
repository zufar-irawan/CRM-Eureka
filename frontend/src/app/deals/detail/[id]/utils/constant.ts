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

// Deal stages - sesuai dengan deals controller
export const DEAL_STAGES: StatusOption[] = [
  { name: "Proposal", color: "bg-blue-500", backendStage: "proposal" },
  { name: "Negotiation", color: "bg-orange-500", backendStage: "negotiation" },
  { name: "Won", color: "bg-green-500", backendStage: "won" },
  { name: "Lost", color: "bg-red-500", backendStage: "lost" },
  { name: "Qualified", color: "bg-purple-500", backendStage: "qualified" },
];

// Status yang digunakan di form dan tampilan leads
export const STATUS_OPTIONS: StatusOption[] = [
  { name: "New", color: "bg-gray-500", backendStage: "New" },
  { name: "Contacted", color: "bg-orange-500", backendStage: "Contacted" },
  { name: "Qualification", color: "bg-green-500", backendStage: "Qualification" },
  { name: "Unqualified", color: "bg-red-500", backendStage: "Unqualified" },
  { name: "Converted", color: "bg-purple-500", backendStage: "Converted" },
];

// Tab navigasi pada halaman detail lead/deal
export const TABS: TabConfig[] = [
  { name: "Activity", icon: BarChart3 },
  { name: "Emails", icon: Mail },
  { name: "Comments", icon: MessageSquare },
  { name: "Data", icon: Database },
  { name: "Calls", icon: Phone },
  { name: "Tasks", icon: CheckSquare },
  { name: "Notes", icon: StickyNote },
  { name: "Attachments", icon: Paperclip },
];

// Endpoint API yang digunakan di seluruh aplikasi
export const API_ENDPOINTS = {
  LEADS: 'http://localhost:5000/api/leads',
  DEALS: 'http://localhost:5000/api/deals',
  AUTH_ME: 'http://localhost:5000/api/auth/me',
  USERS: 'http://localhost:5000/api/users',
  USERS_WITH_ROLES: 'http://localhost:5000/api/users/with-roles',
  TASKS: 'http://localhost:5000/api/tasks',
  CONTACTS: 'http://localhost:5000/api/contacts',
  COMPANIES: 'http://localhost:5000/api/companies',
} as const;

// Data fallback user sesuai dengan SQL database (7 users dari id 1-7)
export const FALLBACK_USERS = [
  { 
    id: 1, 
    name: 'Admin User', 
    email: 'admin@eureka.com', 
    role: 'admin', 
    roleNames: ['admin'],
    primaryRole: 'admin',
    isAdmin: true,
    isSales: false,
    isPartnership: false,
    isAkunting: false
  },
  { 
    id: 2, 
    name: 'Sales One', 
    email: 'sales1@eureka.com', 
    role: 'sales', 
    roleNames: ['sales'],
    primaryRole: 'sales',
    isAdmin: false,
    isSales: true,
    isPartnership: false,
    isAkunting: false
  },
  { 
    id: 3, 
    name: 'Partnership One', 
    email: 'partner1@eureka.com', 
    role: 'partnership', 
    roleNames: ['partnership'],
    primaryRole: 'partnership',
    isAdmin: false,
    isSales: false,
    isPartnership: true,
    isAkunting: false
  },
  { 
    id: 4, 
    name: 'Akunting One', 
    email: 'finance1@eureka.com', 
    role: 'akunting', 
    roleNames: ['akunting'],
    primaryRole: 'akunting',
    isAdmin: false,
    isSales: false,
    isPartnership: false,
    isAkunting: true
  },
  { 
    id: 5, 
    name: 'Sales Two', 
    email: 'sales2@eureka.com', 
    role: 'user', 
    roleNames: [],
    primaryRole: 'user',
    isAdmin: false,
    isSales: false,
    isPartnership: false,
    isAkunting: false
  },
  { 
    id: 6, 
    name: 'GL One', 
    email: 'gl1@eureka.com', 
    role: 'user', 
    roleNames: [],
    primaryRole: 'user',
    isAdmin: false,
    isSales: false,
    isPartnership: false,
    isAkunting: false
  },
  { 
    id: 7, 
    name: 'ASM One', 
    email: 'asm1@eureka.com', 
    role: 'user', 
    roleNames: [],
    primaryRole: 'user',
    isAdmin: false,
    isSales: false,
    isPartnership: false,
    isAkunting: false
  },
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

// Mapping tahap deals dari frontend ke backend
export const DEAL_STAGE_MAPPING: { [key: string]: string } = {
  'Proposal': 'proposal',
  'Negotiation': 'negotiation',
  'Won': 'won',
  'Lost': 'lost',
  'Qualified': 'qualified',
};

// Maksimum level reply untuk komentar (threaded)
export const MAX_REPLY_DEPTH = 5;