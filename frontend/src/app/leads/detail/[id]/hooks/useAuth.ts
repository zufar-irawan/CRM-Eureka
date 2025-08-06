// hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { CurrentUser } from '../types';
import { getCurrentUserFromStorage, makeAuthenticatedRequest, getAuthToken } from '../utils/auth';
import { API_ENDPOINTS } from '../utils/constants';

export const useAuth = () => {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [userLoading, setUserLoading] = useState(true);

  const fetchCurrentUserFromAPI = async (): Promise<CurrentUser | null> => {
    const token = getAuthToken();
    if (!token) return null;

    try {
      const response = await makeAuthenticatedRequest(API_ENDPOINTS.AUTH_ME);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const userData = await response.json();
      
      const userToStore = JSON.stringify(userData);
      localStorage.setItem('currentUser', userToStore);
      
      return userData;
    } catch (error) {
      console.error('Error fetching current user from API:', error);
      return null;
    }
  };

  useEffect(() => {
    const initializeUser = async () => {
      setUserLoading(true);
      
      // First try to get user from storage
      let user = getCurrentUserFromStorage();
      
      // If no user in storage or token exists, try to fetch from API
      if (!user || getAuthToken()) {
        const apiUser = await fetchCurrentUserFromAPI();
        if (apiUser) {
          user = apiUser;
        }
      }
      
      // If still no user, check if we have a token but failed API call
      if (!user && getAuthToken()) {
        console.warn('Authentication token exists but failed to fetch user data');
      }
      
      // Set user or fallback
      if (user) {
        setCurrentUser({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role || 'user',
          avatar: user.avatar
        });
      } else {
        // Fallback for development/testing
        console.warn('No user data found, using fallback user');
        setCurrentUser({
          id: 1,
          name: 'Admin User',
          email: 'admin@eureka.com',
          role: 'admin'
        });
      }
      
      setUserLoading(false);
    };

    initializeUser();
  }, [router]);

  return { currentUser, userLoading };
};