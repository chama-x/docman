import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import { initializeDatabase, updateAppStatus } from './services/initService';
import './App.css';

function AppContent() {
  const { currentUser, loading } = useAuth();
  const [mounted, setMounted] = useState<boolean>(false);
  const [dbInitializing, setDbInitializing] = useState<boolean>(true);

  useEffect(() => {
    const init = async () => {
      try {
        // Initialize the database with default data if needed
        await initializeDatabase();
        await updateAppStatus('initialized');
      } catch (error) {
        console.error('Database initialization failed:', error);
      } finally {
        setDbInitializing(false);
        setMounted(true);
      }
    };
    
    init();
  }, []);

  if (!mounted || loading || dbInitializing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-gray-200">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-gray-400">
          {dbInitializing ? 'Initializing database...' : 'Loading application...'}
        </p>
      </div>
    );
  }

  return currentUser ? <Dashboard /> : <Auth />;
}

export default function App() {
  return (
    <div className="min-h-screen w-full bg-gray-900">
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </div>
  );
}
