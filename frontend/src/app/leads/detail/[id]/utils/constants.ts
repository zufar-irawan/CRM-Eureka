// utils/constants.ts
import {
  BarChart3,
  Mail,
  MessageSquare,
  Database,
  Phone,
  CheckSquare,
  StickyNote,
  Paperclip
} from "lucide-react";

import type { StatusOption, TabConfig } from "../types";

export const STATUS_OPTIONS: StatusOption[] = [
  { name: "New", color: "bg-gray-500", backendStage: "New" },
  { name: "Contacted", color: "bg-orange-500", backendStage: "Contacted" },
  { name: "Qualification", color: "bg-green-500", backendStage: "Qualification" },
  { name: "Unqualified", color: "bg-red-500", backendStage: "Unqualified" },
  { name: "Converted", color: "bg-purple-500", backendStage: "Converted" }
];

export const TABS: TabConfig[] = [
  { name: "Activity", icon: BarChart3 },
  { name: "Emails", icon: Mail },
  { name: "Comments", icon: MessageSquare },
  { name: "Data", icon: Database },
  { name: "Calls", icon: Phone },
  { name: "Tasks", icon: CheckSquare },
  { name: "Notes", icon: StickyNote },
  { name: "Attachments", icon: Paperclip }
];

export const API_ENDPOINTS = {
  LEADS: 'http://localhost:5000/api/leads',
  AUTH_ME: 'http://localhost:5000/api/auth/me',
  USERS: 'http://localhost:5000/api/users',
} as const;

export const FALLBACK_USERS = [
  { id: 1, name: 'Admin User', email: 'admin@eureka.com', role: 'admin' },
  { id: 2, name: 'Sales One', email: 'sales1@eureka.com', role: 'sales' },
  { id: 3, name: 'Partnership One', email: 'partner1@eureka.com', role: 'partnership' },
];

export const STAGE_MAPPING: { [key: string]: string } = {
  'New': 'New',
  'Contacted': 'Contacted',
  'Qualification': 'Qualification',
  'Unqualified': 'Unqualified',
  'Converted': 'Converted'
};

export const MAX_REPLY_DEPTH = 5;