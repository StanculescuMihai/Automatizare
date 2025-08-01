import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Se încarcă...</div>;
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    // Redirect to login or dashboard if not an admin
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

export default AdminRoute;