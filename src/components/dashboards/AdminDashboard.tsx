import { useState, useEffect } from "react";
import DashboardLayout from "../layout/DashboardLayout";
import AdminPanel from "../AdminPanel";
import DocumentCategoryManager from "../DocumentCategoryManager";
import DocumentUploader from "../DocumentUploader";
import DocumentList from "../DocumentList";
import { DocumentCategories } from "../../types/documentTypes";
import {
  getDocumentTypes,
  initializeDefaultDocumentTypes,
} from "../../services/documentService";
import { getAllUsers } from "../../services/userService";
import { ref, get, update } from "firebase/database";
import { database } from "../../firebase";
import { useAuth } from "../../contexts/AuthContext";
import DocumentCategoriesPanel from "../DocumentCategoriesPanel";
import AnalyticsPanel from "../AnalyticsPanel";
import DocumentApprovalPanel from "../DocumentApprovalPanel";

interface Stats {
  totalUsers: number;
  totalTeachers: number;
  totalDocuments: number;
  pendingDocuments: number;
}

export default function AdminDashboard() {
  const [documentTypes, setDocumentTypes] = useState<DocumentCategories>({
    common: {},
    teacher: {},
  });
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<
    "overview" | "categories" | "approvals" | "users"
  >("overview");
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalTeachers: 0,
    totalDocuments: 0,
    pendingDocuments: 0,
  });
  const [pendingDocuments, setPendingDocuments] = useState<any[]>([]);
  const { userRoles, currentUser } = useAuth();

  const isDocManager =
    currentUser?.email?.toLowerCase() === "docmanager@school.edu";
  const isPrincipal =
    currentUser?.email?.toLowerCase() === "principal@school.edu";

  // Get dashboard title from userRoles or determine based on email
  const dashboardTitle =
    userRoles.title ||
    (isDocManager ? "Document Manager Dashboard" : "Principal Dashboard");

  // Set appropriate subtitle based on role
  const dashboardSubtitle = isDocManager
    ? "Manage document categories and submissions"
    : "Complete school document management system";

  // Define theme colors based on role
  const themeColors = {
    principal: {
      bgColor: "bg-blue-900",
      accentColor: "bg-blue-700",
      hoverColor: "hover:bg-blue-800",
      textColor: "text-blue-500",
      lightBg: "bg-blue-50",
      lightBorder: "border-blue-100",
      lightText: "text-blue-700",
      tabActive: "bg-blue-600",
    },
    docManager: {
      bgColor: "bg-purple-900",
      accentColor: "bg-purple-700",
      hoverColor: "hover:bg-purple-800",
      textColor: "text-purple-500",
      lightBg: "bg-purple-50",
      lightBorder: "border-purple-100",
      lightText: "text-purple-700",
      tabActive: "bg-purple-600",
    },
  };

  // Get theme based on user role
  const theme = isPrincipal ? themeColors.principal : themeColors.docManager;

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Initialize default document types if none exist
        await initializeDefaultDocumentTypes();

        // Get all document types
        const types = await getDocumentTypes();
        setDocumentTypes(types);

        // Load stats
        await loadStats();

        // Load pending documents
        await loadPendingDocuments();
      } catch (error) {
        setError("Failed to load data");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const loadStats = async () => {
    try {
      // Get users
      const users = await getAllUsers();
      const totalTeachers = users.filter((user) => user.isTeacher).length;

      // Get documents count
      let totalDocs = 0;
      let pendingDocs = 0;

      const usersRef = ref(database, "users");
      const usersSnapshot = await get(usersRef);
      const usersData = usersSnapshot.val();

      if (usersData) {
        for (const userId in usersData) {
          const userDocsRef = ref(database, `users/${userId}/documents`);
          const userDocsSnapshot = await get(userDocsRef);
          const userDocs = userDocsSnapshot.val() || {};

          const docsArray = Object.values(userDocs) as any[];
          totalDocs += docsArray.length;

          pendingDocs += docsArray.filter(
            (doc: any) => doc.status === "pending",
          ).length;
        }
      }

      setStats({
        totalUsers: users.length,
        totalTeachers,
        totalDocuments: totalDocs,
        pendingDocuments: pendingDocs,
      });
    } catch (error) {
      console.error("Error loading stats", error);
    }
  };

  const loadPendingDocuments = async () => {
    try {
      const usersRef = ref(database, "users");
      const usersSnapshot = await get(usersRef);
      const usersData = usersSnapshot.val();

      const pending: any[] = [];

      if (usersData) {
        for (const userId in usersData) {
          const userDocsRef = ref(database, `users/${userId}/documents`);
          const userDocsSnapshot = await get(userDocsRef);
          const userDocs = userDocsSnapshot.val() || {};

          for (const docId in userDocs) {
            const doc = userDocs[docId];
            if (doc.status === "pending") {
              pending.push({
                id: docId,
                userId: userId,
                userName: usersData[userId].email || "Unknown",
                ...doc,
              });
            }
          }
        }
      }

      // Sort by upload date, newest first
      pending.sort((a, b) => b.uploadedAt - a.uploadedAt);
      setPendingDocuments(pending);
    } catch (error) {
      console.error("Error loading pending documents", error);
    }
  };

  const handleApproveDocument = async (userId: string, docId: string) => {
    try {
      await update(ref(database, `users/${userId}/documents/${docId}`), {
        status: "approved",
      });
      await loadPendingDocuments();
      await loadStats();
    } catch (error) {
      console.error("Error approving document", error);
      setError("Failed to approve document");
    }
  };

  const handleRejectDocument = async (userId: string, docId: string) => {
    try {
      await update(ref(database, `users/${userId}/documents/${docId}`), {
        status: "rejected",
      });
      await loadPendingDocuments();
      await loadStats();
    } catch (error) {
      console.error("Error rejecting document", error);
      setError("Failed to reject document");
    }
  };

  const refreshDocumentTypes = async () => {
    try {
      const types = await getDocumentTypes();
      setDocumentTypes(types);
      await loadStats();
      await loadPendingDocuments();
    } catch (error) {
      setError("Failed to refresh document types");
      console.error(error);
    }
  };

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

  if (loading) {
    return (
      <DashboardLayout
        title={dashboardTitle}
        subtitle="Loading..."
        bgColor={theme.bgColor}
        data-oid="58ad.3z"
      >
        <div className="flex justify-center py-12" data-oid="md690ky">
          <div
            className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"
            data-oid="t3apnkr"
          ></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title={dashboardTitle}
      subtitle={dashboardSubtitle}
      bgColor={theme.bgColor}
      data-oid="dr_lc6h"
    >
      <div className="w-full animate-fadeInFast" data-oid=":3lofk2">
        {error && (
          <div
            className="bg-error bg-opacity-10 border border-error text-error px-4 py-3 rounded-lg mb-6 flex items-start animate-fadeInFast"
            data-oid=":6j9ifw"
          >
            <svg
              className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              data-oid="w1gm.d."
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                data-oid="g1w51rs"
              ></path>
            </svg>
            {error}
          </div>
        )}

        {/* Admin navigation tabs */}
        <div className="mb-6 border-b border-color" data-oid="8h4jx5_">
          <nav
            className="flex flex-wrap -mb-px text-sm font-medium"
            data-oid="qjx_xst"
          >
            <button
              onClick={() => setActiveTab("overview")}
              className={`dashboard-panel mr-2 inline-flex items-center py-3 px-4 rounded-t-lg ${
                activeTab === "overview"
                  ? "text-primary border-b-2 border-primary"
                  : "text-secondary hover:text-primary hover:border-b-2 hover:border-primary"
              }`}
              style={{ color: activeTab === "overview" ? "#000000" : "#555555" }}
              data-oid="v62nw_f"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                data-oid="8eocsys"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 10h16M4 14h16M4 18h16"
                  data-oid="i_qyy5c"
                ></path>
              </svg>
              Overview
            </button>
            <button
              onClick={() => setActiveTab("categories")}
              className={`dashboard-panel mr-2 inline-flex items-center py-3 px-4 rounded-t-lg ${
                activeTab === "categories"
                  ? "text-primary border-b-2 border-primary"
                  : "text-secondary hover:text-primary hover:border-b-2 hover:border-primary"
              }`}
              style={{ color: activeTab === "categories" ? "#000000" : "#555555" }}
              data-oid="4fhx2ui"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                data-oid="wbp6-dn"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  data-oid="qgxgowu"
                ></path>
              </svg>
              Document Categories
            </button>
            <button
              onClick={() => setActiveTab("approvals")}
              className={`dashboard-panel mr-2 inline-flex items-center py-3 px-4 rounded-t-lg ${
                activeTab === "approvals"
                  ? "text-primary border-b-2 border-primary"
                  : "text-secondary hover:text-primary hover:border-b-2 hover:border-primary"
              }`}
              style={{ color: activeTab === "approvals" ? "#000000" : "#555555" }}
              data-oid="m4xmxlb"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                data-oid="kn2uskk"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  data-oid="gjcj49b"
                ></path>
              </svg>
              Document Approvals
            </button>
            {isPrincipal && (
              <button
                onClick={() => setActiveTab("users")}
                className={`dashboard-panel mr-2 inline-flex items-center py-3 px-4 rounded-t-lg ${
                  activeTab === "users"
                    ? "text-primary border-b-2 border-primary"
                    : "text-secondary hover:text-primary hover:border-b-2 hover:border-primary"
                }`}
                style={{ color: activeTab === "users" ? "#000000" : "#555555" }}
                data-oid="0k1ik87"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  data-oid="tjh8pj_"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    data-oid="a7zjt2o"
                  ></path>
                </svg>
                User Management
              </button>
            )}
          </nav>
        </div>

        {/* Tab Content */}
        <div
          className="card shadow-md p-6"
          style={{ backgroundColor: "var(--color-bg-secondary)", color: "var(--color-text-primary)" }}
          data-oid="051-:i0"
        >
          {activeTab === "overview" && (
            <div data-oid="kvf:0i8">
              <h2 
                className="text-2xl font-bold mb-4" 
                style={{ color: "var(--color-text-primary)" }}
                data-oid="ise95gh"
              >
                Welcome to your{" "}
                {isDocManager ? "Document Manager" : "Principal"} Dashboard
              </h2>
              <p 
                className="mb-6" 
                style={{ color: "var(--color-text-secondary)" }}
                data-oid="ksoz9ek"
              >
                {isDocManager
                  ? "Manage document categories and oversee document submissions from this central dashboard."
                  : "Oversee all school document operations and staff from this central dashboard."}
              </p>

              <div
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
                data-oid="_yte4oq"
              >
                <div
                  className="card p-4 rounded-lg border"
                  style={{ 
                    backgroundColor: "rgba(var(--color-primary-rgb), 0.05)", 
                    borderColor: "rgba(var(--color-primary-rgb), 0.2)"
                  }}
                  data-oid="e41roua"
                >
                  <h3
                    className="font-bold mb-2"
                    style={{ color: "var(--color-primary-dark)" }}
                    data-oid="756k82x"
                  >
                    Document Categories
                  </h3>
                  <p
                    className="text-sm"
                    style={{ color: "var(--color-text-secondary)" }}
                    data-oid="gunpgnn"
                  >
                    Create and manage document categories that teachers can
                    submit
                  </p>
                </div>
                <div
                  className="card p-4 rounded-lg border"
                  style={{ 
                    backgroundColor: "rgba(var(--color-success-rgb), 0.05)", 
                    borderColor: "rgba(var(--color-success-rgb), 0.2)"
                  }}
                  data-oid="g3_5ici"
                >
                  <h3
                    className="font-bold mb-2"
                    style={{ color: "var(--color-success)" }}
                    data-oid="o2gj469"
                  >
                    Document Approvals
                  </h3>
                  <p 
                    className="text-sm" 
                    style={{ color: "var(--color-text-secondary)" }}
                    data-oid="p.a1c.8"
                  >
                    Review and approve document submissions from teachers
                  </p>
                </div>
                {isPrincipal && (
                  <div
                    className="card p-4 rounded-lg border"
                    style={{ 
                      backgroundColor: "rgba(var(--color-info-rgb), 0.05)", 
                      borderColor: "rgba(var(--color-info-rgb), 0.2)"
                    }}
                    data-oid="9tx16:q"
                  >
                    <h3
                      className="font-bold mb-2"
                      style={{ color: "var(--color-info)" }}
                      data-oid="-5f2.vh"
                    >
                      User Management
                    </h3>
                    <p 
                      className="text-sm" 
                      style={{ color: "var(--color-text-secondary)" }}
                      data-oid="n1kzw.6"
                    >
                      Manage staff accounts and assign proper roles
                    </p>
                  </div>
                )}
              </div>

              <AnalyticsPanel data-oid="811ktnl" />
            </div>
          )}

          {activeTab === "categories" && (
            <DocumentCategoriesPanel data-oid="rl8ry67" />
          )}
          {activeTab === "approvals" && (
            <DocumentApprovalPanel data-oid="k3zx_7x" />
          )}
          {activeTab === "users" && isPrincipal && (
            <AdminPanel data-oid="vwlskks" />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
