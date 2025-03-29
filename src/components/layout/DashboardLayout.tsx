import { ReactNode, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  bgColor?: string;
}

export default function DashboardLayout({
  children,
  title,
  subtitle,
  bgColor,
}: DashboardLayoutProps) {
  const { currentUser, userRoles, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const handleLogout = () => {
    logout();
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div
      className="min-h-screen relative"
      style={{ 
        backgroundColor: bgColor || "#0077b6",
        color: "#333333", // Default dark text color for content
        position: "relative",
        zIndex: 0
      }}
      data-oid="3whpoyu"
    >
      {/* Background Image with Blur */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundImage: "url('/teachers 1:1.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          opacity: 0.15,
          filter: "blur(8px)",
          zIndex: -1
        }}
      ></div>

      {/* Debug Info - For Development Only */}
      <div
        style={{
          backgroundColor: "rgba(245, 247, 250, 0.9)",
          color: "#333333",
          padding: "0.5rem",
          fontSize: "0.75rem",
          position: "relative",
          zIndex: 1
        }}
        className="animate-fadeInFast"
        data-oid="ktje:70"
      >
        <strong data-oid="mqx2qaa">DEBUG:</strong> User: {currentUser?.email} |
        Roles: Admin: {userRoles.isAdmin ? "YES" : "NO"}, Teacher:{" "}
        {userRoles.isTeacher ? "YES" : "NO"} | Title:{" "}
        {userRoles.title || "None"}
      </div>

      {/* Header */}
      <header
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.7)",
          color: "#333333",
          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.3)",
          position: "sticky",
          top: 0,
          zIndex: 10,
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)" // For Safari support
        }}
        className="animate-fadeInFast"
        data-oid="ew4:v1c"
      >
        <div className="mx-auto px-4 sm:px-6 lg:px-8" data-oid="mj7n-ov">
          <div
            className="flex justify-between items-center py-4 md:py-6"
            data-oid="0av9tyo"
          >
            <div className="animate-fadeInFast" data-oid="7vf3t4h">
              <h1 
                className="text-xl sm:text-2xl md:text-3xl font-bold"
                style={{ color: "#333333" }} 
                data-oid="f5hd_mf"
              >
                {title}
              </h1>
              {subtitle && (
                <p 
                  className="mt-1 text-xs sm:text-sm hidden sm:block"
                  style={{ color: "#555555", opacity: 0.8 }} 
                  data-oid="p_ivrg1"
                >
                  {subtitle}
                </p>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden flex items-center justify-center p-2 rounded-md focus:outline-none"
              onClick={toggleMobileMenu}
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle menu"
              style={{ backgroundColor: "rgba(0, 119, 182, 0.1)" }}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-6 w-6" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="#0077b6"
              >
                {mobileMenuOpen ? (
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M6 18L18 6M6 6l12 12" 
                  />
                ) : (
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M4 6h16M4 12h16M4 18h16" 
                  />
                )}
              </svg>
            </button>

            {/* Desktop Navigation */}
            <div
              className="hidden md:flex items-center animate-fadeInFast"
              data-oid="u3rg205"
            >
              <div className="mr-4 text-right" data-oid="zxlgxg.">
                <p 
                  className="text-sm"
                  style={{ color: "#333333" }} 
                  data-oid="haneaoy"
                >
                  {currentUser?.email}
                </p>
                <div className="flex items-center gap-2" data-oid="6-8n_wg">
                  {userRoles.isAdmin && (
                    <span
                      style={{
                        padding: "0.125rem 0.5rem",
                        backgroundColor: "rgba(59, 130, 246, 0.1)",
                        color: "rgb(30, 64, 175)",
                        fontSize: "0.75rem",
                        borderRadius: "9999px"
                      }}
                      data-oid="od_zc62"
                    >
                      Admin
                    </span>
                  )}
                  {userRoles.isTeacher && (
                    <span
                      style={{
                        padding: "0.125rem 0.5rem",
                        backgroundColor: "rgba(16, 185, 129, 0.1)",
                        color: "rgb(6, 95, 70)",
                        fontSize: "0.75rem",
                        borderRadius: "9999px"
                      }}
                      data-oid="-44eiq-"
                    >
                      Teacher
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={handleLogout}
                style={{
                  backgroundColor: "#0077b6",
                  color: "white",
                  padding: "0.5rem 1rem",
                  borderRadius: "0.375rem",
                  marginLeft: "1rem",
                  fontWeight: "500"
                }}
                className="hover:bg-blue-700 transition-colors"
                data-oid=".xe0h67"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        <div 
          className={`${mobileMenuOpen ? 'block' : 'hidden'} md:hidden animate-fadeIn`}
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            borderBottom: "1px solid rgba(0, 0, 0, 0.1)",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
          }}
        >
          <div className="px-4 pt-2 pb-4 space-y-3">
            <div className="flex flex-col items-start">
              <p className="text-sm font-medium" style={{ color: "#333333" }}>
                {currentUser?.email}
              </p>
              <div className="flex items-center gap-2 mt-1">
                {userRoles.isAdmin && (
                  <span
                    style={{
                      padding: "0.125rem 0.5rem",
                      backgroundColor: "rgba(59, 130, 246, 0.1)",
                      color: "rgb(30, 64, 175)",
                      fontSize: "0.75rem",
                      borderRadius: "9999px"
                    }}
                  >
                    Admin
                  </span>
                )}
                {userRoles.isTeacher && (
                  <span
                    style={{
                      padding: "0.125rem 0.5rem",
                      backgroundColor: "rgba(16, 185, 129, 0.1)",
                      color: "rgb(6, 95, 70)",
                      fontSize: "0.75rem",
                      borderRadius: "9999px"
                    }}
                  >
                    Teacher
                  </span>
                )}
              </div>
            </div>
            
            {subtitle && (
              <p 
                className="text-xs pt-2 border-t border-gray-200"
                style={{ color: "#555555", opacity: 0.8 }} 
              >
                {subtitle}
              </p>
            )}
            
            <div className="pt-2 border-t border-gray-200">
              <button
                onClick={handleLogout}
                className="w-full text-left flex items-center px-3 py-2 text-sm font-medium rounded-md"
                style={{
                  backgroundColor: "#0077b6",
                  color: "white",
                }}
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5 mr-2" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
                  />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 animate-fadeInFast"
        style={{ 
          backgroundColor: "rgba(255, 255, 255, 0.7)", 
          borderRadius: "0.5rem", 
          margin: "1rem auto", 
          color: "#333333",
          position: "relative",
          zIndex: 1,
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)"
        }}
        data-oid="gvwxhtt"
      >
        {children}
      </main>
    </div>
  );
}
