import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../ui/LoadingSpinner';
import { AlertCircle, Shield, UserCheck } from 'lucide-react';

const ProtectedRoute = ({ children, requiredRole = null, requiredRoles = [] }) => {
  const { isAuthenticated, isLoading, isInitialized, hasRole, hasAnyRole, user } = useAuth();
  const location = useLocation();

  // Show loading spinner while authentication is being initialized
  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-neutral-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // User is not authenticated, redirect to login
  if (!isAuthenticated) {
    console.log('User not authenticated, redirecting to login');
    return (
      <Navigate 
        to="/login" 
        state={{ 
          from: location,
          message: 'Please log in to access this page'
        }} 
        replace 
      />
    );
  }

  // Check if user has required role(s)
  let hasAccess = true;
  let accessError = null;

  if (requiredRole) {
    hasAccess = hasRole(requiredRole);
    if (!hasAccess) {
      accessError = `Access denied. This page requires ${requiredRole} role.`;
    }
  } else if (requiredRoles.length > 0) {
    hasAccess = hasAnyRole(requiredRoles);
    if (!hasAccess) {
      accessError = `Access denied. This page requires one of these roles: ${requiredRoles.join(', ')}.`;
    }
  }

  // User doesn't have required role(s)
  if (!hasAccess) {
    console.log('Access denied for user:', user?.fullName, 'Required role(s):', requiredRole || requiredRoles);
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient">
        <div className="max-w-md w-full mx-auto p-6">
          <div className="card text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-error-100 mb-4">
              <Shield className="h-6 w-6 text-error-600" />
            </div>
            
            <h3 className="text-lg font-medium text-neutral-900 mb-2">
              Access Denied
            </h3>
            
            <p className="text-sm text-neutral-600 mb-4">
              {accessError}
            </p>
            
            <div className="bg-neutral-50 rounded-lg p-4 mb-4">
              <div className="flex items-center text-sm text-neutral-600 mb-2">
                <UserCheck className="h-4 w-4 mr-2" />
                <span>Your current role(s):</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {user?.role ? (
                  <span
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                  >
                    {user.role}
                  </span>
                ) : (
                  <span className="text-neutral-500 text-xs">No role assigned</span>
                )}
              </div>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={() => window.history.back()}
                className="btn-outline w-full"
              >
                Go Back
              </button>
              
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="btn-primary w-full"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // User has access, render the protected content
  console.log('Access granted for user:', user?.fullName, 'to route:', location.pathname);
  return children;
};

export default ProtectedRoute;
