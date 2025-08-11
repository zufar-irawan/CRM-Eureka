// src/hooks/useTaskComments.ts
"use client";

import { useState, useEffect, useCallback } from 'react';
import type { TaskComment } from '../types';

export function useTaskComments(taskId: string | string[] | undefined) {
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fungsi untuk mengambil komentar
  const fetchComments = useCallback(async () => {
    if (!taskId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Ganti dengan API call sebenarnya
      const response = await fetch(`/api/tasks/${taskId}/comments`);
      
      if (!response.ok) {
        throw new Error('Gagal mengambil komentar');
      }
      
      const data = await response.json();
      setComments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  // Fungsi untuk menambah komentar
  const addComment = async (content: string): Promise<void> => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        throw new Error('Gagal menambahkan komentar');
      }

      await fetchComments(); // Refresh daftar komentar
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
      throw err; // Re-throw untuk penanganan di komponen
    }
  };

  // Fungsi untuk mengupdate komentar
  const updateComment = async (commentId: string, content: string): Promise<void> => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/comments/${commentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        throw new Error('Gagal mengupdate komentar');
      }

      await fetchComments(); // Refresh daftar komentar
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
      throw err;
    }
  };

  // Fungsi untuk menghapus komentar
  const deleteComment = async (commentId: string): Promise<void> => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/comments/${commentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Gagal menghapus komentar');
      }

      await fetchComments(); // Refresh daftar komentar
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
      throw err;
    }
  };

  // Auto-fetch komentar saat taskId berubah
  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  return {
    comments,
    commentsLoading: loading,
    commentsError: error,
    fetchComments,
    addComment,
    updateComment,
    deleteComment,
  };
}