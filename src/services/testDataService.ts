import { ref, push, get, set, remove } from 'firebase/database';
import { database } from '../firebase';
import { DocumentCategories } from '../types/documentTypes';
import { getAllUsers } from './userService';
import { getDocumentTypes, initializeDefaultDocumentTypes } from './documentService';

interface SampleDocument {
  type: string;
  fileName: string;
  status: 'pending' | 'approved' | 'rejected';
}

// Generate a random sample document for a given user and document type
const generateSampleDocument = (type: string): SampleDocument => {
  const statuses: ('pending' | 'approved' | 'rejected')[] = ['pending', 'approved', 'rejected'];
  const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
  
  return {
    type,
    fileName: `${type}_document_${Math.floor(Math.random() * 1000)}.pdf`,
    status: randomStatus
  };
};

// Add sample documents for testing
export const createSampleDocumentsForUser = async (
  userId: string,
  documentTypes: DocumentCategories,
  forceCreate: boolean = false
): Promise<void> => {
  try {
    // Get existing documents for this user
    const userDocsRef = ref(database, `users/${userId}/documents`);
    const snapshot = await get(userDocsRef);
    
    // Skip if user already has documents and not forcing creation
    if (!forceCreate && snapshot.exists() && Object.keys(snapshot.val()).length > 0) {
      console.log(`User ${userId} already has documents, skipping.`);
      return;
    }
    
    // Clear existing documents if forcing creation
    if (forceCreate && snapshot.exists()) {
      await remove(userDocsRef);
      console.log(`Removed existing documents for user ${userId}`);
    }
    
    // Common document types - every user gets these
    const commonTypes = Object.keys(documentTypes.common);
    
    // Get user roles
    const userRolesRef = ref(database, `users/${userId}/roles`);
    const userRolesSnapshot = await get(userRolesRef);
    const userRoles = userRolesSnapshot.val() || { isTeacher: false };
    
    // Determine which types to use based on user role
    const typesToUse = [...commonTypes];
    
    // Add teacher-specific types if the user is a teacher
    if (userRoles.isTeacher) {
      typesToUse.push(...Object.keys(documentTypes.teacher));
    }
    
    // Create 2-5 sample documents for each user
    const numDocs = Math.floor(Math.random() * 4) + 2;
    
    for (let i = 0; i < numDocs; i++) {
      // Pick a random document type from the available types
      const randomTypeIndex = Math.floor(Math.random() * typesToUse.length);
      const documentType = typesToUse[randomTypeIndex];
      
      // Generate a sample document
      const sampleDoc = generateSampleDocument(documentType);
      
      // Create a mock URL
      const mockUrl = `https://storage.example.com/${userId}/${Date.now()}_${sampleDoc.fileName}`;
      
      // Save to Firebase
      await push(userDocsRef, {
        type: sampleDoc.type,
        url: mockUrl,
        status: sampleDoc.status,
        fileName: sampleDoc.fileName,
        uploadedAt: Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000) // Random date in last 30 days
      });
    }
    
    console.log(`Created ${numDocs} sample documents for user ${userId}`);
  } catch (error) {
    console.error(`Error creating sample documents for user ${userId}:`, error);
    throw error; // Re-throw to allow proper error handling upstream
  }
};

// Create sample documents for all users
export const createSampleDocuments = async (forceCreate: boolean = false): Promise<void> => {
  try {
    console.log(`Starting sample document creation (force: ${forceCreate})...`);
    
    // Ensure document types exist first
    await initializeDefaultDocumentTypes();
    
    // Get all users
    const users = await getAllUsers();
    
    if (users.length === 0) {
      console.warn('No users found to create sample documents for');
      return;
    }
    
    // Get document types
    const documentTypes = await getDocumentTypes();
    
    // Create sample documents for each user
    for (const user of users) {
      await createSampleDocumentsForUser(user.uid, documentTypes, forceCreate);
    }
    
    console.log('Sample documents creation complete');
  } catch (error) {
    console.error('Error creating sample documents:', error);
    throw error; // Re-throw to allow proper error handling upstream
  }
};

// Delete all documents for all users
export const deleteAllDocuments = async (): Promise<void> => {
  try {
    console.log('Deleting all user documents...');
    
    // Get all users
    const users = await getAllUsers();
    
    // Delete documents for each user
    for (const user of users) {
      const userDocsRef = ref(database, `users/${user.uid}/documents`);
      await remove(userDocsRef);
      console.log(`Deleted documents for user ${user.uid}`);
    }
    
    console.log('All user documents deleted successfully');
  } catch (error) {
    console.error('Error deleting all documents:', error);
    throw error;
  }
}; 