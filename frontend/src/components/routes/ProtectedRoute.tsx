import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  adminOnly?: boolean;
}

const ProtectedRoute = ({ children, adminOnly = false }: ProtectedRouteProps) => {
  const { user, loading, isAdmin, isAuthenticated } = useAuth();

  // Show loading screen while checking auth state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-white text-lg">
        Loading...
      </div>
    );
  }

  // Redirect to signin if not logged in
  if (!isAuthenticated || !user) {
    console.warn('[ProtectedRoute] User not logged in - redirecting to signin');
    return <Navigate to="/signin" replace />;
  }

  // Redirect to verify page if email is not verified
  // if (!user.emailVerified) {
  //   console.warn('[ProtectedRoute] Email not verified - redirecting to verify page');
  //   return <Navigate to="/verify" replace />;
  // }

  // If route is adminOnly and user is not admin, redirect to home
  if (adminOnly && !isAdmin) {
    console.warn('[ProtectedRoute] Access denied - non-admin user tried to access admin-only route');
    return <Navigate to="/" replace />;
  }

  // Authorized: render protected content
  return <>{children}</>;
};

export default ProtectedRoute;
