import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface GuestRouteProps {
  children: ReactNode;
}

const GuestRoute = ({ children }: GuestRouteProps) => {
  const { user, loading, isAuthenticated } = useAuth();

  // Show loading screen while checking auth state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-950 text-white text-lg">
        Loading...
      </div>
    );
  }

  // Redirect to dashboard or profile if already logged in
  if (isAuthenticated && user) {
    if (user.role === 'admin') {
      return <Navigate to="/admin-dashboard" replace />;
    } else if (user.role === 'teacher') {
      return <Navigate to="/teacher-dashboard" replace />;
    } else {
      return <Navigate to="/profile" replace />;
    }
  }

  // Render guest content (signin, signup, etc.)
  return <>{children}</>;
};

export default GuestRoute;
