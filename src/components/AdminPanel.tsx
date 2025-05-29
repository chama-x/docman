import { useState, useEffect } from "react";
import { User } from "../types/documentTypes";
import {
  getAllUsers,
  // initializeTestUsers, // Commented out as part of User Management removal
  // fixUserRoles, // Commented out as part of User Management removal
  // addNamesToExistingUsers, // Commented out as part of User Management removal
} from "../services/userService";
// import {
//   createSampleDocuments, // Commented out as part of User Management removal
//   deleteAllDocuments, // Commented out as part of User Management removal
// } from "../services/testDataService"; // Commented out as part of User Management removal
import { useAuth } from "../contexts/AuthContext";
// import { ref, set } from "firebase/database"; // Commented out as part of User Management removal
// import { database } from "../../firebase"; // Commented out as part of User Management removal

// Define types for admin operations - Commented out
// type OperationType = "normal" | "caution" | "danger";

// interface AdminOperation {
//   name: string;
//   description: string;
//   handler: () => Promise<void>;
//   type: OperationType;
//   confirmationMessage?: string;
// }

export default function AdminPanel() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  // const [isOperationInProgress, setIsOperationInProgress] = useState<boolean>(false); // Commented out
  // const [error, setError] = useState<string>(""); // Commented out
  // const [success, setSuccess] = useState<string>(""); // Commented out
  const { userRoles, currentUser } = useAuth();

  // Determine if user is principal or document manager
  const isPrincipal =
    currentUser?.email?.toLowerCase() === "principal@school.edu";
  // const themeColor = isPrincipal ? "blue" : "purple"; // Commented out

  useEffect(() => {
    if (!userRoles.isAdmin) return;

    loadUsers();
  }, [userRoles.isAdmin]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const allUsers = await getAllUsers();
      setUsers(allUsers);
    } catch (error) {
      // setError("Failed to load users"); // Commented out
      console.error("Failed to load users", error); // Keep console error for debugging
    } finally {
      setLoading(false);
    }
  };

  // Commented out User Management functions
  /*
  const handleGenerateTestUsers = async () => {
    try {
      setIsOperationInProgress(true);
      setError("");
      setSuccess("");

      await initializeTestUsers();
      await loadUsers();

      setSuccess("Test users have been created successfully!");
    } catch (error) {
      setError("Failed to create test users");
      console.error(error);
    } finally {
      setIsOperationInProgress(false);
    }
  };

  const handleFixUserRoles = async () => {
    try {
      setIsOperationInProgress(true);
      setError("");
      setSuccess("");

      await fixUserRoles();
      await loadUsers();

      setSuccess("User roles have been fixed successfully!");
    } catch (error) {
      setError("Failed to fix user roles");
      console.error(error);
    } finally {
      setIsOperationInProgress(false);
    }
  };

  const handleAddNamesToUsers = async () => {
    try {
      setIsOperationInProgress(true);
      setError("");
      setSuccess("");

      await addNamesToExistingUsers();
      await loadUsers();

      setSuccess("Names have been added to users successfully!");
    } catch (error) {
      setError("Failed to add names to users");
      console.error(error);
    } finally {
      setIsOperationInProgress(false);
    }
  };

  const handleGenerateSampleDocuments = async () => {
    try {
      setIsOperationInProgress(true);
      setError("");
      setSuccess("");

      await createSampleDocuments(true);

      setSuccess("Sample documents have been created successfully!");
    } catch (error) {
      setError("Failed to create sample documents");
      console.error(error);
    } finally {
      setIsOperationInProgress(false);
    }
  };

  const handleResetDatabase = async () => {
    try {
      setIsOperationInProgress(true);
      setError("");
      setSuccess("");

      const confirmReset = window.confirm(
        "WARNING: This will reset the entire database. All document data will be lost. Continue?",
      );

      if (!confirmReset) {
        setIsOperationInProgress(false);
        return;
      }

      // Delete all existing documents
      await deleteAllDocuments();

      // Reset the database structure
      await set(ref(database), {
        documentTypes: {
          common: {
            appointment_letter: "Appointment Letter",
            birth_certificate: "Birth Certificate",
            nic: "NIC",
            qualification_certificates: "Qualification Certificates",
          },
          teacher: {
            disciplinary_letter: "Disciplinary Letter",
            promotion_letter: "Promotion Letter",
            transfer_letter: "Transfer Letter",
          },
          nonAcademic: {
            work_contract: "Work Contract",
            leave_form: "Leave Application",
            performance_review: "Performance Review"
          },
        },
      });

      // Create users again and sample documents
      await initializeTestUsers();
      await createSampleDocuments(true);
      await loadUsers();

      setSuccess("Database has been completely reset and sample data created!");
    } catch (error) {
      setError("Failed to reset database");
      console.error(error);
    } finally {
      setIsOperationInProgress(false);
    }
  };
  */

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Define admin operations - Commented out
  /*
  const adminOperations: AdminOperation[] = [
    {
      name: "Generate Test Users",
      description: "Creates sample users: principal, doc manager, teachers, and non-academic staff",
      handler: handleGenerateTestUsers,
      type: "normal",
    },
    {
      name: "Fix User Roles",
      description: "Ensures that all users have the correct roles in the database",
      handler: handleFixUserRoles,
      type: "normal",
    },
    {
      name: "Add Names to Users",
      description: "One-time script to add names to users who don't have names",
      handler: handleAddNamesToUsers,
      type: "normal",
    },
    {
      name: "Generate Sample Documents",
      description: "Creates random sample documents for each user",
      handler: handleGenerateSampleDocuments,
      type: "caution",
      confirmationMessage: "This will generate sample documents for all users. Continue?",
    },
    {
      name: "Reset Database",
      description: "WARNING: Completely resets the database and creates fresh data",
      handler: handleResetDatabase,
      type: "danger",
      confirmationMessage: "WARNING: This will reset the entire database. All document data will be lost. Continue?",
    },
  ];
  */

  // Utility function to execute an operation with confirmation if needed - Commented out
  /*
  const executeOperation = async (operation: AdminOperation) => {
    if (operation.confirmationMessage && operation.type !== "normal") {
      const confirmed = window.confirm(operation.confirmationMessage);
      if (!confirmed) return;
    }
    
    await operation.handler();
  };
  */

  if (!userRoles.isAdmin) {
    return null;
  }

  return (
    <div className="space-y-6" data-oid="h8t1p0j">
      {isPrincipal && (
        <>
          {/* User Management Section - This will be removed or commented out
          <div className="flex justify-between items-center" data-oid="l.qdump">
            <h2 className="text-xl font-bold">User Management</h2>
            <button
              onClick={loadUsers}
              disabled={loading || isOperationInProgress}
              className={`px-4 py-2 rounded-md text-white font-medium transition-colors
                        bg-${themeColor}-600 hover:bg-${themeColor}-700
                        disabled:bg-gray-400 disabled:cursor-not-allowed`}
              data-oid="wz0378o"
            >
              Refresh Users
            </button>
          </div>

          {error && (
            <div
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
              role="alert"
              data-oid="1w5g1n4"
            >
              <strong className="font-bold">Error:</strong>
              <span className="block sm:inline"> {error}</span>
            </div>
          )}

          {success && (
            <div
              className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative"
              role="alert"
              data-oid="aou93y4"
            >
              <strong className="font-bold">Success:</strong>
              <span className="block sm:inline"> {success}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-oid="8i2h295">
            {adminOperations.map((op) => (
              <div
                key={op.name}
                className={`p-6 rounded-lg shadow-lg border
                          ${
                            op.type === "danger"
                              ? "bg-red-50 border-red-200"
                              : op.type === "caution"
                              ? "bg-yellow-50 border-yellow-200"
                              : "bg-gray-50 border-gray-200"
                          }
                          hover:shadow-xl transition-shadow`}
                data-oid="c7b6q0s"
              >
                <h3
                  className={`text-lg font-semibold mb-2 
                            ${
                              op.type === "danger"
                                ? "text-red-700"
                                : op.type === "caution"
                                ? "text-yellow-700"
                                : `text-${themeColor}-700`
                            }`}
                  data-oid="_wst.1u"
                >
                  {op.name}
                </h3>
                <p
                  className="text-sm text-gray-600 mb-4"
                  data-oid="j5m52t4"
                >
                  {op.description}
                </p>
                <button
                  onClick={() => executeOperation(op)}
                  disabled={loading || isOperationInProgress}
                  className={`w-full px-4 py-2 rounded-md text-white font-medium transition-colors
                            ${
                              op.type === "danger"
                                ? "bg-red-600 hover:bg-red-700"
                                : op.type === "caution"
                                ? "bg-yellow-500 hover:bg-yellow-600"
                                : `bg-${themeColor}-600 hover:bg-${themeColor}-700`
                            }
                            disabled:bg-gray-400 disabled:cursor-not-allowed`}
                  data-oid="b_3u71a"
                >
                  {op.name}
                </button>
              </div>
            ))}
          </div>
          */}
        </>
      )}

      {/* User Accounts Section */}
      <div className="mt-8" data-oid="z7leswt">
        <h3 
          className="text-lg font-semibold mb-4" 
          style={{ color: "var(--color-text-primary)" }}
          data-oid="q7e20mb"
        >
          User Accounts
        </h3>

        {loading ? (
          <div className="flex justify-center p-8" data-oid="ofmj9.u">
            <div
              className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2"
              style={{ borderColor: "var(--color-primary)" }}
              data-oid="59zqo7r"
            ></div>
          </div>
        ) : (
          <div
            className="card rounded-lg shadow overflow-hidden border overflow-x-auto"
            style={{ 
              backgroundColor: "var(--color-bg-secondary)",
              borderColor: "var(--color-border)"
            }}
            data-oid="e01i-oo"
          >
            <table className="min-w-full divide-y divide-gray-200" data-oid="bgu.xrd">
              <thead 
                style={{ backgroundColor: "rgba(var(--color-primary-rgb), 0.05)" }}
                data-oid="i:42x7y"
              >
                <tr data-oid="lfmixj7">
                  <th
                    className="py-3 px-6 border-b text-left text-xs font-medium uppercase tracking-wider"
                    style={{ 
                      borderColor: "var(--color-border)",
                      color: "var(--color-text-secondary)"
                    }}
                    data-oid="_gg1r8j"
                  >
                    Name
                  </th>
                  <th
                    className="py-3 px-6 border-b text-left text-xs font-medium uppercase tracking-wider"
                    style={{ 
                      borderColor: "var(--color-border)",
                      color: "var(--color-text-secondary)"
                    }}
                  >
                    Email
                  </th>
                  <th
                    className="py-3 px-6 border-b text-left text-xs font-medium uppercase tracking-wider"
                    style={{ 
                      borderColor: "var(--color-border)",
                      color: "var(--color-text-secondary)"
                    }}
                    data-oid="u5glnfc"
                  >
                    Roles
                  </th>
                  <th
                    className="py-3 px-6 border-b text-left text-xs font-medium uppercase tracking-wider"
                    style={{ 
                      borderColor: "var(--color-border)",
                      color: "var(--color-text-secondary)"
                    }}
                    data-oid="98hhw_v"
                  >
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="bg-transparent divide-y divide-gray-200" data-oid="te2wo4h">
                {users.length === 0 ? (
                  <tr data-oid="qbmzen7">
                    <td
                      colSpan={4}
                      className="py-6 text-center"
                      style={{ color: "var(--color-text-muted)" }}
                      data-oid="t06zyf3"
                    >
                      No users found
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr
                      key={user.uid}
                      className="hover:bg-accent transition-colors"
                      style={{ 
                        backgroundColor: "var(--color-bg-secondary)"
                      }}
                      data-oid="a8dxz.b"
                    >
                      <td
                        className="py-3 px-6 text-sm font-medium border-b"
                        style={{ 
                          borderColor: "var(--color-border)",
                          color: "var(--color-text-primary)"
                        }}
                      >
                        {user.name || "Unknown"}
                      </td>
                      <td
                        className="py-3 px-6 text-sm font-medium border-b"
                        style={{ 
                          borderColor: "var(--color-border)",
                          color: "var(--color-text-primary)"
                        }}
                        data-oid="a6cgi:g"
                      >
                        {user.email}
                      </td>
                      <td
                        className="py-3 px-6 text-sm border-b"
                        style={{ borderColor: "var(--color-border)" }}
                        data-oid="vr2-.ps"
                      >
                        <div className="flex flex-wrap gap-2">
                          {user.isAdmin && (
                            <span
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                              style={{ 
                                backgroundColor: "rgba(var(--color-primary-rgb), 0.1)",
                                color: "var(--color-primary-dark)"
                              }}
                              data-oid="u_z1y_4"
                            >
                              Admin
                            </span>
                          )}
                          {user.isTeacher && (
                            <span
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                              style={{ 
                                backgroundColor: "rgba(var(--color-success-rgb), 0.1)",
                                color: "var(--color-success)"
                              }}
                              data-oid="fegg0zz"
                            >
                              Teacher
                            </span>
                          )}
                          {user.isNonAcademic && (
                            <span
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                              style={{ 
                                backgroundColor: "rgba(var(--color-warning-rgb), 0.1)",
                                color: "var(--color-warning)"
                              }}
                            >
                              Non-Academic
                            </span>
                          )}
                        </div>
                      </td>
                      <td
                        className="py-3 px-6 text-sm border-b whitespace-nowrap"
                        style={{ 
                          borderColor: "var(--color-border)",
                          color: "var(--color-text-secondary)"
                        }}
                        data-oid="tl2wwab"
                      >
                        {user.createdAt ? formatDate(user.createdAt) : "N/A"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Test Credentials Section */}
      <div
        className="mt-8 p-5 rounded-lg border"
        style={{ 
          backgroundColor: "rgba(var(--color-info-rgb), 0.05)",
          borderColor: "rgba(var(--color-info-rgb), 0.2)"
        }}
        data-oid="jq87at9"
      >
        <div className="flex items-center mb-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" style={{ color: "var(--color-info)" }} viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <h3 
            className="text-lg font-semibold"
            style={{ color: "var(--color-text-primary)" }}
            data-oid="ejna-7z"
          >
            Test Credentials
          </h3>
        </div>
        
        <ul
          className="space-y-3 pl-7"
          style={{ color: "var(--color-text-secondary)" }}
          data-oid="_zy29q."
        >
          <li className="list-disc" data-oid="yn0zljm">
            <strong data-oid="n_9d1hp">Principal:</strong> principal@school.edu
            / password123
          </li>
          <li className="list-disc" data-oid="kvrvjad">
            <strong data-oid="vjvfj8y">Document Manager:</strong>{" "}
            docmanager@school.edu / password123
          </li>
          <li className="list-disc" data-oid="z9a_rvh">
            <strong data-oid="l1uhhsm">Teachers:</strong> teacher1@school.edu,
            teacher2@school.edu, teacher3@school.edu / password123
          </li>
          <li className="list-disc">
            <strong>Non-Academic Staff:</strong> nonacademic1@school.edu,
            nonacademic2@school.edu, nonacademic3@school.edu / password123
          </li>
        </ul>
      </div>
    </div>
  );
}
