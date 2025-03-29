import { ReactNode } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  bgColor?: string;
}

export default function DashboardLayout({ 
  children, 
  title, 
  subtitle,
  bgColor = 'bg-blue-900'
}: DashboardLayoutProps) {
  const { currentUser, userRoles, logout } = useAuth();
  
  const handleLogout = () => {
    logout();
  };

  const getUserTypeColor = () => {
    if (userRoles.isAdmin) {
      return 'text-blue-100';
    } else if (userRoles.isTeacher) {
      return 'text-green-100';
    }
    return 'text-gray-100';
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Debug Info - For Development Only */}
      <div className="bg-yellow-900 bg-opacity-80 text-yellow-100 p-2 text-xs">
        <strong>DEBUG:</strong> User: {currentUser?.email} | 
        Roles: Admin: {userRoles.isAdmin ? 'YES' : 'NO'}, 
        Teacher: {userRoles.isTeacher ? 'YES' : 'NO'} |
        Title: {userRoles.title || 'None'}
      </div>
      
      {/* Header */}
      <header className={`${bgColor} text-white shadow-lg shadow-black/50`}>
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold">{title}</h1>
              {subtitle && (
                <p className="mt-1 text-sm opacity-80">{subtitle}</p>
              )}
            </div>
            
            <div className="flex items-center">
              <div className="mr-4 text-right">
                <p className="text-white text-sm">
                  {currentUser?.email}
                </p>
                <div className="flex items-center gap-2">
                  {userRoles.isAdmin && (
                    <span className="px-2 py-0.5 bg-blue-800 text-white text-xs rounded-full">
                      Admin
                    </span>
                  )}
                  {userRoles.isTeacher && (
                    <span className="px-2 py-0.5 bg-green-800 text-white text-xs rounded-full">
                      Teacher
                    </span>
                  )}
                </div>
              </div>
              
              <button
                onClick={handleLogout}
                className="ml-4 bg-black/20 hover:bg-black/30 px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
} 