import { useState, FormEvent } from "react";
import { useAuth } from "../contexts/AuthContext";
import { FirebaseError } from "firebase/app";
import InputField from "./InputField";

interface SignupProps {
  switchToLogin: () => void;
}

export default function Signup({ switchToLogin }: SignupProps) {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<string>("teacher");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const { signup } = useAuth();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);

    // Validation
    if (password.length < 6) {
      return setError("Password should be at least 6 characters");
    }

    if (password !== confirmPassword) {
      return setError("Passwords do not match");
    }

    if (!name.trim()) {
      return setError("Please enter your name");
    }

    if (!selectedRole) {
      return setError("Please select a role");
    }

    try {
      setLoading(true);
      await signup(email, password, name, selectedRole);
      setSuccess(true);

      // Reset form after successful signup
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setName("");
      setSelectedRole("teacher");

      // Switch to login after 2 seconds
      setTimeout(() => {
        switchToLogin();
      }, 2000);
    } catch (error) {
      if (error instanceof FirebaseError) {
        switch (error.code) {
          case "auth/email-already-in-use":
            setError("Email is already in use");
            break;
          case "auth/invalid-email":
            setError("Invalid email address");
            break;
          case "auth/weak-password":
            setError("Password is too weak");
            break;
          default:
            setError(`Failed to create an account: ${error.message}`);
        }
      } else {
        setError("Failed to create an account");
      }
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="card animate-fadeInFast w-full"
      style={{ 
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        borderRadius: "0.75rem",
        boxShadow: "0 8px 16px rgba(0, 0, 0, 0.15)",
        padding: "2rem",
        border: "1px solid rgba(255, 255, 255, 0.3)",
        backdropFilter: "blur(10px)",
        transition: "all 0.3s ease"
      }}
      data-oid="cr.fzuy"
    >
      <div className="text-center mb-6" data-oid="o7teh2.">
        <h2 
          className="text-2xl font-bold" 
          style={{ color: "#0a2540" }}
          data-oid="4p2_ok5"
        >
          Create Account
        </h2>
        <p 
          style={{ color: "#4a5568" }}
          className="mt-2" 
          data-oid="nnodg_c"
        >
          Register to manage your school documents
        </p>
      </div>

      {error && (
        <div
          className="status-rejected px-4 py-3 rounded mb-4 animate-fadeInFast"
          data-oid="5d2x__f"
        >
          {error}
        </div>
      )}

      {success && (
        <div
          className="status-approved px-4 py-3 rounded mb-4 animate-fadeInFast"
          data-oid="r2j2zf7"
        >
          Account created successfully! Redirecting to login...
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4"
        data-oid=".e0uu_v"
      >
        <InputField
          id="name"
          label="Full Name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={loading || success}
        />

        <InputField
          id="email"
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading || success}
          data-oid="20gzh9l"
        />

        <div data-oid="o09il9f">
          <InputField
            id="password"
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading || success}
            data-oid="zw-u499"
          />

          <p
            className="text-xs mt-1"
            style={{ color: "var(--color-text-muted)" }}
            data-oid="p08_ah6"
          >
            Must be at least 6 characters
          </p>
        </div>

        <InputField
          id="confirm-password"
          label="Confirm Password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          disabled={loading || success}
          data-oid="e2:h676"
        />

        <div 
          className="p-3 rounded bg-blue-50 border border-blue-200 text-blue-700 text-sm" 
          data-oid="xdoa:ub"
        >
          <p className="flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span>You are signing up as a staff member. Admin accounts are created by the system administrator.</span>
          </p>
          <div className="mt-3">
            <p className="mb-2 font-medium">Select your role:</p>
            <div className="flex flex-col gap-2">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="rounded-full border shadow-sm focus:ring focus:ring-opacity-50"
                  style={{ 
                    borderColor: "var(--color-border)", 
                    backgroundColor: "var(--color-bg-secondary)",
                    color: "var(--color-primary)"
                  }}
                  checked={selectedRole === "teacher"}
                  onChange={() => setSelectedRole("teacher")}
                  disabled={loading || success}
                  name="role"
                />
                <span 
                  className="ml-2" 
                  style={{ color: "var(--color-text-primary)" }}
                >
                  Teacher
                </span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="rounded-full border shadow-sm focus:ring focus:ring-opacity-50"
                  style={{ 
                    borderColor: "var(--color-border)", 
                    backgroundColor: "var(--color-bg-secondary)",
                    color: "var(--color-primary)"
                  }}
                  checked={selectedRole === "nonAcademic"}
                  onChange={() => setSelectedRole("nonAcademic")}
                  disabled={loading || success}
                  name="role"
                />
                <span 
                  className="ml-2" 
                  style={{ color: "var(--color-text-primary)" }}
                >
                  Non-Academic Staff
                </span>
              </label>
            </div>
          </div>
        </div>

        <div
          className="flex items-center justify-between pt-2"
          data-oid="oa_5d1s"
        >
          <button
            className="btn btn-primary"
            style={{
              opacity: loading || success ? "0.5" : "1",
              cursor: loading || success ? "not-allowed" : "pointer"
            }}
            type="submit"
            disabled={loading || success}
            data-oid="_5qtdwf"
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
          <button
            type="button"
            onClick={switchToLogin}
            className="text-primary hover:underline text-sm"
            disabled={loading || success}
            data-oid="1.5pqpx"
          >
            Already have an account?
          </button>
        </div>
      </form>
    </div>
  );
}
