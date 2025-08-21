// utils/uploadUtils.js
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { promisify } from 'util';
import crypto from 'crypto';

// Promisify fs methods
const mkdir = promisify(fs.mkdir);
const access = promisify(fs.access);

// Configuration
const UPLOAD_CONFIG = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedImageTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  allowedDocumentTypes: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ],
  allowedVideoTypes: ['video/mp4', 'video/mpeg', 'video/quicktime'],
  allowedAudioTypes: ['audio/mpeg', 'audio/wav', 'audio/mp3'],
  uploadDir: 'uploads/task-attachments'
};

// Ensure upload directory exists
export const ensureUploadDir = async () => {
  const uploadPath = path.resolve(UPLOAD_CONFIG.uploadDir);
  try {
    await access(uploadPath);
  } catch (error) {
    // Directory doesn't exist, create it
    await mkdir(uploadPath, { recursive: true });
    console.log(`📁 Created upload directory: ${uploadPath}`);
  }
};

// Generate unique filename
export const generateUniqueFilename = (originalFilename) => {
  const timestamp = Date.now();
  const randomString = crypto.randomBytes(8).toString('hex');
  const extension = path.extname(originalFilename);
  const nameWithoutExt = path.basename(originalFilename, extension);
  
  // Sanitize filename
  const sanitizedName = nameWithoutExt
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .substring(0, 50);
  
  return `${sanitizedName}_${timestamp}_${randomString}${extension}`;
};

// Determine file type from mime type
export const getFileType = (mimeType) => {
  if (UPLOAD_CONFIG.allowedImageTypes.includes(mimeType)) {
    return 'image';
  } else if (UPLOAD_CONFIG.allowedDocumentTypes.includes(mimeType)) {
    return 'document';
  } else if (UPLOAD_CONFIG.allowedVideoTypes.includes(mimeType)) {
    return 'video';
  } else if (UPLOAD_CONFIG.allowedAudioTypes.includes(mimeType)) {
    return 'audio';
  }
  return 'other';
};

// Check if file type is allowed
export const isFileTypeAllowed = (mimeType) => {
  const allAllowedTypes = [
    ...UPLOAD_CONFIG.allowedImageTypes,
    ...UPLOAD_CONFIG.allowedDocumentTypes,
    ...UPLOAD_CONFIG.allowedVideoTypes,
    ...UPLOAD_CONFIG.allowedAudioTypes
  ];
  
  return allAllowedTypes.includes(mimeType);
};

// Multer storage configuration
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    await ensureUploadDir();
    cb(null, UPLOAD_CONFIG.uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueFilename = generateUniqueFilename(file.originalname);
    cb(null, uniqueFilename);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  if (isFileTypeAllowed(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} is not allowed`), false);
  }
};

// Multer configuration
export const upload = multer({
  storage: storage,
  limits: {
    fileSize: UPLOAD_CONFIG.maxFileSize,
    files: 5 // Maximum 5 files per request
  },
  fileFilter: fileFilter
});

// Error handler for multer errors
export const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: `File too large. Maximum size is ${UPLOAD_CONFIG.maxFileSize / 1024 / 1024}MB`
      });
    } else if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Maximum 5 files per upload'
      });
    } else if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected field name for file upload'
      });
    }
  } else if (error.message.includes('File type')) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
  
  return res.status(500).json({
    success: false,
    message: 'Upload error occurred',
    error: error.message
  });
};

// Helper function to delete file
export const deleteFile = async (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`🗑️ Deleted file: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error deleting file ${filePath}:`, error);
    return false;
  }
};

// Calculate compression ratio
export const calculateCompressionRatio = (originalSize, compressedSize) => {
  if (!originalSize || !compressedSize) return null;
  return ((originalSize - compressedSize) / originalSize * 100).toFixed(2);
};

export { UPLOAD_CONFIG };