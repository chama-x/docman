import { useState, useEffect } from 'react';
import { ref, get, update } from 'firebase/database';
import { database } from '../firebase';
import { DocumentCategories } from '../types/documentTypes';
import { useAuth } from '../contexts/AuthContext';

interface PendingDocument {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  type: string;
  fileName: string;
  url: string;
  uploadedAt: number;
  status: 'pending' | 'approved' | 'rejected';
}

export default function DocumentApprovalPanel() {
  const [loading, setLoading] = useState<boolean>(true);
  const [pendingDocuments, setPendingDocuments] = useState<PendingDocument[]>([]);
  const [documentTypes, setDocumentTypes] = useState<DocumentCategories>({
    common: {},
    teacher: {}
  });
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const { currentUser } = useAuth();
  
  // Determine if user is principal or document manager
  const isDocManager = currentUser?.email?.toLowerCase() === 'docmanager@school.edu';
  const isPrincipal = currentUser?.email?.toLowerCase() === 'principal@school.edu';
  
  // Set theme color based on user role
  const themeColor = isPrincipal ? 'blue' : 'purple';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch document types
      const docTypesRef = ref(database, 'documentTypes');
      const docTypesSnapshot = await get(docTypesRef);
      
      if (docTypesSnapshot.exists()) {
        setDocumentTypes(docTypesSnapshot.val());
      }
      
      // Fetch all users and their documents
      const usersRef = ref(database, 'users');
      const usersSnapshot = await get(usersRef);
      
      if (!usersSnapshot.exists()) {
        setPendingDocuments([]);
        return;
      }
      
      const allDocuments: PendingDocument[] = [];
      const usersData = usersSnapshot.val();
      
      // Process each user's documents
      Object.entries(usersData).forEach(([userId, userData]: [string, any]) => {
        const userName = userData.email?.split('@')[0] || 'Unknown';
        const userEmail = userData.email || 'Unknown';
        
        if (userData.documents) {
          Object.entries(userData.documents).forEach(([docId, docData]: [string, any]) => {
            allDocuments.push({
              id: docId,
              userId,
              userName,
              userEmail,
              type: docData.type,
              fileName: docData.fileName,
              url: docData.url,
              uploadedAt: docData.uploadedAt,
              status: docData.status
            });
          });
        }
      });
      
      // Sort by upload date (newest first)
      allDocuments.sort((a, b) => b.uploadedAt - a.uploadedAt);
      
      // Set documents
      setPendingDocuments(allDocuments);
    } catch (error) {
      console.error('Error fetching documents:', error);
      setError('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateDocumentStatus = async (userId: string, docId: string, newStatus: 'approved' | 'rejected') => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      // Update the document status
      const docRef = ref(database, `users/${userId}/documents/${docId}`);
      await update(docRef, { status: newStatus });
      
      // Update local state
      setPendingDocuments(prev => 
        prev.map(doc => 
          doc.userId === userId && doc.id === docId
            ? { ...doc, status: newStatus }
            : doc
        )
      );
      
      setSuccess(`Document ${newStatus} successfully`);
    } catch (error) {
      console.error(`Error ${newStatus} document:`, error);
      setError(`Failed to ${newStatus} document`);
    } finally {
      setLoading(false);
    }
  };

  const getDocumentTypeName = (typeKey: string): string => {
    // First check common types
    if (documentTypes.common[typeKey]) {
      return documentTypes.common[typeKey];
    }
    
    // Then check teacher types
    if (documentTypes.teacher[typeKey]) {
      return documentTypes.teacher[typeKey];
    }
    
    // If not found, return the key
    return typeKey;
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filter documents based on the current filter
  const filteredDocuments = pendingDocuments.filter(doc => {
    if (filter === 'all') return true;
    return doc.status === filter;
  });

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Document Approvals</h2>
      
      {error && (
        <div className="bg-red-900 bg-opacity-20 border border-red-700 text-red-400 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-900 bg-opacity-20 border border-green-700 text-green-400 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}
      
      <div className="mb-4">
        <div className="flex space-x-2">
          <button
            className={`px-4 py-2 rounded-md ${
              filter === 'pending'
                ? 'bg-yellow-900 text-yellow-300 border border-yellow-700'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
            onClick={() => setFilter('pending')}
          >
            Pending
          </button>
          <button
            className={`px-4 py-2 rounded-md ${
              filter === 'approved'
                ? 'bg-green-900 text-green-300 border border-green-700'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
            onClick={() => setFilter('approved')}
          >
            Approved
          </button>
          <button
            className={`px-4 py-2 rounded-md ${
              filter === 'rejected'
                ? 'bg-red-900 text-red-300 border border-red-700'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
            onClick={() => setFilter('rejected')}
          >
            Rejected
          </button>
          <button
            className={`px-4 py-2 rounded-md ${
              filter === 'all'
                ? `bg-${themeColor}-900 text-${themeColor}-300 border border-${themeColor}-700`
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
            onClick={() => setFilter('all')}
          >
            All Documents
          </button>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-8">
          <div className={`animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-${themeColor}-500`}></div>
        </div>
      ) : filteredDocuments.length === 0 ? (
        <div className="bg-gray-800 p-6 rounded-lg text-center border border-gray-700">
          <p className="text-gray-400">
            {filter === 'pending' 
              ? 'No pending documents found'
              : filter === 'approved'
              ? 'No approved documents found'
              : filter === 'rejected'
              ? 'No rejected documents found'
              : 'No documents found'}
          </p>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-700">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-900">
                <tr>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Document Type
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Submitted By
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Filename
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredDocuments.map((doc) => (
                  <tr key={`${doc.userId}-${doc.id}`} className="hover:bg-gray-700">
                    <td className="py-3 px-4 whitespace-nowrap">
                      {getDocumentTypeName(doc.type)}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-200">{doc.userName}</div>
                      <div className="text-xs text-gray-400">{doc.userEmail}</div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="text-sm text-gray-200 truncate max-w-[200px]">
                        {doc.fileName}
                      </div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">
                        {formatDate(doc.uploadedAt)}
                      </div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        doc.status === 'pending'
                          ? 'bg-yellow-900 text-yellow-300'
                          : doc.status === 'approved'
                          ? 'bg-green-900 text-green-300'
                          : 'bg-red-900 text-red-300'
                      }`}>
                        {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-sm">
                      <div className="flex space-x-2">
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`bg-${themeColor}-900 hover:bg-${themeColor}-800 text-${themeColor}-300 px-3 py-1 rounded`}
                        >
                          View
                        </a>
                        
                        {doc.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleUpdateDocumentStatus(doc.userId, doc.id, 'approved')}
                              className="bg-green-900 hover:bg-green-800 text-green-300 px-3 py-1 rounded"
                              disabled={loading}
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleUpdateDocumentStatus(doc.userId, doc.id, 'rejected')}
                              className="bg-red-900 hover:bg-red-800 text-red-300 px-3 py-1 rounded"
                              disabled={loading}
                            >
                              Reject
                            </button>
                          </>
                        )}
                        
                        {doc.status === 'approved' && (
                          <button
                            onClick={() => handleUpdateDocumentStatus(doc.userId, doc.id, 'rejected')}
                            className="bg-red-900 hover:bg-red-800 text-red-300 px-3 py-1 rounded"
                            disabled={loading}
                          >
                            Reject
                          </button>
                        )}
                        
                        {doc.status === 'rejected' && (
                          <button
                            onClick={() => handleUpdateDocumentStatus(doc.userId, doc.id, 'approved')}
                            className="bg-green-900 hover:bg-green-800 text-green-300 px-3 py-1 rounded"
                            disabled={loading}
                          >
                            Approve
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
} 