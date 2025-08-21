// utils/imageCompression.js
import imageCompression from 'browser-image-compression';
import Resizer from 'react-image-file-resizer';

export const compressImage = async (file, options = {}) => {
  const defaultOptions = {
    maxSizeMB: 1,          // Maksimal 1MB
    maxWidthOrHeight: 1920, // Maksimal 1920px
    useWebWorker: true,
    initialQuality: 0.8
  };

  const finalOptions = { ...defaultOptions, ...options };

  try {
    const compressedFile = await imageCompression(file, finalOptions);
    console.log(`🔥 Image compressed: ${file.size} -> ${compressedFile.size} bytes`);
    return compressedFile;
  } catch (error) {
    console.error('Error compressing image:', error);
    return file; // Return original if compression fails
  }
};

export const resizeImage = (file, maxWidth = 1920, maxHeight = 1080, quality = 80) => {
  return new Promise((resolve) => {
    Resizer.imageFileResizer(
      file,
      maxWidth,
      maxHeight,
      'JPEG',
      quality,
      0,
      (uri) => {
        resolve(uri);
      },
      'file'
    );
  });
};