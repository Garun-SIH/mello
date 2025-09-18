import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Heart, MessageCircle, Calendar, BookOpen, Users, BarChart3, 
  ClipboardList, UserCheck, TrendingUp, FileText, Upload, 
  Eye, LogOut, Menu, X, Home, Brain, Smile, 
  MessageSquare, Bell, Activity
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userProfile, logout } = useAuth();
  const { t } = useLanguage();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Role-specific navigation items
  const getNavItems = () => {
    if (!userProfile) return [];

    switch (userProfile.role) {
      case 'admin':
        return [
          { path: '/dashboard', label: 'Dashboard', icon: BarChart3, category: 'Overview' },
          { path: '/admin/counselor-approval', label: 'Counselor Approval', icon: UserCheck, category: 'Management' },
          { path: '/admin/content-upload', label: 'Content Upload', icon: Upload, category: 'Management' },
          { path: '/admin/forum-analytics', label: 'Forum Moderation', icon: Eye, category: 'Analytics' },
          { path: '/admin/mood-analytics', label: 'Mood Analytics', icon: TrendingUp, category: 'Analytics' },
          { path: '/admin/appointment-tracking', label: 'Appointments', icon: Calendar, category: 'Analytics' },
          { path: '/admin/chat-analytics', label: 'Chat Analytics', icon: MessageCircle, category: 'Analytics' },
          { path: '/admin/reports', label: 'Reports Review', icon: FileText, category: 'Management' },
        ];
      
      case 'counselor':
        return [
          { path: '/dashboard', label: 'Dashboard', icon: Heart, category: 'Overview' },
          { path: '/counselor/appointments', label: 'My Appointments', icon: Calendar, category: 'Sessions' },
          { path: '/counselor/patients', label: 'My Patients', icon: Users, category: 'Sessions' },
          { path: '/counselor/assessments', label: 'Patient Analytics', icon: Activity, category: 'Analytics' },
          { path: '/counselor/feedback', label: 'Patient Feedback', icon: MessageSquare, category: 'Communication' },
          { path: '/counselor/reports', label: 'File Reports', icon: FileText, category: 'Communication' },
          { path: '/counselor/schedule', label: 'My Schedule', icon: ClipboardList, category: 'Sessions' },
        ];
      
      case 'user':
      default:
        return [
          { path: '/dashboard', label: t('dashboard'), icon: Home, category: 'Overview' },
          { path: '/mood-tracker', label: t('moodTracker'), icon: Smile, category: 'Wellness' },
          { path: '/chat', label: t('aiChatSupport'), icon: Brain, category: 'Support' },
          { path: '/booking', label: t('bookCounselor'), icon: Calendar, category: 'Support' },
          { path: '/forum', label: t('peerSupport'), icon: Users, category: 'Community' },
          { path: '/resources', label: t('wellnessResources'), icon: BookOpen, category: 'Wellness' },
          { path: '/assessments', label: t('selfAssessments'), icon: ClipboardList, category: 'Wellness' },
          { path: '/newsletter', label: t('newsletter'), icon: Bell, category: 'Community' },
          { path: '/feedback', label: t('giveFeedback'), icon: MessageSquare, category: 'Community' },
        ];
    }
  };

  const navItems = getNavItems();
  
  // Group items by category
  const groupedItems = navItems.reduce((acc, item) => {
    const category = item.category || 'Other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {});

  const getRoleColor = () => {
    switch (userProfile?.role) {
      case 'admin': return 'bg-red-500';
      case 'counselor': return 'bg-blue-500';
      case 'user': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getRoleLabel = () => {
    switch (userProfile?.role) {
      case 'admin': return 'Administrator';
      case 'counselor': return 'Counselor';
      case 'user': return 'Student';
      default: return 'User';
    }
  };

  return (
    <div className={`fixed left-0 top-0 h-screen bg-white shadow-lg border-r border-gray-200 transition-all duration-300 z-50 flex flex-col ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <Link to="/dashboard" className={`flex items-center space-x-3 ${isCollapsed ? 'justify-center' : ''}`}>
          <Heart className="h-8 w-8 text-primary-600 flex-shrink-0" />
          {!isCollapsed && (
            <span className="text-2xl font-bold text-gray-900">Mello</span>
          )}
        </Link>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
        >
          {isCollapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
        </button>
      </div>

      {/* User Profile */}
      <div className="p-4 border-b border-gray-200">
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'}`}>
          <div className={`w-10 h-10 rounded-full ${getRoleColor()} flex items-center justify-center text-white font-semibold flex-shrink-0`}>
            {userProfile?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {userProfile?.name || 'User'}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {getRoleLabel()}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4 min-h-0">
        {Object.entries(groupedItems).map(([category, items]) => (
          <div key={category} className="mb-6">
            {!isCollapsed && (
              <h3 className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                {category}
              </h3>
            )}
            <nav className="space-y-1 px-2">
              {items.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group ${
                    location.pathname === path
                      ? 'text-primary-600 bg-primary-50 border-r-2 border-primary-600'
                      : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
                  } ${isCollapsed ? 'justify-center' : 'space-x-3'}`}
                  title={isCollapsed ? label : ''}
                >
                  <Icon className={`h-5 w-5 flex-shrink-0 ${
                    location.pathname === path ? 'text-primary-600' : 'text-gray-400 group-hover:text-primary-600'
                  }`} />
                  {!isCollapsed && <span className="truncate">{label}</span>}
                </Link>
              ))}
            </nav>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 p-4 flex-shrink-0 space-y-2">
        {/* Language Switcher */}
        {!isCollapsed && (
          <div className="mb-2">
            <LanguageSwitcher />
          </div>
        )}
        
        <button
          onClick={handleLogout}
          className={`w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors ${
            isCollapsed ? 'justify-center' : 'space-x-3'
          }`}
          title={isCollapsed ? t('logout') : ''}
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {!isCollapsed && <span>{t('logout')}</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
