// hooks/useUsers.ts
import { useState, useEffect } from 'react';
import type { User } from '../types';
import { makeAuthenticatedRequest } from '../utils/auth';
import { API_ENDPOINTS, FALLBACK_USERS } from '../utils/constant';

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await makeAuthenticatedRequest(API_ENDPOINTS.USERS_WITH_ROLES);

      if (response.ok) {
        const data = await response.json();
        
        const userData = data.data || data;
        
        if (Array.isArray(userData) && userData.length > 0) {
          const processedUsers = userData.map(user => ({
            ...user,
            roleNames: user.roleNames || user.roles?.map((role: any) => role.name) || [],
            primaryRole: user.primaryRole || user.role || 'user'
          }));
          
          setUsers(processedUsers);
          console.log('Users loaded from API:', processedUsers.length);
        } else {
          console.warn('No users from API, using fallback');
          setUsers(FALLBACK_USERS);
        }
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      
      // Use fallback users on error
      console.warn('⚠️ Using fallback users due to API error');
      setUsers(FALLBACK_USERS);
      setError(error instanceof Error ? error.message : 'Failed to fetch users');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const refreshUsers = () => {
    fetchUsers();
  };

  const getUserById = (id: number): User | undefined => {
    return users.find(user => user.id === id);
  };

  const getUsersByRole = (role: string): User[] => {
    return users.filter(user => 
      user.roleNames?.includes(role) || 
      user.primaryRole === role || 
      user.role === role
    );
  };

  return {
    users,
    isLoading,
    error,
    refreshUsers,
    getUserById,
    getUsersByRole,
    totalUsers: users.length
  };
};