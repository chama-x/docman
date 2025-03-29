import React, { createContext, useState, useContext, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { auth, database } from '../firebase';
import { ref, set, get, onValue, update } from 'firebase/database';
import { UserRole } from '../types/documentTypes';

// Define a list of special admin emails - always have admin role
const adminEmails = [
  'principal@school.edu',
  'docmanager@school.edu'
];

// Define titles for special admin emails
const adminTitles: Record<string, string> = {
  'principal@school.edu': 'Principal Dashboard',
  'docmanager@school.edu': 'Document Manager Dashboard'
};

// Define types
interface UserRoles {
  isAdmin: boolean;
  isTeacher: boolean;
  title?: string;
}

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userRoles: UserRoles;
  signup: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  userRoles: { isAdmin: false, isTeacher: false },
  signup: async () => {},
  login: async () => {},
  logout: async () => {},
  loading: true
});

// Custom hook to use the auth context
export function useAuth() {
  return useContext(AuthContext);
}

// Get roles for a given user ID
export const getUserRoles = async (userId: string, email: string): Promise<UserRoles> => {
  try {
    // If this is a known admin email, ensure they have the admin role
    if (adminEmails.includes(email.toLowerCase())) {
      console.log(`User ${email} is a known admin`);
      
      // Check if title is defined for this admin
      const title = adminTitles[email.toLowerCase()];
      
      return { 
        isAdmin: true, 
        isTeacher: false,
        ...(title ? { title } : {})
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
    if (email.includes('teacher')) {
      console.log(`No roles found for ${userId}, but email suggests teacher role`);
      return { isAdmin: false, isTeacher: true };
    }
    
    // Default to regular user roles
    console.log(`No roles found for ${userId}, using default regular user role`);
    return { isAdmin: false, isTeacher: false };
  } catch (error) {
    console.error(`Error getting roles for user ${userId}:`, error);
    return { isAdmin: false, isTeacher: false };
  }
};

// Update roles for a given user ID
export const updateUserRoles = async (userId: string, roles: UserRoles): Promise<void> => {
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
  const [userRoles, setUserRoles] = useState<UserRoles>({ isAdmin: false, isTeacher: false });
  const [loading, setLoading] = useState<boolean>(true);

  // Signup function
  async function signup(email: string, password: string) {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Set initial roles based on email
      let roles: UserRoles = { isAdmin: false, isTeacher: false };
      
      // If this is a known admin email
      if (adminEmails.includes(email.toLowerCase())) {
        roles = { 
          isAdmin: true, 
          isTeacher: false,
          title: adminTitles[email.toLowerCase()]
        };
      } 
      // If email contains 'teacher', assign teacher role
      else if (email.includes('teacher')) {
        roles = { isAdmin: false, isTeacher: true };
      }
      
      // Save roles to database
      const user = result.user;
      await updateUserRoles(user.uid, roles);
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  }

  // Login function
  async function login(email: string, password: string) {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      
      // Roles will be updated by the onAuthStateChanged listener
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // Logout function
  async function logout() {
    try {
      await signOut(auth);
      setUserRoles({ isAdmin: false, isTeacher: false }); // Reset roles on logout
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  // Auth state change listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('Auth state changed:', user?.email);
      setCurrentUser(user);
      
      if (user) {
        try {
          // Get and set user roles
          const roles = await getUserRoles(user.uid, user.email || '');
          console.log('Setting user roles:', roles);
          setUserRoles(roles);
          
          // For known admin emails, ensure their roles are correct in the database
          if (adminEmails.includes(user.email?.toLowerCase() || '')) {
            const adminRole: UserRoles = { 
              isAdmin: true, 
              isTeacher: false,
              title: adminTitles[user.email?.toLowerCase() || '']
            };
            await updateUserRoles(user.uid, adminRole);
          }
          
          // Listen for real-time role updates
          const userRolesRef = ref(database, `users/${user.uid}/roles`);
          const unsubscribeRoles = onValue(userRolesRef, (snapshot) => {
            if (snapshot.exists()) {
              const updatedRoles = snapshot.val();
              console.log('Role update from database:', updatedRoles);
              setUserRoles(updatedRoles);
            }
          });
          
          return () => unsubscribeRoles();
        } catch (error) {
          console.error('Error setting user roles:', error);
        }
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userRoles,
    signup,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
} 