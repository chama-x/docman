import { useState, useEffect } from 'react';
import DashboardLayout from '../layout/DashboardLayout';
import DocumentUploader from '../DocumentUploader';
import DocumentList from '../DocumentList';
import { DocumentCategories, Document } from '../../types/documentTypes';
import { getDocumentTypes, initializeDefaultDocumentTypes } from '../../services/documentService';
import { useAuth } from '../../contexts/AuthContext';
import { ref, get, onValue, DatabaseReference } from 'firebase/database';
import { database } from '../../firebase';

interface Stats {
  totalDocuments: number;
  pendingDocuments: number;
  approvedDocuments: number;
  rejectedDocuments: number;
}

export default function TeacherDashboard() {
  const [documentTypes, setDocumentTypes] = useState<DocumentCategories>({ common: {}, teacher: {} });
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalDocuments: 0,
    pendingDocuments: 0,
    approvedDocuments: 0,
    rejectedDocuments: 0
  });
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
      
      // Update stats
      const pendingDocs = documentsList.filter(doc => doc.status === 'pending').length;
      const approvedDocs = documentsList.filter(doc => doc.status === 'approved').length;
      const rejectedDocs = documentsList.filter(doc => doc.status === 'rejected').length;
      
      setStats({
        totalDocuments: documentsList.length,
        pendingDocuments: pendingDocs,
        approvedDocuments: approvedDocs,
        rejectedDocuments: rejectedDocs
      });
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
      <DashboardLayout title="Teacher Dashboard" subtitle="Loading...">
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      title="Teacher Dashboard" 
      subtitle="Manage your documents and submissions"
    >
      <div className="w-full">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">{error}</div>
        )}
        
        {/* Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="text-sm font-medium text-gray-500">Total Documents</div>
            <div className="mt-1 text-3xl font-semibold text-gray-900">{stats.totalDocuments}</div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow" onClick={() => setActiveTab('pending')}>
            <div className="text-sm font-medium text-gray-500">Pending</div>
            <div className="mt-1 text-3xl font-semibold text-orange-500">{stats.pendingDocuments}</div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow" onClick={() => setActiveTab('approved')}>
            <div className="text-sm font-medium text-gray-500">Approved</div>
            <div className="mt-1 text-3xl font-semibold text-green-500">{stats.approvedDocuments}</div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow" onClick={() => setActiveTab('rejected')}>
            <div className="text-sm font-medium text-gray-500">Rejected</div>
            <div className="mt-1 text-3xl font-semibold text-red-500">{stats.rejectedDocuments}</div>
          </div>
        </div>
        
        {/* Tab Navigation */}
        <div className="bg-white shadow-md rounded-lg mb-6 overflow-hidden">
          <div className="flex border-b overflow-x-auto">
            <button 
              className={`px-6 py-3 font-medium ${activeTab === 'overview' ? 'bg-green-50 text-green-600 border-b-2 border-green-600' : 'text-gray-600 hover:bg-gray-50'}`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button 
              className={`px-6 py-3 font-medium ${activeTab === 'upload' ? 'bg-green-50 text-green-600 border-b-2 border-green-600' : 'text-gray-600 hover:bg-gray-50'}`}
              onClick={() => setActiveTab('upload')}
            >
              Upload Documents
            </button>
            <button 
              className={`px-6 py-3 font-medium ${activeTab === 'all' ? 'bg-green-50 text-green-600 border-b-2 border-green-600' : 'text-gray-600 hover:bg-gray-50'}`}
              onClick={() => setActiveTab('all')}
            >
              All Documents
            </button>
            <button 
              className={`px-6 py-3 font-medium ${activeTab === 'pending' ? 'bg-green-50 text-green-600 border-b-2 border-green-600' : 'text-gray-600 hover:bg-gray-50'}`}
              onClick={() => setActiveTab('pending')}
            >
              Pending
              {stats.pendingDocuments > 0 && (
                <span className="ml-2 bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full text-xs">
                  {stats.pendingDocuments}
                </span>
              )}
            </button>
            <button 
              className={`px-6 py-3 font-medium ${activeTab === 'approved' ? 'bg-green-50 text-green-600 border-b-2 border-green-600' : 'text-gray-600 hover:bg-gray-50'}`}
              onClick={() => setActiveTab('approved')}
            >
              Approved
            </button>
            <button 
              className={`px-6 py-3 font-medium ${activeTab === 'rejected' ? 'bg-green-50 text-green-600 border-b-2 border-green-600' : 'text-gray-600 hover:bg-gray-50'}`}
              onClick={() => setActiveTab('rejected')}
            >
              Rejected
            </button>
          </div>
          
          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'overview' && (
              <div>
                <h2 className="text-xl font-bold mb-4">Teacher Document Management</h2>
                <p className="text-gray-600 mb-6">
                  Welcome to your Teacher Dashboard. Here you can upload, manage, and track the status of all your professional documents.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                    <h3 className="text-lg font-semibold text-green-800 mb-2">Upload Documents</h3>
                    <p className="text-green-600 mb-4">Submit your professional documents for verification</p>
                    <button 
                      onClick={() => setActiveTab('upload')}
                      className="bg-green-600 hover:bg-green-700 text-white rounded px-4 py-2 text-sm"
                    >
                      Upload New Document
                    </button>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <h3 className="text-lg font-semibold text-blue-800 mb-2">Track Submissions</h3>
                    <p className="text-blue-600 mb-4">Monitor the status of your submitted documents</p>
                    <button 
                      onClick={() => setActiveTab('all')}
                      className="bg-blue-600 hover:bg-blue-700 text-white rounded px-4 py-2 text-sm"
                    >
                      View All Documents
                    </button>
                  </div>
                </div>
                
                {/* Recent Activity */}
                {documents.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold mb-3">Recent Activity</h3>
                    <div className="bg-white border rounded-lg overflow-hidden">
                      <table className="min-w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Document</th>
                            <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
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
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'upload' && (
              <div>
                <h2 className="text-xl font-bold mb-4">Upload Professional Documents</h2>
                <p className="text-gray-600 mb-4">
                  Submit your documents for approval. Make sure all information is accurate before uploading.
                </p>
                <DocumentUploader
                  documentTypes={documentTypes}
                  onUploadSuccess={() => {}}
                />
              </div>
            )}
            
            {(activeTab === 'all' || activeTab === 'pending' || activeTab === 'approved' || activeTab === 'rejected') && (
              <div>
                <h2 className="text-xl font-bold mb-4">
                  {activeTab === 'all' && 'All Documents'}
                  {activeTab === 'pending' && 'Pending Documents'}
                  {activeTab === 'approved' && 'Approved Documents'}
                  {activeTab === 'rejected' && 'Rejected Documents'}
                </h2>
                
                {documents.length === 0 ? (
                  <p className="text-gray-500">No documents found.</p>
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
                        {documents
                          .filter(doc => {
                            if (activeTab === 'all') return true;
                            return doc.status === activeTab;
                          })
                          .map((doc) => (
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
                                  className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded text-sm mr-2"
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