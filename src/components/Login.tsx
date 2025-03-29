import { useState, FormEvent } from "react";
import { useAuth } from "../contexts/AuthContext";
import { FirebaseError } from "firebase/app";
import InputField from "./InputField";
import TestAccountSelector from "./TestAccountSelector";

interface LoginProps {
  switchToSignup: () => void;
}

export default function Login({ switchToSignup }: LoginProps) {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const { login } = useAuth();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);
      await login(email, password);
    } catch (error) {
      if (error instanceof FirebaseError) {
        switch (error.code) {
          case "auth/invalid-email":
            setError("Invalid email address");
            break;
          case "auth/user-not-found":
            setError("No account found with this email");
            break;
          case "auth/wrong-password":
            setError("Incorrect password");
            break;
          case "auth/invalid-credential":
            setError("Invalid login credentials");
            break;
          default:
            setError(`Failed to sign in: ${error.message}`);
        }
      } else {
        setError("Failed to sign in");
      }
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  function handleSelectTestAccount(testEmail: string, testPassword?: string) {
    setEmail(testEmail);
    if (testPassword) {
      setPassword(testPassword);
    }
  }

  return (
    <div
      className="card animate-fadeInFast"
      style={{ 
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        borderRadius: "0.75rem",
        boxShadow: "0 8px 16px rgba(0, 0, 0, 0.15)",
        padding: "2rem",
        border: "1px solid rgba(255, 255, 255, 0.3)",
        width: "100%",
        backdropFilter: "blur(10px)",
        transition: "all 0.3s ease"
      }}
      data-oid="b7foxo5"
    >
      <div className="text-center mb-6" data-oid="2d6.c-5">
        <h2 
          className="text-2xl font-bold" 
          style={{ color: "#0a2540" }}
          data-oid="_kcxbgd"
        >
          School Document Manager
        </h2>
        <p 
          className="mt-2" 
          style={{ color: "#4a5568" }}
          data-oid="pmm51.s"
        >
          Sign in to manage your documents
        </p>
      </div>

      {error && (
        <div
          style={{
            backgroundColor: "rgba(220, 76, 100, 0.1)",
            border: "1px solid rgba(220, 76, 100, 0.3)",
            color: "rgb(220, 76, 100)",
            padding: "0.75rem 1rem",
            borderRadius: "0.375rem",
            marginBottom: "1rem"
          }}
          className="animate-fadeInFast"
          data-oid="odeswt-"
        >
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4"
        style={{ width: "100%" }}
        data-oid="l6fxnbi"
      >
        <div className="mb-4" style={{ width: "100%" }}>
          <label 
            htmlFor="email" 
            className="block text-sm font-medium mb-1"
            style={{ color: "#333", textAlign: "left" }}
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            className="w-full px-3 py-2 rounded-md border"
            style={{
              backgroundColor: "#f8f9fa",
              borderColor: "#e5e7eb",
              width: "100%",
              boxSizing: "border-box",
              color: "#333"
            }}
            data-oid="agaxf32"
          />
        </div>

        <div className="mb-4" style={{ width: "100%" }}>
          <label 
            htmlFor="password" 
            className="block text-sm font-medium mb-1"
            style={{ color: "#333", textAlign: "left" }}
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            className="w-full px-3 py-2 rounded-md border"
            style={{
              backgroundColor: "#f8f9fa",
              borderColor: "#e5e7eb",
              width: "100%",
              boxSizing: "border-box",
              color: "#333"
            }}
            data-oid="hmtcedi"
          />
        </div>

        <div
          className="flex items-center justify-between pt-2"
          style={{ width: "100%" }}
          data-oid="6h2og98"
        >
          <button
            style={{
              backgroundColor: "#0077b6",
              color: "white",
              fontWeight: "bold",
              padding: "0.5rem 1rem",
              borderRadius: "0.375rem",
              transition: "all 0.2s ease",
              opacity: loading ? 0.5 : 1,
              cursor: loading ? "not-allowed" : "pointer"
            }}
            type="submit"
            disabled={loading}
            data-oid="jba80cw"
          >
            {loading ? (
              <div className="flex items-center" data-oid=":wvxfai">
                <span
                  className="inline-block animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"
                  data-oid="u8lty7_"
                ></span>
                Signing In...
              </div>
            ) : (
              "Sign In"
            )}
          </button>
          <button
            style={{
              fontWeight: "bold",
              fontSize: "0.875rem",
              color: "#0077b6",
              transition: "all 0.2s ease"
            }}
            type="button"
            onClick={switchToSignup}
            disabled={loading}
            data-oid="n3e-r1l"
          >
            Create Account
          </button>
        </div>
      </form>

      <TestAccountSelector
        disabled={loading}
        onSelectAccount={handleSelectTestAccount}
        data-oid="40-qdyw"
      />
    </div>
  );
}
