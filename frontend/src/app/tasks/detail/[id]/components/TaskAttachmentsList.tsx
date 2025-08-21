// components/TaskAttachmentsList.jsx
import React, { useState, useEffect } from 'react';
import type { TaskAttachment } from '../types';

interface TaskAttachmentsListProps {
  taskId: string;
}

const TaskAttachmentsList: React.FC<TaskAttachmentsListProps> = ({ taskId }) => {
  const [attachments, setAttachments] = useState<TaskAttachment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (taskId) {
      fetchAttachments();
    }
  }, [taskId]);

  const fetchAttachments = async () => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/attachments`);
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

  const handleDelete = async (attachmentId: number) => {
    if (!confirm('Are you sure you want to delete this attachment?')) return;

    try {
      const response = await fetch(`/api/tasks/attachments/${attachmentId}`, {
        method: 'DELETE'
      });
      const result = await response.json();
      if (result.success) {
        setAttachments(prev => prev.filter(att => att.id !== attachmentId));
        alert('Attachment deleted successfully');
      } else {
        alert(result.message || 'Error deleting attachment');
      }
    } catch (error) {
      console.error('Error deleting attachment:', error);
      alert('Error deleting attachment');
    }
  };

  if (loading) return <div>Loading attachments...</div>;

  return (
    <div className="space-y-2">
      <h4 className="font-medium text-gray-900">Attachments ({attachments.length})</h4>
      {attachments.length === 0 ? (
        <p className="text-sm text-gray-500">No attachments found</p>
      ) : (
        <div className="space-y-2">
          {attachments.map((attachment) => (
            <div key={attachment.id} className="flex items-center justify-between p-2 border rounded">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">{getFileIcon(attachment.file_type)}</span>
                <div>
                  <p className="text-sm font-medium">{attachment.original_filename}</p>
                  <p className="text-xs text-gray-500">
                    {(attachment.file_size / 1024 / 1024).toFixed(2)} MB •
                    {attachment.uploader?.name || 'Unknown'} •
                    {new Date(attachment.uploaded_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                {attachment.view_url && (
                  <button
                    onClick={() => window.open(attachment.view_url, '_blank')}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    👁️ View
                  </button>
                )}
                <button
                  onClick={() => handleDownload(attachment.id, attachment.original_filename)}
                  className="text-green-600 hover:text-green-800 text-sm"
                >
                  📥 Download
                </button>
                <button
                  onClick={() => handleDelete(attachment.id)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const getFileIcon = (fileType: TaskAttachment['file_type']): string => {
  switch (fileType) {
    case 'image': return '🖼️';
    case 'document': return '📄';
    case 'video': return '🎥';
    case 'audio': return '🎵';
    default: return '📎';
  }
};

export default TaskAttachmentsList;