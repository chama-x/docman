import { createUserWithEmailAndPassword, signInWithEmailAndPassword, getAuth } from 'firebase/auth';
import { ref, set, get, update, remove } from 'firebase/database';
import { auth, database } from '../firebase';
import { User } from '../types/documentTypes';

interface UserRoles {
  isAdmin: boolean;
  isTeacher: boolean;
  isNonAcademic?: boolean;
  title?: string;
}

// Sample user data with roles
const sampleUsers = [
  {
    email: 'principal@school.edu',
    password: 'password123',
    name: 'Principal Smith',
    roles: { 
      isAdmin: true, 
      isTeacher: false,
      isNonAcademic: false,
      title: 'Principal Dashboard'
    }
  },
  {
    email: 'docmanager@school.edu',
    password: 'password123',
    name: 'Document Manager Johnson',
    roles: { 
      isAdmin: true, 
      isTeacher: false,
      isNonAcademic: false,
      title: 'Document Manager Dashboard'
    }
  },
  {
    email: 'teacher1@school.edu',
    password: 'password123',
    name: 'Teacher Anderson',
    roles: { isAdmin: false, isTeacher: true, isNonAcademic: false }
  },
  {
    email: 'teacher2@school.edu',
    password: 'password123',
    name: 'Teacher Wilson',
    roles: { isAdmin: false, isTeacher: true, isNonAcademic: false }
  },
  {
    email: 'teacher3@school.edu',
    password: 'password123',
    name: 'Teacher Martinez',
    roles: { isAdmin: false, isTeacher: true, isNonAcademic: false }
  },
  {
    email: 'nonacademic1@school.edu',
    password: 'password123',
    name: 'Support Staff Thomas',
    roles: { isAdmin: false, isTeacher: false, isNonAcademic: true }
  },
  {
    email: 'nonacademic2@school.edu',
    password: 'password123',
    name: 'Support Staff Garcia',
    roles: { isAdmin: false, isTeacher: false, isNonAcademic: true }
  },
  {
    email: 'nonacademic3@school.edu',
    password: 'password123',
    name: 'Support Staff Lee',
    roles: { isAdmin: false, isTeacher: false, isNonAcademic: true }
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
      name: userData.name || 'Unknown',
      isAdmin: userData.roles?.isAdmin || false,
      isTeacher: userData.roles?.isTeacher || false,
      isNonAcademic: userData.roles?.isNonAcademic || false,
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
  name: string,
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
      name,
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
  
  // Create a map of emails to their expected roles and names
  const emailUserMap = sampleUsers.reduce((map, user) => {
    map[user.email] = {
      roles: user.roles,
      name: user.name
    };
    return map;
  }, {} as Record<string, { roles: UserRoles, name: string }>);
  
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
      
      // If this is a known sample user, ensure they have the correct roles and name
      if (emailUserMap[email]) {
        const expectedRoles = emailUserMap[email].roles;
        const expectedName = emailUserMap[email].name;
        const currentRoles = userData.roles || { isAdmin: false, isTeacher: false, isNonAcademic: false };
        const currentName = userData.name;
        
        let needsUpdate = false;
        const updates: any = {};
        
        // Check if roles need to be updated
        if (
          currentRoles.isAdmin !== expectedRoles.isAdmin || 
          currentRoles.isTeacher !== expectedRoles.isTeacher ||
          currentRoles.isNonAcademic !== expectedRoles.isNonAcademic ||
          (expectedRoles.title && currentRoles.title !== expectedRoles.title)
        ) {
          updates['roles'] = expectedRoles;
          needsUpdate = true;
        }
        
        // Check if name needs to be updated
        if (!currentName && expectedName) {
          updates['name'] = expectedName;
          needsUpdate = true;
        }
        
        if (needsUpdate) {
          console.log(`Updating user ${email} (${uid})`);
          if (updates['roles']) console.log('  Roles updated');
          if (updates['name']) console.log('  Name added: ' + expectedName);
          
          // Update the user
          const userRef = ref(database, `users/${uid}`);
          await update(userRef, updates);
        } else {
          console.log(`User ${email} (${uid}) is already correctly configured`);
        }
      } else {
        // For non-sample users, add default name if missing
        if (!userData.name) {
          console.log(`Adding default name for user ${email} (${uid})`);
          const userRef = ref(database, `users/${uid}`);
          await update(userRef, {
            name: email.split('@')[0].replace(/[0-9]/g, '') + ' User'
          });
        }
      }
    }
    
    console.log('User data fixed successfully');
  } catch (error) {
    console.error('Error fixing user data:', error);
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
        },
        nonAcademic: {
          work_contract: "Work Contract",
          leave_form: "Leave Application",
          performance_review: "Performance Review"
        }
      });
    }
    
    // Then create or update users
    for (const user of sampleUsers) {
      await createTestUser(
        user.email, 
        user.password,
        user.name,
        user.roles
      );
    }
    
    // Finally, fix any missing roles or names
    await fixUserRoles();
    
    console.log('Sample users initialization complete');
  } catch (error) {
    console.error('Error initializing test users:', error);
    throw error;
  }
};

// One-time script to add names to existing users without names
export const addNamesToExistingUsers = async (): Promise<void> => {
  console.log('Starting to add names to existing users without names...');
  
  try {
    // Get all users from the database
    const usersRef = ref(database, 'users');
    const snapshot = await get(usersRef);
    
    if (!snapshot.exists()) {
      console.log('No users found in the database');
      return;
    }
    
    const usersData = snapshot.val();
    let updatedCount = 0;
    
    // Check each user and add name if missing
    for (const [uid, userData] of Object.entries<any>(usersData)) {
      const email = userData.email;
      
      if (!email) {
        console.log(`User ${uid} has no email, skipping`);
        continue;
      }
      
      // Skip users who already have names
      if (userData.name) {
        continue;
      }
      
      // Generate a name based on email or use sample user name if available
      let name = '';
      
      // Check if this is a sample user
      const sampleUser = sampleUsers.find(user => user.email === email);
      if (sampleUser) {
        name = sampleUser.name;
      } else {
        // Generate name from email
        const emailPrefix = email.split('@')[0];
        // Capitalize and remove numbers
        name = emailPrefix.charAt(0).toUpperCase() + 
               emailPrefix.slice(1).replace(/[0-9]/g, '') + 
               ' User';
      }
      
      // Update user with new name
      const userRef = ref(database, `users/${uid}`);
      await update(userRef, { name });
      
      console.log(`Added name "${name}" to user ${email} (${uid})`);
      updatedCount++;
    }
    
    console.log(`Names added to ${updatedCount} users`);
  } catch (error) {
    console.error('Error adding names to users:', error);
    throw error;
  }
}; 