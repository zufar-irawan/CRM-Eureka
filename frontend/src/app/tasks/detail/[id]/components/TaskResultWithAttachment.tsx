import React, { useState } from 'react';
import { compressImage } from '../utils/imageCompression';
import { CurrentUser } from '../types';

interface TaskResultWithAttachmentProps {
  taskId: string;
  onSuccess: () => void;
}

const TaskResultWithAttachment: React.FC<TaskResultWithAttachmentProps> = ({ taskId, onSuccess }) => {
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
            // Compress image files while preserving filename
            const compressed = await compressImage(file, {
              maxSizeMB: 1,
              maxWidthOrHeight: 1920,
              useWebWorker: true
            });
            
            // ✅ FIXED: Preserve original filename after compression
            const preservedFile = new File(
              [compressed], 
              file.name, // Use original filename
              { 
                type: compressed.type || file.type,
                lastModified: Date.now()
              }
            );
            
            console.log('✅ Image compressed:', {
              original: file.name,
              preserved: preservedFile.name,
              originalSize: file.size,
              compressedSize: preservedFile.size
            });
            
            return preservedFile;
          }
          // Return non-image files as-is
          return file;
        })
      );

      setFiles(processedFiles);
      console.log('✅ Files processed:', processedFiles.map(f => ({ name: f.name, size: f.size })));
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

      // ✅ FIXED: Add files with proper names
      files.forEach((file, index) => {
        console.log(`Adding file ${index + 1}: ${file.name} (${file.size} bytes)`);
        formData.append('attachments', file, file.name); // Explicitly pass filename
      });

      // Debug FormData
      console.log('FormData contents:');
      for (let [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`${key}:`, { name: value.name, size: value.size, type: value.type });
        } else {
          console.log(`${key}:`, value);
        }
      }

      const response = await fetch(`http://localhost:5000/api/tasks/${taskId}/results/with-attachments`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
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
                <li key={index} className="flex justify-between">
                  <span>📎 {file.name}</span>
                  <span>({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
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