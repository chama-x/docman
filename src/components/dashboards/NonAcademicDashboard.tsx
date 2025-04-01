import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import DashboardLayout from "../layout/DashboardLayout";
import DocumentUploader from "../DocumentUploader";
import DocumentList from "../DocumentList";
import { getDocumentTypes } from "../../services/documentService";
import { DocumentCategories } from "../../types/documentTypes";

export default function NonAcademicDashboard() {
  const [documentTypes, setDocumentTypes] = useState<DocumentCategories>({
    common: {},
    teacher: {},
    nonAcademic: {},
  });
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const { currentUser } = useAuth();

  // Get document types on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const types = await getDocumentTypes();
        setDocumentTypes(types);
      } catch (error) {
        setError("Failed to load document types");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Get combined document types for non-academic staff
  const combinedDocumentTypes: Record<string, string> = {
    ...documentTypes.common,
    ...(documentTypes.nonAcademic || {})
  };

  // Check if there are document types available
  const hasDocumentTypes = Object.keys(combinedDocumentTypes).length > 0;

  return (
    <DashboardLayout
      title="Non-Academic Staff Dashboard"
      subtitle="Upload and manage your documents"
      bgColor="#6B7280" // Gray color for non-academic staff
      data-oid="l9pzamd"
    >
      <div className="space-y-8 animate-fadeInFast" data-oid="0_zpcr_">
        {error && (
          <div
            className="status-rejected px-4 py-3 rounded-lg animate-fadeInFast"
            data-oid="bnwz9vr"
          >
            {error}
          </div>
        )}

        <div
          className="card rounded-lg shadow overflow-hidden"
          style={{ backgroundColor: "var(--color-bg-secondary)" }}
          data-oid="8wjzbmr"
        >
          <div className="p-6" data-oid="5w09e1l">
            <h2
              className="text-xl font-semibold mb-4"
              style={{ color: "var(--color-text-primary)" }}
              data-oid="2c:zd2i"
            >
              Welcome, {currentUser?.email?.split("@")[0] || "User"}!
            </h2>
            
            <p
              className="mb-4"
              style={{ color: "var(--color-text-secondary)" }}
              data-oid="6d4ntt_"
            >
              This is your document management dashboard. Here you can upload and manage
              your documents, check their status, and download them when needed.
            </p>

            <div
              className="bg-accent bg-opacity-30 rounded-lg p-4 border border-accent"
              style={{ borderColor: "var(--color-border)" }}
              data-oid="ggmx2s_"
            >
              <h3
                className="font-medium mb-2"
                style={{ color: "var(--color-text-primary)" }}
                data-oid="gkfq33d"
              >
                Getting Started
              </h3>
              <ul className="list-disc list-inside space-y-1" data-oid="-4_7.nc">
                <li
                  style={{ color: "var(--color-text-secondary)" }}
                  data-oid="lsxokkh"
                >
                  Upload your documents using the form below
                </li>
                <li
                  style={{ color: "var(--color-text-secondary)" }}
                  data-oid="c_02udn"
                >
                  Track document statuses in the My Documents section
                </li>
                <li
                  style={{ color: "var(--color-text-secondary)" }}
                  data-oid="08dwrxg"
                >
                  Administrators will review and approve your documents
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Document uploader section */}
        {loading ? (
          <div
            className="flex justify-center py-12 animate-fadeIn"
            data-oid="v70cw:a"
          >
            <div
              className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"
              data-oid="8hm25o9"
            ></div>
          </div>
        ) : hasDocumentTypes ? (
          <DocumentUploader
            documentTypes={combinedDocumentTypes}
            data-oid="2g4x5ox"
          />
        ) : (
          <div
            className="bg-warning-light border border-warning rounded-lg p-4 animate-fadeIn"
            data-oid="g0:2u1r"
          >
            <p data-oid="4.rxr9o">
              No document types available. Please contact the administrator.
            </p>
          </div>
        )}

        {/* Documents list section */}
        <div data-oid="d5tvbr0">
          <h2
            className="text-xl font-semibold mb-4"
            style={{ color: "var(--color-text-primary)" }}
            data-oid="ooq9vc-"
          >
            My Documents
          </h2>
          <DocumentList documentTypes={documentTypes} data-oid="b92f9xg" />
        </div>
      </div>
    </DashboardLayout>
  );
}