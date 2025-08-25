"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";
import type { CurrentUser, User } from '../../types';
import { makeAuthenticatedRequest } from '../../utils/auth';
import { API_ENDPOINTS, FALLBACK_USERS } from '../../utils/constants';
import Swal from "sweetalert2";

interface CreateTaskModalProps {
  leadId: string | string[] | undefined;
  currentUser: CurrentUser | null;
  onClose: () => void;
  onTaskCreated: () => void;
}

interface TaskForm {
  lead_id: number;
  assigned_to: number;
  title: string;
  description: string;
  category: string;
  due_date: string;
  priority: string;
}

export default function CreateTaskModal({
  leadId,
  currentUser,
  onClose,
  onTaskCreated
}: CreateTaskModalProps) {
  const [form, setForm] = useState<TaskForm>({
    lead_id: parseInt(String(leadId)) || 0,
    assigned_to: currentUser?.id || 0,
    title: '',
    description: '',
    category: 'Lainnya',
    due_date: '',
    priority: 'medium',
  });

  const [userOptions, setUserOptions] = useState<User[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await makeAuthenticatedRequest(API_ENDPOINTS.USERS);

        if (response.ok) {
          const result = await response.json();
          const data = Array.isArray(result) ? result : result.data || [];
          setUserOptions(data);
        } else {
          console.log('Using fallback users due to API error');
          setUserOptions(FALLBACK_USERS);
        }
      } catch (error) {
        console.error("Failed to fetch users", error);
        setUserOptions(FALLBACK_USERS);
      }
    };

    fetchUsers();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    // Validation
    if (!form.title.trim()) {
      setError("Task title is required");
      setIsSubmitting(false);
      return;
    }

    if (!form.due_date) {
      setError("Due date is required");
      setIsSubmitting(false);
      return;
    }

    if (!form.assigned_to) {
      setError("Please assign the task to someone");
      setIsSubmitting(false);
      return;
    }

    try {
      const submitData = {
        lead_id: Number(form.lead_id),
        assigned_to: Number(form.assigned_to),
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category || 'Lainnya',
        due_date: form.due_date,
        priority: form.priority,
      };

      const response = await makeAuthenticatedRequest(
        API_ENDPOINTS.TASKS,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(submitData),
        }
      );

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || "Failed to create task");
      }

      const result = await response.json();
      console.log("Task created successfully:", result);

      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: "Task created successfully"
      })

      onTaskCreated();
    } catch (err) {
      console.error("Error creating task:", err);

      Swal.fire({
        icon: 'error',
        title: 'Failed',
        text: err instanceof Error ? err.message : "Failed to create task"
      })

      setError(err instanceof Error ? err.message : "Failed to create task");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
        <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl relative transform transition-all duration-300 max-h-[90vh] overflow-hidden pointer-events-auto">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
            <h2 className="text-xl font-semibold text-gray-800">Create New Task</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors duration-200"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Form Container */}
          <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
            <div className="p-6">
              {/* Error Message */}
              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Task Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Task Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="Enter task title"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                    maxLength={100}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Assigned To */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Assigned To <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="assigned_to"
                      value={form.assigned_to}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Select user</option>
                      {userOptions.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      name="category"
                      value={form.category}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="Kanvasing">Kanvasing</option>
                      <option value="Followup">Followup</option>
                      <option value="Penawaran">Penawaran</option>
                      <option value="Kesepakatan Tarif">Kesepakatan Tarif</option>
                      <option value="Deal DO">Deal DO</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>
                  </div>

                  {/* Priority */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Priority
                    </label>
                    <select
                      name="priority"
                      value={form.priority}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  {/* Due Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Due Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      name="due_date"
                      value={form.due_date}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Enter task description or additional notes"
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  />
                </div>
              </form>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition-colors duration-200 font-medium disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}