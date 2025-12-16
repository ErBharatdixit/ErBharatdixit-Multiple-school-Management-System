import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, allowedRoles }) {
      const { user, loading } = useAuth();

      if (loading) {
            return (
                  <div className="min-h-screen flex items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                  </div>
            );
      }

      if (!user) {
            return <Navigate to="/login" replace />;
      }

      if (allowedRoles) {
            const roleHierarchy = {
                  student: ["student"],
                  teacher: ["student", "teacher"],
                  admin: ["student", "teacher", "admin"],
                  superadmin: ["student", "teacher", "admin", "superadmin"]
            };

            const userRoles = roleHierarchy[user.role] || [];
            const hasPermission = allowedRoles.some(role => userRoles.includes(role));

            if (!hasPermission) {
                  return <Navigate to="/unauthorized" replace />;
            }
      }

      return children;
}
