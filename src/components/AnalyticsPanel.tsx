import { useState, useEffect } from 'react';
import { ref, get } from 'firebase/database';
import { database } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

interface Stats {
  totalUsers: number;
  totalTeachers: number;
  totalDocuments: number;
  pendingDocuments: number;
  approvedDocuments: number;
  rejectedDocuments: number;
}

export default function AnalyticsPanel() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalTeachers: 0,
    totalDocuments: 0,
    pendingDocuments: 0,
    approvedDocuments: 0,
    rejectedDocuments: 0
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const { currentUser } = useAuth();
  
  // Determine if user is principal or document manager
  const isDocManager = currentUser?.email?.toLowerCase() === 'docmanager@school.edu';
  const isPrincipal = currentUser?.email?.toLowerCase() === 'principal@school.edu';
  
  // Set theme color based on user role
  const themeColor = isPrincipal ? 'blue' : 'purple';

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        
        // Fetch users
        const usersRef = ref(database, 'users');
        const usersSnapshot = await get(usersRef);
        
        if (!usersSnapshot.exists()) {
          setStats({
            totalUsers: 0,
            totalTeachers: 0,
            totalDocuments: 0,
            pendingDocuments: 0,
            approvedDocuments: 0,
            rejectedDocuments: 0
          });
          return;
        }
        
        const usersData = usersSnapshot.val();
        const userIds = Object.keys(usersData);
        
        // Calculate stats
        let totalTeachers = 0;
        let totalDocuments = 0;
        let pendingDocuments = 0;
        let approvedDocuments = 0;
        let rejectedDocuments = 0;
        
        // Count teachers and documents
        for (const userId of userIds) {
          const userData = usersData[userId];
          
          // Count teachers
          if (userData.roles?.isTeacher) {
            totalTeachers++;
          }
          
          // Count documents
          if (userData.documents) {
            const userDocs = Object.values(userData.documents);
            totalDocuments += userDocs.length;
            
            // Count documents by status
            userDocs.forEach((doc: any) => {
              if (doc.status === 'pending') pendingDocuments++;
              else if (doc.status === 'approved') approvedDocuments++;
              else if (doc.status === 'rejected') rejectedDocuments++;
            });
          }
        }
        
        setStats({
          totalUsers: userIds.length,
          totalTeachers,
          totalDocuments,
          pendingDocuments,
          approvedDocuments,
          rejectedDocuments
        });
      } catch (error) {
        console.error('Error fetching analytics data:', error);
        setError('Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    }
    
    fetchStats();
  }, []);
  
  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold mb-4">System Analytics</h3>
      
      {error && (
        <div className="bg-red-900 bg-opacity-20 text-red-400 p-3 rounded mb-4 border border-red-800">
          {error}
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center py-8">
          <div className={`animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-${themeColor}-500`}></div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-gray-800 p-4 rounded-lg shadow hover:shadow-md transition-shadow border border-gray-700">
            <div className="text-sm font-medium text-gray-400">Total Users</div>
            <div className={`mt-1 text-2xl font-semibold text-${themeColor}-400`}>{stats.totalUsers}</div>
          </div>
          
          <div className="bg-gray-800 p-4 rounded-lg shadow hover:shadow-md transition-shadow border border-gray-700">
            <div className="text-sm font-medium text-gray-400">Teachers</div>
            <div className="mt-1 text-2xl font-semibold text-green-400">{stats.totalTeachers}</div>
          </div>
          
          <div className="bg-gray-800 p-4 rounded-lg shadow hover:shadow-md transition-shadow border border-gray-700">
            <div className="text-sm font-medium text-gray-400">Total Documents</div>
            <div className="mt-1 text-2xl font-semibold text-indigo-400">{stats.totalDocuments}</div>
          </div>
          
          <div className="bg-gray-800 p-4 rounded-lg shadow hover:shadow-md transition-shadow border border-gray-700">
            <div className="text-sm font-medium text-gray-400">Pending</div>
            <div className="mt-1 text-2xl font-semibold text-yellow-400">{stats.pendingDocuments}</div>
          </div>
          
          <div className="bg-gray-800 p-4 rounded-lg shadow hover:shadow-md transition-shadow border border-gray-700">
            <div className="text-sm font-medium text-gray-400">Approved</div>
            <div className="mt-1 text-2xl font-semibold text-green-400">{stats.approvedDocuments}</div>
          </div>
          
          <div className="bg-gray-800 p-4 rounded-lg shadow hover:shadow-md transition-shadow border border-gray-700">
            <div className="text-sm font-medium text-gray-400">Rejected</div>
            <div className="mt-1 text-2xl font-semibold text-red-400">{stats.rejectedDocuments}</div>
          </div>
        </div>
      )}
    </div>
  );
} 