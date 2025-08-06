// hooks/useTasks.ts
import { useState, useCallback } from 'react';
import type { Task, TaskStats } from '../types';
import { makeAuthenticatedRequest } from '../utils/auth';

export const useTasks = (leadId: string | string[] | undefined) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [tasksError, setTasksError] = useState<string | null>(null);

  const getTaskStats = useCallback((tasks: Task[]): TaskStats => {
    const now = new Date();

    return tasks.reduce(
      (stats, task) => {
        stats.total++;

        if (task.status === 'completed') {
          stats.completed++;
        } else {
          stats.pending++;

          if (new Date(task.due_date) < now) {
            stats.overdue++;
          }
        }

        return stats;
      },
      { total: 0, completed: 0, pending: 0, overdue: 0 }
    );
  }, []);

  const fetchTasks = useCallback(async () => {
    if (!leadId) return;

    setTasksLoading(true);
    setTasksError(null);

    try {
      // Perbaikan: Gunakan endpoint yang benar dan tambahkan parameter lead_id
      const response = await makeAuthenticatedRequest(
        `http://localhost:5000/api/tasks?lead_id=${leadId}`
      );

      if (response.ok) {
        const result = await response.json();
        
        // Handle response structure dari backend
        if (result.success && result.data) {
          const tasksList = Array.isArray(result.data) ? result.data : [];
          
          // Transform data untuk menambahkan assigned_user_name jika perlu
          const transformedTasks = tasksList.map((task: any) => ({
            ...task,
            assigned_user_name: task.assignee?.name || task.assigned_user_name || 'Unknown User'
          }));
          
          setTasks(transformedTasks);
        } else {
          // Fallback untuk format lama
          const tasksList = Array.isArray(result) ? result : result.tasks || [];
          setTasks(tasksList);
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch tasks');
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setTasksError(error instanceof Error ? error.message : 'Failed to load tasks. Please try again.');
      setTasks([]);
    } finally {
      setTasksLoading(false);
    }
  }, [leadId]);

  const handleUpdateTaskStatus = useCallback(
    async (taskId: number, status: 'pending' | 'completed' | 'cancelled') => {
      try {
        const response = await makeAuthenticatedRequest(
          `http://localhost:5000/api/tasks/${taskId}/updateStatus`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status }),
          }
        );

        if (response.ok) {
          const result = await response.json();
          
          if (result.success) {
            setTasks((prev): Task[] =>
              prev.map((task) =>
                task.id === taskId
                  ? {
                      ...task,
                      status,
                      updated_at: new Date().toISOString(),
                    }
                  : task
              )
            );
          } else {
            throw new Error(result.message || 'Failed to update task status');
          }
        } else {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Failed to update task status');
        }
      } catch (error) {
        console.error('Error updating task status:', error);
        setTasksError(error instanceof Error ? error.message : 'Failed to update task status. Please try again.');
      }
    },
    []
  );

  const handleDeleteTask = useCallback(async (taskId: number) => {
    try {
      const response = await makeAuthenticatedRequest(
        `http://localhost:5000/api/tasks/${taskId}`,
        {
          method: 'DELETE',
        }
      );

      if (response.ok) {
        setTasks((prev) => prev.filter((task) => task.id !== taskId));
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to delete task');
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      setTasksError(error instanceof Error ? error.message : 'Failed to delete task. Please try again.');
    }
  }, []);

  return {
    tasks,
    tasksLoading,
    tasksError,
    taskStats: getTaskStats(tasks),
    fetchTasks,
    handleUpdateTaskStatus,
    handleDeleteTask,
  };
};