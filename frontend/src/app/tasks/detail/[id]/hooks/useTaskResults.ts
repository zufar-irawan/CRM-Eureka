import { useState, useCallback } from 'react';

interface TaskResult {
  id: string;
  content: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export function useTaskResults(taskId?: string | string[]) {
  const [results, setResults] = useState<TaskResult[]>([]);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [resultsError, setResultsError] = useState<string | null>(null);

  const fetchResults = useCallback(async () => {
    if (!taskId) return;
    setResultsLoading(true);
    setResultsError(null);
    try {
      const res = await fetch(`/api/tasks/${taskId}/results`);
      if (!res.ok) throw new Error('Failed to fetch results');
      const data = await res.json();
      setResults(data);
    } catch (err: any) {
      setResultsError(err.message || 'Failed to load results');
    } finally {
      setResultsLoading(false);
    }
  }, [taskId]);

  const addResult = useCallback(
    async (newResult: Partial<TaskResult>) => {
      if (!taskId) return;
      try {
        const res = await fetch(`/api/tasks/${taskId}/results`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newResult),
        });
        if (!res.ok) throw new Error('Failed to add result');
        const data = await res.json();
        setResults((prev) => [...prev, data]);
        return data;
      } catch (err) {
        console.error(err);
        throw err;
      }
    },
    [taskId]
  );

  const updateResult = useCallback(
    async (id: string, updated: Partial<TaskResult>) => {
      if (!taskId) return;
      try {
        const res = await fetch(`/api/tasks/${taskId}/results/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updated),
        });
        if (!res.ok) throw new Error('Failed to update result');
        const data = await res.json();
        setResults((prev) =>
          prev.map((r) => (r.id === id ? { ...r, ...data } : r))
        );
        return data;
      } catch (err) {
        console.error(err);
        throw err;
      }
    },
    [taskId]
  );

  const deleteResult = useCallback(
    async (id: string) => {
      if (!taskId) return;
      try {
        const res = await fetch(`/api/tasks/${taskId}/results/${id}`, {
          method: 'DELETE',
        });
        if (!res.ok) throw new Error('Failed to delete result');
        setResults((prev) => prev.filter((r) => r.id !== id));
      } catch (err) {
        console.error(err);
        throw err;
      }
    },
    [taskId]
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
