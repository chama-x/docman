import { useState, useEffect } from 'react';
import DashboardLayout from '../layout/DashboardLayout';
import DocumentUploader from '../DocumentUploader';
import DocumentList from '../DocumentList';
import { DocumentCategories, Document } from '../../types/documentTypes';
import { getDocumentTypes, initializeDefaultDocumentTypes } from '../../services/documentService';
import { useAuth } from '../../contexts/AuthContext';
import { ref, onValue, DatabaseReference } from 'firebase/database';
import { database } from '../../firebase';

export default function UserDashboard() {
  const [documentTypes, setDocumentTypes] = useState<DocumentCategories>({ common: {}, teacher: {} });
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [documents, setDocuments] = useState<Document[]>([]);
  const { currentUser } = useAuth();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Initialize default document types if none exist
        await initializeDefaultDocumentTypes();
        
        // Get all document types
        const types = await getDocumentTypes();
        setDocumentTypes(types);
      } catch (error) {
        setError('Failed to load data');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);
  
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
  
  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  const getStatusBadgeClass = (status: string): string => {
    switch(status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="User Dashboard" subtitle="Loading...">
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      title="User Dashboard" 
      subtitle="Manage your documents"
    >
      <div className="w-full">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">{error}</div>
        )}
        
        {/* Summary Card */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium text-gray-900">Documents Summary</h2>
              <p className="text-sm text-gray-500">You have {documents.length} document(s) in your account</p>
            </div>
            <div className="text-3xl font-bold text-gray-700">{documents.length}</div>
          </div>
          
          {documents.length > 0 && (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                <div className="text-sm font-medium text-gray-500">Pending</div>
                <div className="text-xl font-semibold text-yellow-500">
                  {documents.filter(doc => doc.status === 'pending').length}
                </div>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                <div className="text-sm font-medium text-gray-500">Approved</div>
                <div className="text-xl font-semibold text-green-500">
                  {documents.filter(doc => doc.status === 'approved').length}
                </div>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                <div className="text-sm font-medium text-gray-500">Rejected</div>
                <div className="text-xl font-semibold text-red-500">
                  {documents.filter(doc => doc.status === 'rejected').length}
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Tab Navigation */}
        <div className="bg-white shadow-md rounded-lg mb-6 overflow-hidden">
          <div className="flex border-b">
            <button 
              className={`px-6 py-3 font-medium ${activeTab === 'overview' ? 'bg-gray-50 text-gray-800 border-b-2 border-gray-600' : 'text-gray-600 hover:bg-gray-50'}`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button 
              className={`px-6 py-3 font-medium ${activeTab === 'upload' ? 'bg-gray-50 text-gray-800 border-b-2 border-gray-600' : 'text-gray-600 hover:bg-gray-50'}`}
              onClick={() => setActiveTab('upload')}
            >
              Upload Documents
            </button>
            <button 
              className={`px-6 py-3 font-medium ${activeTab === 'view' ? 'bg-gray-50 text-gray-800 border-b-2 border-gray-600' : 'text-gray-600 hover:bg-gray-50'}`}
              onClick={() => setActiveTab('view')}
            >
              View Documents
            </button>
          </div>
          
          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'overview' && (
              <div>
                <h2 className="text-xl font-bold mb-4">Welcome to Your Dashboard</h2>
                <p className="text-gray-600 mb-4">
                  Here you can upload and manage your documents. Use the tabs above to navigate between different sections.
                </p>
                
                {documents.length === 0 ? (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mt-6">
                    <p className="text-blue-700 mb-3">You haven't uploaded any documents yet.</p>
                    <button 
                      onClick={() => setActiveTab('upload')}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
                    >
                      Upload Your First Document
                    </button>
                  </div>
                ) : (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-3">Recent Documents</h3>
                    <div className="bg-white border rounded-lg overflow-hidden">
                      <table className="min-w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Document</th>
                            <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {documents.slice(0, 3).map((doc) => (
                            <tr key={doc.id} className="hover:bg-gray-50">
                              <td className="py-3 px-4">{getDocumentTypeName(doc.type)}</td>
                              <td className="py-3 px-4">{formatDate(doc.uploadedAt)}</td>
                              <td className="py-3 px-4">
                                <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusBadgeClass(doc.status)}`}>
                                  {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <a
                                  href={doc.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800"
                                >
                                  View
                                </a>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    
                    {documents.length > 3 && (
                      <div className="mt-3 text-right">
                        <button 
                          onClick={() => setActiveTab('view')}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          View All Documents →
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'upload' && (
              <div>
                <h2 className="text-xl font-bold mb-4">Upload Documents</h2>
                <p className="text-gray-600 mb-4">
                  Please select a document type and upload your file. Make sure all information is accurate before uploading.
                </p>
                <DocumentUploader
                  documentTypes={documentTypes}
                  onUploadSuccess={() => {}}
                />
              </div>
            )}
            
            {activeTab === 'view' && (
              <div>
                <h2 className="text-xl font-bold mb-4">Your Documents</h2>
                
                {documents.length === 0 ? (
                  <p className="text-gray-500">No documents found. Upload one using the Upload Documents tab.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="py-2 px-4 border-b text-left font-medium">Document Type</th>
                          <th className="py-2 px-4 border-b text-left font-medium">Filename</th>
                          <th className="py-2 px-4 border-b text-left font-medium">Date Uploaded</th>
                          <th className="py-2 px-4 border-b text-left font-medium">Status</th>
                          <th className="py-2 px-4 border-b text-left font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {documents.map((doc) => (
                          <tr key={doc.id} className="hover:bg-gray-50">
                            <td className="py-3 px-4 border-b">{getDocumentTypeName(doc.type)}</td>
                            <td className="py-3 px-4 border-b">{doc.fileName}</td>
                            <td className="py-3 px-4 border-b">{formatDate(doc.uploadedAt)}</td>
                            <td className="py-3 px-4 border-b">
                              <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusBadgeClass(doc.status)}`}>
                                {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                              </span>
                            </td>
                            <td className="py-3 px-4 border-b">
                              <a
                                href={doc.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded text-sm"
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
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 