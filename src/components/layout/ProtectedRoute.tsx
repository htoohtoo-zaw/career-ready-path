import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getAuthSession } from '../../lib/learnerStore';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const session = getAuthSession();
  const location = useLocation();

  if (!session.isLoggedIn) {
    // Redirect them to the /auth/login page, but save the current location they were trying to go to
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
