// hooks/useLeadUser.ts - Simple Fix
import { useState, useEffect, useCallback } from 'react';
import { makeAuthenticatedRequest } from '../utils/constants';

interface LeadUser {
  id: number;
  name: string;
  email?: string;
  role?: string;
}

interface UseLeadUserReturn {
  leadUser: LeadUser | null;
  isLoading: boolean;
  error: string | null;
  fetchLeadUser: () => Promise<void>;
}

export function useLeadUser(leadId: number | null): UseLeadUserReturn {
  const [leadUser, setLeadUser] = useState<LeadUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLeadUser = useCallback(async () => {
    if (!leadId) {
      setLeadUser(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await makeAuthenticatedRequest(`/api/leads/${leadId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch lead information');
      }

      const lead = await response.json();
      
      // Controller return lead data langsung, bukan wrapped dalam success/data
      if (lead && lead.id) {
        // Map lead data ke format LeadUser
        const userData = {
          id: lead.id,
          name: lead.fullname || 
                `${lead.first_name || ''} ${lead.last_name || ''}`.trim() || 
                lead.company || 
                'Unknown User',
          email: lead.email || lead.work_email,
          role: lead.job_position
        };

        setLeadUser(userData);
      } else {
        throw new Error('Invalid lead data');
      }
    } catch (err) {
      console.error('Error fetching lead user:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setLeadUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [leadId]);

  useEffect(() => {
    fetchLeadUser();
  }, [fetchLeadUser]);

  return {
    leadUser,
    isLoading,
    error,
    fetchLeadUser
  };
}