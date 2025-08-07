export interface Deal {
  id: string | number;
  title?: string | null;
  value?: number | null;
  stage?: string | null;
  probability?: number | null;
  lead?: {
    id?: number;
    company?: string | null;
    fullname?: string | null;
    email?: string | null;
    phone?: string | null;
    industry?: string | null;
  } | null;
  company?: {
    id?: number;
    name?: string | null;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
  } | null;
  contact?: {
    id?: number;
    name?: string | null;
    email?: string | null;
    phone?: string | null;
    position?: string | null;
    company?: {
      id?: number;
      name?: string | null;
    } | null;
  } | null;
  creator?: {
    name?: string | null;
    email?: string | null;
  } | null;
  created_at?: string | null;
  updated_at?: string | null;
  description?: string | null;
  comments?: Comment[] | null;
}

export interface Contact {
  id: number;
  name: string;
  email?: string | null;
  phone?: string | null;
  position?: string | null;
  company_id?: number | null;
  company?: {
    id: number;
    name: string;
  } | null;
  created_at?: string;
}

export interface Comment {
  id: string;
  text: string;
  author: string;
  created_at: string;
}

export interface Company {
  id: number;
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
}