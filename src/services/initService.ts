import { ref, get, set } from 'firebase/database';
import { database, auth } from '../firebase';
import { initializeTestUsers } from './userService';
import { initializeDefaultDocumentTypes } from './documentService';

// Function to get the current app status
export const getAppStatus = async (): Promise<string | null> => {
  try {
    // Check if user is authenticated first
    if (!auth.currentUser) {
      console.log('User not authenticated, cannot get app status');
      return null;
    }
    
    const statusRef = ref(database, 'appStatus/status');
    const snapshot = await get(statusRef);
    return snapshot.exists() ? snapshot.val() : null;
  } catch (error) {
    console.error('Error getting app status:', error);
    // Don't throw, just return null to handle gracefully
    return null;
  }
};

// Check if the database has been initialized
export const isDatabaseInitialized = async (): Promise<boolean> => {
  try {
    // Check if user is authenticated first
    if (!auth.currentUser) {
      console.log('User not authenticated, cannot check database initialization');
      return false;
    }
    
    // Check for document types and at least one user
    const docTypesRef = ref(database, 'documentTypes');
    const docTypesSnapshot = await get(docTypesRef);
    
    const usersRef = ref(database, 'users');
    const usersSnapshot = await get(usersRef);
    
    return docTypesSnapshot.exists() && usersSnapshot.exists() && 
           Object.keys(usersSnapshot.val() || {}).length > 0;
  } catch (error) {
    console.error('Error checking database initialization:', error);
    // Don't throw, just return false to handle gracefully
    return false;
  }
};

// Initialize the database with basic data
export const initializeDatabase = async (): Promise<void> => {
  try {
    // Check if user is authenticated first
    if (!auth.currentUser) {
      console.log('User not authenticated, cannot initialize database');
      return;
    }
    
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
    // Don't throw, just return to handle gracefully
  }
};

// Create a status record to track application state
export const updateAppStatus = async (status: string): Promise<void> => {
  try {
    // Check if user is authenticated first
    if (!auth.currentUser) {
      console.log('User not authenticated, cannot update app status');
      return;
    }
    
    const statusRef = ref(database, 'appStatus');
    await set(statusRef, {
      status,
      lastUpdated: Date.now()
    });
  } catch (error) {
    console.error('Error updating app status:', error);
    // Don't throw, just return to handle gracefully
  }
}; 