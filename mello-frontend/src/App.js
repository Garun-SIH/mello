import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import RoleBasedDashboard from './components/RoleBasedDashboard';
import Login from './components/Login';
import Register from './components/Register';
import ErrorBoundary from './components/ErrorBoundary';
import Home from './pages/Home';
import Chatbot from './pages/Chatbot';
import Booking from './pages/Booking';
import Resources from './pages/Resources';
import Forum from './pages/Forum';
import Assessments from './pages/Assessments';
import MoodTracker from './pages/MoodTracker';
import Newsletter from './pages/Newsletter';
import Feedback from './pages/Feedback';

// Admin Pages
import CounselorApproval from './pages/admin/CounselorApproval';
import ContentUpload from './pages/admin/ContentUpload';
import ForumAnalytics from './pages/admin/ForumAnalytics';
import MoodAnalytics from './pages/admin/MoodAnalytics';
import AppointmentTracking from './pages/admin/AppointmentTracking';

// Counselor Pages
import CounselorAppointments from './pages/counselor/CounselorAppointments';
import PatientAssessments from './pages/counselor/PatientAssessments';
import PatientFeedback from './pages/counselor/PatientFeedback';
import Reports from './pages/counselor/Reports';

function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <AuthProvider>
          <Router>
            <div className="min-h-screen bg-gray-50">
              <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<Home />} />
            
            {/* Protected Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Layout>
                  <RoleBasedDashboard />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/chat" element={
              <ProtectedRoute>
                <Layout>
                  <Chatbot />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/booking" element={
              <ProtectedRoute>
                <Layout>
                  <Booking />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/resources" element={
              <ProtectedRoute>
                <Layout>
                  <Resources />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/forum" element={
              <ProtectedRoute>
                <Layout>
                  <Forum />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/assessments" element={
              <ProtectedRoute>
                <Layout>
                  <Assessments />
                </Layout>
              </ProtectedRoute>
            } />
            
            {/* User-specific Routes */}
            <Route path="/mood-tracker" element={
              <ProtectedRoute requiredRole="user">
                <Layout>
                  <MoodTracker />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/newsletter" element={
              <ProtectedRoute requiredRole="user">
                <Layout>
                  <Newsletter />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/feedback" element={
              <ProtectedRoute requiredRole="user">
                <Layout>
                  <Feedback />
                </Layout>
              </ProtectedRoute>
            } />
            
            {/* Admin Routes */}
            <Route path="/admin/counselor-approval" element={
              <ProtectedRoute requiredRole="admin">
                <Layout>
                  <CounselorApproval />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/admin/content-upload" element={
              <ProtectedRoute requiredRole="admin">
                <Layout>
                  <ContentUpload />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/admin/forum-analytics" element={
              <ProtectedRoute requiredRole="admin">
                <Layout>
                  <ForumAnalytics />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/admin/mood-analytics" element={
              <ProtectedRoute requiredRole="admin">
                <Layout>
                  <MoodAnalytics />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/admin/appointment-tracking" element={
              <ProtectedRoute requiredRole="admin">
                <Layout>
                  <AppointmentTracking />
                </Layout>
              </ProtectedRoute>
            } />
            
            {/* Counselor Routes */}
            <Route path="/counselor/appointments" element={
              <ProtectedRoute requiredRole="counselor">
                <Layout>
                  <CounselorAppointments />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/counselor/assessments" element={
              <ProtectedRoute requiredRole="counselor">
                <Layout>
                  <PatientAssessments />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/counselor/feedback" element={
              <ProtectedRoute requiredRole="counselor">
                <Layout>
                  <PatientFeedback />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/counselor/reports" element={
              <ProtectedRoute requiredRole="counselor">
                <Layout>
                  <Reports />
                </Layout>
              </ProtectedRoute>
            } />
            
            {/* Status Pages */}
            <Route path="/pending-approval" element={
              <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Application Under Review</h2>
                  <p className="text-gray-600">Your counselor application is being reviewed by our admin team. You'll be notified once approved.</p>
                </div>
              </div>
            } />
            
            <Route path="/account-suspended" element={
              <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Account Suspended</h2>
                  <p className="text-gray-600">Your account has been suspended. Please contact support for assistance.</p>
                </div>
              </div>
            } />
            
            <Route path="/unauthorized" element={
              <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
                  <p className="text-gray-600">You don't have permission to access this page.</p>
                </div>
              </div>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}

export default App;
