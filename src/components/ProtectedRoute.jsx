import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

/**
 * ProtectedRoute component
 * Wraps routes that require authentication and instance setup
 * Redirects to login if user is not authenticated
 * Redirects to onboarding if user doesn't have an instance
 * Shows loading spinner while checking authentication
 */
export function ProtectedRoute({ children, requireAdmin = false }) {
  const { user, isLoading, isAuthenticated, isAdmin } = useAuth();
  const instanceId = localStorage.getItem('instance_id');

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </motion.div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated()) {
    return <Navigate to="/auth/login" replace />;
  }

  // Redirect to onboarding if user doesn't have any instances (hasn't completed onboarding)
  if (!user?.has_instances && (!user?.instances || user.instances.length === 0)) {
    console.log('User has no instances, redirecting to onboarding');
    return <Navigate to="/onboarding" replace />;
  }
  
  // Set instance_id in localStorage if user has instances (for backward compatibility)
  if (user?.instances && user.instances.length > 0) {
    const storedInstanceId = localStorage.getItem('instance_id');
    if (!storedInstanceId) {
      localStorage.setItem('instance_id', user.instances[0].id);
    }
  }

  // Redirect to dashboard if admin required but user is not admin
  if (requireAdmin && !isAdmin()) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

/**
 * PublicRoute component
 * Wraps routes that should only be accessible when logged out
 * Redirects to dashboard if user is already authenticated
 */
export function PublicRoute({ children }) {
  const { isLoading, isAuthenticated } = useAuth();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </motion.div>
      </div>
    );
  }

  // Redirect to dashboard if already authenticated
  if (isAuthenticated()) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

/**
 * OnboardingRoute component
 * Wraps onboarding route that should only be accessible for authenticated users without an instance
 * Redirects to login if not authenticated
 * Redirects to dashboard if user already has an instance
 */
export function OnboardingRoute({ children }) {
  const { isLoading, isAuthenticated, user } = useAuth();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </motion.div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated()) {
    return <Navigate to="/auth/login" replace />;
  }

  // Redirect to dashboard if user already has instances (completed onboarding)
  if (user?.has_instances || user?.instances?.length > 0) {
    console.log('User has instances, redirecting to dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
