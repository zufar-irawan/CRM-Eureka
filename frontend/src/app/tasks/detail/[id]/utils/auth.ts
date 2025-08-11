import type { CurrentUser } from "../types";

export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
};

export const getCurrentUserFromStorage = (): CurrentUser | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    const userData = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
    if (userData) {
      return JSON.parse(userData);
    }
  } catch (error) {
    console.error('Error parsing stored user data:', error);
  }
  return null;
};

export const makeAuthenticatedRequest = async (url: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };

  return fetch(url, {
    ...options,
    headers,
    mode: 'cors',
  });
};