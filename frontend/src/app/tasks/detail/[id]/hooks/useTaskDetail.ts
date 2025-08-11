// hooks/useTaskDetail.ts
import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { Task } from '../types';
import { makeAuthenticatedRequest } from '../utils/auth';

export const useTaskDetail = (id: string | string[] | undefined) => {
  const router = useRouter();
  const [task, setTask] = useState<Task | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchTask = useCallback(async () => {
    if (!id) {
      setError("Invalid task ID");
      return;
    }

    try {
      setError(null);
      setIsLoading(true);
      console.log(`[DEBUG] Fetching task with ID: ${id}`);

      const response = await makeAuthenticatedRequest(`http://localhost:5000/api/tasks/${id}`);

      if (!response.ok) {
        if (response.status === 401) {
          console.error('Unauthorized access - redirecting to login');
          router.push('/login');
          return;
        }
        if (response.status === 404) {
          throw new Error(`Task with ID ${id} not found`);
        }
        const errorData = await response.json().catch(() => null);
        const errorMsg = errorData?.message || `HTTP ${response.status}: ${response.statusText}`;
        throw new Error(errorMsg);
      }

      const result = await response.json();
      const taskData = result.success ? result.data : result;
      
      if (!taskData || typeof taskData !== 'object') {
        throw new Error("Invalid data format received from server");
      }

      setTask(taskData);

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
        setTimeout(() => router.push('/tasks'), 3000);
      }
    } finally {
      setIsLoading(false);
    }
  }, [id, router]);

  const refreshTask = useCallback(() => {
    fetchTask();
  }, [fetchTask]);

  const updateTaskStatus = useCallback(async (taskId: number, status: string): Promise<void> => {
    try {
      const response = await makeAuthenticatedRequest(
        `http://localhost:5000/api/tasks/${taskId}/updateStatus`,
        {
          method: 'PUT',
          body: JSON.stringify({ status })
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to update task status');
      }

      const result = await response.json();
      if (result.success && result.data) {
        setTask(result.data);
      } else {
        // Fallback: refresh task data
        await fetchTask();
      }
    } catch (error) {
      console.error('Error updating task status:', error);
      throw error;
    }
  }, [fetchTask]);

  const updateTaskAssignment = useCallback(async (taskId: number, userId: number): Promise<void> => {
    try {
      const response = await makeAuthenticatedRequest(
        `http://localhost:5000/api/tasks/${taskId}`,
        {
          method: 'PUT',
          body: JSON.stringify({ assigned_to: userId })
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to update task assignment');
      }

      const result = await response.json();
      if (result.success && result.data) {
        setTask(result.data);
      } else {
        // Fallback: refresh task data
        await fetchTask();
      }
    } catch (error) {
      console.error('Error updating task assignment:', error);
      throw error;
    }
  }, [fetchTask]);

  return {
    task,
    error,
    isLoading,
    fetchTask,
    refreshTask,
    updateTaskStatus,
    updateTaskAssignment,
    setTask
  };
};
