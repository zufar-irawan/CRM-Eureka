import React, { useState } from 'react';
import { compressImage } from '../utils/imageCompression';
import { CurrentUser } from '../types';

interface TaskResultWithAttachmentProps {
  taskId: string;
  currentUser: CurrentUser | null;
  onSuccess: () => void;
}

const TaskResultWithAttachment: React.FC<TaskResultWithAttachmentProps> = ({ taskId, currentUser, onSuccess }) => {
  const [resultText, setResultText] = useState('');
  const [resultType, setResultType] = useState('note');
  const [files, setFiles] = useState<File[]>([]);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    setIsCompressing(true);

    try {
      const processedFiles = await Promise.all(
        selectedFiles.map(async (file) => {
          if (file.type.startsWith('image/')) {
            // Compress image files
            const compressed = await compressImage(file, {
              maxSizeMB: 1,
              maxWidthOrHeight: 1920,
              useWebWorker: true
            });
            return compressed;
          }
          // Return non-image files as-is
          return file;
        })
      );

      setFiles(processedFiles);
      console.log('✅ Files processed:', processedFiles.length);
    } catch (error) {
      console.error('Error processing files:', error);
      alert('Error processing files');
    } finally {
      setIsCompressing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!resultText.trim()) {
      alert('Result text is required');
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('result_text', resultText);
      formData.append('result_type', resultType);
      formData.append('created_by', String(currentUser?.id || '')); 

      // Add all files to FormData
      files.forEach((file) => {
        formData.append('attachments', file);
      });

      const response = await fetch(`http://localhost:5000/api/tasks/${taskId}/results/with-attachments`, {
        method: 'POST',
        body: formData,
        headers: {
          // Note: 'Content-Type' is not set here, browser will set it to 'multipart/form-data' with boundary
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      const result = await response.json();

      if (result.success) {
        alert('Task result added successfully!');
        setResultText('');
        setFiles([]);
        if (onSuccess) onSuccess();
      } else {
        alert(result.message || 'Error adding task result');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error adding task result');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Result Text *
        </label>
        <textarea
          value={resultText}
          onChange={(e) => setResultText(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          rows={3}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Result Type
        </label>
        <select
          value={resultType}
          onChange={(e) => setResultType(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        >
          <option value="note">Note</option>
          <option value="call">Call</option>
          <option value="meeting">Meeting</option>
          <option value="email">Email</option>
          <option value="visit">Visit</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Attachments (Max 5 files, 10MB each)
        </label>
        <input
          type="file"
          multiple
          onChange={handleFileSelect}
          className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx"
          disabled={isCompressing || isUploading}
        />
        
        {isCompressing && (
          <p className="text-sm text-blue-600 mt-1">
            🔄 Compressing images...
          </p>
        )}

        {files.length > 0 && (
          <div className="mt-2">
            <p className="text-sm text-gray-600">Selected files:</p>
            <ul className="text-sm text-gray-500">
              {files.map((file, index) => (
                <li key={index}>
                  📎 {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={isCompressing || isUploading || !resultText.trim()}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
      >
        {isUploading ? '📤 Uploading...' : '➕ Add Result with Attachments'}
      </button>
    </form>
  );
};

export default TaskResultWithAttachment;