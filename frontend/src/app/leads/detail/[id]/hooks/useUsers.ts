// hooks/useUsers.ts
import { useState, useEffect } from 'react';
import type { User } from '../types';
import { makeAuthenticatedRequest } from '../utils/auth';
import { API_ENDPOINTS, FALLBACK_USERS } from '../utils/constants';

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async (limit: number = 50) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await makeAuthenticatedRequest(`${API_ENDPOINTS.USERS_WITH_ROLES}?limit=${limit}`);
      
      if (response.ok) {
        const result = await response.json();
        const userData = result.data || result;
        
        // Ensure we have array of users
        if (Array.isArray(userData)) {
          const formattedUsers = userData.map(user => ({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.primaryRole || user.role || 'user',
            roles: user.roles || [],
            roleNames: user.roleNames || [],
            primaryRole: user.primaryRole || user.role || 'user'
          }));
          
          setUsers(formattedUsers);
          console.log('✅ Users fetched successfully:', formattedUsers.length);
        } else {
          throw new Error('Invalid response format');
        }
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.warn('Error fetching users from API, using fallback:', error);
      
      // Fallback to local users
      const fallbackUsers = FALLBACK_USERS.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        roleNames: user.roleNames,
        primaryRole: user.role
      }));
      
      setUsers(fallbackUsers);
      setError('Using offline user data');
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-fetch on mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const getUserById = (userId: number | string): User | null => {
    return users.find(user => user.id.toString() === userId.toString()) || null;
  };

  const getUsersWithRole = (roleName: string): User[] => {
    return users.filter(user => 
      user.roleNames?.includes(roleName) || 
      user.role === roleName ||
      user.primaryRole === roleName
    );
  };

  const refreshUsers = () => {
    fetchUsers();
  };

  return {
    users,
    isLoading,
    error,
    fetchUsers,
    getUserById,
    getUsersWithRole,
    refreshUsers
  };
};