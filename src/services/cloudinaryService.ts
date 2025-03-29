// This service handles file uploads to Cloudinary
// You need to install the cloudinary package: npm install cloudinary-core

interface UploadProgressCallback {
  (progress: number): void;
}

interface CloudinaryResponse {
  secure_url: string;
  public_id: string;
  original_filename: string;
  format: string;
  bytes: number;
  created_at: string;
  resource_type: string;
}

// Environment variables (set in .env file)
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dqhwtrjdd';
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'docman_uploads';

// Check if required environment variables are defined
if (!CLOUD_NAME) {
  console.error('Missing Cloudinary CLOUD_NAME. Check your .env file.');
}

/**
 * Uploads a file to Cloudinary using unsigned upload with preset
 * @param file The file to upload
 * @param newFileName The desired filename (without extension)
 * @param userId User ID for folder organization
 * @param onProgress Optional callback for upload progress
 * @returns Promise with the Cloudinary response
 */
export const uploadToCloudinary = async (
  file: File,
  newFileName: string,
  userId: string,
  onProgress?: UploadProgressCallback
): Promise<CloudinaryResponse> => {
  return new Promise((resolve, reject) => {
    // Create a FormData object to send the file
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    
    // Use public_id to set the filename in Cloudinary
    // Remove .pdf extension if present in newFileName
    const publicId = `user_documents/${userId}/${newFileName.replace(/\.pdf$/i, '')}`;
    formData.append('public_id', publicId);
    
    // For debugging
    console.log('Uploading to Cloudinary:', {
      cloudName: CLOUD_NAME,
      uploadPreset: UPLOAD_PRESET,
      publicId
    });
    
    // Create a new XMLHttpRequest to track upload progress
    const xhr = new XMLHttpRequest();
    
    // Make sure to use the correct cloud name
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`, true);
    
    // Set up progress tracking
    if (onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          onProgress(percentComplete);
        }
      };
    }
    
    // Handle completion
    xhr.onload = function() {
      if (xhr.status === 200) {
        const response = JSON.parse(xhr.responseText);
        console.log('Cloudinary upload successful:', response);
        resolve(response as CloudinaryResponse);
      } else {
        console.error('Cloudinary error:', xhr.status, xhr.responseText);
        try {
          const errorObj = JSON.parse(xhr.responseText);
          reject(new Error(`Upload failed: ${errorObj.error?.message || xhr.statusText}`));
        } catch (e) {
          reject(new Error(`Upload failed with status: ${xhr.status}`));
        }
      }
    };
    
    // Handle errors
    xhr.onerror = function() {
      console.error('Cloudinary network error');
      reject(new Error('Upload failed due to network error'));
    };
    
    // Send the request
    xhr.send(formData);
  });
};

/**
 * Deletes a file from Cloudinary
 * Note: This would typically be handled through a backend endpoint for security
 * @param publicId The public_id of the file to delete
 */
export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  // This is a placeholder. In a real implementation, you would:
  // 1. Call a backend endpoint that has your API_SECRET
  // 2. That endpoint would make the authenticated deletion request
  console.warn('File deletion should be implemented via backend for security.');
  throw new Error('Direct file deletion from frontend is not implemented for security reasons.');
}; 