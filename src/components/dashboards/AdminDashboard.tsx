import { useState, useEffect } from 'react';
import DashboardLayout from '../layout/DashboardLayout';
import AdminPanel from '../AdminPanel';
import DocumentCategoryManager from '../DocumentCategoryManager';
import DocumentUploader from '../DocumentUploader';
import DocumentList from '../DocumentList';
import { DocumentCategories } from '../../types/documentTypes';
import { getDocumentTypes, initializeDefaultDocumentTypes } from '../../services/documentService';
import { getAllUsers } from '../../services/userService';
import { ref, get, update } from 'firebase/database';
import { database } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';
import DocumentCategoriesPanel from '../DocumentCategoriesPanel';
import AnalyticsPanel from '../AnalyticsPanel';
import DocumentApprovalPanel from '../DocumentApprovalPanel';

interface Stats {
  totalUsers: number;
  totalTeachers: number;
  totalDocuments: number;
  pendingDocuments: number;
}

export default function AdminDashboard() {
  const [documentTypes, setDocumentTypes] = useState<DocumentCategories>({ common: {}, teacher: {} });
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'categories' | 'approvals' | 'users'>('overview');
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalTeachers: 0,
    totalDocuments: 0,
    pendingDocuments: 0
  });
  const [pendingDocuments, setPendingDocuments] = useState<any[]>([]);
  const { userRoles, currentUser } = useAuth();
  
  const isDocManager = currentUser?.email?.toLowerCase() === 'docmanager@school.edu';
  const isPrincipal = currentUser?.email?.toLowerCase() === 'principal@school.edu';
  
  // Get dashboard title from userRoles or determine based on email
  const dashboardTitle = userRoles.title || 
    (isDocManager ? 'Document Manager Dashboard' : 'Principal Dashboard');
  
  // Set appropriate subtitle based on role
  const dashboardSubtitle = isDocManager 
    ? 'Manage document categories and submissions'
    : 'Complete school document management system';

  // Define theme colors based on role
  const themeColors = {
    principal: {
      bgColor: 'bg-blue-900',
      accentColor: 'bg-blue-700',
      hoverColor: 'hover:bg-blue-800',
      textColor: 'text-blue-500',
      lightBg: 'bg-blue-50',
      lightBorder: 'border-blue-100',
      lightText: 'text-blue-700',
      tabActive: 'bg-blue-600'
    },
    docManager: {
      bgColor: 'bg-purple-900',
      accentColor: 'bg-purple-700',
      hoverColor: 'hover:bg-purple-800',
      textColor: 'text-purple-500',
      lightBg: 'bg-purple-50',
      lightBorder: 'border-purple-100',
      lightText: 'text-purple-700',
      tabActive: 'bg-purple-600'
    }
  };

  // Get theme based on user role
  const theme = isPrincipal ? themeColors.principal : themeColors.docManager;

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Initialize default document types if none exist
        await initializeDefaultDocumentTypes();
        
        // Get all document types
        const types = await getDocumentTypes();
        setDocumentTypes(types);
        
        // Load stats
        await loadStats();
        
        // Load pending documents
        await loadPendingDocuments();
      } catch (error) {
        setError('Failed to load data');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  const loadStats = async () => {
    try {
      // Get users
      const users = await getAllUsers();
      const totalTeachers = users.filter(user => user.isTeacher).length;
      
      // Get documents count
      let totalDocs = 0;
      let pendingDocs = 0;
      
      const usersRef = ref(database, 'users');
      const usersSnapshot = await get(usersRef);
      const usersData = usersSnapshot.val();
      
      if (usersData) {
        for (const userId in usersData) {
          const userDocsRef = ref(database, `users/${userId}/documents`);
          const userDocsSnapshot = await get(userDocsRef);
          const userDocs = userDocsSnapshot.val() || {};
          
          const docsArray = Object.values(userDocs) as any[];
          totalDocs += docsArray.length;
          
          pendingDocs += docsArray.filter(
            (doc: any) => doc.status === 'pending'
          ).length;
        }
      }
      
      setStats({
        totalUsers: users.length,
        totalTeachers,
        totalDocuments: totalDocs,
        pendingDocuments: pendingDocs
      });
    } catch (error) {
      console.error('Error loading stats', error);
    }
  };
  
  const loadPendingDocuments = async () => {
    try {
      const usersRef = ref(database, 'users');
      const usersSnapshot = await get(usersRef);
      const usersData = usersSnapshot.val();
      
      const pending: any[] = [];
      
      if (usersData) {
        for (const userId in usersData) {
          const userDocsRef = ref(database, `users/${userId}/documents`);
          const userDocsSnapshot = await get(userDocsRef);
          const userDocs = userDocsSnapshot.val() || {};
          
          for (const docId in userDocs) {
            const doc = userDocs[docId];
            if (doc.status === 'pending') {
              pending.push({
                id: docId,
                userId: userId,
                userName: usersData[userId].email || 'Unknown',
                ...doc
              });
            }
          }
        }
      }
      
      // Sort by upload date, newest first
      pending.sort((a, b) => b.uploadedAt - a.uploadedAt);
      setPendingDocuments(pending);
    } catch (error) {
      console.error('Error loading pending documents', error);
    }
  };
  
  const handleApproveDocument = async (userId: string, docId: string) => {
    try {
      await update(ref(database, `users/${userId}/documents/${docId}`), {
        status: 'approved'
      });
      await loadPendingDocuments();
      await loadStats();
    } catch (error) {
      console.error('Error approving document', error);
      setError('Failed to approve document');
    }
  };
  
  const handleRejectDocument = async (userId: string, docId: string) => {
    try {
      await update(ref(database, `users/${userId}/documents/${docId}`), {
        status: 'rejected'
      });
      await loadPendingDocuments();
      await loadStats();
    } catch (error) {
      console.error('Error rejecting document', error);
      setError('Failed to reject document');
    }
  };
  
  const refreshDocumentTypes = async () => {
    try {
      const types = await getDocumentTypes();
      setDocumentTypes(types);
      await loadStats();
      await loadPendingDocuments();
    } catch (error) {
      setError('Failed to refresh document types');
      console.error(error);
    }
  };

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

  if (loading) {
    return (
      <DashboardLayout title={dashboardTitle} subtitle="Loading..." bgColor={theme.bgColor}>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      title={dashboardTitle}
      subtitle={dashboardSubtitle}
      bgColor={theme.bgColor}
    >
      <div className="space-y-6">
        {/* Tab Navigation */}
        <div className="flex flex-wrap space-x-2 border-b border-gray-700 pb-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 font-medium rounded-t-lg transition-colors ${
              activeTab === 'overview'
                ? theme.tabActive + ' text-white'
                : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
            }`}
          >
            Overview
          </button>
          
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-4 py-2 font-medium rounded-t-lg transition-colors ${
              activeTab === 'categories'
                ? theme.tabActive + ' text-white'
                : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
            }`}
          >
            Document Categories
          </button>
          
          <button
            onClick={() => setActiveTab('approvals')}
            className={`px-4 py-2 font-medium rounded-t-lg transition-colors ${
              activeTab === 'approvals'
                ? theme.tabActive + ' text-white'
                : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
            }`}
          >
            Document Approvals
          </button>
          
          {/* Only show User Management for principals */}
          {isPrincipal && (
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 font-medium rounded-t-lg transition-colors ${
                activeTab === 'users'
                  ? theme.tabActive + ' text-white'
                  : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
              }`}
            >
              User Management
            </button>
          )}
        </div>

        {/* Tab Content */}
        <div className="bg-gray-800 text-gray-100 rounded-lg shadow-md p-6">
          {activeTab === 'overview' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">
                Welcome to your {isDocManager ? 'Document Manager' : 'Principal'} Dashboard
              </h2>
              <p className="text-gray-300 mb-6">
                {isDocManager 
                  ? 'Manage document categories and oversee document submissions from this central dashboard.' 
                  : 'Oversee all school document operations and staff from this central dashboard.'}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className={`${theme.accentColor} bg-opacity-20 p-4 rounded-lg border border-opacity-20 border-white`}>
                  <h3 className={`font-bold ${isPrincipal ? 'text-blue-300' : 'text-purple-300'} mb-2`}>Document Categories</h3>
                  <p className={`text-sm ${isPrincipal ? 'text-blue-200' : 'text-purple-200'}`}>
                    Create and manage document categories that teachers can submit
                  </p>
                </div>
                <div className="bg-green-900 bg-opacity-20 p-4 rounded-lg border border-opacity-20 border-white">
                  <h3 className="font-bold text-green-300 mb-2">Document Approvals</h3>
                  <p className="text-sm text-green-200">
                    Review and approve document submissions from teachers
                  </p>
                </div>
                {isPrincipal && (
                  <div className="bg-indigo-900 bg-opacity-20 p-4 rounded-lg border border-opacity-20 border-white">
                    <h3 className="font-bold text-indigo-300 mb-2">User Management</h3>
                    <p className="text-sm text-indigo-200">
                      Manage staff accounts and assign proper roles
                    </p>
                  </div>
                )}
              </div>
              
              <AnalyticsPanel />
            </div>
          )}

          {activeTab === 'categories' && <DocumentCategoriesPanel />}
          {activeTab === 'approvals' && <DocumentApprovalPanel />}
          {activeTab === 'users' && isPrincipal && <AdminPanel />}
        </div>
      </div>
    </DashboardLayout>
  );
} 