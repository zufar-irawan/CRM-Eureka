// hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { CurrentUser } from '../types';
import { getCurrentUserFromStorage, makeAuthenticatedRequest, getAuthToken } from '../utils/auth';
import { API_ENDPOINTS, FALLBACK_USERS } from '../utils/constants';

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

      const result = await response.json();
      const userData = result.data || result; 
      
      // Format user data with role information
      const formattedUser = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.primaryRole || userData.role || 'user',
        roles: userData.roles || [],
        roleNames: userData.roleNames || [],
        primaryRole: userData.primaryRole || userData.role || 'user',
        avatar: userData.avatar,
        // Permission flags
        isAdmin: userData.isAdmin || false,
        isSales: userData.isSales || false,
        isPartnership: userData.isPartnership || false,
        isAkunting: userData.isAkunting || false
      };
      
      const userToStore = JSON.stringify(formattedUser);
      localStorage.setItem('currentUser', userToStore);
      
      return formattedUser;
    } catch (error) {
      console.error('Error fetching current user from API:', error);
      return null;
    }
  };

  const refreshUser = async (): Promise<CurrentUser | null> => {
    try {
      const response = await makeAuthenticatedRequest(`${API_ENDPOINTS.AUTH_ME.replace('/me', '/refresh')}`, {
        method: 'POST'
      });

      if (response.ok) {
        const result = await response.json();
        const userData = result.data || result;
        if (result.token) {
          localStorage.setItem('authToken', result.token);
        }

        const formattedUser = {
          id: userData.id,
          name: userData.name,
          email: userData.email,
          role: userData.primaryRole || userData.role || 'user',
          roles: userData.roles || [],
          roleNames: userData.roleNames || [],
          primaryRole: userData.primaryRole || userData.role || 'user',
          avatar: userData.avatar,
          isAdmin: userData.isAdmin || false,
          isSales: userData.isSales || false,
          isPartnership: userData.isPartnership || false,
          isAkunting: userData.isAkunting || false
        };

        const userToStore = JSON.stringify(formattedUser);
        localStorage.setItem('currentUser', userToStore);
        
        setCurrentUser(formattedUser);
        return formattedUser;
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
    return null;
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('currentUser');
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('currentUser');
    setCurrentUser(null);
    router.push('/login');
  };

  const hasRole = (role: string): boolean => {
    if (!currentUser) return false;
    return currentUser.roleNames?.includes(role) || currentUser.role === role || false;
  };

  const hasAnyRole = (roles: string[]): boolean => {
    if (!currentUser) return false;
    return roles.some(role => hasRole(role));
  };

  const canAccess = (requiredRoles: string[]): boolean => {
    if (!currentUser) return false;
    if (hasRole('admin')) return true; // Admin can access everything
    return hasAnyRole(requiredRoles);
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
          role: user.primaryRole || user.role || 'user',
          roles: user.roles || [],
          roleNames: user.roleNames || [],
          primaryRole: user.primaryRole || user.role || 'user',
          avatar: user.avatar,
          isAdmin: user.isAdmin || false,
          isSales: user.isSales || false,
          isPartnership: user.isPartnership || false,
          isAkunting: user.isAkunting || false
        });
      } else {
        // Fallback for development/testing - use first fallback user (Admin)
        console.warn('No user data found, using fallback admin user');
        const fallbackUser = FALLBACK_USERS[0]; // Admin User
        setCurrentUser({
          id: fallbackUser.id,
          name: fallbackUser.name,
          email: fallbackUser.email,
          role: fallbackUser.role,
          roles: [],
          roleNames: fallbackUser.roleNames,
          primaryRole: fallbackUser.role,
          isAdmin: fallbackUser.role === 'admin',
          isSales: fallbackUser.role === 'sales',
          isPartnership: fallbackUser.role === 'partnership',
          isAkunting: fallbackUser.role === 'akunting'
        });
      }
      
      setUserLoading(false);
    };

    initializeUser();
  }, [router]);

  return { 
    currentUser, 
    userLoading, 
    refreshUser, 
    logout, 
    hasRole, 
    hasAnyRole, 
    canAccess 
  };
};