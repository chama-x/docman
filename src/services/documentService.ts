import { ref, push, update, get, remove, set } from 'firebase/database';
import { database } from '../firebase';
import { DocumentCategories } from '../types/documentTypes';

// Add a new document type
export const addDocumentType = async (typeName: string, isTeacherType: boolean): Promise<void> => {
  const category = isTeacherType ? 'teacher' : 'common';
  const key = typeName.toLowerCase().replace(/ /g, '_');
  
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
  
  // Create an object with the key as property and typeName as value
  const updateData: Record<string, string> = {};
  updateData[key] = typeName;
  
  await update(ref(database, `documentTypes/${category}`), updateData);
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
  const newKey = newName.toLowerCase().replace(/ /g, '_');
  
  // Create an object with the key as property and newName as value
  const updateData: Record<string, string> = {};
  updateData[newKey] = newName;
  
  await update(ref(database, `documentTypes/${category}`), updateData);
  
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

  // Only initialize if the documentTypes node doesn't exist at all
  if (!snapshot.exists()) {
    console.log('Initializing default document types...');
    const defaultTypes: DocumentCategories = {
      common: {
        // Existing common types
        nic: "NIC", 
        birth_certificate: "Birth Certificate", 
        appointment_letter: "Appointment Letter", 
        qualification_certificates: "Qualification Certificates", 
        // New common types
        letter_of_acceptance: "Letter of Acceptance", 
        good_delivery_document: "Good Delivery Document", 
        log_record: "Log Record", 
        marriage_certificate: "Marriage Certificate", 
        medical_record: "Medical Record", 
        holiday_details: "Holiday Details", 
        teacher_info_form: "Teacher Information Form", 
        promotion_letter: "Promotion Letter" // Moved from teacher
      },
      teacher: {
        // Existing teacher types
        transfer_letter: "Transfer Letter", 
        disciplinary_letter: "Letters on Disciplinary Issues", // Updated value
        // New teacher types
        letter_of_attachment: "Letter of Attachment" 
      }
    };
    
    await set(docTypesRef, defaultTypes);
    console.log('Default document types initialized.');
  } else {
    console.log('Document types already exist, skipping default initialization.');
  }
}; 