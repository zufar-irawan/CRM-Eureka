"use client";

import { useState, useEffect } from 'react';
import type { User } from '../../types';
import { getFirstChar } from '../../utils/formatting';
import { makeAuthenticatedRequest } from '../../utils/auth';
import { API_ENDPOINTS, FALLBACK_USERS } from '../../utils/constant';

interface DealUserSelectorProps {
  show: boolean;
  onClose: () => void;
  onUserSelect: (user: User) => void;
  searchTerm: string;
  selectedUsers?: User[];
}

export default function DealUserSelector({
  show,
  onClose,
  onUserSelect,
  searchTerm,
  selectedUsers = []
}: DealUserSelectorProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch users on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await makeAuthenticatedRequest(API_ENDPOINTS.USERS);

        if (response.ok) {
          const data = await response.json();
          const usersList = Array.isArray(data) ? data : [];
          setUsers(usersList);
          console.log('Successfully loaded users from API:', usersList.length, 'users');
        } else if (response.status === 401) {
          console.log('API authentication failed, using fallback users');
          setUsers(FALLBACK_USERS);
        } else {
          console.log(`API returned ${response.status}, using fallback users`);
          setUsers(FALLBACK_USERS);
        }
      } catch (error) {
        console.log('Failed to fetch users from API, using fallback users:', error);
        setUsers(FALLBACK_USERS);
      } finally {
        setLoading(false);
      }
    };

    if (show && users.length === 0) {
      fetchUsers();
    }
  }, [show]);

  // Filter users based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredUsers(users);
      return;
    }

    const searchLower = searchTerm.toLowerCase();
    const filtered = users.filter(user =>
      user.name.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower)
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  if (!show) return null;

  return (
    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-20 max-h-60 overflow-y-auto">
      {loading ? (
        <div className="p-4 text-center text-sm text-gray-500">
          <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-2"></div>
          Loading users...
        </div>
      ) : error ? (
        <div className="p-4 text-center text-sm text-red-500">
          {error}
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="p-4 text-center text-sm text-gray-500">
          {searchTerm.trim() ? 'No users found' : 'Start typing to search users'}
        </div>
      ) : (
        <div className="py-1">
          {filteredUsers.map((user) => {
            const isSelected = selectedUsers.some(selected => selected.email === user.email);
            
            return (
              <button
                key={user.id}
                onClick={() => onUserSelect(user)}
                className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
              >
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-medium text-blue-700">
                    {getFirstChar(user.name)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user.email}
                    {user.role && (
                      <span className="ml-1 text-blue-600">• {user.role}</span>
                    )}
                  </p>
                </div>
                {isSelected && (
                  <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}