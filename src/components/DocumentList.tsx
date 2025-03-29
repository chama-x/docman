import { useState, useEffect } from "react";
import {
  ref,
  onValue,
  remove,
  DatabaseReference,
  get,
} from "firebase/database";
import { database } from "../firebase";
import { useAuth } from "../contexts/AuthContext";
import { Document, DocumentCategories } from "../types/documentTypes";
import { deleteFromCloudinary } from "../services/cloudinaryService";

interface DocumentListProps {
  documentTypes: DocumentCategories;
}

export default function DocumentList({ documentTypes }: DocumentListProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState<string | null>(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const documentsRef: DatabaseReference = ref(
      database,
      `users/${currentUser.uid}/documents`,
    );

    const unsubscribe = onValue(
      documentsRef,
      (snapshot) => {
        setIsLoading(false);
        const data = snapshot.val();
        const documentsList: Document[] = [];

        if (data) {
          Object.entries(data).forEach(([id, value]) => {
            // Type assertion to ensure value is of the expected structure
            const docData = value as Omit<Document, "id">;
            documentsList.push({
              id,
              type: docData.type,
              name: docData.name || getDocumentTypeName(docData.type), // Use name if exists, otherwise look up
              url: docData.url,
              publicId: docData.publicId,
              status: docData.status || "pending", // Default to pending if not set
              uploadedAt: docData.uploadedAt,
              fileName: docData.fileName,
              originalFileName: docData.originalFileName || docData.fileName,
              fileSize: docData.fileSize,
              lastModified: docData.lastModified,
            });
          });
        }

        // Sort by upload date, newest first
        documentsList.sort((a, b) => b.uploadedAt - a.uploadedAt);

        setDocuments(documentsList);
      },
      (error) => {
        console.error("Error fetching documents:", error);
        setError("Failed to load documents. Please refresh the page.");
        setIsLoading(false);
      },
    );

    return () => unsubscribe();
  }, [currentUser]);

  // Get document type name from key
  const getDocumentTypeName = (typeKey: string): string => {
    if (documentTypes.common && documentTypes.common[typeKey]) {
      return documentTypes.common[typeKey];
    }
    if (documentTypes.teacher && documentTypes.teacher[typeKey]) {
      return documentTypes.teacher[typeKey];
    }
    return typeKey; // Fallback to the key if name not found
  };

  const confirmDelete = (id: string) => {
    setDeleteConfirm(id);
  };

  const cancelDelete = () => {
    setDeleteConfirm(null);
  };

  async function handleDelete(id: string) {
    if (!currentUser) return;
    setError("");

    try {
      // First, get the document to access its Cloudinary publicId
      const documentRef = ref(
        database,
        `users/${currentUser.uid}/documents/${id}`,
      );
      const snapshot = await get(documentRef);
      const documentData = snapshot.val();

      if (!documentData) {
        throw new Error("Document not found");
      }

      // If we have a publicId, try to delete from Cloudinary
      if (documentData.publicId) {
        try {
          await deleteFromCloudinary(documentData.publicId);
        } catch (cloudinaryError) {
          console.warn("Failed to delete from Cloudinary:", cloudinaryError);
          // Continue anyway - we'll delete from Firebase
        }
      }

      // Delete the document metadata from Firebase
      await remove(documentRef);
      setDeleteConfirm(null); // Reset confirmation state
    } catch (error) {
      setError("Failed to delete document. Please try again.");
      console.error("Document deletion error:", error);
    }
  }

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return "Unknown";
    const units = ["B", "KB", "MB", "GB"];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  const getStatusBadgeClasses = (status: string): string => {
    switch (status.toLowerCase()) {
      case "approved":
      case "verified":
        return "status-approved";
      case "rejected":
        return "status-rejected";
      case "pending":
      default:
        return "status-pending";
    }
  };

  const renderPreviewModal = () => {
    if (!showPreview) return null;

    const document = documents.find((doc) => doc.id === showPreview);
    if (!document) return null;

    return (
      <div
        className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 animate-fadeIn"
      >
        <div
          className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col animate-slideUp"
          style={{
            backdropFilter: "blur(5px)",
            border: "1px solid rgba(255, 255, 255, 0.3)"
          }}
        >
          <div
            className="flex justify-between items-center p-4 border-b border-gray-200"
          >
            <h3
              className="font-bold text-lg truncate text-gray-800"
            >
              {document.originalFileName || document.fileName}
            </h3>
            <button
              onClick={() => setShowPreview(null)}
              className="text-gray-500 hover:text-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded-full p-1"
              aria-label="Close"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div
            className="flex-1 overflow-auto p-1 bg-gray-50 h-[70vh]"
          >
            <iframe
              src={document.url}
              className="w-full h-full border-0 rounded bg-white"
              title={document.fileName}
            ></iframe>
          </div>

          <div
            className="p-4 border-t border-gray-200 flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0"
          >
            <div>
              <div className="flex items-center mb-1">
                <svg
                  className="w-4 h-4 mr-1 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  ></path>
                </svg>
                <span className="text-sm text-gray-600">
                  {formatDate(document.uploadedAt)}
                </span>
              </div>
              <div className="flex items-center">
                <svg
                  className="w-4 h-4 mr-1 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  ></path>
                </svg>
                <span className="text-sm text-gray-600">
                  {formatFileSize(document.fileSize)}
                </span>
              </div>
            </div>
            <div className="flex space-x-2">
              <a
                href={document.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-all hover:shadow-md flex items-center hover:translate-y-[-1px] active:translate-y-[1px]"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  ></path>
                </svg>
                Open in New Tab
              </a>
              <a
                href={document.url}
                download={document.originalFileName || document.fileName}
                className="bg-white hover:bg-gray-100 text-gray-800 border border-gray-300 px-4 py-2 rounded-md transition-all hover:shadow-sm flex items-center hover:translate-y-[-1px] active:translate-y-[1px]"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  ></path>
                </svg>
                Download
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div
        className="flex justify-center items-center p-8 animate-fadeIn min-h-[200px]"
        data-oid=".o41d5."
      >
        <div
          className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"
          data-oid="3rar9mm"
        ></div>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div
        className="bg-secondary rounded-lg shadow p-8 text-center animate-fadeIn"
        data-oid="jhkyl8o"
      >
        <svg
          className="w-16 h-16 mx-auto text-muted mb-4 animate-pulse-slow"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          data-oid="0o9dc8f"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            data-oid="y:rse72"
          ></path>
        </svg>
        <h3
          className="text-xl font-semibold text-primary mb-2"
          data-oid="p83cr_i"
        >
          No Documents Found
        </h3>
        <p className="text-secondary mb-6" data-oid="ks9nmar">
          You haven't uploaded any documents yet.
        </p>
        <button
          onClick={() => window.history.back()}
          className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md inline-flex items-center transition-all hover:shadow-md hover:translate-y-[-1px] active:translate-y-[1px]"
          data-oid="q080kzs"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            data-oid=":zeybll"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
              data-oid="ykdsnyx"
            ></path>
          </svg>
          Upload Documents
        </button>
      </div>
    );
  }

  return (
    <div
      className="bg-secondary rounded-lg shadow overflow-hidden animate-fadeIn"
      data-oid="mggoeg_"
    >
      {error && (
        <div
          className="bg-error bg-opacity-10 border border-error border-opacity-20 text-error m-4 px-4 py-3 rounded-lg flex items-start animate-fadeIn"
          data-oid="w1pjv2_"
        >
          <svg
            className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            data-oid="bwbf6hk"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              data-oid="5tq_ohc"
            ></path>
          </svg>
          <span data-oid="sjc3.ic">{error}</span>
        </div>
      )}

      <div className="overflow-x-auto" data-oid="rnavb3v">
        <table className="w-full" data-oid="sffqv2k">
          <thead data-oid="ktgy3uf">
            <tr className="bg-accent border-b border-color" data-oid="lrbdfq0">
              <th
                className="py-3 px-4 text-left text-xs font-medium text-secondary uppercase tracking-wider"
                data-oid="kmbw_3q"
              >
                Document Type
              </th>
              <th
                className="py-3 px-4 text-left text-xs font-medium text-secondary uppercase tracking-wider"
                data-oid="n0:isog"
              >
                Filename
              </th>
              <th
                className="py-3 px-4 text-left text-xs font-medium text-secondary uppercase tracking-wider"
                data-oid="7vwp6tb"
              >
                Upload Date
              </th>
              <th
                className="py-3 px-4 text-left text-xs font-medium text-secondary uppercase tracking-wider"
                data-oid="furrqtv"
              >
                Status
              </th>
              <th
                className="py-3 px-4 text-left text-xs font-medium text-secondary uppercase tracking-wider"
                data-oid="5i3-tlo"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-color" data-oid="1_4pbdd">
            {documents.map((doc, index) => (
              <tr
                key={doc.id}
                className="hover:bg-accent transition-colors"
                style={{ animationDelay: `${index * 50}ms` }}
                data-oid="zwd.42g"
              >
                <td className="py-3 px-4 text-primary" data-oid="-iq0g.k">
                  {doc.name}
                </td>
                <td className="py-3 px-4 text-primary" data-oid="av1qfct">
                  <div className="flex items-center" data-oid="nclyay3">
                    <svg
                      className="w-5 h-5 mr-2 text-muted"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      data-oid="79.by::"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                        data-oid="03w5crf"
                      ></path>
                    </svg>
                    <span
                      className="truncate max-w-xs"
                      title={doc.originalFileName || doc.fileName}
                      data-oid="zttxoen"
                    >
                      {doc.originalFileName || doc.fileName}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-4 text-secondary" data-oid="jh5vfs7">
                  {formatDate(doc.uploadedAt)}
                </td>
                <td className="py-3 px-4" data-oid="6rt00sb">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClasses(doc.status)}`}
                    data-oid="d0smft8"
                  >
                    {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                  </span>
                </td>
                <td className="py-3 px-4" data-oid="7xpa4:7">
                  <div className="flex space-x-2" data-oid=":qolb7_">
                    <button
                      onClick={() => setShowPreview(doc.id)}
                      className="flex items-center justify-center bg-blue-100 hover:bg-blue-200 text-blue-700 p-2 rounded-md transition-all focus:outline-none hover:scale-105"
                      title="View Document"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        ></path>
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        ></path>
                      </svg>
                    </button>

                    {deleteConfirm === doc.id ? (
                      <div
                        className="flex space-x-1 animate-fadeIn"
                      >
                        <button
                          onClick={() => handleDelete(doc.id)}
                          className="flex items-center justify-center bg-red-600 text-white p-2 rounded-md hover:bg-red-700 transition-all focus:outline-none hover:scale-105"
                          title="Confirm Delete"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M5 13l4 4L19 7"
                            ></path>
                          </svg>
                        </button>
                        <button
                          onClick={cancelDelete}
                          className="flex items-center justify-center bg-gray-200 text-gray-700 p-2 rounded-md hover:bg-gray-300 transition-all focus:outline-none hover:scale-105"
                          title="Cancel"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M6 18L18 6M6 6l12 12"
                            ></path>
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => confirmDelete(doc.id)}
                        className="flex items-center justify-center bg-red-100 hover:bg-red-200 text-red-700 p-2 rounded-md transition-all focus:outline-none hover:scale-105"
                        title="Delete Document"
                        disabled={doc.status === "approved"}
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          ></path>
                        </svg>
                      </button>
                    )}

                    <a
                      href={doc.url}
                      download={doc.originalFileName || doc.fileName}
                      className="flex items-center justify-center bg-green-100 hover:bg-green-200 text-green-700 p-2 rounded-md transition-all focus:outline-none hover:scale-105"
                      title="Download Document"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        ></path>
                      </svg>
                    </a>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {renderPreviewModal()}
    </div>
  );
}
