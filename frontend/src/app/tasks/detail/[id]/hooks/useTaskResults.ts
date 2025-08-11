import { useState, useCallback } from 'react';
import { makeAuthenticatedRequest } from '../utils/auth';
import { TASK_API_ENDPOINTS } from '../utils/constants';

interface TaskResult {
  id: string | number;
  task_id: number;
  result_text: string;
  result_type: string;
  result_date: string;
  created_by: number | null;
  created_by_name?: string;
  created_at: string;
  updated_at: string;
}

export function useTaskResults(taskId?: string | string[]) {
  const [results, setResults] = useState<TaskResult[]>([]);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [resultsError, setResultsError] = useState<string | null>(null);

  // Normalize taskId to string
  const normalizedTaskId = Array.isArray(taskId) ? taskId[0] : taskId;

  const fetchResults = useCallback(async () => {
    if (!normalizedTaskId) return;
    
    setResultsLoading(true);
    setResultsError(null);
    
    try {
      const response = await makeAuthenticatedRequest(
        TASK_API_ENDPOINTS.TASK_RESULTS(normalizedTaskId)
      );
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch results');
      }
      
      const data = await response.json();
      
      // Handle different response formats
      const resultsData = data.success ? data.data : data;
      const resultsArray = Array.isArray(resultsData) ? resultsData : [];
      
      setResults(resultsArray);
    } catch (err: any) {
      console.error('Error fetching results:', err);
      setResultsError(err.message || 'Failed to load results');
    } finally {
      setResultsLoading(false);
    }
  }, [normalizedTaskId]);

  const addResult = useCallback(
    async (newResult: Partial<TaskResult>) => {
      if (!normalizedTaskId) throw new Error('Task ID is required');
      
      try {
        const response = await makeAuthenticatedRequest(
          TASK_API_ENDPOINTS.TASK_RESULTS(normalizedTaskId),
          {
            method: 'POST',
            body: JSON.stringify(newResult),
          }
        );
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Failed to add result');
        }
        
        const data = await response.json();
        const resultData = data.success ? data.data : data;
        
        // Add to current results
        setResults(prev => [...prev, resultData]);
        
        return resultData;
      } catch (err) {
        console.error('Error adding result:', err);
        throw err;
      }
    },
    [normalizedTaskId]
  );

  const updateResult = useCallback(
    async (id: string | number, updated: Partial<TaskResult>) => {
      if (!normalizedTaskId) throw new Error('Task ID is required');
      
      try {
        const response = await makeAuthenticatedRequest(
          TASK_API_ENDPOINTS.RESULT_UPDATE(String(id)),
          {
            method: 'PUT',
            body: JSON.stringify(updated),
          }
        );
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Failed to update result');
        }
        
        const data = await response.json();
        const resultData = data.success ? data.data : data;
        
        // Update the result in the array
        setResults(prev =>
          prev.map(r => (r.id === id ? { ...r, ...resultData } : r))
        );
        
        return resultData;
      } catch (err) {
        console.error('Error updating result:', err);
        throw err;
      }
    },
    [normalizedTaskId]
  );

  const deleteResult = useCallback(
    async (id: string | number) => {
      if (!normalizedTaskId) throw new Error('Task ID is required');
      
      try {
        const response = await makeAuthenticatedRequest(
          TASK_API_ENDPOINTS.RESULT_UPDATE(String(id)),
          {
            method: 'DELETE',
          }
        );
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Failed to delete result');
        }
        
        // Remove from results array
        setResults(prev => prev.filter(r => r.id !== id));
      } catch (err) {
        console.error('Error deleting result:', err);
        throw err;
      }
    },
    [normalizedTaskId]
  );

  return {
    results,
    resultsLoading,
    resultsError,
    fetchResults,
    addResult,
    updateResult,
    deleteResult,
  };
}