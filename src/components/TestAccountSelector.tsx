import React, { useState } from "react";

interface TestAccount {
  email: string;
  role: string;
}

interface TestAccountSelectorProps {
  disabled?: boolean;
  onSelectAccount: (email: string, password?: string) => void;
}

// Define test accounts data outside the component
const testAccounts: TestAccount[] = [
  { email: "principal@school.edu", role: "Admin" },
  { email: "docmanager@school.edu", role: "Admin" },
  { email: "teacher1@school.edu", role: "Teacher" },
  // Add more test accounts here if needed
];

const testPassword = "password123"; // Centralize the test password

const TestAccountSelector: React.FC<TestAccountSelectorProps> = ({
  disabled = false,
  onSelectAccount,
}) => {
  const [showTestAccounts, setShowTestAccounts] = useState<boolean>(false);

  const getRoleStyle = (role: string): React.CSSProperties => {
    switch (role.toLowerCase()) {
      case "admin":
        return { 
          backgroundColor: "rgba(59, 130, 246, 0.1)", 
          color: "rgb(30, 64, 175)" 
        };
      case "teacher":
        return { 
          backgroundColor: "rgba(16, 185, 129, 0.1)", 
          color: "rgb(6, 95, 70)" 
        };
      default:
        return { 
          backgroundColor: "rgba(156, 163, 175, 0.1)", 
          color: "rgb(55, 65, 81)" 
        };
    }
  };

  return (
    <div style={{ marginTop: "2rem", width: "100%" }} data-oid="yh43p6p">
      <button
        onClick={() => setShowTestAccounts(!showTestAccounts)}
        style={{
          fontSize: "0.875rem",
          color: "#0077b6",
          opacity: disabled ? 0.5 : 0.7,
          cursor: disabled ? "not-allowed" : "pointer",
          display: "flex",
          alignItems: "center",
          transition: "all 0.2s ease",
          background: "none",
          border: "none",
          padding: 0
        }}
        disabled={disabled}
        data-oid="-c-yl1w"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          style={{ height: "1rem", width: "1rem", marginRight: "0.25rem" }}
          viewBox="0 0 20 20"
          fill="currentColor"
          data-oid="ho_qbdv"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z"
            clipRule="evenodd"
            data-oid="dzd7:j:"
          />
        </svg>
        {showTestAccounts ? "Hide Test Accounts" : "Show Test Accounts"}
      </button>

      {showTestAccounts && (
        <div
          style={{
            marginTop: "1rem",
            backgroundColor: "#f8f9fa",
            padding: "1rem",
            borderRadius: "0.375rem",
            border: "1px solid #e5e7eb",
            animation: "fadeIn 0.3s ease-in-out",
            width: "100%",
            boxSizing: "border-box"
          }}
          data-oid="dxa28.g"
        >
          <h3
            style={{
              fontSize: "0.9375rem",
              fontWeight: 600,
              marginBottom: "0.75rem",
              color: "#333",
              textAlign: "left"
            }}
            data-oid="_efubd:"
          >
            Test Accounts
          </h3>
          <p
            style={{
              fontSize: "0.75rem",
              color: "#555",
              opacity: 0.7,
              marginBottom: "0.5rem",
              textAlign: "left"
            }}
            data-oid="7s2q-dx"
          >
            All accounts use password:{" "}
            <code
              style={{
                backgroundColor: "white",
                padding: "0.125rem 0.25rem",
                borderRadius: "0.25rem"
              }}
              data-oid="jfzi.vo"
            >
              {testPassword}
            </code>
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: "0.5rem",
              width: "100%"
            }}
            data-oid="5pv3ra6"
          >
            {testAccounts.map((account) => (
              <button
                key={account.email}
                onClick={() => onSelectAccount(account.email, testPassword)}
                style={{
                  textAlign: "left",
                  padding: "0.375rem 0.75rem",
                  fontSize: "0.875rem",
                  borderRadius: "0.25rem",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  opacity: disabled ? 0.5 : 1,
                  cursor: disabled ? "not-allowed" : "pointer",
                  transition: "all 0.2s ease",
                  border: "none",
                  width: "100%",
                  ...getRoleStyle(account.role)
                }}
                disabled={disabled}
                data-oid="jaxx7ia"
              >
                <span 
                  style={{ 
                    color: "#333", 
                    overflow: "hidden", 
                    textOverflow: "ellipsis", 
                    whiteSpace: "nowrap",
                    marginRight: "0.5rem" 
                  }} 
                  data-oid="bn7b5v3"
                >
                  {account.email}
                </span>
                <span
                  style={{
                    padding: "0.125rem 0.5rem",
                    borderRadius: "0.25rem",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    ...getRoleStyle(account.role)
                  }}
                  data-oid="1dzp7qg"
                >
                  {account.role}
                </span>
              </button>
            ))}
          </div>

          <p
            style={{
              fontSize: "0.75rem",
              color: "#555",
              opacity: 0.7,
              marginTop: "0.75rem",
              textAlign: "left"
            }}
            data-oid="8ti7lmr"
          >
            Note: You may need appropriate roles assigned via the database for
            full functionality.
          </p>
        </div>
      )}
    </div>
  );
};

export default TestAccountSelector;
