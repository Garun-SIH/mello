import React, { useState, useEffect, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Users, MessageSquare, Calendar, BookOpen, TrendingUp, Activity } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const AdminDashboard = () => {
  const { getAuthenticatedAxios } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [trends, setTrends] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAllAnalytics = useCallback(async () => {
    try {
      const axios = getAuthenticatedAxios();
      
      const [
        analyticsRes,
        trendsRes
      ] = await Promise.all([
        axios.get('/api/admin/analytics'),
        axios.get('/api/admin/analytics/trends')
      ]);
      
      setAnalytics(analyticsRes.data);
      setTrends(trendsRes.data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setIsLoading(false);
    }
  }, [getAuthenticatedAxios]);

  useEffect(() => {
    fetchAllAnalytics();
  }, [fetchAllAnalytics]);


  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="card">
                <div className="h-16 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2].map(i => (
              <div key={i} className="card">
                <div className="h-64 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="max-w-7xl mx-auto text-center py-12">
        <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to load analytics</h3>
        <p className="text-gray-600">Please try refreshing the page.</p>
      </div>
    );
  }

  // Prepare data for charts
  const categoryData = Object.entries(analytics.category_breakdown).map(([category, count]) => ({
    category: category.charAt(0).toUpperCase() + category.slice(1),
    count
  }));

  const bookingStatusData = Object.entries(analytics.booking_status_breakdown).map(([status, count]) => ({
    status: status.charAt(0).toUpperCase() + status.slice(1),
    count
  }));

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  const stats = [
    {
      title: 'Total Interactions',
      value: analytics.total_interactions,
      icon: MessageSquare,
      color: 'bg-blue-500',
      change: '+12%'
    },
    {
      title: 'Total Bookings',
      value: analytics.total_bookings,
      icon: Calendar,
      color: 'bg-green-500',
      change: '+8%'
    },
    {
      title: 'Forum Posts',
      value: analytics.total_posts,
      icon: Users,
      color: 'bg-purple-500',
      change: '+15%'
    },
    {
      title: 'Popular Resources',
      value: analytics.popular_resources.length,
      icon: BookOpen,
      color: 'bg-orange-500',
      change: '+5%'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Analytics Dashboard</h1>
        <p className="text-gray-600">
          Monitor platform usage, user engagement, and mental health support metrics.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-green-600">{stat.change} from last week</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Category Breakdown */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Chat Categories</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Booking Status */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Booking Status</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={bookingStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ status, percent }) => `${status} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {bookingStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Trends */}
      {trends && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Daily Interactions */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Daily Interactions (Last 7 Days)</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trends.daily_interactions}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#3B82F6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Daily Bookings */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Daily Bookings (Last 7 Days)</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trends.daily_bookings}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#10B981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Popular Resources */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Popular Resources</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {analytics.popular_resources.map((resource, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900">{resource.title}</h3>
                <p className="text-sm text-gray-600 capitalize">{resource.category}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold text-primary-600">{resource.views}</p>
                <p className="text-xs text-gray-500">views</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Key Insights */}
      <div className="mt-8 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Key Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4">
            <TrendingUp className="h-8 w-8 text-green-500 mb-2" />
            <h3 className="font-medium text-gray-900">Growing Engagement</h3>
            <p className="text-sm text-gray-600">Chat interactions increased by 12% this week</p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <Users className="h-8 w-8 text-blue-500 mb-2" />
            <h3 className="font-medium text-gray-900">Active Community</h3>
            <p className="text-sm text-gray-600">Forum posts show healthy peer support activity</p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <Calendar className="h-8 w-8 text-purple-500 mb-2" />
            <h3 className="font-medium text-gray-900">Professional Support</h3>
            <p className="text-sm text-gray-600">Counselor bookings remain steady with high completion rates</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
