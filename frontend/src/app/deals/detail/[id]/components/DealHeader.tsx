"use client";

import { useState, useEffect } from 'react';
import { Deal, User as UserType } from '../types';
import { Mail, Link2, Paperclip, ChevronDown, Check, User, X } from 'lucide-react';
import { makeAuthenticatedRequest } from '../utils/auth';
import { DEAL_STAGES, API_ENDPOINTS } from '../utils/constant';
import { useUsers } from '../hooks/useUsers';
import Swal from 'sweetalert2';

interface DealHeaderProps {
  deal: Deal;
  isDropdownOpen: boolean;
  setIsDropdownOpen: (open: boolean) => void;
  displayValue: (value: any, fallback?: string) => string;
  onDealUpdate?: (updatedDeal: Deal) => void;
}

export default function DealHeader({ 
  deal, 
  isDropdownOpen, 
  setIsDropdownOpen, 
  displayValue,
  onDealUpdate 
}: DealHeaderProps) {
  const [isUpdatingStage, setIsUpdatingStage] = useState(false);
  const [isAssignDropdownOpen, setIsAssignDropdownOpen] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignedUser, setAssignedUser] = useState<UserType | null>(null);
  
  // Use the users hook
  const { users, isLoading: isLoadingUsers } = useUsers();

  // Update assigned user when deal or users change
  useEffect(() => {
    if (deal?.owner && users.length > 0) {
      const currentUser = users.find(user => 
        user.id.toString() === deal.owner?.toString()
      );
      setAssignedUser(currentUser || null);
    }
  }, [deal?.owner, users]);

  const getCurrentStageConfig = () => {
    return DEAL_STAGES.find(stage => 
      stage.backendStage.toLowerCase() === deal.stage?.toLowerCase()
    ) || DEAL_STAGES[0];
  };

  const handleClickOutside = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!target.closest('[data-dropdown]')) {
      setIsDropdownOpen(false);
      setIsAssignDropdownOpen(false);
    }
  };

  // Add click outside listener
  useEffect(() => {
    if (isDropdownOpen || isAssignDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isDropdownOpen, isAssignDropdownOpen]);

  // Handle user assignment
  const handleAssignToUser = async (userId: number) => {
    if (!deal || isAssigning) return;
    
    if (userId.toString() === deal.owner?.toString()) {
      setIsAssignDropdownOpen(false);
      return;
    }

    setIsAssigning(true);
    try {
      const response = await makeAuthenticatedRequest(
        `${API_ENDPOINTS.DEALS}/${deal.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ owner: userId })
        }
      );

      if (response.ok) {
        const { data } = await response.json();
        const selectedUser = users.find(user => user.id === userId);
        setAssignedUser(selectedUser || null);
        
        // Update the deal object with new owner
        const updatedDeal = { ...deal, owner: userId, updated_at: new Date().toISOString() };
        
        // Call parent callback to update the deal state
        if (onDealUpdate) {
          onDealUpdate(updatedDeal);
        }
        
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: `Deal assigned to ${selectedUser?.name || 'user'} successfully!`,
          timer: 2000,
          showConfirmButton: false
        });
        
        console.log(`✅ Deal ${deal.id} assigned to user ${userId}`);
      } else {
        const errorData = await response.json().catch(() => null);
        const errorMsg = errorData?.message || 'Failed to assign user';
        throw new Error(errorMsg);
      }
    } catch (error) {
      console.error('Error assigning user:', error);
      Swal.fire({
        icon: 'error',
        title: 'Failed',
        text: 'Failed to assign user. Please try again.'
      });
    } finally {
      setIsAssigning(false);
      setIsAssignDropdownOpen(false);
    }
  };

  const updateDealStage = async (newStage: string) => {
    if (isUpdatingStage || newStage === deal.stage) return;

    // Show confirmation for critical stages (Won/Lost)
    if (newStage === 'won' || newStage === 'lost') {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: `Are you sure you want to mark this deal as "${newStage === 'won' ? 'Won' : 'Lost'}"?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: newStage === 'won' ? '#10b981' : '#ef4444',
        cancelButtonColor: '#6b7280',
        confirmButtonText: `Yes, mark as ${newStage === 'won' ? 'Won' : 'Lost'}`,
        cancelButtonText: 'Cancel'
      });

      if (!result.isConfirmed) {
        return;
      }
    }

    setIsUpdatingStage(true);
    try {
      const response = await makeAuthenticatedRequest(
        `${API_ENDPOINTS.DEALS}/${deal.id}/updateStage`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ stage: newStage }),
        }
      );

      if (response.ok) {
        const { data } = await response.json();
        
        // Update the deal object with new stage
        const updatedDeal = { ...deal, stage: newStage, updated_at: new Date().toISOString() };
        
        // Call parent callback to update the deal state
        if (onDealUpdate) {
          onDealUpdate(updatedDeal);
        }
        
        setIsDropdownOpen(false);
        
        // Find the stage name for the success message
        const updatedStageConfig = DEAL_STAGES.find(stage => 
          stage.backendStage.toLowerCase() === newStage.toLowerCase()
        );
        
        // Show simple SweetAlert success notification like TaskHeader
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: `Deal stage updated to "${updatedStageConfig?.name || newStage}" successfully!`,
          timer: 2000,
          showConfirmButton: false
        });
        
      } else {
        const errorData = await response.json().catch(() => null);
        const errorMsg = errorData?.message || `Failed to update deal stage`;
        throw new Error(errorMsg);
      }
    } catch (error) {
      console.error('Error updating deal stage:', error);
      
      // Show simple SweetAlert error notification like TaskHeader
      Swal.fire({
        icon: 'error',
        title: 'Failed',
        text: 'Failed to update deal stage. Please try again.'
      });
    } finally {
      setIsUpdatingStage(false);
    }
  };

  const currentStage = getCurrentStageConfig();

  return (
    <div className="border-b border-gray-200 p-6">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-2 text-gray-600 text-sm">
          <span>Deals</span>
          <span>/</span>
          <span className="text-gray-900">
            {displayValue(deal.title, deal.lead?.company || deal.company?.name || 'Untitled Deal')}
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500">CRM-DEAL-{deal.id}</div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-semibold text-gray-900">
            {displayValue(deal.title, deal.lead?.company || deal.company?.name || 'Untitled Deal')}
          </h1>
          <div className="flex items-center space-x-2">
            {(deal.lead?.email || deal.contact?.email || deal.company?.email) && (
              <a href={`mailto:${deal.lead?.email || deal.contact?.email || deal.company?.email}`}>
                <Mail className="w-5 h-5 text-gray-400 hover:text-gray-600 cursor-pointer" />
              </a>
            )}
            {(deal.lead?.website || deal.company?.website) && (
              <a 
                href={deal.lead?.website || deal.company?.website || `https://${(deal.lead?.company || deal.company?.name)?.toLowerCase().replace(/\s+/g, '')}.com`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Link2 className="w-5 h-5 text-gray-400 hover:text-gray-600 cursor-pointer" />
              </a>
            )}
            <Paperclip className="w-5 h-5 text-gray-400 hover:text-gray-600 cursor-pointer" />
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Assign To Dropdown */}
          <div className="relative" data-dropdown>
            <button
              onClick={() => setIsAssignDropdownOpen(!isAssignDropdownOpen)}
              disabled={isAssigning}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-700 flex items-center space-x-2 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px]"
            >
              {isAssigning ? (
                <>
                  <div className="w-2 h-2 border border-gray-500 border-t-transparent rounded-full animate-spin"></div>
                  <span>Assigning...</span>
                </>
              ) : (
                <>
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="truncate flex-1 text-left">
                    {assignedUser ? assignedUser.name : 'Assign to'}
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </>
              )}
            </button>

            {isAssignDropdownOpen && !isAssigning && (
              <div className="absolute right-0 mt-1 w-64 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-64 overflow-y-auto animate-in fade-in duration-200">
                <div className="py-1">
                  <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide border-b border-gray-100">
                    Assign to User
                  </div>
                  {isLoadingUsers ? (
                    <div className="px-4 py-2 text-sm text-gray-500 text-center">
                      Loading users...
                    </div>
                  ) : users.length === 0 ? (
                    <div className="px-4 py-2 text-sm text-gray-500 text-center">
                      No users available
                    </div>
                  ) : (
                    <>
                      {/* Unassign option */}
                      <button
                        onClick={() => handleAssignToUser(0)}
                        className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                          <X className="w-3 h-3 text-gray-500" />
                        </div>
                        <div className="flex-1 text-left">
                          <div className="font-medium">Unassigned</div>
                        </div>
                        {!assignedUser && (
                          <Check className="w-4 h-4 text-blue-600" />
                        )}
                      </button>
                      
                      <div className="border-t border-gray-100 my-1"></div>
                      
                      {users.map((user) => (
                        <button
                          key={user.id}
                          onClick={() => handleAssignToUser(user.id)}
                          className={`w-full flex items-center space-x-3 px-3 py-2 text-sm transition-colors ${
                            assignedUser?.id === user.id 
                              ? 'bg-blue-50 text-blue-700' 
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium text-blue-700">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1 text-left">
                            <div className="font-medium">{user.name}</div>
                            <div className="text-xs text-gray-500">{user.email}</div>
                            {user.roleNames && user.roleNames.length > 0 && (
                              <div className="text-xs text-blue-600">
                                {user.roleNames.join(', ')}
                              </div>
                            )}
                          </div>
                          {assignedUser?.id === user.id && (
                            <Check className="w-4 h-4 text-blue-600" />
                          )}
                        </button>
                      ))}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Stage Update Dropdown */}
          <div className="relative" data-dropdown>
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              disabled={isUpdatingStage}
              className={`border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-700 flex items-center space-x-2 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[120px] transition-colors ${
                isUpdatingStage ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${currentStage.color}`}></div>
              <span className="flex-1 text-left">
                {isUpdatingStage ? 'Updating...' : currentStage.name}
              </span>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                isDropdownOpen ? 'rotate-180' : ''
              }`} />
            </button>
            
            {isDropdownOpen && !isUpdatingStage && (
              <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50 animate-in fade-in duration-200">
                <div className="py-1">
                  <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide border-b border-gray-100">
                    Change Stage
                  </div>
                  {DEAL_STAGES.map((stageOption) => {
                    const isCurrentStage = stageOption.backendStage.toLowerCase() === deal.stage?.toLowerCase();
                    
                    return (
                      <button
                        key={stageOption.backendStage}
                        onClick={() => updateDealStage(stageOption.backendStage)}
                        disabled={isCurrentStage}
                        className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between transition-colors ${
                          isCurrentStage 
                            ? 'bg-blue-50 text-blue-700 cursor-default' 
                            : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-2 h-2 rounded-full ${stageOption.color}`}></div>
                          <span className="font-medium">{stageOption.name}</span>
                        </div>
                        {isCurrentStage && (
                          <Check className="w-4 h-4 text-blue-600" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}