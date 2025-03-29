import { useAuth } from '../contexts/AuthContext';
import AdminDashboard from './dashboards/AdminDashboard';
import TeacherDashboard from './dashboards/TeacherDashboard';
import UserDashboard from './dashboards/UserDashboard';

export default function Dashboard() {
  const { userRoles, currentUser } = useAuth();
  
  // Log user and roles for debugging
  console.log('Current user:', currentUser?.email);
  console.log('User roles:', userRoles);

  // Special handling for known admin emails
  const adminEmails = ['principal@school.edu', 'docmanager@school.edu'];
  const isKnownAdmin = currentUser && adminEmails.includes(currentUser.email || '');
  
  // Render appropriate dashboard based on user role
  if (userRoles.isAdmin || isKnownAdmin) {
    console.log('Rendering AdminDashboard');
    return <AdminDashboard />;
  } else if (userRoles.isTeacher) {
    console.log('Rendering TeacherDashboard');
    return <TeacherDashboard />;
  } else {
    console.log('Rendering UserDashboard');
    return <UserDashboard />;
  }
} 