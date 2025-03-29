import { useState, FormEvent, ChangeEvent, DragEvent } from 'react';
import { ref, push } from 'firebase/database';
import { database } from '../firebase';
import { DocumentCategories } from '../types/documentTypes';
import { useAuth } from '../contexts/AuthContext';

interface DocumentUploaderProps {
  documentTypes: DocumentCategories;
  onUploadSuccess: () => void;
}

export default function DocumentUploader({ documentTypes, onUploadSuccess }: DocumentUploaderProps) {
  const [documentType, setDocumentType] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  
  const { currentUser, userRoles } = useAuth();
  
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };
  
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };
  
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };
  
  const validateAndSetFile = (selectedFile: File) => {
    setError('');
    
    // Validate file is PDF
    if (selectedFile.type !== 'application/pdf') {
      setError('Only PDF files are allowed');
      setFile(null);
      return;
    }
    
    // Check file size (limit to 5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      setFile(null);
      return;
    }
    
    setFile(selectedFile);
  };
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!documentType) {
      return setError('Please select a document type');
    }
    
    if (!file) {
      return setError('Please select a file to upload');
    }
    
    try {
      setLoading(true);
      setError('');
      setUploadStatus('');
      setUploadProgress(0);
      
      // Simulate upload progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prevProgress => {
          // Cap progress at 90% until actual upload completes
          const newProgress = prevProgress + Math.random() * 10;
          return newProgress > 90 ? 90 : newProgress;
        });
      }, 300);
      
      // In a real implementation, you would upload the file to storage first
      // and get back a URL. For this example, we'll create a placeholder URL
      const mockFileUrl = `https://storage.example.com/${currentUser?.uid}/${Date.now()}_${file.name}`;
      
      // Simulate network latency for upload
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Save document metadata to the database
      const userDocumentsRef = ref(database, `users/${currentUser?.uid}/documents`);
      await push(userDocumentsRef, {
        type: documentType,
        url: mockFileUrl,
        status: 'pending',
        uploadedAt: Date.now(),
        fileName: file.name
      });
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      setUploadStatus('Document uploaded successfully!');
      
      // Reset form after short delay
      setTimeout(() => {
        setFile(null);
        setDocumentType('');
        setUploadProgress(0);
        onUploadSuccess();
      }, 2000);
      
    } catch (error) {
      setError('Failed to upload document. Please try again.');
      console.error(error);
      setUploadProgress(0);
    } finally {
      setLoading(false);
    }
  };
  
  // Combine document types based on user role
  const availableTypes: Record<string, string> = {
    ...documentTypes.common
  };
  
  if (userRoles.isTeacher) {
    Object.assign(availableTypes, documentTypes.teacher);
  }
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {uploadStatus && !error && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {uploadStatus}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="documentType">
            Document Type
          </label>
          <select
            id="documentType"
            className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring focus:ring-blue-300"
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value)}
            required
          >
            <option value="">Select a document type</option>
            {Object.entries(availableTypes).map(([key, name]) => (
              <option key={key} value={key}>
                {name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            PDF Document
          </label>
          
          <div
            className={`border-2 border-dashed rounded-lg p-6 transition-colors ${
              isDragging ? 'border-blue-500 bg-blue-50' : file ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="text-center">
              {file ? (
                <svg 
                  className="mx-auto h-12 w-12 text-green-500" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="2" 
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
              ) : (
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                  ></path>
                </svg>
              )}
              
              <p className="mt-1 text-sm text-gray-600">
                {file
                  ? `Selected: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`
                  : 'Drag and drop your PDF file here, or click to select file'}
              </p>
              
              <input
                type="file"
                id="file"
                className="sr-only"
                accept="application/pdf"
                onChange={handleFileChange}
              />
              
              <button
                type="button"
                onClick={() => document.getElementById('file')?.click()}
                className="mt-2 inline-flex items-center px-4 py-2 border border-gray-300 rounded shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring focus:ring-blue-300"
              >
                {file ? 'Change File' : 'Select File'}
              </button>
              
              <p className="text-gray-500 text-xs mt-1">Only PDF files up to 5MB are accepted</p>
            </div>
          </div>
        </div>
        
        {uploadProgress > 0 && uploadProgress < 100 && (
          <div className="mb-4">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-in-out" 
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 text-right mt-1">{Math.round(uploadProgress)}% uploaded</p>
          </div>
        )}
        
        <div className="flex justify-end">
          <button
            type="submit"
            className={`px-4 py-2 rounded font-bold ${
              loading || !file || !documentType
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-700 text-white'
            }`}
            disabled={loading || !file || !documentType}
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Uploading...
              </span>
            ) : (
              'Upload Document'
            )}
          </button>
        </div>
      </form>
    </div>
  );
} 