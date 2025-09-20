import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import UserDashboard from '../pages/UserDashboard';
import CounselorDashboard from '../pages/CounselorDashboard';
import AdminDashboard from '../pages/AdminDashboard';

export default function RoleBasedDashboard() {
  const { userProfile } = useAuth();

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  switch (userProfile.role) {
    case 'user':
      return <UserDashboard />;
    case 'counselor':
      return <CounselorDashboard />;
    case 'admin':
      return <AdminDashboard />;
    default:
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Unknown Role</h2>
            <p className="text-gray-600">Your account role is not recognized. Please contact support.</p>
          </div>
        </div>
      );
  }
}
