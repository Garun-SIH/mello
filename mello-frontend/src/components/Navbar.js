import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Heart, MessageCircle, Calendar, BookOpen, Users, BarChart3, ClipboardList, Shield, UserCheck, TrendingUp, FileText, Upload, Eye } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const location = useLocation();
  const { userProfile } = useAuth();

  // Role-specific navigation items
  const getNavItems = () => {
    if (!userProfile) return [];

    switch (userProfile.role) {
      case 'ADMIN':
        return [
          { path: '/admin', label: 'Dashboard', icon: BarChart3 },
          { path: '/admin/counselors', label: 'Counselor Approval', icon: UserCheck },
          { path: '/admin/content', label: 'Content Upload', icon: Upload },
          { path: '/admin/forum-moderation', label: 'Forum Moderation', icon: Eye },
          { path: '/admin/mood-analytics', label: 'Mood Analytics', icon: TrendingUp },
          { path: '/admin/appointments', label: 'Appointment Tracking', icon: Calendar },
          { path: '/admin/assessments', label: 'Assessment Analytics', icon: ClipboardList },
          { path: '/admin/chat-analytics', label: 'Chat Analytics', icon: MessageCircle },
        ];
      
      case 'COUNSELOR':
        return [
          { path: '/counselor', label: 'Dashboard', icon: Heart },
          { path: '/counselor/appointments', label: 'My Appointments', icon: Calendar },
          { path: '/counselor/patients', label: 'Patient Analytics', icon: Users },
          { path: '/counselor/feedback', label: 'Patient Feedback', icon: MessageCircle },
          { path: '/counselor/reports', label: 'File Reports', icon: FileText },
        ];
      
      case 'USER':
      default:
        return [
          { path: '/', label: 'Home', icon: Heart },
          { path: '/mood-tracker', label: 'Mood Tracker', icon: TrendingUp },
          { path: '/forum', label: 'Peer Support', icon: Users },
          { path: '/chat', label: 'AI Chat', icon: MessageCircle },
          { path: '/booking', label: 'Book Counselor', icon: Calendar },
          { path: '/newsletter', label: 'Newsletter', icon: BookOpen },
          { path: '/feedback', label: 'Give Feedback', icon: FileText },
          { path: '/resources', label: 'Wellness Resources', icon: BookOpen },
          { path: '/assessments', label: 'Assessments', icon: ClipboardList },
        ];
    }
  };

  const navItems = getNavItems();

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Heart className="h-8 w-8 text-primary-600" />
            <span className="text-2xl font-bold text-gray-900">Mello</span>
          </Link>
          
          <div className="hidden md:flex space-x-4">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === path
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </Link>
            ))}
          </div>

          {/* User Profile & Logout */}
          <div className="flex items-center space-x-4">
            {userProfile && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  {userProfile.name} ({userProfile.role})
                </span>
                <button 
                  onClick={() => {/* Add logout function */}}
                  className="text-sm text-gray-500 hover:text-red-600"
                >
                  Logout
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button className="text-gray-600 hover:text-primary-600">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
