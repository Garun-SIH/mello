import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { MessageSquare, Users, AlertTriangle, TrendingUp, Eye, Flag, Trash2, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const ForumAnalytics = () => {
  const { getAuthenticatedAxios } = useAuth();
  const [analytics, setAnalytics] = useState({
    totalPosts: 0,
    totalUsers: 0,
    flaggedPosts: 0,
    engagementRate: 0
  });
  const [recentPosts, setRecentPosts] = useState([]);
  const [flaggedContent, setFlaggedContent] = useState([]);
  const [activityData, setActivityData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
    fetchRecentPosts();
    fetchFlaggedContent();
    fetchActivityData();
    fetchCategoryData();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const axios = getAuthenticatedAxios();
      const response = await axios.get('/api/admin/forum/analytics');
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      // Mock data for development
      setAnalytics({
        totalPosts: 1247,
        totalUsers: 342,
        flaggedPosts: 23,
        engagementRate: 78.5
      });
    }
  };

  const fetchRecentPosts = async () => {
    try {
      const axios = getAuthenticatedAxios();
      const response = await axios.get('/api/admin/forum/recent-posts');
      setRecentPosts(response.data);
    } catch (error) {
      console.error('Error fetching recent posts:', error);
      // Mock data for development
      setRecentPosts([
        { id: 1, title: 'Dealing with exam stress', author: 'Anonymous', replies: 12, created_at: '2024-01-15T10:30:00Z', flagged: false },
        { id: 2, title: 'Need advice on sleep schedule', author: 'Anonymous', replies: 8, created_at: '2024-01-15T09:15:00Z', flagged: false },
        { id: 3, title: 'Feeling overwhelmed lately', author: 'Anonymous', replies: 15, created_at: '2024-01-15T08:45:00Z', flagged: true },
        { id: 4, title: 'Study motivation tips?', author: 'Anonymous', replies: 6, created_at: '2024-01-14T16:20:00Z', flagged: false },
        { id: 5, title: 'Social anxiety in college', author: 'Anonymous', replies: 9, created_at: '2024-01-14T14:10:00Z', flagged: false }
      ]);
    }
  };

  const fetchFlaggedContent = async () => {
    try {
      const axios = getAuthenticatedAxios();
      const response = await axios.get('/api/admin/forum/flagged');
      setFlaggedContent(response.data);
    } catch (error) {
      console.error('Error fetching flagged content:', error);
      // Mock data for development
      setFlaggedContent([
        { id: 3, title: 'Feeling overwhelmed lately', reason: 'Potentially harmful content', reporter: 'User123', created_at: '2024-01-15T08:45:00Z' },
        { id: 7, title: 'I hate everything', reason: 'Negative language', reporter: 'User456', created_at: '2024-01-14T20:30:00Z' }
      ]);
    }
  };

  const fetchActivityData = async () => {
    try {
      const axios = getAuthenticatedAxios();
      const response = await axios.get('/api/admin/forum/activity');
      setActivityData(response.data);
    } catch (error) {
      console.error('Error fetching activity data:', error);
      // Mock data for development
      setActivityData([
        { date: '2024-01-08', posts: 45, replies: 123 },
        { date: '2024-01-09', posts: 52, replies: 145 },
        { date: '2024-01-10', posts: 38, replies: 98 },
        { date: '2024-01-11', posts: 61, replies: 167 },
        { date: '2024-01-12', posts: 49, replies: 134 },
        { date: '2024-01-13', posts: 55, replies: 156 },
        { date: '2024-01-14', posts: 43, replies: 112 }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategoryData = async () => {
    try {
      const axios = getAuthenticatedAxios();
      const response = await axios.get('/api/admin/forum/categories');
      setCategoryData(response.data);
    } catch (error) {
      console.error('Error fetching category data:', error);
      // Mock data for development
      setCategoryData([
        { name: 'Academic Stress', value: 35, color: '#8884d8' },
        { name: 'Social Anxiety', value: 28, color: '#82ca9d' },
        { name: 'Sleep Issues', value: 20, color: '#ffc658' },
        { name: 'Relationship', value: 12, color: '#ff7c7c' },
        { name: 'Other', value: 5, color: '#8dd1e1' }
      ]);
    }
  };

  const handleModeratePost = async (postId, action) => {
    try {
      const axios = getAuthenticatedAxios();
      await axios.post(`/api/admin/forum/moderate/${postId}`, { action });
      
      if (action === 'approve') {
        setFlaggedContent(prev => prev.filter(post => post.id !== postId));
        alert('Post approved successfully');
      } else if (action === 'remove') {
        setFlaggedContent(prev => prev.filter(post => post.id !== postId));
        setRecentPosts(prev => prev.filter(post => post.id !== postId));
        alert('Post removed successfully');
      }
    } catch (error) {
      console.error('Error moderating post:', error);
      alert('Failed to moderate post');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Forum Analytics & Moderation</h1>
        <p className="text-gray-600 mt-2">Monitor forum activity and moderate content</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <MessageSquare className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Posts</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.totalPosts.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.totalUsers.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Flagged Posts</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.flaggedPosts}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Engagement Rate</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.engagementRate}%</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Activity Chart */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Forum Activity (Last 7 Days)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={activityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={(date) => new Date(date).toLocaleDateString()} />
              <YAxis />
              <Tooltip labelFormatter={(date) => new Date(date).toLocaleDateString()} />
              <Line type="monotone" dataKey="posts" stroke="#8884d8" name="Posts" />
              <Line type="monotone" dataKey="replies" stroke="#82ca9d" name="Replies" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Category Distribution */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Discussion Categories</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent Posts */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Posts</h2>
          <div className="space-y-4">
            {recentPosts.map((post) => (
              <div key={post.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{post.title}</h3>
                  <p className="text-sm text-gray-600">
                    By {post.author} • {post.replies} replies • {new Date(post.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {post.flagged && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
                      <Flag className="h-3 w-3 mr-1" />
                      Flagged
                    </span>
                  )}
                  <button className="p-1 text-gray-400 hover:text-gray-600">
                    <Eye className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Flagged Content */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Flagged Content</h2>
          {flaggedContent.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No flagged content to review</p>
          ) : (
            <div className="space-y-4">
              {flaggedContent.map((post) => (
                <div key={post.id} className="p-4 border border-red-200 rounded-lg bg-red-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{post.title}</h3>
                      <p className="text-sm text-red-600 mt-1">Reason: {post.reason}</p>
                      <p className="text-sm text-gray-600">
                        Reported by {post.reporter} • {new Date(post.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleModeratePost(post.id, 'approve')}
                        className="p-2 text-green-600 hover:bg-green-100 rounded"
                        title="Approve"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleModeratePost(post.id, 'remove')}
                        className="p-2 text-red-600 hover:bg-red-100 rounded"
                        title="Remove"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForumAnalytics;
