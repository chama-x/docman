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
import { ref, get, onValue, DatabaseReference } from "firebase/database";
import { database } from "../../firebase";

interface Stats {
  totalDocuments: number;
  pendingDocuments: number;
  approvedDocuments: number;
  rejectedDocuments: number;
}

export default function TeacherDashboard() {
  const [documentTypes, setDocumentTypes] = useState<DocumentCategories>({
    common: {},
    teacher: {},
  });
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [documents, setDocuments] = useState<Document[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalDocuments: 0,
    pendingDocuments: 0,
    approvedDocuments: 0,
    rejectedDocuments: 0,
  });
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

      // Update stats
      const pendingDocs = documentsList.filter(
        (doc) => doc.status === "pending",
      ).length;
      const approvedDocs = documentsList.filter(
        (doc) => doc.status === "approved",
      ).length;
      const rejectedDocs = documentsList.filter(
        (doc) => doc.status === "rejected",
      ).length;

      setStats({
        totalDocuments: documentsList.length,
        pendingDocuments: pendingDocs,
        approvedDocuments: approvedDocs,
        rejectedDocuments: rejectedDocs,
      });
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
        title="Teacher Dashboard"
        subtitle="Loading..."
        data-oid="f9hssqy"
      >
        <div className="flex justify-center py-12" data-oid="w9-ju3y">
          <div
            className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"
            data-oid="-4r-5y:"
          ></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Teacher Dashboard"
      subtitle="Manage your documents and submissions"
      data-oid="dr_lc6h"
    >
      <div className="w-full animate-fadeInFast" data-oid="mlikkop">
        {error && (
          <div
            className="bg-error bg-opacity-10 border border-error text-error px-4 py-3 rounded-lg mb-6 flex items-start animate-fadeInFast"
            data-oid="4-8zoct"
          >
            <svg
              className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              data-oid="eeit75i"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                data-oid="jld1sch"
              ></path>
            </svg>
            {error}
          </div>
        )}

        {/* Stats Section */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
          data-oid="3ysxtgl"
        >
          <div className="card flex flex-col" data-oid="3n18smh">
            <div
              className="text-sm font-medium text-secondary"
              data-oid="_muc.4i"
            >
              Total Documents
            </div>
            <div
              className="mt-1 text-3xl font-semibold text-primary"
              data-oid="dbfzjgq"
            >
              {stats.totalDocuments}
            </div>
          </div>

          <div className="card flex flex-col" data-oid="nq5kagr">
            <div
              className="text-sm font-medium text-secondary"
              data-oid="ivrohge"
            >
              Pending Review
            </div>
            <div
              className="mt-1 text-3xl font-semibold text-warning"
              data-oid="7wgn29m"
            >
              {stats.pendingDocuments}
            </div>
          </div>

          <div className="card flex flex-col" data-oid="v1nk9q1">
            <div
              className="text-sm font-medium text-secondary"
              data-oid="hprwe72"
            >
              Approved
            </div>
            <div
              className="mt-1 text-3xl font-semibold text-success"
              data-oid="qm_w017"
            >
              {stats.approvedDocuments}
            </div>
          </div>

          <div className="card flex flex-col" data-oid="m-:iad_">
            <div
              className="text-sm font-medium text-secondary"
              data-oid="p_qh6u2"
            >
              Rejected
            </div>
            <div
              className="mt-1 text-3xl font-semibold text-error"
              data-oid="n1ur7cd"
            >
              {stats.rejectedDocuments}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div
          className="bg-secondary rounded-lg shadow-md mb-6 overflow-hidden border border-color"
          data-oid="gxczp2t"
        >
          <div className="flex border-b border-color" data-oid=":i_axph">
            <button
              className={`px-6 py-3 font-medium transition-all ${
                activeTab === "overview"
                  ? "bg-accent text-primary border-b-2 border-primary"
                  : "text-primary hover:text-primary-dark hover:bg-accent"
              }`}
              onClick={() => setActiveTab("overview")}
              data-oid="7-ofa7_"
            >
              <div className="flex items-center" data-oid="2rba1-x">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  data-oid="3zygpzt"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                    data-oid="_yhxbfz"
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
              data-oid="enpma4v"
            >
              <div className="flex items-center" data-oid="tytsuiq">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  data-oid="niggw11"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    data-oid="mg2rrh_"
                  ></path>
                </svg>
                Upload Documents
              </div>
            </button>
          </div>

          <div className="p-6" data-oid="fvf3he3">
            {activeTab === "overview" ? (
              documents.length === 0 ? (
                <div className="py-8 text-center" data-oid="o_0k-a1">
                  <svg
                    className="w-16 h-16 mx-auto text-muted mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                    data-oid="b:fgkvo"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      data-oid="z60ijpu"
                    ></path>
                  </svg>
                  <h3
                    className="text-lg font-medium text-primary mb-2"
                    data-oid="09wdrx9"
                  >
                    No Documents Yet
                  </h3>
                  <p className="text-secondary mb-4" data-oid="4fypg_n">
                    You haven't uploaded any documents yet. Get started by
                    uploading your first document.
                  </p>
                  <button
                    onClick={() => setActiveTab("upload")}
                    className="btn btn-primary inline-flex items-center"
                    data-oid="16-ewuo"
                  >
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                      data-oid="9-9rq5d"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        data-oid="xk3ve.7"
                      ></path>
                    </svg>
                    Upload Documents
                  </button>
                </div>
              ) : (
                <DocumentList
                  documentTypes={documentTypes}
                  data-oid="21n4no4"
                />
              )
            ) : (
              <DocumentUploader
                documentTypes={documentTypes}
                onUploadSuccess={() => {
                  // This will refresh the documents list when uploading is done
                  // The documents are already being fetched with onValue in useEffect
                }}
                data-oid="s.vbz7w"
              />
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
