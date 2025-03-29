import { useState, useEffect } from "react";
import DashboardLayout from "../layout/DashboardLayout";
import DocumentUploader from "../DocumentUploader";
import DocumentList from "../DocumentList";
import { DocumentCategories, Document } from "../../types/documentTypes";
import {
  getDocumentTypes,
  initializeDefaultDocumentTypes,
} from "../../services/documentService";
import { useAuth } from "../../contexts/AuthContext";
import { ref, onValue, DatabaseReference } from "firebase/database";
import { database } from "../../firebase";

export default function UserDashboard() {
  const [documentTypes, setDocumentTypes] = useState<DocumentCategories>({
    common: {},
    teacher: {},
  });
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [documents, setDocuments] = useState<Document[]>([]);
  const { currentUser } = useAuth();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Initialize default document types if none exist
        await initializeDefaultDocumentTypes();

        // Get all document types
        const types = await getDocumentTypes();
        setDocumentTypes(types);
      } catch (error) {
        setError("Failed to load data");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    const documentsRef: DatabaseReference = ref(
      database,
      `users/${currentUser.uid}/documents`,
    );

    const unsubscribe = onValue(documentsRef, (snapshot) => {
      const data = snapshot.val();
      const documentsList: Document[] = [];

      if (data) {
        Object.entries(data).forEach(([id, value]) => {
          // Type assertion to ensure value is of the expected structure
          const docData = value as Omit<Document, "id">;
          documentsList.push({
            id,
            type: docData.type,
            url: docData.url,
            status: docData.status,
            uploadedAt: docData.uploadedAt,
            fileName: docData.fileName,
          });
        });
      }

      // Sort by upload date, newest first
      documentsList.sort((a, b) => b.uploadedAt - a.uploadedAt);

      setDocuments(documentsList);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Get document type name from key
  const getDocumentTypeName = (typeKey: string): string => {
    if (documentTypes.common[typeKey]) {
      return documentTypes.common[typeKey];
    }
    if (documentTypes.teacher[typeKey]) {
      return documentTypes.teacher[typeKey];
    }
    return typeKey; // Fallback to the key if name not found
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadgeClass = (status: string): string => {
    switch (status) {
      case "approved":
        return "status-approved";
      case "rejected":
        return "status-rejected";
      case "pending":
      default:
        return "status-pending";
    }
  };

  if (loading) {
    return (
      <DashboardLayout
        title="User Dashboard"
        subtitle="Loading..."
        data-oid="zlk13ha"
      >
        <div className="flex justify-center py-12" data-oid="2puap4e">
          <div
            className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"
            data-oid="apm:doi"
          ></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="User Dashboard"
      subtitle="Manage your documents"
      data-oid="7yz3y18"
    >
      <div className="w-full animate-fadeInFast" data-oid="n_a_u.f">
        {error && (
          <div
            className="bg-error bg-opacity-10 border border-error border-opacity-20 text-error px-4 py-3 rounded-lg mb-6 flex items-start animate-fadeInFast"
            data-oid="x75fcgx"
          >
            <svg
              className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              data-oid="kwd5xog"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                data-oid="w18az-m"
              ></path>
            </svg>
            {error}
          </div>
        )}

        {/* Summary Card */}
        <div className="card mb-6" data-oid="9x5l:qm">
          <div className="flex items-center justify-between" data-oid=".klb9e0">
            <div data-oid="8h5xu5c">
              <h2
                className="text-lg font-medium text-primary"
                data-oid="_qe-q3t"
              >
                Documents Summary
              </h2>
              <p className="text-sm text-secondary mt-1" data-oid="4a1de-5">
                You have {documents.length} document(s) in your account
              </p>
            </div>
            <div className="text-3xl font-bold text-primary" data-oid="u68s70f">
              {documents.length}
            </div>
          </div>

          {documents.length > 0 && (
            <div
              className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3"
              data-oid="und_smg"
            >
              <div
                className="bg-accent p-4 rounded-lg border border-color"
                data-oid="9h1.kwm"
              >
                <div
                  className="text-sm font-medium text-primary mb-1"
                  data-oid="lkuvhy8"
                >
                  Pending
                </div>
                <div className="flex items-center" data-oid="igsz3s:">
                  <span
                    className="text-xl font-semibold text-warning"
                    data-oid="v2c5.qn"
                  >
                    {documents.filter((doc) => doc.status === "pending").length}
                  </span>
                  <div
                    className="ml-2 h-2 w-2 rounded-full bg-warning"
                    data-oid="kx.-pf-"
                  ></div>
                </div>
              </div>

              <div
                className="bg-accent p-4 rounded-lg border border-color"
                data-oid="2-64dt3"
              >
                <div
                  className="text-sm font-medium text-primary mb-1"
                  data-oid="zvpw.ok"
                >
                  Approved
                </div>
                <div className="flex items-center" data-oid="xe_i9zg">
                  <span
                    className="text-xl font-semibold text-success"
                    data-oid="mshm.fm"
                  >
                    {
                      documents.filter((doc) => doc.status === "approved")
                        .length
                    }
                  </span>
                  <div
                    className="ml-2 h-2 w-2 rounded-full bg-success"
                    data-oid="32ucd:j"
                  ></div>
                </div>
              </div>

              <div
                className="bg-accent p-4 rounded-lg border border-color"
                data-oid="cb-mr1i"
              >
                <div
                  className="text-sm font-medium text-primary mb-1"
                  data-oid="3wwsavk"
                >
                  Rejected
                </div>
                <div className="flex items-center" data-oid="-5cfer2">
                  <span
                    className="text-xl font-semibold text-error"
                    data-oid="dt4_w5w"
                  >
                    {
                      documents.filter((doc) => doc.status === "rejected")
                        .length
                    }
                  </span>
                  <div
                    className="ml-2 h-2 w-2 rounded-full bg-error"
                    data-oid=".jt23z6"
                  ></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div
          className="bg-secondary rounded-lg shadow-md mb-6 overflow-hidden border border-color"
          data-oid="5-zd_wr"
        >
          <div className="flex border-b border-color" data-oid="1u_iwgh">
            <button
              className={`px-6 py-3 font-medium transition-all ${
                activeTab === "overview"
                  ? "bg-accent text-primary border-b-2 border-primary"
                  : "text-primary hover:text-primary-dark hover:bg-accent"
              }`}
              onClick={() => setActiveTab("overview")}
              data-oid="fe9sc52"
            >
              <div className="flex items-center" data-oid="e9:oo8e">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  data-oid="3zje.9p"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                    data-oid="4_whfxn"
                  ></path>
                </svg>
                Overview
              </div>
            </button>
            <button
              className={`px-6 py-3 font-medium transition-all ${
                activeTab === "upload"
                  ? "bg-accent text-primary border-b-2 border-primary"
                  : "text-primary hover:text-primary-dark hover:bg-accent"
              }`}
              onClick={() => setActiveTab("upload")}
              data-oid="0p12vwc"
            >
              <div className="flex items-center" data-oid="b_p0v65">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  data-oid="k67p67v"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    data-oid="8x-ya29"
                  ></path>
                </svg>
                Upload Documents
              </div>
            </button>
          </div>

          <div className="p-6" data-oid="_x_7h1z">
            {activeTab === "overview" ? (
              documents.length === 0 ? (
                <div className="py-8 text-center" data-oid="yubzl81">
                  <svg
                    className="w-16 h-16 mx-auto text-muted mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                    data-oid="d-n6gpw"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      data-oid="-40aln9"
                    ></path>
                  </svg>
                  <h3
                    className="text-lg font-medium text-primary mb-2"
                    data-oid="pash0he"
                  >
                    No Documents Yet
                  </h3>
                  <p className="text-secondary mb-4" data-oid="wp7h0vi">
                    You haven't uploaded any documents yet. Get started by
                    uploading your first document.
                  </p>
                  <button
                    onClick={() => setActiveTab("upload")}
                    className="btn btn-primary inline-flex items-center"
                    data-oid="a9ffa4i"
                  >
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                      data-oid="b:so5bf"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        data-oid="5inmomd"
                      ></path>
                    </svg>
                    Upload Documents
                  </button>
                </div>
              ) : (
                <DocumentList
                  documentTypes={documentTypes}
                  data-oid="31ivy3w"
                />
              )
            ) : (
              <DocumentUploader
                documentTypes={documentTypes}
                onUploadSuccess={() => {
                  // This will refresh the documents list when uploading is done
                  // The documents are already being fetched with onValue in useEffect
                }}
                data-oid="16xz2st"
              />
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
