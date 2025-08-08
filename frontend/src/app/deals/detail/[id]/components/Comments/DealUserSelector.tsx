// DealUserSelector.tsx - Updated to match UserSelector.tsx design
"use client";

import { useState, useEffect, useRef } from 'react';
import type { User } from '../../types';
import { getFirstChar } from '../../utils/formatting';
import { makeAuthenticatedRequest } from '../../utils/auth';
import { API_ENDPOINTS, FALLBACK_USERS } from '../../utils/constant';
import { Search, X, UserCheck, Users } from 'lucide-react';

interface DealUserSelectorProps {
  show: boolean;
  onClose: () => void;
  onUserSelect: (user: User) => void;
  searchTerm: string;
  selectedUsers?: User[];
  placeholder?: string;
  maxHeight?: string;
}

export default function DealUserSelector({
  show,
  onClose,
  onUserSelect,
  searchTerm,
  selectedUsers = [],
  placeholder = "Search users by name or email...",
  maxHeight = "max-h-80"
}: DealUserSelectorProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch users with roles on component mount
  useEffect(() => {
    const fetchUsersWithRoles = async () => {
      setLoading(true);
      setError(null);

      try {
        // Try to fetch from API with roles
        const response = await makeAuthenticatedRequest(API_ENDPOINTS.USERS_WITH_ROLES);

        if (response.ok) {
          const data = await response.json();
          const usersList = Array.isArray(data.data) ? data.data : [];
          setUsers(usersList);
          console.log('Successfully loaded users with roles from API:', usersList.length, 'users');
        } else if (response.status === 401) {
          console.log('API authentication failed, using fallback users');
          setUsers(FALLBACK_USERS);
        } else {
          // Try regular users endpoint as fallback
          console.log(`Users with roles API returned ${response.status}, trying regular users endpoint`);
          const fallbackResponse = await makeAuthenticatedRequest(API_ENDPOINTS.USERS);
          
          if (fallbackResponse.ok) {
            const fallbackData = await fallbackResponse.json();
            const fallbackUsersList: User[] = Array.isArray(fallbackData.data) ? fallbackData.data : [];
            // Add role information from fallback data
            const usersWithRoles = fallbackUsersList.map(user => ({
              ...user,
              role: undefined,
              roleNames: [],
              primaryRole: undefined
            }));
            setUsers(usersWithRoles);
          } else {
            setUsers(FALLBACK_USERS);
          }
        }
      } catch (error) {
        console.log('Failed to fetch users from API, using fallback users:', error);
        setUsers(FALLBACK_USERS);
      } finally {
        setLoading(false);
      }
    };

    if (show && users.length === 0) {
      fetchUsersWithRoles();
    }
  }, [show]);

  // Filter users based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredUsers(users);
      return;
    }

    const searchLower = searchTerm.toLowerCase();
    const filtered = users.filter(user => {
      const nameMatch = user.name.toLowerCase().includes(searchLower);
      const emailMatch = user.email.toLowerCase().includes(searchLower);
      const roleMatch = user.primaryRole && user.primaryRole.toLowerCase().includes(searchLower);
      const roleNamesMatch = user.roleNames && user.roleNames.some(role => 
        role.toLowerCase().includes(searchLower)
      );
      
      return nameMatch || emailMatch || roleMatch || roleNamesMatch;
    });
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (show) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [show, onClose]);

  if (!show) return null;

  const getRoleColor = (role?: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'sales': return 'bg-blue-100 text-blue-800';
      case 'partnership': return 'bg-green-100 text-green-800';
      case 'akunting': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div 
      ref={dropdownRef}
      className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden"
    >
      {/* Header dengan search dan info */}
      <div className="p-3 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Select User</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-white rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        {/* Search info */}
        {searchTerm && (
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <Search className="w-3 h-3" />
            <span>
              {filteredUsers.length} of {users.length} users found
              {searchTerm && ` for "${searchTerm}"`}
            </span>
          </div>
        )}
      </div>

      {/* User list */}
      <div className={`${maxHeight} overflow-y-auto`}>
        {loading ? (
          <div className="p-6 text-center text-sm text-gray-500">
            <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-3"></div>
            <p>Loading users...</p>
          </div>
        ) : error ? (
          <div className="p-4 text-center text-sm text-red-500 bg-red-50">
            <p className="font-medium">Error loading users</p>
            <p className="text-xs mt-1">{error}</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-6 text-center text-sm text-gray-500">
            <Users className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="font-medium">
              {searchTerm.trim() ? 'No users found' : 'No users available'}
            </p>
            {searchTerm.trim() && (
              <p className="text-xs mt-1">Try searching with different keywords</p>
            )}
          </div>
        ) : (
          <div className="py-1">
            {filteredUsers.map((user) => {
              const isSelected = selectedUsers.some(selected => selected.id === user.id);
              const primaryRole = user.primaryRole || user.role || 'user';
              const displayRole = primaryRole !== 'user' ? primaryRole : 'User';
              
              return (
                <button
                  key={user.id}
                  onClick={() => onUserSelect(user)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 text-left transition-colors border-b border-gray-50 last:border-b-0 ${
                    isSelected 
                      ? 'bg-blue-50 border-blue-100' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  {/* User Avatar */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isSelected ? 'bg-blue-100' : 'bg-gray-100'
                  }`}>
                    <span className={`text-sm font-bold ${
                      isSelected ? 'text-blue-700' : 'text-gray-600'
                    }`}>
                      {getFirstChar(user.name)}
                    </span>
                  </div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className={`text-sm font-medium truncate ${
                        isSelected ? 'text-blue-900' : 'text-gray-900'
                      }`}>
                        {user.name}
                      </p>
                      {isSelected && (
                        <UserCheck className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      )}
                    </div>
                    
                    <p className="text-xs text-gray-500 truncate">
                      {user.email}
                    </p>
                    
                    {/* Role badges */}
                    <div className="flex items-center space-x-1 mt-1">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getRoleColor(primaryRole)}`}>
                        <span className="mr-1 text-xs"></span>
                        {displayRole}
                      </span>
                      
                      {/* Additional roles */}
                      {user.roleNames && user.roleNames.length > 1 && (
                        <span className="text-xs text-gray-400">
                          +{user.roleNames.length - 1} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Selection indicator */}
                  {isSelected && (
                    <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer info */}
      {!loading && !error && filteredUsers.length > 0 && (
        <div className="p-3 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{filteredUsers.length} users available</span>
            <div className="flex items-center space-x-3">
              <span className="flex items-center space-x-1">
                <span className="w-2 h-2 bg-red-100 rounded-full"></span>
                <span>Admin</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2 h-2 bg-blue-100 rounded-full"></span>
                <span>Sales</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2 h-2 bg-green-100 rounded-full"></span>
                <span>Partnership</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2 h-2 bg-yellow-100 rounded-full"></span>
                <span>Akunting</span>
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}