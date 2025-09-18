import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Link } from 'react-router-dom';
import {  
  Calendar,  
  TrendingUp, 
  BookOpen, 
  Users,
  Plus,
  Activity,
  Brain,
  Smile
} from 'lucide-react';
import DashboardCard from '../components/DashboardCard';

export default function UserDashboard() {
  const { userProfile, getAuthenticatedAxios } = useAuth();
  const { t } = useLanguage();
  const [dashboardData, setDashboardData] = useState(null);
  const [moodData, setMoodData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    fetchMoodAnalytics();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const axios = getAuthenticatedAxios();
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/user/dashboard`);
      setDashboardData(response.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    }
  };

  const fetchMoodAnalytics = async () => {
    try {
      const axios = getAuthenticatedAxios();
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/mood/analytics`);
      setMoodData(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch mood analytics:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {t('welcomeBack')}, {userProfile?.name}! 👋
            </h1>
            <p className="text-gray-600 mt-2">{t('howAreYouFeeling')}</p>
          </div>
          <div className="flex space-x-3">
            <Link 
              to="/chat"
              className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 flex items-center space-x-2 transition-colors shadow-sm"
            >
              <Brain className="h-5 w-5" />
              <span>{t('chatWithAI')}</span>
            </Link>
            <Link 
              to="/booking"
              className="bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 flex items-center space-x-2 transition-colors shadow-sm"
            >
              <Calendar className="h-5 w-5" />
              <span>{t('bookSession')}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <DashboardCard
          title={t('moodStreak')}
          value={`${dashboardData?.mood_tracking_streak || 0} days`}
          icon={Smile}
          color="blue"
          description="Keep tracking daily!"
        />
        
        <DashboardCard
          title={t('weeklyChatCount')}
          value={dashboardData?.weekly_chat_count || 0}
          icon={Brain}
          color="green"
          description="AI conversations"
        />
        
        <DashboardCard
          title={t('upcomingSessions')}
          value={dashboardData?.upcoming_appointments?.length || 0}
          icon={Calendar}
          color="purple"
          description="Scheduled appointments"
        />
        
        <DashboardCard
          title={t('moodTrend')}
          value={moodData?.trend || 'Stable'}
          icon={TrendingUp}
          color="indigo"
          description="Last 7 days"
        />
      </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Today's Mood */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-900">{t('todaysMoodCheck')}</h2>
                <Link to="/mood-tracker" className="text-blue-600 hover:text-blue-700 flex items-center space-x-1">
                  <Plus className="h-4 w-4" />
                  <span>{t('logMood')}</span>
                </Link>
              </div>

              {dashboardData?.latest_mood ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Mood Score</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${(dashboardData.latest_mood.mood_score / 10) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{dashboardData.latest_mood.mood_score}/10</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Energy Level</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${(dashboardData.latest_mood.energy_level / 10) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{dashboardData.latest_mood.energy_level}/10</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Stress Level</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-red-600 h-2 rounded-full" 
                          style={{ width: `${(dashboardData.latest_mood.stress_level / 10) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{dashboardData.latest_mood.stress_level}/10</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No mood data for today</p>
                  <Link to="/mood-tracker" className="mt-2 text-blue-600 hover:text-blue-700">
                    Log your first mood entry
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            {/* Upcoming Appointments */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Sessions</h3>
              {dashboardData?.upcoming_appointments?.length > 0 ? (
                <div className="space-y-3">
                  {dashboardData.upcoming_appointments.map((appointment, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Calendar className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-gray-900">{appointment.counselor_name}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(appointment.datetime).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-center py-4">No upcoming sessions</p>
              )}
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Access</h3>
              <div className="space-y-3">
                <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg">
                  <BookOpen className="h-5 w-5 text-green-600" />
                  <span>Resource Library</span>
                </button>
                <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg">
                  <Users className="h-5 w-5 text-purple-600" />
                  <span>Peer Forum</span>
                </button>
                <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-orange-600" />
                  <span>Assessment Tools</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mood Analytics Summary */}
        {moodData && moodData.averages && (
          <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Mental Health Insights</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{moodData.averages.mood}</div>
                <div className="text-sm text-gray-600">Average Mood</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{moodData.averages.energy}</div>
                <div className="text-sm text-gray-600">Average Energy</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600">{moodData.averages.stress}</div>
                <div className="text-sm text-gray-600">Average Stress</div>
              </div>
            </div>
            {moodData.sleep_mood_correlation && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  💡 <strong>Insight:</strong> Your sleep patterns show a {moodData.sleep_mood_correlation} correlation with your mood scores.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
  );
}
