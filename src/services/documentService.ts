import { ref, push, update, get, remove, set } from 'firebase/database';
import { database } from '../firebase';
import { DocumentCategories } from '../types/documentTypes';

// Add a new document type
export const addDocumentType = async (typeName: string, isTeacherType: boolean): Promise<void> => {
  const category = isTeacherType ? 'teacher' : 'common';
  const key = typeName.toLowerCase().replaceAll(' ', '_');
  
  // Check if type already exists to prevent duplicates
  const docTypesRef = ref(database, `documentTypes/${category}`);
  const snapshot = await get(docTypesRef);
  const existingTypes = snapshot.val() || {};
  
  // Check for duplicates - both keys and values (case insensitive)
  const values = Object.values(existingTypes) as string[];
  if (values.some(val => val.toLowerCase() === typeName.toLowerCase())) {
    throw new Error('Document type with this name already exists');
  }
  
  if (existingTypes[key]) {
    throw new Error('Document type with this key already exists');
  }
  
  await update(ref(database, `documentTypes/${category}/${key}`), typeName);
};

// Edit an existing document type
export const editDocumentType = async (
  oldKey: string, 
  newName: string, 
  category: 'common' | 'teacher'
): Promise<void> => {
  // Validate the new name doesn't already exist
  const docTypesRef = ref(database, `documentTypes/${category}`);
  const snapshot = await get(docTypesRef);
  const existingTypes = snapshot.val() || {};
  
  const values = Object.values(existingTypes) as string[];
  if (values.some(val => val.toLowerCase() === newName.toLowerCase() && 
      existingTypes[oldKey].toLowerCase() !== newName.toLowerCase())) {
    throw new Error('Document type with this name already exists');
  }
  
  // Remove old entry
  await remove(ref(database, `documentTypes/${category}/${oldKey}`));
  
  // Add new entry
  const newKey = newName.toLowerCase().replaceAll(' ', '_');
  await update(ref(database, `documentTypes/${category}/${newKey}`), newName);
  
  // Update any documents with the old type to use the new type
  const usersRef = ref(database, 'users');
  const usersSnapshot = await get(usersRef);
  const users = usersSnapshot.val();
  
  if (users) {
    for (const userId in users) {
      const userDocsRef = ref(database, `users/${userId}/documents`);
      const userDocsSnapshot = await get(userDocsRef);
      const userDocs = userDocsSnapshot.val();
      
      if (userDocs) {
        for (const docId in userDocs) {
          const doc = userDocs[docId];
          
          if (doc.type === oldKey) {
            await update(ref(database, `users/${userId}/documents/${docId}`), {
              ...doc,
              type: newKey
            });
          }
        }
      }
    }
  }
};

// Delete a document type
export const deleteDocumentType = async (
  category: 'common' | 'teacher',
  key: string
): Promise<void> => {
  await remove(ref(database, `documentTypes/${category}/${key}`));
  
  // Optionally, you could also update any documents with this type to a "deleted" or "unknown" type
};

// Get all document types
export const getDocumentTypes = async (): Promise<DocumentCategories> => {
  const docTypesRef = ref(database, 'documentTypes');
  const snapshot = await get(docTypesRef);
  
  const types = snapshot.val() || { common: {}, teacher: {} };
  
  // Ensure both categories exist
  if (!types.common) types.common = {};
  if (!types.teacher) types.teacher = {};
  
  return types;
};

// Initialize default document types if none exist
export const initializeDefaultDocumentTypes = async (): Promise<void> => {
  const docTypesRef = ref(database, 'documentTypes');
  const snapshot = await get(docTypesRef);
  
  if (!snapshot.exists()) {
    const defaultTypes: DocumentCategories = {
      common: {
        nic: "NIC",
        birth_certificate: "Birth Certificate",
        appointment_letter: "Appointment Letter",
        qualification_certificates: "Qualification Certificates"
      },
      teacher: {
        transfer_letter: "Transfer Letter",
        promotion_letter: "Promotion Letter",
        disciplinary_letter: "Disciplinary Letter"
      }
    };
    
    await set(docTypesRef, defaultTypes);
  }
}; 