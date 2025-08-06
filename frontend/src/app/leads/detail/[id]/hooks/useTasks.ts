// hooks/useTasks.ts
import { useState, useCallback } from 'react';
import type { Task, TaskStats } from '../types'; // perhatikan path ini
import { makeAuthenticatedRequest } from '../utils/auth';
import { API_ENDPOINTS } from '../utils/constants';

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
      const response = await makeAuthenticatedRequest(
        `http://localhost:5000/api/tasks?lead_id=${leadId}`
      );

      if (response.ok) {
        const data = await response.json();
        const tasksList = Array.isArray(data) ? data : data.tasks || [];
        setTasks(tasksList);
      } else {
        throw new Error('Failed to fetch tasks');
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setTasksError('Failed to load tasks. Please try again.');
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
            body: JSON.stringify({ status }),
          }
        );

        if (response.ok) {
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
          throw new Error('Failed to update task status');
        }
      } catch (error) {
        console.error('Error updating task status:', error);
        setTasksError('Failed to update task status. Please try again.');
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
        throw new Error('Failed to delete task');
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      setTasksError('Failed to delete task. Please try again.');
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
