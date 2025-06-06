import React, { createContext, useState, useContext, useEffect } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from "firebase/auth";
import { auth, database } from "../firebase";
import { ref, set, get, onValue } from "firebase/database";

// Define a list of special admin emails - always have admin role
const adminEmails = ["principal@school.edu", "docmanager@school.edu"];

// Define titles for special admin emails
const adminTitles: Record<string, string> = {
  "principal@school.edu": "Principal Dashboard",
  "docmanager@school.edu": "Document Manager Dashboard",
};

// Define types
interface UserRoles {
  isAdmin: boolean;
  isTeacher: boolean;
  isNonAcademic?: boolean;
  title?: string;
}

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userRoles: UserRoles;
  signup: (email: string, password: string, name: string, role: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  userRoles: { isAdmin: false, isTeacher: false, isNonAcademic: false },
  signup: async () => {},
  login: async () => {},
  logout: async () => {},
  loading: true,
});

// Custom hook to use the auth context
export function useAuth() {
  return useContext(AuthContext);
}

// Get roles for a given user ID
export const getUserRoles = async (
  userId: string,
  email: string,
): Promise<UserRoles> => {
  try {
    // If this is a known admin email, ensure they have the admin role
    if (adminEmails.includes(email.toLowerCase())) {
      console.log(`User ${email} is a known admin`);

      // Check if title is defined for this admin
      const title = adminTitles[email.toLowerCase()];

      return {
        isAdmin: true,
        isTeacher: false,
        isNonAcademic: false,
        ...(title ? { title } : {}),
      };
    }

    // Get the user's roles from the database
    const userRolesRef = ref(database, `users/${userId}/roles`);
    const snapshot = await get(userRolesRef);

    // If roles exist in the database
    if (snapshot.exists()) {
      const roles = snapshot.val();
      console.log(`Retrieved roles for ${userId}:`, roles);
      return roles;
    }

    // If no roles found, check if email contains 'teacher' to assign default role
    if (email.includes("teacher")) {
      console.log(
        `No roles found for ${userId}, but email suggests teacher role`,
      );
      return { isAdmin: false, isTeacher: true, isNonAcademic: false };
    }

    // Default to regular user roles
    console.log(
      `No roles found for ${userId}, using default regular user role`,
    );
    return { isAdmin: false, isTeacher: false, isNonAcademic: false };
  } catch (error) {
    console.error(`Error getting roles for user ${userId}:`, error);
    return { isAdmin: false, isTeacher: false, isNonAcademic: false };
  }
};

// Update roles for a given user ID
export const updateUserRoles = async (
  userId: string,
  roles: UserRoles,
): Promise<void> => {
  try {
    const userRolesRef = ref(database, `users/${userId}/roles`);
    await set(userRolesRef, roles);
    console.log(`Updated roles for user ${userId}:`, roles);
  } catch (error) {
    console.error(`Error updating roles for user ${userId}:`, error);
    throw error;
  }
};

// Provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userRoles, setUserRoles] = useState<UserRoles>({
    isAdmin: false,
    isTeacher: false,
    isNonAcademic: false,
  });
  const [loading, setLoading] = useState<boolean>(true);

  // Signup function
  async function signup(email: string, password: string, name: string, role: string) {
    try {
      const result = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );

      // Set initial roles based on role parameter
      let roles: UserRoles = { 
        isAdmin: false, 
        isTeacher: false,
        isNonAcademic: false 
      };

      // If this is a known admin email
      if (adminEmails.includes(email.toLowerCase())) {
        roles = {
          isAdmin: true,
          isTeacher: false,
          isNonAcademic: false,
          title: adminTitles[email.toLowerCase()],
        };
      }
      // Otherwise set roles based on the selected role
      else if (role === 'teacher') {
        roles = { isAdmin: false, isTeacher: true, isNonAcademic: false };
      }
      else if (role === 'nonAcademic') {
        roles = { isAdmin: false, isTeacher: false, isNonAcademic: true };
      }

      // Save user data to database
      const user = result.user;
      const userRef = ref(database, `users/${user.uid}`);
      
      await set(userRef, {
        email: email,
        name: name,
        roles: roles,
        createdAt: Date.now()
      });
    } catch (error) {
      console.error("Signup error:", error);
      throw error;
    }
  }

  // Login function
  async function login(email: string, password: string) {
    try {
      await signInWithEmailAndPassword(auth, email, password);

      // Roles will be updated by the onAuthStateChanged listener
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }

  // Logout function
  async function logout() {
    try {
      await signOut(auth);
      setUserRoles({ isAdmin: false, isTeacher: false, isNonAcademic: false }); // Reset roles on logout
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  }

  // Auth state change listener
  useEffect(() => {
    console.log("AuthContext: Setting up auth state listener");
    let rolesUnsubscriber: (() => void) | null = null;

    // Backup timeout to ensure loading is never stuck
    const backupTimeout = setTimeout(() => {
      console.log("AuthContext: Backup timeout triggered, forcing loading to false");
      setLoading(false);
    }, 5000); // 5 second backup

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("Auth state changed:", user?.email || "No user");
      console.log("Auth state change - user object:", user ? "User exists" : "No user");
      
      // Clear the backup timeout since we got a response
      clearTimeout(backupTimeout);
      
      setCurrentUser(user);

      // Clean up previous roles listener
      if (rolesUnsubscriber) {
        rolesUnsubscriber();
        rolesUnsubscriber = null;
      }

      if (user) {
        console.log("User is logged in, processing roles...");
        // If user is logged in
        try {
          // Get and set user roles (async operation)
          const roles = await getUserRoles(user.uid, user.email || "");
          console.log("Setting user roles:", roles);
          setUserRoles(roles);

          // Ensure admin roles are correct in DB (async operation)
          if (adminEmails.includes(user.email?.toLowerCase() || "")) {
            const adminRole: UserRoles = {
              isAdmin: true,
              isTeacher: false,
              isNonAcademic: false,
              title: adminTitles[user.email?.toLowerCase() || ""],
            };
            
            try {
            // Check if current roles need update before writing
            const currentRoles = await get(
              ref(database, `users/${user.uid}/roles`),
            );
            if (
              !currentRoles.exists() ||
              JSON.stringify(currentRoles.val()) !== JSON.stringify(adminRole)
            ) {
              await updateUserRoles(user.uid, adminRole);
              }
            } catch (roleUpdateError) {
              console.error("Error updating admin roles:", roleUpdateError);
              // Continue anyway, don't block loading
            }
          }

          // Listen for real-time role updates
          const userRolesRef = ref(database, `users/${user.uid}/roles`);
          rolesUnsubscriber = onValue(userRolesRef, (snapshot) => {
            if (snapshot.exists()) {
              const updatedRoles = snapshot.val();
              console.log("Role update from database:", updatedRoles);
              setUserRoles(updatedRoles);
            }
          });

        } catch (error) {
          console.error("Error setting user roles:", error);
          // Set roles to default on error
          setUserRoles({ isAdmin: false, isTeacher: false, isNonAcademic: false });
        }
      } else {
        console.log("No user, resetting roles and setting loading to false");
        // User is logged out, reset roles
        setUserRoles({ isAdmin: false, isTeacher: false, isNonAcademic: false });
      }

      // Always set loading to false after processing
      console.log("AuthContext: Setting loading to false");
      setLoading(false);
    });

    return () => {
      console.log("AuthContext: Cleaning up auth state listener");
      clearTimeout(backupTimeout); // Clean up the backup timeout
      unsubscribe();
      if (rolesUnsubscriber) {
        rolesUnsubscriber();
      }
    };
  }, []);

  const value = {
    currentUser,
    userRoles,
    signup,
    login,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value} data-oid="e3k1tdw">
      {children}
    </AuthContext.Provider>
  );
}
