import { useState, useEffect } from "react";
import { ref, get } from "firebase/database";
import { database } from "../firebase";
import { useAuth } from "../contexts/AuthContext";

interface Stats {
  totalUsers: number;
  totalTeachers: number;
  totalDocuments: number;
  pendingDocuments: number;
  approvedDocuments: number;
  rejectedDocuments: number;
}

export default function AnalyticsPanel() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalTeachers: 0,
    totalDocuments: 0,
    pendingDocuments: 0,
    approvedDocuments: 0,
    rejectedDocuments: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const { currentUser } = useAuth();

  // Determine if user is principal or document manager
  const isDocManager =
    currentUser?.email?.toLowerCase() === "docmanager@school.edu";
  const isPrincipal =
    currentUser?.email?.toLowerCase() === "principal@school.edu";

  // Set theme color based on user role
  const themeColor = isPrincipal ? "blue" : "purple";

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);

        // Fetch users
        const usersRef = ref(database, "users");
        const usersSnapshot = await get(usersRef);

        if (!usersSnapshot.exists()) {
          setStats({
            totalUsers: 0,
            totalTeachers: 0,
            totalDocuments: 0,
            pendingDocuments: 0,
            approvedDocuments: 0,
            rejectedDocuments: 0,
          });
          return;
        }

        const usersData = usersSnapshot.val();
        const userIds = Object.keys(usersData);

        // Calculate stats
        let totalTeachers = 0;
        let totalDocuments = 0;
        let pendingDocuments = 0;
        let approvedDocuments = 0;
        let rejectedDocuments = 0;

        // Count teachers and documents
        for (const userId of userIds) {
          const userData = usersData[userId];

          // Count teachers
          if (userData.roles?.isTeacher) {
            totalTeachers++;
          }

          // Count documents
          if (userData.documents) {
            const userDocs = Object.values(userData.documents);
            totalDocuments += userDocs.length;

            // Count documents by status
            userDocs.forEach((doc: any) => {
              if (doc.status === "pending") pendingDocuments++;
              else if (doc.status === "approved") approvedDocuments++;
              else if (doc.status === "rejected") rejectedDocuments++;
            });
          }
        }

        setStats({
          totalUsers: userIds.length,
          totalTeachers,
          totalDocuments,
          pendingDocuments,
          approvedDocuments,
          rejectedDocuments,
        });
      } catch (error) {
        console.error("Error fetching analytics data:", error);
        setError("Failed to load analytics data");
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  return (
    <div className="mt-8" data-oid="y..gdhl">
      <h3 
        className="text-lg font-semibold mb-4" 
        style={{ color: "var(--color-text-primary)" }}
        data-oid="yutsph."
      >
        System Analytics
      </h3>

      {error && (
        <div
          className="status-rejected p-3 rounded mb-4"
          data-oid="w7pfcfz"
        >
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-8" data-oid="c.7-529">
          <div
            className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2"
            style={{ borderColor: "var(--color-primary)" }}
            data-oid="el6kbpy"
          ></div>
        </div>
      ) : (
        <div
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
          data-oid="nbkfig6"
        >
          <div
            className="card p-4 rounded-lg shadow hover:shadow-md transition-shadow border"
            style={{ 
              backgroundColor: "var(--color-bg-secondary)",
              borderColor: "var(--color-border)"
            }}
            data-oid="jsoxagy"
          >
            <div
              className="text-sm font-medium"
              style={{ color: "var(--color-text-muted)" }}
              data-oid="t3ibhlj"
            >
              Total Users
            </div>
            <div
              className="mt-1 text-2xl font-semibold"
              style={{ color: "var(--color-primary)" }}
              data-oid="w1zwq0-"
            >
              {stats.totalUsers}
            </div>
          </div>

          <div
            className="card p-4 rounded-lg shadow hover:shadow-md transition-shadow border"
            style={{ 
              backgroundColor: "var(--color-bg-secondary)",
              borderColor: "var(--color-border)"
            }}
            data-oid="6vnand2"
          >
            <div
              className="text-sm font-medium"
              style={{ color: "var(--color-text-muted)" }}
              data-oid="fqk91mw"
            >
              Teachers
            </div>
            <div
              className="mt-1 text-2xl font-semibold"
              style={{ color: "var(--color-success)" }}
              data-oid="y.z9rkx"
            >
              {stats.totalTeachers}
            </div>
          </div>

          <div
            className="card p-4 rounded-lg shadow hover:shadow-md transition-shadow border"
            style={{ 
              backgroundColor: "var(--color-bg-secondary)",
              borderColor: "var(--color-border)"
            }}
            data-oid="d35rq32"
          >
            <div
              className="text-sm font-medium"
              style={{ color: "var(--color-text-muted)" }}
              data-oid="fo4r0z9"
            >
              Total Documents
            </div>
            <div
              className="mt-1 text-2xl font-semibold"
              style={{ color: "var(--color-info)" }}
              data-oid="k08is.w"
            >
              {stats.totalDocuments}
            </div>
          </div>

          <div
            className="card p-4 rounded-lg shadow hover:shadow-md transition-shadow border"
            style={{ 
              backgroundColor: "var(--color-bg-secondary)",
              borderColor: "var(--color-border)"
            }}
            data-oid="5e.8g.9"
          >
            <div
              className="text-sm font-medium"
              style={{ color: "var(--color-text-muted)" }}
              data-oid="fdbroea"
            >
              Pending
            </div>
            <div
              className="mt-1 text-2xl font-semibold"
              style={{ color: "var(--color-warning)" }}
              data-oid="acul6h_"
            >
              {stats.pendingDocuments}
            </div>
          </div>

          <div
            className="card p-4 rounded-lg shadow hover:shadow-md transition-shadow border"
            style={{ 
              backgroundColor: "var(--color-bg-secondary)",
              borderColor: "var(--color-border)"
            }}
            data-oid="5leks.j"
          >
            <div
              className="text-sm font-medium"
              style={{ color: "var(--color-text-muted)" }}
              data-oid="9bxwqag"
            >
              Approved
            </div>
            <div
              className="mt-1 text-2xl font-semibold"
              style={{ color: "var(--color-success)" }}
              data-oid="308cex4"
            >
              {stats.approvedDocuments}
            </div>
          </div>

          <div
            className="card p-4 rounded-lg shadow hover:shadow-md transition-shadow border"
            style={{ 
              backgroundColor: "var(--color-bg-secondary)",
              borderColor: "var(--color-border)"
            }}
            data-oid=":4f.hkd"
          >
            <div
              className="text-sm font-medium"
              style={{ color: "var(--color-text-muted)" }}
              data-oid="mtsogfy"
            >
              Rejected
            </div>
            <div
              className="mt-1 text-2xl font-semibold"
              style={{ color: "var(--color-error)" }}
              data-oid="--dc116"
            >
              {stats.rejectedDocuments}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
