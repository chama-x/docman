import { useState, FormEvent, ChangeEvent, DragEvent } from "react";
import { ref, push } from "firebase/database";
import { database } from "../firebase";
import { DocumentCategories } from "../types/documentTypes";
import { useAuth } from "../contexts/AuthContext";
import { uploadToCloudinary } from "../services/cloudinaryService"; // Import the real Cloudinary service

interface DocumentUploaderProps {
  documentTypes: DocumentCategories;
  onUploadSuccess: () => void;
}

export default function DocumentUploader({
  documentTypes,
  onUploadSuccess,
}: DocumentUploaderProps) {
  const [documentType, setDocumentType] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const { currentUser, userRoles } = useAuth();

  // Combine document types based on user role
  const availableTypes: Record<string, string> = {
    ...documentTypes.common,
  };

  if (userRoles.isTeacher) {
    Object.assign(availableTypes, documentTypes.teacher);
  }

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
    setError("");

    // Validate file is PDF
    if (selectedFile.type !== "application/pdf") {
      setError("Only PDF files are allowed");
      setFile(null);
      return;
    }

    // Check file size (limit to 5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB");
      setFile(null);
      return;
    }

    setFile(selectedFile);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!documentType) {
      return setError("Please select a document type");
    }

    if (!file) {
      return setError("Please select a file to upload");
    }

    if (!currentUser) {
      return setError("User not logged in."); // Should not happen if component is rendered correctly
    }

    try {
      setLoading(true);
      setError("");
      setUploadStatus("Starting upload...");
      setUploadProgress(0);

      // Generate the new filename with timestamp
      const safeDocTypeKey = documentType; // Already in snake_case format
      const timestamp = Date.now();
      const newFileName = `${safeDocTypeKey}_${timestamp}.pdf`;
      console.log("Uploading document as:", newFileName);

      // Upload the file to Cloudinary using our service
      setUploadStatus("Uploading to cloud storage...");

      try {
        // Use the actual Cloudinary upload function with progress tracking
        const cloudinaryResponse = await uploadToCloudinary(
          file,
          newFileName,
          currentUser.uid,
          (progress) => setUploadProgress(progress),
        );

        // Upload success - use the secure URL returned by Cloudinary
        const uploadedFileUrl = cloudinaryResponse.secure_url;
        console.log("Upload successful:", uploadedFileUrl);
        setUploadStatus("Processing document...");

        // Save document metadata to Firebase
        const userDocumentsRef = ref(
          database,
          `users/${currentUser.uid}/documents`,
        );
        await push(userDocumentsRef, {
          type: documentType,
          name: availableTypes[documentType], // Store the document type name
          url: uploadedFileUrl,
          publicId: cloudinaryResponse.public_id, // Store this for potential deletion later
          status: "pending",
          uploadedAt: timestamp,
          fileName: newFileName,
          originalFileName: file.name,
          fileSize: file.size,
          lastModified: file.lastModified,
        });

        setUploadStatus("Document uploaded successfully!");

        // Reset form after short delay
        setTimeout(() => {
          setFile(null);
          setDocumentType("");
          setUploadStatus("");
          setUploadProgress(0);
          onUploadSuccess();
        }, 2000);
      } catch (cloudinaryError) {
        console.error("Cloudinary upload error:", cloudinaryError);
        setError(
          `Upload failed: ${cloudinaryError instanceof Error ? cloudinaryError.message : "Server error"}`,
        );
        setUploadProgress(0);
      }
    } catch (error) {
      setError("Failed to upload document. Please try again.");
      console.error("Upload error:", error);
      setUploadProgress(0);
      setUploadStatus("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="bg-white shadow rounded-lg p-6 transition-all duration-300 animate-fadeIn"
      style={{ color: "var(--color-text-primary)" }}
      data-oid="lu.sr2a"
    >
      {error && (
        <div
          className="bg-error bg-opacity-10 border border-error border-opacity-20 text-error px-4 py-3 rounded-lg mb-4 flex items-start animate-fadeIn"
          style={{ color: "oklch(35% 0.15 20)" }}
          data-oid="n95f3u8"
        >
          <svg
            className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          <span>{error}</span>
        </div>
      )}

      {uploadStatus && !error && (
        <div
          className="bg-success bg-opacity-10 border border-success border-opacity-20 text-success px-4 py-3 rounded-lg mb-4 flex items-start animate-fadeIn"
          style={{ color: "oklch(35% 0.15 150)" }}
          data-oid="kv7w00w"
        >
          <svg
            className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          <div className="flex-1">
            <div>{uploadStatus}</div>
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="mt-2">
                <div
                  className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden"
                >
                  <div
                    className="bg-primary h-2.5 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <div
                  className="text-xs text-right mt-1"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  {uploadProgress}%
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6" data-oid="2w_q1jb">
        <div data-oid="tuqvg_h">
          <label
            className="block font-medium mb-2"
            style={{ color: "var(--color-text-primary)" }}
            htmlFor="documentType"
            data-oid="wa0i_91"
          >
            Document Type
          </label>
          <select
            id="documentType"
            className="w-full px-4 py-2 rounded-md border border-color bg-white focus:ring-2 focus:ring-primary focus:ring-opacity-20 focus:border-primary focus:outline-none transition disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ color: "var(--color-text-primary)" }}
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value)}
            required
            disabled={loading}
            data-oid="8y1wo6_"
          >
            <option value="">
              Select a document type
            </option>
            {Object.entries(availableTypes)
              .sort(([, nameA], [, nameB]) => nameA.localeCompare(nameB))
              .map(([key, name]) => (
                <option key={key} value={key}>
                  {name}
                </option>
              ))}
          </select>
        </div>

        <div data-oid="tz_cheo">
          <label
            className="block font-medium mb-2"
            style={{ color: "var(--color-text-primary)" }}
            data-oid="4yrlfsg"
          >
            PDF Document (Max 5MB)
          </label>

          <div
            className={`border-2 border-dashed rounded-lg p-8 transition-all duration-200 cursor-pointer ${
              loading
                ? "bg-gray-100 cursor-not-allowed"
                : isDragging
                  ? "border-primary bg-primary bg-opacity-5 scale-[1.01]"
                  : file
                    ? "border-success bg-success bg-opacity-5"
                    : "hover:border-primary hover:bg-primary hover:bg-opacity-5"
            }`}
            style={{ 
              borderColor: loading ? "var(--color-border)" : 
                         isDragging ? "var(--color-primary)" : 
                         file ? "var(--color-success)" : "var(--color-border)" 
            }}
            onDragOver={!loading ? handleDragOver : undefined}
            onDragLeave={!loading ? handleDragLeave : undefined}
            onDrop={!loading ? handleDrop : undefined}
            onClick={() => {
              if (!loading) {
                document.getElementById("fileInput")?.click();
              }
            }}
          >
            <div className="text-center space-y-3">
              {file ? (
                <>
                  <div
                    className="mx-auto w-12 h-12 rounded-full flex items-center justify-center animate-fadeIn"
                    style={{ 
                      backgroundColor: "rgba(39, 174, 96, 0.1)",
                      color: "var(--color-success)"
                    }}
                  >
                    <svg
                      className="w-6 h-6"
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
                  </div>
                  <p 
                    className="font-medium"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    {file.name}
                  </p>
                  <p style={{ color: "var(--color-text-muted)" }} className="text-sm">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <div 
                    className="text-xs"
                    style={{ color: "var(--color-primary)" }}
                  >
                    Click or drag to replace
                  </div>
                </>
              ) : (
                <>
                  <div
                    className="mx-auto w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ 
                      backgroundColor: "rgba(0, 119, 182, 0.1)",
                      color: "var(--color-primary)"
                    }}
                  >
                    <svg
                      className="w-6 h-6"
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
                  </div>
                  <p 
                    className="font-medium"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    Drag and drop your file here
                  </p>
                  <p style={{ color: "var(--color-text-muted)" }} className="text-sm">
                    or{" "}
                    <span style={{ color: "var(--color-primary)" }} className="underline">
                      click to browse
                    </span>
                  </p>
                  <div className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                    Only PDF files up to 5MB are supported
                  </div>
                </>
              )}
              <input
                type="file"
                id="fileInput"
                onChange={handleFileChange}
                accept="application/pdf"
                disabled={loading}
                className="hidden"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end" data-oid="8d29i0f">
          <button
            type="submit"
            disabled={loading || !file || !documentType}
            className="btn btn-primary px-6 py-2.5 text-white font-medium rounded-md transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center hover:translate-y-[-1px] active:translate-y-[1px]"
            data-oid="e.-42mr"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Uploading...
              </>
            ) : (
              <>
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                  ></path>
                </svg>
                Upload Document
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
