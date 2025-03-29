import { useState } from "react";
import Login from "./Login";
import Signup from "./Signup";

export default function Auth() {
  const [showLogin, setShowLogin] = useState<boolean>(true);

  return (
    <div
      style={{ 
        backgroundColor: "#0077b6",
        color: "white",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0",
        position: "relative",
        overflow: "hidden"
      }}
      data-oid="ttk-3a-"
    >
      {/* Background Image with Blur */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundImage: "url('/students.webp')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          opacity: 0.25,
          filter: "blur(6px)",
          zIndex: 0
        }}
      ></div>
      
      <div 
        style={{ 
          maxWidth: "480px",
          width: "90%",
          margin: "0 auto",
          position: "relative",
          zIndex: 1
        }} 
        data-oid="k970:l6"
      >
        {showLogin ? (
          <Login
            switchToSignup={() => setShowLogin(false)}
            data-oid=".g.:xr4"
          />
        ) : (
          <Signup switchToLogin={() => setShowLogin(true)} data-oid="_3_ciu9" />
        )}
      </div>
    </div>
  );
}
