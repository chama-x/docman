import { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Auth from "./components/Auth";
import Dashboard from "./components/Dashboard";
import {
  initializeDatabase,
  updateAppStatus,
  getAppStatus,
} from "./services/initService";

function AppContent() {
  const { currentUser, loading } = useAuth();
  const [dbInitializing, setDbInitializing] = useState<boolean>(true);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    // Set the default theme to clean white mode
    document.documentElement.setAttribute("data-theme", "default");
    // Also ensure the html and body elements match the theme
    document.documentElement.classList.add("bg-primary");
    document.body.classList.add("bg-primary", "text-primary");

    const init = async () => {
      try {
        setInitError(null);
        setDbInitializing(true);

        const currentStatus = await getAppStatus();

        if (currentStatus !== "initialized") {
          console.log(
            "App not marked as initialized, running initialization checks...",
          );
          await initializeDatabase();
          await updateAppStatus("initialized");
          console.log("Initialization process complete.");
        } else {
          console.log("App already initialized, skipping database setup.");
        }
      } catch (error) {
        console.error("Application initialization failed:", error);
        setInitError(
          "Failed to initialize application. Please try refreshing.",
        );
      } finally {
        setDbInitializing(false);
      }
    };

    init();
  }, []);

  if (initError) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center bg-primary"
        data-oid="3pw7h_i"
      >
        <div
          className="bg-secondary p-6 rounded-lg shadow max-w-md w-full"
          data-oid="c_ld8w7"
        >
          <div
            className="flex items-center space-x-3 text-error mb-3"
            data-oid="kwr:c67"
          >
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              data-oid=":-45x.4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                data-oid=".buub:v"
              ></path>
            </svg>
            <h2 className="text-xl font-semibold" data-oid="uacie3_">
              Initialization Error
            </h2>
          </div>
          <p className="mb-4 text-primary" data-oid="niifcyn">
            {initError}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-2 px-4 rounded transition-colors"
            data-oid="37u2y5n"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (loading || dbInitializing) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center bg-primary"
        data-oid="7hanzzr"
      >
        <div
          className="flex flex-col items-center p-8 bg-secondary rounded-lg shadow-lg"
          data-oid="gtbiw4x"
        >
          <div
            className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-6"
            data-oid=".h:yzwy"
          ></div>
          <p className="text-primary text-lg" data-oid="mh6f08.">
            {dbInitializing
              ? "Initializing database..."
              : "Loading application..."}
          </p>
        </div>
      </div>
    );
  }

  return currentUser ? (
    <Dashboard data-oid="w4:ikmq" />
  ) : (
    <Auth data-oid="3dzkqg0" />
  );
}

export default function App() {
  return (
    <div className="min-h-screen w-full bg-[#CCCCCC]" data-oid="2wvz._:">
      <AuthProvider data-oid="fcku4y2">
        <AppContent data-oid="awt.xci" />
      </AuthProvider>
    </div>
  );
}
