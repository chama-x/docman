import { ref, get, set } from 'firebase/database';
import { database } from '../firebase';
import { initializeTestUsers } from './userService';
import { initializeDefaultDocumentTypes } from './documentService';

// Check if the database has been initialized
export const isDatabaseInitialized = async (): Promise<boolean> => {
  try {
    // Check for document types and at least one user
    const docTypesRef = ref(database, 'documentTypes');
    const docTypesSnapshot = await get(docTypesRef);
    
    const usersRef = ref(database, 'users');
    const usersSnapshot = await get(usersRef);
    
    return docTypesSnapshot.exists() && usersSnapshot.exists() && 
           Object.keys(usersSnapshot.val() || {}).length > 0;
  } catch (error) {
    console.error('Error checking database initialization:', error);
    return false;
  }
};

// Initialize the database with basic data
export const initializeDatabase = async (): Promise<void> => {
  try {
    console.log('Checking if database needs initialization...');
    
    const isInitialized = await isDatabaseInitialized();
    
    if (isInitialized) {
      console.log('Database is already initialized.');
      return;
    }
    
    console.log('Database not initialized. Starting initialization...');
    
    // Set up document types
    await initializeDefaultDocumentTypes();
    
    // Create test users
    await initializeTestUsers();
    
    console.log('Database initialization complete.');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

// Create a status record to track application state
export const updateAppStatus = async (status: string): Promise<void> => {
  try {
    const statusRef = ref(database, 'appStatus');
    await set(statusRef, {
      status,
      lastUpdated: Date.now()
    });
  } catch (error) {
    console.error('Error updating app status:', error);
  }
}; 