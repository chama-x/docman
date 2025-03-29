import { useState, useEffect } from 'react';
import { User } from '../types/documentTypes';
import { getAllUsers, initializeTestUsers, fixUserRoles } from '../services/userService';
import { createSampleDocuments, deleteAllDocuments } from '../services/testDataService';
import { useAuth } from '../contexts/AuthContext';
import { ref, set } from 'firebase/database';
import { database } from '../firebase';

export default function AdminPanel() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const { userRoles, currentUser } = useAuth();
  
  // Determine if user is principal or document manager
  const isPrincipal = currentUser?.email?.toLowerCase() === 'principal@school.edu';
  const themeColor = isPrincipal ? 'blue' : 'purple';

  useEffect(() => {
    if (!userRoles.isAdmin) return;
    
    loadUsers();
  }, [userRoles.isAdmin]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const allUsers = await getAllUsers();
      setUsers(allUsers);
    } catch (error) {
      setError('Failed to load users');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateTestUsers = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      await initializeTestUsers();
      await loadUsers();
      
      setSuccess('Test users have been created successfully!');
    } catch (error) {
      setError('Failed to create test users');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFixUserRoles = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      await fixUserRoles();
      await loadUsers();
      
      setSuccess('User roles have been fixed successfully!');
    } catch (error) {
      setError('Failed to fix user roles');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSampleDocuments = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      await createSampleDocuments(true);
      
      setSuccess('Sample documents have been created successfully!');
    } catch (error) {
      setError('Failed to create sample documents');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleResetDatabase = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      const confirmReset = window.confirm(
        "WARNING: This will reset the entire database. All document data will be lost. Continue?"
      );
      
      if (!confirmReset) {
        setLoading(false);
        return;
      }
      
      // Delete all existing documents
      await deleteAllDocuments();
      
      // Reset the database structure
      await set(ref(database), {
        documentTypes: {
          common: {
            appointment_letter: "Appointment Letter",
            birth_certificate: "Birth Certificate",
            nic: "NIC",
            qualification_certificates: "Qualification Certificates"
          },
          teacher: {
            disciplinary_letter: "Disciplinary Letter",
            promotion_letter: "Promotion Letter",
            transfer_letter: "Transfer Letter"
          }
        }
      });
      
      // Create users again and sample documents
      await initializeTestUsers();
      await createSampleDocuments(true);
      await loadUsers();
      
      setSuccess('Database has been completely reset and sample data created!');
    } catch (error) {
      setError('Failed to reset database');
      console.error(error);
    } finally {
      setLoading(false);
    }
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

  if (!userRoles.isAdmin) {
    return null;
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">User Management</h2>
      
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

      <div className="mb-6 flex flex-wrap gap-4">
        <div>
          <button
            onClick={handleGenerateTestUsers}
            className="bg-purple-900 hover:bg-purple-800 text-purple-300 font-bold py-2 px-4 rounded"
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Generate Test Users'}
          </button>
          <p className="text-gray-400 text-sm mt-2">
            Creates sample users: principal, docmanager, and 3 teachers
          </p>
        </div>
        
        <div>
          <button
            onClick={handleFixUserRoles}
            className={`bg-${themeColor}-900 hover:bg-${themeColor}-800 text-${themeColor}-300 font-bold py-2 px-4 rounded`}
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Fix User Roles'}
          </button>
          <p className="text-gray-400 text-sm mt-2">
            Ensures that all users have the correct roles in the database
          </p>
        </div>
        
        <div>
          <button
            onClick={handleGenerateSampleDocuments}
            className="bg-green-900 hover:bg-green-800 text-green-300 font-bold py-2 px-4 rounded"
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Generate Sample Documents'}
          </button>
          <p className="text-gray-400 text-sm mt-2">
            Creates random sample documents for each user
          </p>
        </div>
        
        <div>
          <button
            onClick={handleResetDatabase}
            className="bg-red-900 hover:bg-red-800 text-red-300 font-bold py-2 px-4 rounded"
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Reset Database'}
          </button>
          <p className="text-gray-400 text-sm mt-2">
            WARNING: Completely resets the database and creates fresh data
          </p>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-4">User Accounts</h3>
        
        {loading ? (
          <div className="flex justify-center">
            <div className={`animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-${themeColor}-500`}></div>
          </div>
        ) : (
          <div className="bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-700">
            <table className="min-w-full">
              <thead className="bg-gray-900">
                <tr>
                  <th className="py-2 px-4 border-b border-gray-700 text-left text-xs text-gray-400 uppercase">Email</th>
                  <th className="py-2 px-4 border-b border-gray-700 text-left text-xs text-gray-400 uppercase">Roles</th>
                  <th className="py-2 px-4 border-b border-gray-700 text-left text-xs text-gray-400 uppercase">Created</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-4 text-center text-gray-400">No users found</td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.uid} className="hover:bg-gray-700">
                      <td className="py-2 px-4 border-b border-gray-700">{user.email}</td>
                      <td className="py-2 px-4 border-b border-gray-700">
                        {user.isAdmin && (
                          <span className="inline-block bg-blue-900 text-blue-300 px-2 py-1 rounded text-xs font-semibold mr-2">
                            Admin
                          </span>
                        )}
                        {user.isTeacher && (
                          <span className="inline-block bg-green-900 text-green-300 px-2 py-1 rounded text-xs font-semibold">
                            Teacher
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-4 border-b border-gray-700 text-gray-300">
                        {user.createdAt ? formatDate(user.createdAt) : 'N/A'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      <div className="mt-6 p-4 bg-gray-800 rounded border border-gray-700">
        <h3 className="text-lg font-semibold mb-2">Test Credentials</h3>
        <ul className="space-y-2 text-gray-300">
          <li><strong>Principal:</strong> principal@school.edu / password123</li>
          <li><strong>Document Manager:</strong> docmanager@school.edu / password123</li>
          <li><strong>Teachers:</strong> teacher1@school.edu, teacher2@school.edu, teacher3@school.edu / password123</li>
        </ul>
      </div>
    </div>
  );
} 