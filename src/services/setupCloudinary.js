// This script should be run once to set up the Cloudinary upload preset

// Import Cloudinary v2 SDK
import { v2 as cloudinary } from 'cloudinary';

// Configure using environment variables or direct values
cloudinary.config({
  cloud_name: 'dqhwtrjdd',
  api_key: '434795811361573',
  api_secret: 'PSwp6Kw8usJnPCFERYklPIVmuKU'
});

// Create the upload preset
async function createUploadPreset() {
  try {
    // Check if preset already exists
    const result = await cloudinary.api.upload_preset('docman_uploads');
    console.log('Upload preset already exists:', result);
  } catch (error) {
    // If preset doesn't exist, create it
    if (error.error && error.error.http_code === 404) {
      try {
        const result = await cloudinary.api.create_upload_preset({
          name: 'docman_uploads',
          folder: 'user_documents',
          allowed_formats: 'pdf',
          unsigned: true,
          use_filename: true,
          unique_filename: false
        });
        
        console.log('Upload preset created successfully:', result);
      } catch (createError) {
        console.error('Error creating upload preset:', createError);
      }
    } else {
      console.error('Error checking upload preset:', error);
    }
  }
}

// Run the setup
createUploadPreset()
  .then(() => {
    console.log('Cloudinary setup completed');
  })
  .catch((error) => {
    console.error('Cloudinary setup failed:', error);
  }); 