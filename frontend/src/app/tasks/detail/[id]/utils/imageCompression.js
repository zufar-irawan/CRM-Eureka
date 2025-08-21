// utils/imageCompression.js
import imageCompression from 'browser-image-compression';

export const compressImage = async (file, options = {}) => {
  const defaultOptions = {
    maxSizeMB: 1,   
    maxWidthOrHeight: 1920, 
    useWebWorker: true,
    initialQuality: 0.8,
    fileType: file.type,
    fileName: file.name
  };

  const finalOptions = { ...defaultOptions, ...options };

  try {
    console.log('🔄 Compressing image:', {
      originalName: file.name,
      originalSize: file.size,
      type: file.type
    });

    const compressedFile = await imageCompression(file, finalOptions);
    const namedCompressedFile = new File(
      [compressedFile],
      file.name, 
      {
        type: compressedFile.type || file.type,
        lastModified: Date.now(),
      }
    );

    console.log('Image compressed successfully:', {
      originalName: file.name,
      compressedName: namedCompressedFile.name,
      originalSize: file.size,
      compressedSize: namedCompressedFile.size,
      compressionRatio: ((file.size - namedCompressedFile.size) / file.size * 100).toFixed(2) + '%'
    });
    return namedCompressedFile;
  } catch (error) {
    console.error('Error compressing image:', error);
    console.log('Returning original file due to compression error');
    return file; 
  }
};

export const resizeImage = (file, maxWidth = 1920, maxHeight = 1080, quality = 80) => {
  return new Promise((resolve, reject) => {
    try {
      console.log('🔄 Resizing image:', file.name);

      resolve(file);
    } catch (error) {
      console.error('❌ Error resizing image:', error);
      resolve(file);
    }
  });
};