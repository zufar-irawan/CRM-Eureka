// hooks/useLead.ts
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Deal } from '../types';
import { makeAuthenticatedRequest } from '../utils/auth';
import { API_ENDPOINTS, STAGE_MAPPING } from '../utils/constant';

export const useDeal = (id: string | string[] | undefined) => {
  const router = useRouter();
  const [deal, setDeal] = useState<Deal | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const mapStageToStatus = (stage: string): string => {
    return STAGE_MAPPING[stage] || 'New';
  };

  const fetchDeal = async () => {
    if (!id) {
      setError("Invalid deal ID");
      return;
    }

    try {
      setError(null);
      setIsLoading(true);
      console.log(`[DEBUG] Fetching deal with ID: ${id}`);

      const response = await makeAuthenticatedRequest(`${API_ENDPOINTS.DEALS}/${id}`);

      if (!response.ok) {
        if (response.status === 401) {
          console.error('Unauthorized access - redirecting to login');
          router.push('/login');
          return;
        }
        if (response.status === 404) {
          throw new Error(`Deal with ID ${id} not found`);
        }
        const errorData = await response.json().catch(() => null);
        const errorMsg = errorData?.message || `HTTP ${response.status}: ${response.statusText}`;
        throw new Error(errorMsg);
      }

      const data = await response.json();
      if (!data || typeof data !== 'object') {
        throw new Error("Invalid data format received from server");
      }

      setDeal(data);

    } catch (err: unknown) {
      let errorMessage = 'An unexpected error occurred';

      if (err instanceof TypeError && err.message.includes('fetch')) {
        errorMessage = 'Network error: Unable to connect to server. Please check if backend server is running on localhost:5000';
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      console.error('[ERROR] Fetch failed:', err);
      setError(errorMessage);

      if (err instanceof Error && err.message.includes('not found')) {
        setTimeout(() => router.push('/deal'), 3000);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const refreshDeal = () => {
    fetchDeal();
  };

  return {
    deal,
    error,
    isLoading,
    fetchDeal,
    refreshDeal,
    mapStageToStatus,
    setDeal
  };
};