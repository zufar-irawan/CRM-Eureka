import React, { useState } from 'react';
import type { Lead } from '../types';
import { makeAuthenticatedRequest } from '../utils/auth';
import { API_ENDPOINTS, STATUS_OPTIONS } from '../utils/constants';

export const useLeadActions = (lead: Lead | null) => {
  const [isUpdatingStage, setIsUpdatingStage] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(
    lead?.stage || 'New'
  );

  const updateLeadStage = async (newStage: string): Promise<boolean> => {
    if (!lead || isUpdatingStage) return false;
    
    const statusOption = STATUS_OPTIONS.find(opt => opt.name === newStage);
    if (!statusOption) {
      console.error('Invalid stage:', newStage);
      return false;
    }

    setIsUpdatingStage(true);
    try {
      console.log(`[DEBUG] Updating lead ${lead.id} stage to: ${newStage} (backend: ${statusOption.backendStage})`);
      
      const response = await makeAuthenticatedRequest(
        `${API_ENDPOINTS.LEADS}/${lead.id}/stage`,
        {
          method: 'PATCH',
          body: JSON.stringify({ stage: statusOption.backendStage })
        }
      );

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Stage update successful:', result);
        setSelectedStatus(newStage);
        return true;
      } else {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Error updating stage:', error);
      alert(`Failed to update stage: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    } finally {
      setIsUpdatingStage(false);
    }
  };

  const convertLeadToDeal = async (
    dealTitle: string, 
    dealValue: number, 
    dealStage: string
  ): Promise<boolean> => {
    if (!lead || isConverting) return false;

    setIsConverting(true);
    try {
      const requestBody = {
        dealTitle: dealTitle.trim(),
        dealValue: parseFloat(dealValue.toString()),
        dealStage: dealStage
      };

      console.log('[DEBUG] Converting lead to deal:', requestBody);

      const response = await makeAuthenticatedRequest(
        `${API_ENDPOINTS.LEADS}/${lead.id}/convert`,
        {
          method: 'POST',
          body: JSON.stringify(requestBody)
        }
      );

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Conversion successful:', result);
        
        // Update local state
        setSelectedStatus('Converted');
        return true;
      } else {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Error converting lead:', error);
      alert(`Failed to convert lead: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    } finally {
      setIsConverting(false);
    }
  };

  const assignLeadToUser = async (userId: number): Promise<boolean> => {
    if (!lead) return false;

    try {
      const response = await makeAuthenticatedRequest(
        `${API_ENDPOINTS.LEADS}/${lead.id}`,
        {
          method: 'PUT',
          body: JSON.stringify({ owner: userId })
        }
      );

      if (response.ok) {
        console.log(`✅ Lead ${lead.id} assigned to user ${userId}`);
        return true;
      } else {
        throw new Error('Failed to assign user');
      }
    } catch (error) {
      console.error('❌ Error assigning user:', error);
      alert('Failed to assign user. Please try again.');
      return false;
    }
  };

  // Reset status when lead changes
  React.useEffect(() => {
    if (lead?.stage) {
      setSelectedStatus(lead.stage);
    }
  }, [lead?.stage]);

  return {
    selectedStatus,
    isUpdatingStage,
    isConverting,
    updateLeadStage,
    convertLeadToDeal,
    assignLeadToUser
  };
};