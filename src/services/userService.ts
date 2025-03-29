import { createUserWithEmailAndPassword, signInWithEmailAndPassword, getAuth } from 'firebase/auth';
import { ref, set, get, update, remove } from 'firebase/database';
import { auth, database } from '../firebase';
import { User } from '../types/documentTypes';

interface UserRoles {
  isAdmin: boolean;
  isTeacher: boolean;
  title?: string;
}

// Sample user data with roles
const sampleUsers = [
  {
    email: 'principal@school.edu',
    password: 'password123',
    roles: { 
      isAdmin: true, 
      isTeacher: false,
      title: 'Principal Dashboard'
    }
  },
  {
    email: 'docmanager@school.edu',
    password: 'password123',
    roles: { 
      isAdmin: true, 
      isTeacher: false,
      title: 'Document Manager Dashboard'
    }
  },
  {
    email: 'teacher1@school.edu',
    password: 'password123',
    roles: { isAdmin: false, isTeacher: true }
  },
  {
    email: 'teacher2@school.edu',
    password: 'password123',
    roles: { isAdmin: false, isTeacher: true }
  },
  {
    email: 'teacher3@school.edu',
    password: 'password123',
    roles: { isAdmin: false, isTeacher: true }
  }
];

// Get all users from the database
export const getAllUsers = async (): Promise<User[]> => {
  try {
    const usersRef = ref(database, 'users');
    const snapshot = await get(usersRef);
    
    if (!snapshot.exists()) {
      return [];
    }
    
    const usersData = snapshot.val();
    
    return Object.entries(usersData).map(([uid, userData]: [string, any]) => ({
      uid,
      email: userData.email || 'Unknown',
      isAdmin: userData.roles?.isAdmin || false,
      isTeacher: userData.roles?.isTeacher || false,
      createdAt: userData.createdAt || null
    }));
  } catch (error) {
    console.error('Error getting all users:', error);
    throw error;
  }
};

// Create a test user with the given roles
export const createTestUser = async (
  email: string, 
  password: string, 
  roles: UserRoles,
): Promise<string | null> => {
  try {
    console.log(`Creating/updating test user: ${email}`);
    
    let uid: string;
    
    // Check if the user already exists in Firebase Auth
    try {
      // Try to sign in with the credentials
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      uid = userCredential.user.uid;
      console.log(`User ${email} already exists with UID: ${uid}`);
    } catch (error) {
      // If the user doesn't exist, create them
      console.log(`User ${email} doesn't exist, creating new account`);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      uid = userCredential.user.uid;
    }
    
    // Update the user record in the database
    const userRef = ref(database, `users/${uid}`);
    
    // Get existing user data if it exists
    const snapshot = await get(userRef);
    const existingData = snapshot.exists() ? snapshot.val() : {};
    
    // Merge with new data
    await set(userRef, {
      ...existingData,
      email,
      roles,
      createdAt: existingData.createdAt || Date.now()
    });
    
    console.log(`User ${email} created/updated with roles:`, roles);
    
    return uid;
  } catch (error) {
    console.error(`Error creating/updating test user ${email}:`, error);
    return null;
  }
};

// Fix user roles to ensure users have correct roles
export const fixUserRoles = async (): Promise<void> => {
  console.log('Fixing user roles...');
  
  // Create a map of emails to their expected roles
  const emailRolesMap = sampleUsers.reduce((map, user) => {
    map[user.email] = user.roles;
    return map;
  }, {} as Record<string, UserRoles>);
  
  try {
    // Get all users from the database
    const usersRef = ref(database, 'users');
    const snapshot = await get(usersRef);
    
    if (!snapshot.exists()) {
      console.log('No users found in the database');
      return;
    }
    
    const usersData = snapshot.val();
    
    // Check each user and fix their roles if needed
    for (const [uid, userData] of Object.entries<any>(usersData)) {
      const email = userData.email;
      
      if (!email) {
        console.log(`User ${uid} has no email, skipping`);
        continue;
      }
      
      // If this is a known sample user, ensure they have the correct roles
      if (emailRolesMap[email]) {
        const expectedRoles = emailRolesMap[email];
        const currentRoles = userData.roles || { isAdmin: false, isTeacher: false };
        
        // Check if roles need to be updated
        if (
          currentRoles.isAdmin !== expectedRoles.isAdmin || 
          currentRoles.isTeacher !== expectedRoles.isTeacher ||
          (expectedRoles.title && currentRoles.title !== expectedRoles.title)
        ) {
          console.log(`Fixing roles for ${email} (${uid})`);
          console.log('  Current:', currentRoles);
          console.log('  Expected:', expectedRoles);
          
          // Update roles
          const userRolesRef = ref(database, `users/${uid}/roles`);
          await set(userRolesRef, expectedRoles);
        } else {
          console.log(`Roles for ${email} (${uid}) are already correct`);
        }
      } else {
        console.log(`User ${email} (${uid}) is not a sample user, skipping role check`);
      }
    }
    
    console.log('User roles fixed successfully');
  } catch (error) {
    console.error('Error fixing user roles:', error);
    throw error;
  }
};

// Initialize all sample users
export const initializeTestUsers = async (): Promise<void> => {
  console.log('Starting test user initialization...');
  
  try {
    // First make sure we have the document types
    const docTypesRef = ref(database, 'documentTypes');
    const docTypesSnapshot = await get(docTypesRef);
    
    if (!docTypesSnapshot.exists()) {
      console.log('Initializing document types...');
      await set(docTypesRef, {
        common: {
          appointment_letter: "Appointment Letter",
          birth_certificate: "Birth Certificate",
          nic: "NIC",
          qualification_certificates: "Qualification Certificates"
        },
        teacher: {
          disciplinary_letter: "Disciplinary Letter",
          promotion_letter: "Promotion Letter",
          transfer_letter: "Transfer Letter"
        }
      });
    }
    
    // Then create or update users
    for (const user of sampleUsers) {
      await createTestUser(
        user.email, 
        user.password, 
        user.roles
      );
    }
    
    // Finally, fix any missing roles
    await fixUserRoles();
    
    console.log('Sample users initialization complete');
  } catch (error) {
    console.error('Error initializing test users:', error);
    throw error;
  }
}; 