import { useState, useEffect } from "react";
import { ref, get, update } from "firebase/database";
import { database } from "../firebase";
import { DocumentCategories } from "../types/documentTypes";
import { useAuth } from "../contexts/AuthContext";

interface PendingDocument {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  type: string;
  name?: string; // Document type name
  fileName: string;
  originalFileName?: string;
  url: string;
  publicId?: string;
  uploadedAt: number;
  status: "pending" | "approved" | "rejected";
  fileSize?: number;
  comment?: string; // For rejection comments
  verifiedBy?: string; // Email of admin who verified
  verifiedAt?: number; // Timestamp of verification
  showRejectionForm?: boolean; // Flag to show rejection form in preview
}

export default function DocumentApprovalPanel() {
  const [loading, setLoading] = useState<boolean>(true);
  const [pendingDocuments, setPendingDocuments] = useState<PendingDocument[]>(
    [],
  );
  const [documentTypes, setDocumentTypes] = useState<DocumentCategories>({
    common: {},
    teacher: {},
  });
  const [filter, setFilter] = useState<
    "all" | "pending" | "approved" | "rejected"
  >("pending");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [showPreview, setShowPreview] = useState<PendingDocument | null>(null);
  const [rejectionComment, setRejectionComment] = useState<string>("");
  const [selectedDocuments, setSelectedDocuments] = useState<Set<string>>(
    new Set(),
  );
  const { currentUser } = useAuth();

  // Determine if user is principal or document manager
  const isDocManager =
    currentUser?.email?.toLowerCase() === "docmanager@school.edu";
  const isPrincipal =
    currentUser?.email?.toLowerCase() === "principal@school.edu";

  // Set theme color based on user role
  const themeColor = isPrincipal ? "blue" : "purple";

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      // Fetch document types
      const docTypesRef = ref(database, "documentTypes");
      const docTypesSnapshot = await get(docTypesRef);

      if (docTypesSnapshot.exists()) {
        setDocumentTypes(docTypesSnapshot.val());
      }

      // Fetch all users and their documents
      const usersRef = ref(database, "users");
      const usersSnapshot = await get(usersRef);

      if (!usersSnapshot.exists()) {
        setPendingDocuments([]);
        return;
      }

      const allDocuments: PendingDocument[] = [];
      const usersData = usersSnapshot.val();

      // Process each user's documents
      Object.entries(usersData).forEach(([userId, userData]: [string, any]) => {
        const userName = userData.email?.split("@")[0] || "Unknown";
        const userEmail = userData.email || "Unknown";

        if (userData.documents) {
          Object.entries(userData.documents).forEach(
            ([docId, docData]: [string, any]) => {
              const typeName = getDocumentTypeName(docData.type);

              allDocuments.push({
                id: docId,
                userId,
                userName,
                userEmail,
                type: docData.type,
                name: docData.name || typeName,
                fileName: docData.fileName || "unknown.pdf",
                originalFileName: docData.originalFileName,
                url: docData.url,
                publicId: docData.publicId,
                uploadedAt: docData.uploadedAt || 0,
                status: docData.status || "pending",
                fileSize: docData.fileSize,
                comment: docData.comment,
                verifiedBy: docData.verifiedBy,
                verifiedAt: docData.verifiedAt,
              });
            },
          );
        }
      });

      // Sort by upload date (newest first)
      allDocuments.sort((a, b) => b.uploadedAt - a.uploadedAt);

      // Set documents
      setPendingDocuments(allDocuments);
    } catch (error) {
      console.error("Error fetching documents:", error);
      setError("Failed to load documents. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateDocumentStatus = async (
    userId: string,
    docId: string,
    newStatus: "approved" | "rejected",
    comment?: string,
  ) => {
    if (!currentUser?.email) {
      setError("You must be logged in to perform this action");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const updateData: Record<string, any> = {
        status: newStatus,
        verifiedBy: currentUser.email,
        verifiedAt: Date.now(),
      };

      // Add comment for rejected documents
      if (newStatus === "rejected" && comment) {
        updateData.comment = comment;
      }

      // Update the document status in Firebase
      const docRef = ref(database, `users/${userId}/documents/${docId}`);
      await update(docRef, updateData);

      // Update local state
      setPendingDocuments((prev) =>
        prev.map((doc) =>
          doc.userId === userId && doc.id === docId
            ? { ...doc, ...updateData }
            : doc,
        ),
      );

      setSuccess(`Document ${newStatus} successfully`);
      setRejectionComment(""); // Clear comment field

      // Clear this document from selected if it was selected
      if (selectedDocuments.has(`${userId}:${docId}`)) {
        const newSelection = new Set(selectedDocuments);
        newSelection.delete(`${userId}:${docId}`);
        setSelectedDocuments(newSelection);
      }
    } catch (error) {
      console.error(`Error ${newStatus} document:`, error);
      setError(`Failed to ${newStatus} document. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  // Document selection handling for bulk operations
  const toggleDocumentSelection = (userId: string, docId: string) => {
    const documentKey = `${userId}:${docId}`;
    const newSelection = new Set(selectedDocuments);

    if (newSelection.has(documentKey)) {
      newSelection.delete(documentKey);
    } else {
      newSelection.add(documentKey);
    }

    setSelectedDocuments(newSelection);
  };

  const selectAllVisibleDocuments = () => {
    const newSelection = new Set<string>();

    filteredAndSearchedDocuments.forEach((doc) => {
      newSelection.add(`${doc.userId}:${doc.id}`);
    });

    setSelectedDocuments(newSelection);
  };

  const clearSelection = () => {
    setSelectedDocuments(new Set());
  };

  // Check if a specific document is selected
  const isDocumentSelected = (userId: string, docId: string): boolean => {
    return selectedDocuments.has(`${userId}:${docId}`);
  };

  // Add the toggleSelectAll function
  const toggleSelectAll = () => {
    if (areAllVisibleDocsSelected()) {
      clearSelection();
    } else {
      selectAllVisibleDocuments();
    }
  };

  // Check if all visible documents are selected
  const areAllVisibleDocsSelected = (): boolean => {
    if (filteredAndSearchedDocuments.length === 0) return false;
    
    return filteredAndSearchedDocuments.every(doc => 
      selectedDocuments.has(`${doc.userId}:${doc.id}`)
    );
  };

  const getDocumentTypeName = (typeKey: string): string => {
    // First check common types
    if (documentTypes.common && documentTypes.common[typeKey]) {
      return documentTypes.common[typeKey];
    }

    // Then check teacher types
    if (documentTypes.teacher && documentTypes.teacher[typeKey]) {
      return documentTypes.teacher[typeKey];
    }

    // If not found, return the key
    return typeKey;
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
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

  // Filter documents based on the current filter and search term
  const filteredAndSearchedDocuments = pendingDocuments.filter((doc) => {
    // Apply status filter
    if (filter !== "all" && doc.status !== filter) return false;

    // Apply search filter if there is a search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        doc.userName.toLowerCase().includes(searchLower) ||
        doc.userEmail.toLowerCase().includes(searchLower) ||
        (doc.name || "").toLowerCase().includes(searchLower) ||
        (doc.fileName || "").toLowerCase().includes(searchLower) ||
        (doc.originalFileName || "").toLowerCase().includes(searchLower)
      );
    }

    return true;
  });

  // Close the preview modal
  const closePreview = () => {
    setShowPreview(null);
  };

  // Render the preview modal
  const renderPreviewModal = () => {
    if (!showPreview) return null;

    return (
      <div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        data-oid="bnw.:yc"
      >
        <div
          className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-3/4 flex flex-col"
          data-oid="l7xswml"
        >
          <div
            className="flex items-center justify-between px-6 py-4 border-b"
            style={{ borderColor: "var(--color-border)" }}
            data-oid="58pjkj_"
          >
            <h3 
              className="text-lg font-semibold" 
              style={{ color: "var(--color-text-primary)" }}
              data-oid="9gzqpdd"
            >
              Document Preview - {showPreview.fileName}
            </h3>
            <button
              onClick={closePreview}
              className="text-gray-500 hover:text-gray-700"
              data-oid="3gp:1py"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                data-oid="l7u-mjj"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                  data-oid="fzx0ik9"
                ></path>
              </svg>
            </button>
          </div>

          <div
            className="flex-1 overflow-auto p-1"
            style={{ backgroundColor: "var(--color-bg-accent)" }}
            data-oid="vjl_pn0"
          >
            <iframe
              src={showPreview.url}
              className="w-full h-full border-0 rounded"
              title={showPreview.fileName}
              data-oid="w7eo:x:"
            ></iframe>
          </div>

          <div 
            className="p-4 border-t" 
            style={{ borderColor: "var(--color-border)" }}
            data-oid="eztf2j3"
          >
            {showPreview.status === "pending" ? (
              <div className="flex flex-col space-y-3" data-oid="6limnhl">
                {/* Rejection comment field */}
                <div className="mb-2" data-oid="dte_0i9">
                  <label
                    className="block text-sm font-medium mb-1"
                    style={{ color: "var(--color-text-secondary)" }}
                    data-oid="4jpm1dn"
                  >
                    Comment (for rejection)
                  </label>
                  <textarea
                    className="w-full px-3 py-2 rounded-md border"
                    style={{ 
                      backgroundColor: "var(--color-input)",
                      borderColor: "var(--color-border)",
                      color: "var(--color-text-primary)"
                    }}
                    rows={2}
                    value={rejectionComment}
                    onChange={(e) => setRejectionComment(e.target.value)}
                    placeholder="Optional: Explain why this document is being rejected..."
                    data-oid="4661g1b"
                  ></textarea>
                </div>

                <div className="flex justify-end space-x-3" data-oid="2rpe7hy">
                  <button
                    onClick={() => {
                      handleUpdateDocumentStatus(
                        showPreview.userId,
                        showPreview.id,
                        "rejected",
                        rejectionComment,
                      );
                      closePreview();
                    }}
                    className="btn btn-danger py-2 px-4 rounded"
                    disabled={loading}
                    data-oid="5uh__l1"
                  >
                    Reject Document
                  </button>
                  <button
                    onClick={() => {
                      handleUpdateDocumentStatus(
                        showPreview.userId,
                        showPreview.id,
                        "approved",
                      );
                      closePreview();
                    }}
                    className="btn btn-success py-2 px-4 rounded"
                    disabled={loading}
                    data-oid="gs7jwgz"
                  >
                    Approve Document
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex justify-between items-center" data-oid="1v6c.xj">
                <div data-oid="9xfk1sf">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      showPreview.status === "approved"
                        ? "status-approved"
                        : "status-rejected"
                    }`}
                    data-oid="p2s:swu"
                  >
                    {showPreview.status.charAt(0).toUpperCase() +
                      showPreview.status.slice(1)}
                  </span>
                  {showPreview.comment && (
                    <p 
                      className="mt-2 text-sm"
                      style={{ color: "var(--color-text-secondary)" }}
                      data-oid="7a8sbc."
                    >
                      Comment: {showPreview.comment}
                    </p>
                  )}
                </div>
                <button
                  onClick={closePreview}
                  className="btn btn-secondary py-2 px-4 rounded"
                  data-oid="7ib-hck"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Handle showing the rejection form
  const showRejectionFormForDocument = (doc: PendingDocument) => {
    setRejectionComment("");
    setShowPreview({
      ...doc,
      showRejectionForm: true
    });
  };

  return (
    <div data-oid="8ue_-5z">
      <h2 
        className="text-xl font-bold mb-4" 
        style={{ color: "var(--color-text-primary)" }}
        data-oid=":bu-3rz"
      >
        Document Approvals
      </h2>

      {error && (
        <div
          className="status-rejected px-4 py-3 rounded mb-4"
          data-oid="tba-u1v"
        >
          {error}
        </div>
      )}

      {success && (
        <div
          className="status-approved px-4 py-3 rounded mb-4"
          data-oid="svs34rm"
        >
          {success}
        </div>
      )}

      {/* Filters and search */}
      <div
        className="mb-4 flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:justify-between"
        data-oid="2.cw8o0"
      >
        <div className="flex flex-wrap gap-2" data-oid="f5w-h-r">
          <button
            className={`px-4 py-2 rounded-md ${
              filter === "pending"
                ? "btn-warning border"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
            style={{ 
              borderColor: filter === "pending" ? "var(--color-warning)" : "transparent",
              color: filter === "pending" ? "#333" : "var(--color-text-secondary)" 
            }}
            onClick={() => setFilter("pending")}
            data-oid="trp.57l"
          >
            Pending
          </button>
          <button
            className={`px-4 py-2 rounded-md ${
              filter === "approved"
                ? "btn-success border"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
            style={{ 
              borderColor: filter === "approved" ? "var(--color-success)" : "transparent",
              color: filter === "approved" ? "white" : "var(--color-text-secondary)" 
            }}
            onClick={() => setFilter("approved")}
            data-oid="lq1xkg8"
          >
            Approved
          </button>
          <button
            className={`px-4 py-2 rounded-md ${
              filter === "rejected"
                ? "btn-danger border"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
            style={{ 
              borderColor: filter === "rejected" ? "var(--color-error)" : "transparent",
              color: filter === "rejected" ? "white" : "var(--color-text-secondary)" 
            }}
            onClick={() => setFilter("rejected")}
            data-oid="qlorvlu"
          >
            Rejected
          </button>
          <button
            className={`px-4 py-2 rounded-md ${
              filter === "all"
                ? "bg-primary border"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
            style={{ 
              borderColor: filter === "all" ? "var(--color-primary)" : "transparent",
              color: filter === "all" ? "white" : "var(--color-text-secondary)" 
            }}
            onClick={() => setFilter("all")}
            data-oid="t0qw7fu"
          >
            All Documents
          </button>
        </div>

        <div className="relative" data-oid="bv0mfgq">
          <input
            type="text"
            className="pl-10 pr-4 py-2 rounded-md border"
            style={{ 
              backgroundColor: "var(--color-input)",
              borderColor: "var(--color-border)",
              color: "var(--color-text-primary)"
            }}
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            data-oid="nqhbj.o"
          />
          <div
            className="absolute left-3 top-2.5 text-gray-400"
            data-oid="6d.e53_"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              data-oid="uzk1x8q"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                data-oid="j3isjgb"
              ></path>
            </svg>
          </div>
        </div>
      </div>

      {/* Document preview modal */}
      {renderPreviewModal()}

      {loading && !filteredAndSearchedDocuments.length ? (
        <div className="flex justify-center py-12" data-oid="m2mzdrw">
          <div
            className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2"
            style={{ borderColor: "var(--color-primary)" }}
            data-oid="6j21hy-"
          ></div>
        </div>
      ) : filteredAndSearchedDocuments.length === 0 ? (
        <div
          className="text-center py-8 rounded-lg border"
          style={{ 
            backgroundColor: "var(--color-bg-accent)",
            borderColor: "var(--color-border)",
            color: "var(--color-text-secondary)"
          }}
          data-oid="0_15qbr"
        >
          <svg
            className="mx-auto h-12 w-12 mb-4"
            style={{ color: "var(--color-text-muted)" }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            data-oid="5djuxz4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              data-oid="9jcbg4q"
            ></path>
          </svg>
          <h3 
            className="text-lg font-medium mb-1" 
            style={{ color: "var(--color-text-primary)" }}
            data-oid="88mtshv"
          >
            No documents found
          </h3>
          <p data-oid="_mwptv.">
            {filter !== "all"
              ? `No ${filter} documents matching your search criteria.`
              : "No documents matching your search criteria."}
          </p>
        </div>
      ) : (
        <>
          {/* Selection controls and bulk actions */}
          {selectedDocuments.size > 0 && (
            <div
              className="mb-4 p-3 rounded-lg border flex flex-wrap items-center gap-3"
              style={{ 
                backgroundColor: "var(--color-bg-accent)",
                borderColor: "var(--color-border)"
              }}
              data-oid="cc:8eak"
            >
              <span 
                style={{ color: "var(--color-text-primary)" }}
                data-oid="ep11y0i"
              >
                {selectedDocuments.size} document
                {selectedDocuments.size > 1 ? "s" : ""} selected
              </span>

              <div className="flex-1" data-oid="4jrwkzu"></div>

              <button
                onClick={clearSelection}
                className="text-sm px-3 py-1 rounded-md"
                style={{ 
                  backgroundColor: "var(--color-bg-secondary)",
                  color: "var(--color-text-secondary)",
                  border: "1px solid var(--color-border)"
                }}
                data-oid="5qt0tou"
              >
                Clear Selection
              </button>

              <button
                onClick={async () => {
                  try {
                    setLoading(true);

                    // Process each selected document
                    const promises = Array.from(selectedDocuments).map(
                      async (key) => {
                        const [userId, docId] = key.split(":");
                        return handleUpdateDocumentStatus(
                          userId,
                          docId,
                          "approved",
                        );
                      },
                    );

                    await Promise.all(promises);
                    setSuccess(
                      `${selectedDocuments.size} documents approved successfully`,
                    );
                    clearSelection();
                  } catch (error) {
                    setError(
                      "Failed to approve some documents. Please try again.",
                    );
                    console.error(error);
                  } finally {
                    setLoading(false);
                  }
                }}
                className="btn btn-success text-sm px-3 py-1 rounded-md"
                disabled={loading}
                data-oid="09_7g-4"
              >
                Approve Selected
              </button>

              <button
                onClick={async () => {
                  try {
                    setLoading(true);

                    // Process each selected document
                    const promises = Array.from(selectedDocuments).map(
                      async (key) => {
                        const [userId, docId] = key.split(":");
                        return handleUpdateDocumentStatus(
                          userId,
                          docId,
                          "rejected",
                        );
                      },
                    );

                    await Promise.all(promises);
                    setSuccess(
                      `${selectedDocuments.size} documents rejected successfully`,
                    );
                    clearSelection();
                  } catch (error) {
                    setError(
                      "Failed to reject some documents. Please try again.",
                    );
                    console.error(error);
                  } finally {
                    setLoading(false);
                  }
                }}
                className="btn btn-danger text-sm px-3 py-1 rounded-md"
                disabled={loading}
                data-oid="jxl_lvq"
              >
                Reject Selected
              </button>
            </div>
          )}

          {/* Documents table */}
          <div
            className="bg-white rounded-lg border shadow-sm overflow-hidden"
            style={{ borderColor: "var(--color-border)" }}
            data-oid="p1m2b1t"
          >
            <div className="overflow-x-auto" data-oid="q_ytbtt">
              <table className="min-w-full divide-y" data-oid="qn-1fv0">
                <thead 
                  style={{ 
                    backgroundColor: "rgba(var(--color-primary-rgb), 0.05)",
                    borderColor: "var(--color-border)"
                  }}
                  data-oid="6bfj9nw"
                >
                  <tr data-oid="gqz.4-0">
                    <th
                      className="py-3 px-4 text-left"
                      style={{ width: "40px" }}
                      data-oid="5m_:cux"
                    >
                      <input
                        type="checkbox"
                        className="rounded"
                        style={{ 
                          borderColor: "var(--color-border)",
                          backgroundColor: "transparent"
                        }}
                        checked={
                          selectedDocuments.size > 0 &&
                          selectedDocuments.size ===
                            filteredAndSearchedDocuments.length
                        }
                        onChange={toggleSelectAll}
                        data-oid="sj-cqnk"
                      />
                    </th>
                    <th
                      className="py-3 px-2 text-left text-xs font-medium uppercase tracking-wider"
                      style={{ 
                        color: "var(--color-text-secondary)",
                        width: "80px"
                      }}
                      data-oid="8uqd_l2"
                    >
                      Status
                    </th>
                    <th
                      className="py-3 px-2 text-left text-xs font-medium uppercase tracking-wider"
                      style={{ color: "var(--color-text-secondary)" }}
                      data-oid="r95cnuk"
                    >
                      Document
                    </th>
                    <th
                      className="py-3 px-2 text-left text-xs font-medium uppercase tracking-wider"
                      style={{ color: "var(--color-text-secondary)" }}
                      data-oid="vgpw.iz"
                    >
                      User
                    </th>
                    <th
                      className="py-3 px-2 text-left text-xs font-medium uppercase tracking-wider"
                      style={{ color: "var(--color-text-secondary)" }}
                      data-oid="vspw3:4"
                    >
                      Uploaded
                    </th>
                    <th
                      className="py-3 px-4 text-left text-xs font-medium uppercase tracking-wider"
                      style={{ color: "var(--color-text-secondary)" }}
                      data-oid="wz68y89"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: "var(--color-border)" }} data-oid="_l:o4.x">
                  {filteredAndSearchedDocuments.map((doc) => (
                    <tr
                      key={`${doc.userId}-${doc.id}`}
                      className="hover:bg-gray-50"
                      data-oid="h8x9tva"
                    >
                      <td className="py-2 px-4" data-oid="h9ey-b-">
                        <input
                          type="checkbox"
                          className="rounded"
                          style={{ 
                            borderColor: "var(--color-border)",
                            backgroundColor: "transparent"
                          }}
                          checked={selectedDocuments.has(
                            `${doc.userId}:${doc.id}`,
                          )}
                          onChange={() =>
                            toggleDocumentSelection(doc.userId, doc.id)
                          }
                          data-oid="1a.6.1c"
                        />
                      </td>
                      <td className="py-2 px-2" data-oid="ffq9pey">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            doc.status === "approved"
                              ? "status-approved"
                              : doc.status === "rejected"
                                ? "status-rejected"
                                : "status-pending"
                          }`}
                          data-oid="86kuoog"
                        >
                          {doc.status.charAt(0).toUpperCase() +
                            doc.status.slice(1)}
                        </span>
                      </td>
                      <td
                        className="py-2 px-2 max-w-xs"
                        style={{ color: "var(--color-text-primary)" }}
                        data-oid="ypuuu9j"
                      >
                        <div className="flex items-center" data-oid="s-nv:.w">
                          <span className="truncate" data-oid="4v8vfts">
                            {doc.name || getDocumentTypeName(doc.type)}
                          </span>
                        </div>
                      </td>
                      <td className="py-2 px-2" data-oid="5l1e0ne">
                        <div data-oid="m2f.glk">
                          <div 
                            style={{ color: "var(--color-text-primary)" }}
                            data-oid="xmx_-0z"
                          >
                            {doc.userEmail}
                          </div>
                        </div>
                      </td>
                      <td
                        className="py-2 px-2"
                        style={{ color: "var(--color-text-secondary)" }}
                        data-oid="tlxvoqn"
                      >
                        {formatDate(doc.uploadedAt)}
                      </td>
                      <td className="py-2 px-4" data-oid="wzitw31">
                        <div className="flex items-center space-x-3" data-oid="7-9k2pb">
                          <button
                            onClick={() => {
                              setRejectionComment("");
                              setShowPreview(doc);
                            }}
                            className="text-primary hover:text-primary-dark"
                            title="Preview Document"
                            data-oid="8.gy1j."
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              data-oid="g1a_8qz"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                data-oid="u9qrcvg"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                data-oid="v_aqmgp"
                              />
                            </svg>
                          </button>

                          {doc.status === "pending" && (
                            <>
                              <button
                                onClick={() =>
                                  handleUpdateDocumentStatus(
                                    doc.userId,
                                    doc.id,
                                    "approved",
                                  )
                                }
                                className="text-success hover:text-success-dark"
                                title="Approve Document"
                                disabled={loading}
                                data-oid="4nmyc0d"
                              >
                                <svg
                                  className="w-5 h-5"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                  data-oid="cirpa39"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M5 13l4 4L19 7"
                                    data-oid="bou_gf2"
                                  />
                                </svg>
                              </button>
                              
                              <button
                                onClick={() => {
                                  setRejectionComment("");
                                  showRejectionFormForDocument(doc);
                                }}
                                className="text-error hover:text-error-dark"
                                title="Reject Document"
                                disabled={loading}
                                data-oid="cgv5sfc"
                              >
                                <svg
                                  className="w-5 h-5"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                  data-oid="f_nq4xt"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M6 18L18 6M6 6l12 12"
                                    data-oid="4iq.5yx"
                                  />
                                </svg>
                              </button>
                            </>
                          )}

                          {doc.status !== "pending" && (
                            <a
                              href={doc.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:text-primary-dark"
                              title="Open in New Tab"
                              data-oid="plp0wir"
                            >
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                data-oid="xmu.xbd"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                  data-oid="xxwcbsf"
                                />
                              </svg>
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
