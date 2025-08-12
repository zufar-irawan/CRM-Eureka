"use client";

import { useState } from 'react';
import { Deal } from '../types';
import { Mail, Link2, Paperclip, ChevronDown, Check } from 'lucide-react';
import { makeAuthenticatedRequest } from '../utils/auth';
import { DEAL_STAGES } from '../utils/constant';
import Swal from 'sweetalert2';

interface DealHeaderProps {
  deal: Deal;
  isDropdownOpen: boolean;
  setIsDropdownOpen: (open: boolean) => void;
  displayValue: (value: any, fallback?: string) => string;
  onDealUpdate?: (updatedDeal: Deal) => void; // Callback to update parent component
}

export default function DealHeader({ 
  deal, 
  isDropdownOpen, 
  setIsDropdownOpen, 
  displayValue,
  onDealUpdate 
}: DealHeaderProps) {
  const [isUpdatingStage, setIsUpdatingStage] = useState(false);

  const getCurrentStageConfig = () => {
    return DEAL_STAGES.find(stage => 
      stage.backendStage.toLowerCase() === deal.stage?.toLowerCase()
    ) || DEAL_STAGES[0];
  };

  const handleClickOutside = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!target.closest('[data-dropdown]')) {
      setIsDropdownOpen(false);
    }
  };

  // Add click outside listener
  useState(() => {
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  });

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
        `http://localhost:5000/api/deals/${deal.id}/updateStage`,
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
          <select className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            <option>Assign to</option>
            <option value="admin">Admin User</option>
            <option value="sales1">Sales One</option>
            <option value="sales2">Sales Two</option>
          </select>
          
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