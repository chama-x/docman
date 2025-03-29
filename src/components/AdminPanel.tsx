import { useState, useEffect } from "react";
import { User } from "../types/documentTypes";
import {
  getAllUsers,
  initializeTestUsers,
  fixUserRoles,
} from "../services/userService";
import {
  createSampleDocuments,
  deleteAllDocuments,
} from "../services/testDataService";
import { useAuth } from "../contexts/AuthContext";
import { ref, set } from "firebase/database";
import { database } from "../firebase";

// Define types for admin operations
type OperationType = "normal" | "caution" | "danger";

interface AdminOperation {
  name: string;
  description: string;
  handler: () => Promise<void>;
  type: OperationType;
  confirmationMessage?: string;
}

export default function AdminPanel() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isOperationInProgress, setIsOperationInProgress] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const { userRoles, currentUser } = useAuth();

  // Determine if user is principal or document manager
  const isPrincipal =
    currentUser?.email?.toLowerCase() === "principal@school.edu";
  const themeColor = isPrincipal ? "blue" : "purple";

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
      setError("Failed to load users");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

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

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Define admin operations
  const adminOperations: AdminOperation[] = [
    {
      name: "Generate Test Users",
      description: "Creates sample users: principal, doc manager, and 3 teachers",
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

  // Utility function to execute an operation with confirmation if needed
  const executeOperation = async (operation: AdminOperation) => {
    if (operation.confirmationMessage && operation.type !== "normal") {
      const confirmed = window.confirm(operation.confirmationMessage);
      if (!confirmed) return;
    }
    
    await operation.handler();
  };

  if (!userRoles.isAdmin) {
    return null;
  }

  return (
    <div className="space-y-6" data-oid="h8t1p0j">
      <div className="flex justify-between items-center" data-oid="l.qdump">
        <h2 className="text-xl font-bold">
          User Management
        </h2>
        <button 
          onClick={loadUsers}
          className="text-sm px-3 py-1 rounded border hover:bg-opacity-10 transition-colors"
          style={{ 
            backgroundColor: "rgba(var(--color-primary-rgb), 0.05)",
            borderColor: "rgba(var(--color-primary-rgb), 0.2)",
            color: "var(--color-primary)"
          }}
          disabled={loading || isOperationInProgress}
        >
          {loading ? "Refreshing..." : "Refresh Users"}
        </button>
      </div>

      {error && (
        <div
          className="bg-red-900 bg-opacity-20 border border-red-700 text-red-400 px-4 py-3 rounded flex items-center"
          data-oid="oqpxvn:"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      {success && (
        <div
          className="bg-green-900 bg-opacity-20 border border-green-700 text-green-400 px-4 py-3 rounded flex items-center"
          data-oid="dex3jpj"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          {success}
        </div>
      )}

      {/* Admin Operations Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-oid="oq1t:pj">
        {adminOperations.map((operation, index) => {
          // Set the appropriate styling based on operation type
          const bgColor = operation.type === "danger" 
            ? "rgba(var(--color-error-rgb), 0.05)" 
            : operation.type === "caution"
              ? "rgba(var(--color-warning-rgb), 0.05)"
              : "rgba(var(--color-primary-rgb), 0.05)";
          
          const borderColor = operation.type === "danger" 
            ? "rgba(var(--color-error-rgb), 0.2)" 
            : operation.type === "caution"
              ? "rgba(var(--color-warning-rgb), 0.2)"
              : "rgba(var(--color-primary-rgb), 0.2)";
          
          const buttonBgColor = operation.type === "danger" 
            ? "bg-red-900 hover:bg-red-800 text-red-300" 
            : operation.type === "caution"
              ? "bg-yellow-900 hover:bg-yellow-800 text-yellow-300"
              : `bg-${themeColor}-900 hover:bg-${themeColor}-800 text-${themeColor}-300`;

          return (
            <div 
              key={index}
              className="rounded-lg border p-4 transition-all hover:shadow-md"
              style={{ 
                backgroundColor: bgColor,
                borderColor: borderColor,
              }}
            >
              <h3 className="font-bold mb-2" style={{ 
                color: operation.type === "danger" 
                  ? "var(--color-error)" 
                  : operation.type === "caution"
                    ? "var(--color-warning)"
                    : "var(--color-primary)"
              }}>
                {operation.name}
              </h3>
              
              <p className="text-sm mb-4" style={{ color: "var(--color-text-secondary)" }}>
                {operation.description}
              </p>
              
              <button
                onClick={() => executeOperation(operation)}
                className={`${buttonBgColor} font-bold py-2 px-4 rounded flex items-center justify-center transition-colors`}
                disabled={loading || isOperationInProgress}
              >
                {isOperationInProgress ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  operation.name
                )}
              </button>
            </div>
          );
        })}
      </div>

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
                      colSpan={3}
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
        </ul>
      </div>
    </div>
  );
}
