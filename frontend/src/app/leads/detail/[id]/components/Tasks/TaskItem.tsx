/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  Calendar,
  User,
  Tag,
  MoreHorizontal,
  Trash2,
  CheckCircle2,
  Circle,
  AlertTriangle,
  Clock,
  FileText,
  Download,
  Eye,
  Image,
  Video,
  Music,
  File as FileIcon,
  X,
  ChevronDown
} from 'lucide-react';
import { useEffect, useState, useCallback, useRef } from 'react';
import { formatDate, getFirstChar, formatBytes } from '../../../../../tasks/detail/[id]/utils/formatting';
import type { Task, CurrentUser } from '../../types';
import { compressImage } from '../../../../../tasks/detail/[id]/utils/imageCompression';
import Swal from 'sweetalert2';
import useUser from '../../../../../../../hooks/useUser';

// Import constants - adjust path as needed
const TASK_API_ENDPOINTS = {
  TASK_RESULTS: (taskId: any) => `http://localhost:5000/api/tasks/${taskId}/results`,
  RESULT_UPDATE: (resultId: string) => `http://localhost:5000/api/tasks/task-results/${resultId}`,
  ATTACHMENT_DOWNLOAD: (attachmentId: string) => `http://localhost:5000/api/tasks/attachments/${attachmentId}/download`,
  ATTACHMENT_VIEW: (attachmentId: string) => `http://localhost:5000/api/tasks/attachments/${attachmentId}/view`,
  ADD_RESULT_WITH_ATTACHMENTS: (taskId: string) => `http://localhost:5000/api/tasks/${taskId}/results/with-attachments`,
} as const;

const RESULT_TYPES = [
  {
    value: "meeting",
    label: "Meeting",
    color: "bg-blue-500 text-white",
  },
  {
    value: "call",
    label: "Phone Call",
    color: "bg-green-500 text-white",
  },
  {
    value: "email",
    label: "Email",
    color: "bg-purple-500 text-white",
  },
  {
    value: "visit",
    label: "Site Visit",
    color: "bg-orange-500 text-white",
  },
  {
    value: "note",
    label: "General Note",
    color: "bg-gray-500 text-white",
  }
];

const makeAuthenticatedRequest = async (url: string, options: RequestInit = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...options.headers,
  };

  return fetch(url, {
    ...options,
    headers,
    mode: 'cors',
    credentials: 'include',
  });
};

interface TaskItemProps {
  task: Task;
  currentUser: CurrentUser | null;
  onUpdateStatus: (taskId: number, status: 'pending' | 'completed' | 'cancelled') => Promise<void>;
  onDelete: (taskId: number) => void;
}

interface TaskResult {
  id: number;
  result_text: string;
  result_type: string;
  result_date: string;
  result_time: string;
  attachments?: TaskAttachment[];
}

interface TaskAttachment {
  id: number;
  task_result_id: number;
  original_filename: string;
  stored_filename: string;
  file_path: string;
  file_size: number;
  file_type: 'image' | 'document' | 'video' | 'audio' | 'other';
  mime_type: string;
  view_url?: string;
  download_url?: string;
}

export default function TaskItem({
  task,
  currentUser,
  onUpdateStatus,
  onDelete
}: TaskItemProps) {
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showActionsDropdown, setShowActionsDropdown] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [resultText, setResultText] = useState('');
  const [resultType, setResultType] = useState('note');
  const [result, setResult] = useState<TaskResult | null>(null);
  const [isLoadingResult, setIsLoadingResult] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewAttachment, setPreviewAttachment] = useState<TaskAttachment | null>(null);

  const { user } = useUser()

  // Ref untuk cancel request jika component unmount
  const abortControllerRef = useRef<AbortController | null>(null);

  const isCompleted = task.status === 'completed';
  const isOverdue = new Date(task.due_date) < new Date() && !isCompleted;

  // Effect untuk handle ESC key untuk image preview
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && previewImage) {
        setPreviewImage(null);
        setPreviewAttachment(null);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [previewImage]);

  // Effect untuk prevent body scroll saat preview
  useEffect(() => {
    if (previewImage) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [previewImage]);

  // Memoized function untuk get task result
  const getTaskResult = useCallback(async () => {
    if (isLoadingResult) return;

    setIsLoadingResult(true);

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    try {
      const response = await makeAuthenticatedRequest(
        TASK_API_ENDPOINTS.TASK_RESULTS(task.id),
        {
          method: 'GET',
          signal: abortControllerRef.current.signal
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch task result');
      }

      const data = await response.json();

      if (data.success && data.data.length > 0) {
        const r = data.data[0];
        const dateObj = new Date(r.result_date);

        const formatted: TaskResult = {
          id: r.id,
          result_text: r.result_text,
          result_type: r.result_type,
          result_date: dateObj.toLocaleDateString(),
          result_time: dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          attachments: r.attachments || []
        };

        setResult(formatted);
      } else {
        setResult(null);
        if (isCompleted) {
          setShowResultModal(true);
        }
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('Failed to fetch task result:', error);
      }
    } finally {
      setIsLoadingResult(false);
    }
  }, [task.id, isCompleted, isLoadingResult]);

  useEffect(() => {
    if (isCompleted && !result && !isLoadingResult) {
      getTaskResult();
    } else if (!isCompleted) {
      setShowResultModal(false);
      setResult(null);
    }
  }, [isCompleted, getTaskResult, result, isLoadingResult]);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'kanvasing': return 'bg-blue-100 text-blue-800';
      case 'followup': return 'bg-purple-100 text-purple-800';
      case 'penawaran': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getFileTypeIcon = (fileType: TaskAttachment["file_type"]) => {
    switch (fileType) {
      case "image": return Image;
      case "document": return FileText;
      case "video": return Video;
      case "audio": return Music;
      default: return FileIcon;
    }
  };

  const getFileTypeColor = (fileType: TaskAttachment["file_type"]) => {
    switch (fileType) {
      case "image": return "bg-green-100 text-green-700 border-green-300";
      case "document": return "bg-blue-100 text-blue-700 border-blue-300";
      case "video": return "bg-purple-100 text-purple-700 border-purple-300";
      case "audio": return "bg-orange-100 text-orange-700 border-orange-300";
      default: return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  const getImageUrl = (attachment: TaskAttachment): string => {
    const possibleUrls = [
      attachment.view_url,
      `/api/tasks/attachments/${attachment.id}/view`,
      `http://localhost:5000/api/tasks/attachments/${attachment.id}/view`,
      attachment.file_path ? `http://localhost:5000${attachment.file_path}` : null,
    ].filter(Boolean);

    return possibleUrls[0] || "";
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    setIsCompressing(true);

    try {
      const processedFiles = await Promise.all(
        selectedFiles.map(async (file) => {
          if (file.type.startsWith('image/')) {
            const compressed = await compressImage(file, {
              maxSizeMB: 1,
              maxWidthOrHeight: 1920,
              useWebWorker: true
            });

            return new File(
              [compressed],
              file.name,
              {
                type: compressed.type || file.type,
                lastModified: Date.now()
              }
            );
          }
          return file;
        })
      );

      setFiles(processedFiles);
    } catch (error) {
      console.error('Error processing files:', error);
      Swal.fire({
        icon: 'error',
        title: 'File Processing Error',
        text: 'Error processing files. Please try again.',
        confirmButtonColor: '#3b82f6',
      });
    } finally {
      setIsCompressing(false);
    }
  };

  const handleStatusChange = async (newStatus: 'pending' | 'completed' | 'cancelled') => {
    setIsUpdating(true);
    setShowStatusDropdown(false);

    try {
      await onUpdateStatus(task.id, newStatus);

      if (newStatus === 'completed' && !result) {
        setShowResultModal(true);
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    setShowActionsDropdown(false);

    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      onDelete(task.id);
    }
  };

  const handleResultSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!resultText.trim()) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Please enter a result',
        confirmButtonColor: '#3b82f6',
      });
      return;
    }

    Swal.fire({
      title: 'Uploading Result...',
      text: 'Please wait while we save your result and attachments',
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('result_text', resultText.trim());
      formData.append('result_type', resultType);

      files.forEach((file) => {
        formData.append('attachments', file, file.name);
      });

      const response = await fetch(
        TASK_API_ENDPOINTS.ADD_RESULT_WITH_ATTACHMENTS(String(task.id)),
        {
          method: 'POST',
          body: formData,
          credentials: 'include',
        }
      );

      const result = await response.json();

      if (result.success) {
        await Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Task result added successfully!',
          timer: 2000,
          showConfirmButton: false,
          timerProgressBar: true,
        });

        setResultText('');
        setResultType('note');
        setFiles([]);
        setShowResultModal(false);
        await getTaskResult();
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Failed to Add Result',
          text: result.message || 'Error adding task result',
          confirmButtonColor: '#3b82f6',
        });
      }
    } catch (error) {
      console.error('Error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Upload Failed',
        text: 'Error adding task result. Please check your connection and try again.',
        confirmButtonColor: '#3b82f6',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = (attachment: TaskAttachment) => {
    const link = document.createElement("a");
    link.href = TASK_API_ENDPOINTS.ATTACHMENT_DOWNLOAD(String(attachment.id));
    link.download = attachment.original_filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleView = (attachment: TaskAttachment) => {
    if (attachment.view_url) {
      window.open(attachment.view_url, "_blank");
    } else {
      window.open(TASK_API_ENDPOINTS.ATTACHMENT_VIEW(String(attachment.id)), "_blank");
    }
  };

  const handleImagePreview = (attachment: TaskAttachment) => {
    if (attachment.file_type === "image") {
      const imageUrl = getImageUrl(attachment);
      setPreviewImage(imageUrl);
      setPreviewAttachment(attachment);
    }
  };

  const canEditTask = task.assigned_to === currentUser?.id || user?.isAdmin || user?.isGl || user?.isSales

  return (
    <>
      <div>
        <div className={`border p-4 bg-white hover:shadow-md transition-all duration-200 ${isCompleted ? 'bg-gray-50 border-gray-200 rounded-t-lg' : 'border-gray-200 rounded-lg'
          } ${isOverdue ? 'border-l-4 border-l-red-500' : ''}`}>
          <div className="flex items-start justify-between">
            <div className="flex items-start flex-1">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-3 mb-2">
                  <h4 className={`font-medium ${isCompleted ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                    {task.title}
                  </h4>

                  <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>

                  {isOverdue && (
                    <div className="flex items-center space-x-1 text-red-600">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="text-xs font-medium">Overdue</span>
                    </div>
                  )}
                </div>

                {task.description && (
                  <p className={`text-sm mb-3 ${isCompleted ? 'text-gray-400' : 'text-gray-600'}`}>
                    {task.description}
                  </p>
                )}

                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Tag className="w-3 h-3" />
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(task.category)}`}>
                      {task.category}
                    </span>
                  </div>

                  <div className={`flex items-center space-x-1 ${isOverdue ? 'text-red-600' : ''}`}>
                    <Calendar className="w-3 h-3" />
                    <span className="font-medium">Due: {formatDate(task.due_date)}</span>
                  </div>

                  <div className="flex items-center space-x-1">
                    <User className="w-3 h-3" />
                    <div className="flex items-center space-x-1">
                      <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-blue-700">
                          {getFirstChar(task.assigned_user_name || 'U')}
                        </span>
                      </div>
                      <span>{task.assigned_user_name || 'Unassigned'}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>Created {formatDate(task.created_at)}</span>
                  </div>
                </div>
              </div>
            </div>

            {canEditTask && (
              <div className="flex items-center space-x-2">
                {/* Status Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                    disabled={isUpdating}
                    className={`flex items-center space-x-1 px-3 py-2 text-xs font-medium rounded-full border transition-colors ${getStatusColor(task.status)
                      } hover:bg-opacity-80 disabled:opacity-50`}
                  >
                    {isUpdating ? (
                      <>
                        <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                        <span>Updating...</span>
                      </>
                    ) : (
                      <>
                        <span className="capitalize">{task.status}</span>
                        <ChevronDown className="w-3 h-3" />
                      </>
                    )}
                  </button>

                  {showStatusDropdown && !isUpdating && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowStatusDropdown(false)} />
                      <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                        <div className="py-1">
                          <button
                            onClick={() => handleStatusChange('pending')}
                            className={`w-full px-3 py-2 text-left text-xs font-medium hover:bg-gray-50 flex items-center space-x-2 ${task.status === 'pending' ? 'bg-yellow-50 text-yellow-800' : 'text-gray-700'
                              }`}
                          >
                            <Circle className="w-3 h-3" />
                            <span>Pending</span>
                          </button>

                          <button
                            onClick={() => handleStatusChange('completed')}
                            className={`w-full px-3 py-2 text-left text-xs font-medium hover:bg-gray-50 flex items-center space-x-2 ${task.status === 'completed' ? 'bg-green-50 text-green-800' : 'text-gray-700'
                              }`}
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Completed</span>
                          </button>

                          <button
                            onClick={() => handleStatusChange('cancelled')}
                            className={`w-full px-3 py-2 text-left text-xs font-medium hover:bg-gray-50 flex items-center space-x-2 ${task.status === 'cancelled' ? 'bg-red-50 text-red-800' : 'text-gray-700'
                              }`}
                          >
                            <X className="w-3 h-3" />
                            <span>Cancelled</span>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Actions Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowActionsDropdown(!showActionsDropdown)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>

                  {showActionsDropdown && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowActionsDropdown(false)} />
                      <div className="absolute right-0 top-full mt-1 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                        <div className="py-1">
                          <button
                            onClick={handleDelete}
                            className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Result Display with Attachments */}
        {result && (
          <div className="border-green-600 rounded-b-lg p-4 border bg-green-50">
            <div className="flex items-start space-x-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h4 className="font-medium text-green-800">Task Result</h4>
                </div>

                <p className="text-sm mb-3 text-gray-700">
                  {result.result_text}
                </p>

                <div className="flex items-center space-x-4 text-xs text-gray-600 mb-4">
                  <div className="flex items-center space-x-1">
                    <Tag className="w-3 h-3" />
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-200 text-green-800">
                      {result.result_type}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1">
                    <Calendar className="w-3 h-3" />
                    <span className="font-medium">{result.result_date}</span>
                  </div>

                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{result.result_time}</span>
                  </div>
                </div>

                {/* Attachments */}
                {result.attachments && result.attachments.length > 0 && (
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">
                      Attachments ({result.attachments.length})
                    </h5>
                    {result.attachments.map((attachment) => {
                      const FileIcon = getFileTypeIcon(attachment.file_type);
                      const colorClass = getFileTypeColor(attachment.file_type);

                      return (
                        <div
                          key={attachment.id}
                          className="group flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${colorClass}`}>
                            <FileIcon className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate">
                              {attachment.original_filename}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatBytes(attachment.file_size)}
                            </p>
                          </div>
                          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {attachment.file_type === 'image' && (
                              <button
                                onClick={() => handleImagePreview(attachment)}
                                className="p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-blue-50"
                                title="Preview"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            )}
                            {(attachment.view_url || attachment.file_type !== 'image') && (
                              <button
                                onClick={() => handleView(attachment)}
                                className="p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-blue-50"
                                title="View"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDownload(attachment)}
                              className="p-2 text-gray-500 hover:text-green-600 rounded-full hover:bg-green-50"
                              title="Download"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Loading Result */}
        {isLoadingResult && (
          <div className="border-gray-300 rounded-b-lg p-4 border bg-gray-50 flex items-center justify-center">
            <div className="flex items-center space-x-2 text-gray-600">
              <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
              <span className="text-sm">Loading result...</span>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Result Modal with Attachments */}
      {showResultModal && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={() => {
              setShowResultModal(false);
              setResultText('');
              setFiles([]);
              setResultType('note');
              handleStatusChange('pending');
            }}
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-hidden">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-lg font-semibold">Add Task Result</h2>
                <button
                  onClick={() => {
                    setShowResultModal(false);
                    setResultText('');
                    setFiles([]);
                    setResultType('note');
                    handleStatusChange('pending');
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
                <form onSubmit={handleResultSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Result Type
                    </label>
                    <select
                      value={resultType}
                      onChange={(e) => setResultType(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                      disabled={isUploading}
                    >
                      {RESULT_TYPES.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Result Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={resultText}
                      onChange={(e) => setResultText(e.target.value)}
                      placeholder="Describe the result..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={4}
                      required
                      disabled={isUploading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Attachments (Max 5 files, 10MB each)
                    </label>
                    <input
                      type="file"
                      multiple
                      onChange={handleFileSelect}
                      className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx"
                      disabled={isCompressing || isUploading}
                    />

                    {isCompressing && (
                      <div className="text-sm text-blue-600 mt-2 flex items-center">
                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                        <span>Compressing images...</span>
                      </div>
                    )}

                    {files.length > 0 && (
                      <div className="mt-3">
                        <div className="text-sm text-gray-600 mb-2">Selected files:</div>
                        <div className="space-y-2">
                          {files.map((file, index) => (
                            <div key={index} className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-md">
                              <span className="flex items-center text-sm">
                                <FileText className="w-4 h-4 mr-2 text-gray-500" />
                                {file.name}
                              </span>
                              <span className="text-xs text-gray-400">
                                ({formatBytes(file.size)})
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </form>
              </div>

              <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowResultModal(false);
                    setResultText('');
                    setFiles([]);
                    setResultType('note');
                    handleStatusChange('pending');
                  }}
                  disabled={isUploading}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleResultSubmit}
                  disabled={isUploading || !resultText.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isUploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <span>Save Result</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Image Preview Modal */}
      {previewImage && previewAttachment && (
        <>
          <div
            className="fixed inset-0 z-40 backdrop-blur-sm"
            style={{
              backgroundColor: "rgba(0, 0, 0, 0.6)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
            }}
            onClick={() => {
              setPreviewImage(null);
              setPreviewAttachment(null);
            }}
          />

          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8"
            onClick={() => {
              setPreviewImage(null);
              setPreviewAttachment(null);
            }}
          >
            <img
              src={previewImage}
              alt={previewAttachment.original_filename}
              className="block max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              crossOrigin="anonymous"
              onClick={(e) => e.stopPropagation()}
              onError={(e) => {
                console.error("Preview image failed to load:", previewImage);
              }}
            />
          </div>
        </>
      )}
    </>
  );
}