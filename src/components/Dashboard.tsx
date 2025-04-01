import { useAuth } from "../contexts/AuthContext";
import AdminDashboard from "./dashboards/AdminDashboard";
import TeacherDashboard from "./dashboards/TeacherDashboard";
import UserDashboard from "./dashboards/UserDashboard";
import NonAcademicDashboard from "./dashboards/NonAcademicDashboard";

export default function Dashboard() {
  const { userRoles, currentUser } = useAuth();

  // Special handling for known admin emails
  const adminEmails = ["principal@school.edu", "docmanager@school.edu"];
  const isKnownAdmin =
    currentUser && adminEmails.includes(currentUser.email || "");

  // Render appropriate dashboard based on user role
  if (userRoles.isAdmin || isKnownAdmin) {
    return <AdminDashboard data-oid="_r6kjjj" />;
  } else if (userRoles.isTeacher) {
    return <TeacherDashboard data-oid=".bf_fj1" />;
  } else if (userRoles.isNonAcademic) {
    return <NonAcademicDashboard data-oid="kr5d8m2" />;
  } else {
    return <UserDashboard data-oid="6f5s6f4" />;
  }
}
