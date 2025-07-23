// src/components/ProtectedRoute.tsx
import React from "react";
import { Navigate } from "react-router-dom";

// Simple cookie-based auth check
const isAuthenticated = (): boolean => {
  return document.cookie.includes("username=");
};

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return isAuthenticated() ? <>{children}</> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
