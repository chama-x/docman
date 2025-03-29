import { useState, useEffect } from 'react';
import { ref, onValue, remove, DatabaseReference } from 'firebase/database';
import { database } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { Document, DocumentCategories } from '../types/documentTypes';

interface DocumentListProps {
  documentTypes: DocumentCategories;
}

export default function DocumentList({ documentTypes }: DocumentListProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [error, setError] = useState<string>('');
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) return;

    const documentsRef: DatabaseReference = ref(database, `users/${currentUser.uid}/documents`);
    
    const unsubscribe = onValue(documentsRef, (snapshot) => {
      const data = snapshot.val();
      const documentsList: Document[] = [];
      
      if (data) {
        Object.entries(data).forEach(([id, value]) => {
          // Type assertion to ensure value is of the expected structure
          const docData = value as Omit<Document, 'id'>;
          documentsList.push({
            id,
            type: docData.type,
            url: docData.url,
            status: docData.status,
            uploadedAt: docData.uploadedAt,
            fileName: docData.fileName
          });
        });
      }
      
      // Sort by upload date, newest first
      documentsList.sort((a, b) => b.uploadedAt - a.uploadedAt);
      
      setDocuments(documentsList);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Get document type name from key
  const getDocumentTypeName = (typeKey: string): string => {
    if (documentTypes.common[typeKey]) {
      return documentTypes.common[typeKey];
    }
    if (documentTypes.teacher[typeKey]) {
      return documentTypes.teacher[typeKey];
    }
    return typeKey; // Fallback to the key if name not found
  };

  async function handleDelete(id: string) {
    if (!currentUser) return;
    
    try {
      const documentRef = ref(database, `users/${currentUser.uid}/documents/${id}`);
      await remove(documentRef);
    } catch (error) {
      setError('Failed to delete document');
      console.error(error);
    }
  }

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Your Documents</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {documents.length === 0 ? (
        <p className="text-gray-500">No documents yet. Upload one using the form above!</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b text-left">Document Type</th>
                <th className="py-2 px-4 border-b text-left">Filename</th>
                <th className="py-2 px-4 border-b text-left">Date Uploaded</th>
                <th className="py-2 px-4 border-b text-left">Status</th>
                <th className="py-2 px-4 border-b text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b">{getDocumentTypeName(doc.type)}</td>
                  <td className="py-2 px-4 border-b">{doc.fileName}</td>
                  <td className="py-2 px-4 border-b">{formatDate(doc.uploadedAt)}</td>
                  <td className="py-2 px-4 border-b">
                    <span 
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        doc.status === 'approved' 
                          ? 'bg-green-100 text-green-800'
                          : doc.status === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                    </span>
                  </td>
                  <td className="py-2 px-4 border-b">
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="text-red-500 hover:text-red-700 mr-2"
                    >
                      Delete
                    </button>
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-700"
                    >
                      View
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
} 