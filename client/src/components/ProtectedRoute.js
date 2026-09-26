import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

// Consolidated from two near-duplicate ProtectedRoute components that
// existed in this codebase (src/ProtectedRoute.js and
// src/components/ProtectedRoute.js) -- kept the role-checking behavior from
// the former, at the latter's file path. Only one should exist going
// forward; delete the old src/ProtectedRoute.js if it's still on disk.
//
// NOTE: redirecting an unauthorized (wrong-role) user to /login is a
// pragmatic choice since App.js has no dedicated "/unauthorized" route --
// redirecting there would just hit the catch-all NotFound page instead. If
// you'd rather show a proper "access denied" message, add an /unauthorized
// route to App.js and point this at that instead.
const ProtectedRoute = ({ children, role }) => {
  const { user } = useContext(AuthContext);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
