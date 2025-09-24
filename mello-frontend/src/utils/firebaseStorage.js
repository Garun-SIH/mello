import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../config/firebase';

/**
 * Upload a file to Firebase Storage
 * @param {File} file - The file to upload
 * @param {string} path - The storage path (e.g., 'resources/videos/')
 * @param {function} onProgress - Progress callback function
 * @returns {Promise<string>} - Download URL of the uploaded file
 */
export const uploadFileToStorage = (file, path, onProgress = null) => {
  return new Promise((resolve, reject) => {
    // Create a unique filename
    const timestamp = Date.now();
    const fileName = `${timestamp}_${file.name}`;
    const storageRef = ref(storage, `${path}${fileName}`);

    // Create upload task
    const uploadTask = uploadBytesResumable(storageRef, file);

    // Listen for state changes, errors, and completion
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        // Progress callback
        if (onProgress) {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          onProgress(progress);
        }
      },
      (error) => {
        // Handle unsuccessful uploads
        console.error('Upload failed:', error);
        reject(error);
      },
      () => {
        // Handle successful uploads on complete
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          resolve(downloadURL);
        });
      }
    );
  });
};

/**
 * Delete a file from Firebase Storage
 * @param {string} url - The download URL of the file to delete
 * @returns {Promise<void>}
 */
export const deleteFileFromStorage = async (url) => {
  try {
    // Extract the file path from the URL
    const urlParts = url.split('/');
    const pathIndex = urlParts.findIndex(part => part === 'o') + 1;
    const encodedPath = urlParts[pathIndex].split('?')[0];
    const filePath = decodeURIComponent(encodedPath);
    
    const fileRef = ref(storage, filePath);
    await deleteObject(fileRef);
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};

/**
 * Get file size in a human-readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} - Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Validate file type and size
 * @param {File} file - The file to validate
 * @param {Array} allowedTypes - Array of allowed MIME types
 * @param {number} maxSizeMB - Maximum file size in MB
 * @returns {Object} - Validation result
 */
export const validateFile = (file, allowedTypes, maxSizeMB) => {
  const errors = [];
  
  // Check file type
  if (!allowedTypes.includes(file.type)) {
    errors.push(`File type ${file.type} is not allowed`);
  }
  
  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    errors.push(`File size must be less than ${maxSizeMB}MB`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};
