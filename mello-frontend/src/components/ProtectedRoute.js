import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children, requiredRole = null }) {
  const { currentUser, userProfile } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  // Handle users who need to complete registration
  if (userProfile.needsRegistration) {
    return <Navigate to="/register" />;
  }

  // Handle backend connection errors
  if (userProfile.backendError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Backend Connection Error</h2>
          <p className="text-gray-600 mb-4">Unable to connect to the server. Please check if the backend is running.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Check role-based access
  if (requiredRole && userProfile.role !== requiredRole) {
    return <Navigate to="/unauthorized" />;
  }

  // Special handling for pending counselors
  if (userProfile.role === 'counselor' && userProfile.counselor_status === 'pending') {
    return <Navigate to="/pending-approval" />;
  }

  // Block rejected or suspended counselors
  if (userProfile.role === 'counselor' && 
      (userProfile.counselor_status === 'rejected' || userProfile.counselor_status === 'suspended')) {
    return <Navigate to="/account-suspended" />;
  }

  return children;
}
