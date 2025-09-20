import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Calendar, 
  Users, 
  TrendingUp, 
  Clock,
  AlertCircle,
  FileText,
  MessageSquare
} from 'lucide-react';

export default function CounselorDashboard() {
  const { userProfile, getAuthenticatedAxios } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [moodTrends, setMoodTrends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  });

  const fetchDashboardData = async () => {
    try {
      const axios = getAuthenticatedAxios();
      
      const [appointmentsRes, analyticsRes, moodTrendsRes] = await Promise.all([
        axios.get('/api/counselor/appointments'),
        axios.get('/api/counselor/patients/analytics'),
        axios.get('/api/counselor/patients/mood-trends')
      ]);
      
      setAppointments(appointmentsRes.data);
      setAnalytics(analyticsRes.data);
      setMoodTrends(moodTrendsRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setLoading(false);
    }
  };

  const updateAppointmentStatus = async (bookingId, status, notes = '') => {
    try {
      const axios = getAuthenticatedAxios();
      await axios.put('/api/counselor/appointments/update', {
        booking_id: bookingId,
        status: status,
        notes: notes
      });
      fetchDashboardData(); // Refresh data
    } catch (error) {
      console.error('Failed to update appointment:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const todayAppointments = appointments.filter(apt => 
    new Date(apt.preferred_datetime).toDateString() === new Date().toDateString()
  );

  const upcomingAppointments = appointments.filter(apt => 
    new Date(apt.preferred_datetime) > new Date() && 
    new Date(apt.preferred_datetime).toDateString() !== new Date().toDateString()
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Counselor Dashboard
              </h1>
              <p className="text-gray-600">
                Welcome, Dr. {userProfile?.name} • {userProfile?.specialization}
              </p>
            </div>
            <div className="flex space-x-4">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>New Report</span>
              </button>
              <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>View Schedule</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Patients</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics?.total_patients || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Today's Sessions</p>
                <p className="text-2xl font-bold text-gray-900">
                  {todayAppointments.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Upcoming</p>
                <p className="text-2xl font-bold text-gray-900">
                  {upcomingAppointments.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Patient Mood</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics?.average_mood_scores?.mood || 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Today's Appointments */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Today's Appointments</h2>
              
              {todayAppointments.length > 0 ? (
                <div className="space-y-4">
                  {todayAppointments.map((appointment) => (
                    <div key={appointment.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-medium text-gray-900">
                              {appointment.patient_name}
                            </h3>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                              appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {appointment.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {new Date(appointment.preferred_datetime).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                          <p className="text-sm text-gray-700">
                            {appointment.issue_description}
                          </p>
                          {appointment.urgency === 'high' && (
                            <div className="flex items-center space-x-1 mt-2">
                              <AlertCircle className="h-4 w-4 text-red-500" />
                              <span className="text-sm text-red-600 font-medium">High Priority</span>
                            </div>
                          )}
                        </div>
                        <div className="flex space-x-2 ml-4">
                          {appointment.status === 'pending' && (
                            <button
                              onClick={() => updateAppointmentStatus(appointment.id, 'confirmed')}
                              className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                            >
                              Confirm
                            </button>
                          )}
                          {appointment.status === 'confirmed' && (
                            <button
                              onClick={() => updateAppointmentStatus(appointment.id, 'completed')}
                              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                            >
                              Complete
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No appointments scheduled for today</p>
                </div>
              )}
            </div>
          </div>

          {/* Patient Analytics */}
          <div className="space-y-6">
            {/* Severity Distribution */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Patient Severity Levels</h3>
              {analytics?.assessment_severity_distribution ? (
                <div className="space-y-3">
                  {Object.entries(analytics.assessment_severity_distribution).map(([severity, count]) => (
                    <div key={severity} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 capitalize">{severity}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              severity === 'severe' ? 'bg-red-600' :
                              severity === 'moderate' ? 'bg-yellow-600' :
                              'bg-green-600'
                            }`}
                            style={{ width: `${(count / analytics.total_patients) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-center py-4">No assessment data available</p>
              )}
            </div>

            {/* Chat Categories */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Common Issues</h3>
              {analytics?.chat_categories && Object.keys(analytics.chat_categories).length > 0 ? (
                <div className="space-y-2">
                  {Object.entries(analytics.chat_categories)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 5)
                    .map(([category, count]) => (
                    <div key={category} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 capitalize">{category}</span>
                      <span className="text-sm font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-center py-4">No chat data available</p>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <span>View Reports</span>
                </button>
                <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg">
                  <MessageSquare className="h-5 w-5 text-green-600" />
                  <span>Patient Feedback</span>
                </button>
                <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                  <span>Mood Trends</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mood Trends Chart */}
        {moodTrends.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Patient Mood Trends (Last 30 Days)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {analytics?.average_mood_scores?.mood || 'N/A'}
                </div>
                <div className="text-sm text-gray-600">Average Mood</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {analytics?.average_mood_scores?.energy || 'N/A'}
                </div>
                <div className="text-sm text-gray-600">Average Energy</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {analytics?.average_mood_scores?.stress || 'N/A'}
                </div>
                <div className="text-sm text-gray-600">Average Stress</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
