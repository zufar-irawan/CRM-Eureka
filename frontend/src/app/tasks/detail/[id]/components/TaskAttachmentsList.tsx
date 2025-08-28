// components/TaskAttachmentsList.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { MoreHorizontal, Download, Eye, Trash2, Paperclip, FileText, Image, Video, Music, File, Calendar } from 'lucide-react';
import type { TaskAttachment, CurrentUser } from '../types';
import { formatDate, getFirstChar } from '../utils/formatting';
import { makeAuthenticatedRequest } from '../utils/constants';
import Swal from 'sweetalert2';

interface TaskAttachmentsListProps {
  taskId: string;
  currentUser: CurrentUser | null;
}

const TaskAttachmentsList: React.FC<TaskAttachmentsListProps> = ({ taskId, currentUser }) => {
  const [attachments, setAttachments] = useState<TaskAttachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionMenuId, setActionMenuId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    if (taskId) {
      fetchAttachments();
    }
  }, [taskId]);

  const fetchAttachments = async () => {
    try {
      const response = await makeAuthenticatedRequest(`/api/tasks/${taskId}/attachments`);
      const result = await response.json();
      if (result.success) {
        setAttachments(result.data);
      }
    } catch (error) {
      console.error('Error fetching attachments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (attachmentId: number, filename: string) => {
    const link = document.createElement('a');
    link.href = `/api/tasks/attachments/${attachmentId}/download`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleView = (viewUrl: string) => {
    window.open(viewUrl, '_blank');
  };

  const handleDelete = async (attachmentId: number) => {
    const deleteConfirmation = await Swal.fire({
      title: 'Delete Attachment?',
      text: 'Are you sure you want to delete this attachment? This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel'
    });

    if (!deleteConfirmation.isConfirmed) return;

    setDeletingId(attachmentId);
    try {
      const response = await makeAuthenticatedRequest(`/api/tasks/attachments/${attachmentId}`, {
        method: 'DELETE'
      });
      const result = await response.json();

      if (result.success) {
        setAttachments(prev => prev.filter(att => att.id !== attachmentId));

        Swal.fire({
          icon: 'success',
          title: 'Deleted',
          text: 'Attachment has been deleted successfully!',
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        throw new Error(result.message || 'Error deleting attachment');
      }
    } catch (error) {
      console.error('Error deleting attachment:', error);

      Swal.fire({
        icon: 'error',
        title: 'Delete Failed',
        text: 'Failed to delete attachment. Please try again.',
      });
    } finally {
      setDeletingId(null);
      setActionMenuId(null);
    }
  };

  const getFileTypeInfo = (fileType: TaskAttachment['file_type']) => {
    switch (fileType) {
      case 'image':
        return {
          icon: Image,
          color: 'bg-green-100',
          textColor: 'text-green-700',
          bgColor: 'bg-green-50',
          label: 'Image'
        };
      case 'document':
        return {
          icon: FileText,
          color: 'bg-blue-100',
          textColor: 'text-blue-700',
          bgColor: 'bg-blue-50',
          label: 'Document'
        };
      case 'video':
        return {
          icon: Video,
          color: 'bg-purple-100',
          textColor: 'text-purple-700',
          bgColor: 'bg-purple-50',
          label: 'Video'
        };
      case 'audio':
        return {
          icon: Music,
          color: 'bg-orange-100',
          textColor: 'text-orange-700',
          bgColor: 'bg-orange-50',
          label: 'Audio'
        };
      default:
        return {
          icon: File,
          color: 'bg-gray-100',
          textColor: 'text-gray-700',
          bgColor: 'bg-gray-50',
          label: 'File'
        };
    }
  };

  const formatFileSize = (bytes: number): string => {
    const mb = bytes / 1024 / 1024;
    if (mb < 1) {
      const kb = bytes / 1024;
      return `${kb.toFixed(1)} KB`;
    }
    return `${mb.toFixed(2)} MB`;
  };

  const canDelete = (attachment: TaskAttachment): boolean => {
    // Assuming uploader only has name property, we'll check if current user is admin
    // or if uploader name matches current user name
    return Boolean(currentUser?.role === 'admin' ||
      (currentUser?.name && attachment.uploader?.name === currentUser.name));
  };

  if (loading) {
    return (
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Paperclip className="w-4 h-4 text-gray-600" />
          <h4 className="font-medium text-gray-900">Attachments</h4>
        </div>
        <div className="text-sm text-gray-500">Loading attachments...</div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2 px-5 py-2">
        <Paperclip className="w-4 h-4 text-gray-600" />
        <h4 className="font-medium text-gray-900">Attachments ({attachments.length})</h4>
      </div>

      {attachments.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
          <Paperclip className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500">No attachments found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {attachments.map((attachment) => {
            const typeInfo = getFileTypeInfo(attachment.file_type);
            const isDeleting = Boolean(deletingId === attachment.id);
            const showActions = actionMenuId === attachment.id;

            return (
              <div
                key={attachment.id}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start space-x-3">
                  {/* File Type Icon */}
                  <div className={`w-8 h-8 ${typeInfo.color} rounded-full flex items-center justify-center flex-shrink-0`}>
                    <typeInfo.icon className="w-4 h-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${typeInfo.bgColor} ${typeInfo.textColor}`}>
                          {typeInfo.label}
                        </span>
                        <span className="flex items-center space-x-1 text-xs text-gray-500">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(attachment.uploaded_at)}</span>
                        </span>
                        {attachment.uploader?.name && (
                          <span className="flex items-center space-x-1 text-xs text-gray-500">
                            <div className="w-4 h-4 bg-gray-200 rounded-full flex items-center justify-center">
                              <span className="text-xs font-medium">
                                {getFirstChar(attachment.uploader.name)}
                              </span>
                            </div>
                            <span>{attachment.uploader.name}</span>
                          </span>
                        )}
                      </div>

                      {/* Actions Menu */}
                      <div className="relative">
                        <button
                          onClick={() => setActionMenuId(showActions ? null : attachment.id)}
                          className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                          disabled={isDeleting}
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>

                        {showActions && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setActionMenuId(null)} />
                            <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                              <div className="py-1">
                                {attachment.view_url && (
                                  <button
                                    onClick={() => {
                                      handleView(attachment.view_url!);
                                      setActionMenuId(null);
                                    }}
                                    className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                                  >
                                    <Eye className="w-3 h-3" />
                                    <span>View</span>
                                  </button>
                                )}

                                <button
                                  onClick={() => {
                                    handleDownload(attachment.id, attachment.original_filename);
                                    setActionMenuId(null);
                                  }}
                                  className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                                >
                                  <Download className="w-3 h-3" />
                                  <span>Download</span>
                                </button>

                                {canDelete(attachment) && (
                                  <button
                                    onClick={() => handleDelete(attachment.id)}
                                    disabled={isDeleting}
                                    className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2 disabled:opacity-50"
                                  >
                                    {isDeleting ? (
                                      <>
                                        <div className="w-3 h-3 border border-red-600 border-t-transparent rounded-full animate-spin" />
                                        <span>Deleting...</span>
                                      </>
                                    ) : (
                                      <>
                                        <Trash2 className="w-3 h-3" />
                                        <span>Delete</span>
                                      </>
                                    )}
                                  </button>
                                )}
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* File Info */}
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {attachment.original_filename}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(attachment.file_size)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TaskAttachmentsList;