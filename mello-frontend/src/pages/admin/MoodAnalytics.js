import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { Brain, TrendingUp, Users, Calendar, Download, Filter } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const MoodAnalytics = () => {
  const { getAuthenticatedAxios } = useAuth();
  const [analytics, setAnalytics] = useState({
    totalEntries: 0,
    activeUsers: 0,
    averageMood: 0,
    weeklyChange: 0
  });
  const [moodTrends, setMoodTrends] = useState([]);
  const [moodDistribution, setMoodDistribution] = useState([]);
  const [stressLevels, setStressLevels] = useState([]);
  const [energyLevels, setEnergyLevels] = useState([]);
  const [timeRange, setTimeRange] = useState('7d');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
    fetchMoodTrends();
    fetchMoodDistribution();
    fetchStressLevels();
    fetchEnergyLevels();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      const axios = getAuthenticatedAxios();
      const response = await axios.get(`/api/admin/mood/analytics?range=${timeRange}`);
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching mood analytics:', error);
      // Mock data for development
      setAnalytics({
        totalEntries: 2847,
        activeUsers: 156,
        averageMood: 6.8,
        weeklyChange: 12.5
      });
    }
  };

  const fetchMoodTrends = async () => {
    try {
      const axios = getAuthenticatedAxios();
      const response = await axios.get(`/api/admin/mood/trends?range=${timeRange}`);
      setMoodTrends(response.data);
    } catch (error) {
      console.error('Error fetching mood trends:', error);
      // Mock data for development
      setMoodTrends([
        { date: '2024-01-08', mood: 6.2, stress: 5.8, energy: 6.5 },
        { date: '2024-01-09', mood: 6.8, stress: 5.2, energy: 7.1 },
        { date: '2024-01-10', mood: 5.9, stress: 6.5, energy: 5.8 },
        { date: '2024-01-11', mood: 7.2, stress: 4.8, energy: 7.8 },
        { date: '2024-01-12', mood: 6.5, stress: 5.5, energy: 6.9 },
        { date: '2024-01-13', mood: 7.0, stress: 5.0, energy: 7.2 },
        { date: '2024-01-14', mood: 6.9, stress: 5.3, energy: 7.0 }
      ]);
    }
  };

  const fetchMoodDistribution = async () => {
    try {
      const axios = getAuthenticatedAxios();
      const response = await axios.get(`/api/admin/mood/distribution?range=${timeRange}`);
      setMoodDistribution(response.data);
    } catch (error) {
      console.error('Error fetching mood distribution:', error);
      // Mock data for development
      setMoodDistribution([
        { range: '1-2 (Very Low)', count: 45, color: '#ef4444' },
        { range: '3-4 (Low)', count: 128, color: '#f97316' },
        { range: '5-6 (Moderate)', count: 342, color: '#eab308' },
        { range: '7-8 (Good)', count: 298, color: '#22c55e' },
        { range: '9-10 (Excellent)', count: 87, color: '#16a34a' }
      ]);
    }
  };

  const fetchStressLevels = async () => {
    try {
      const axios = getAuthenticatedAxios();
      const response = await axios.get(`/api/admin/mood/stress?range=${timeRange}`);
      setStressLevels(response.data);
    } catch (error) {
      console.error('Error fetching stress levels:', error);
      // Mock data for development
      setStressLevels([
        { date: '2024-01-08', high: 23, medium: 45, low: 88 },
        { date: '2024-01-09', high: 19, medium: 52, low: 95 },
        { date: '2024-01-10', high: 31, medium: 48, low: 76 },
        { date: '2024-01-11', high: 15, medium: 41, low: 102 },
        { date: '2024-01-12', high: 22, medium: 49, low: 89 },
        { date: '2024-01-13', high: 18, medium: 46, low: 94 },
        { date: '2024-01-14', high: 20, medium: 44, low: 91 }
      ]);
    }
  };

  const fetchEnergyLevels = async () => {
    try {
      const axios = getAuthenticatedAxios();
      const response = await axios.get(`/api/admin/mood/energy?range=${timeRange}`);
      setEnergyLevels(response.data);
    } catch (error) {
      console.error('Error fetching energy levels:', error);
      // Mock data for development
      setEnergyLevels([
        { time: '6-9 AM', energy: 7.2 },
        { time: '9-12 PM', energy: 8.1 },
        { time: '12-3 PM', energy: 6.8 },
        { time: '3-6 PM', energy: 5.9 },
        { time: '6-9 PM', energy: 6.5 },
        { time: '9-12 AM', energy: 5.2 }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const exportData = async () => {
    try {
      const axios = getAuthenticatedAxios();
      const response = await axios.get(`/api/admin/mood/export?range=${timeRange}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `mood-analytics-${timeRange}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Failed to export data');
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mood Analytics</h1>
          <p className="text-gray-600 mt-2">Monitor student mental health trends and patterns</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 3 months</option>
              <option value="1y">Last year</option>
            </select>
          </div>
          
          <button
            onClick={exportData}
            className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Brain className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Entries</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.totalEntries.toLocaleString()}</p>
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
              <p className="text-2xl font-bold text-gray-900">{analytics.activeUsers}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Average Mood</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.averageMood}/10</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Calendar className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Weekly Change</p>
              <p className={`text-2xl font-bold ${analytics.weeklyChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {analytics.weeklyChange >= 0 ? '+' : ''}{analytics.weeklyChange}%
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Mood Trends */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Mood Trends Over Time</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={moodTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={(date) => new Date(date).toLocaleDateString()} />
              <YAxis domain={[0, 10]} />
              <Tooltip 
                labelFormatter={(date) => new Date(date).toLocaleDateString()}
                formatter={(value, name) => [value.toFixed(1), name.charAt(0).toUpperCase() + name.slice(1)]}
              />
              <Line type="monotone" dataKey="mood" stroke="#8884d8" strokeWidth={2} name="Mood" />
              <Line type="monotone" dataKey="stress" stroke="#ff7c7c" strokeWidth={2} name="Stress" />
              <Line type="monotone" dataKey="energy" stroke="#82ca9d" strokeWidth={2} name="Energy" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Mood Distribution */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Mood Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={moodDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ range, percent }) => `${range.split(' ')[0]} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {moodDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [value, 'Entries']} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Stress Levels */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Daily Stress Levels</h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={stressLevels}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={(date) => new Date(date).toLocaleDateString()} />
              <YAxis />
              <Tooltip labelFormatter={(date) => new Date(date).toLocaleDateString()} />
              <Area type="monotone" dataKey="high" stackId="1" stroke="#ef4444" fill="#ef4444" name="High Stress" />
              <Area type="monotone" dataKey="medium" stackId="1" stroke="#f97316" fill="#f97316" name="Medium Stress" />
              <Area type="monotone" dataKey="low" stackId="1" stroke="#22c55e" fill="#22c55e" name="Low Stress" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Energy Levels by Time */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Energy Levels by Time of Day</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={energyLevels}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis domain={[0, 10]} />
              <Tooltip formatter={(value) => [value.toFixed(1), 'Energy Level']} />
              <Bar dataKey="energy" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Insights and Recommendations */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Key Insights & Recommendations</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Trends Identified:</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Peak energy levels occur between 9-12 PM</li>
              <li>• Stress levels tend to increase mid-week</li>
              <li>• Overall mood shows {analytics.weeklyChange >= 0 ? 'positive' : 'negative'} trend</li>
              <li>• {Math.round((moodDistribution.find(d => d.range.includes('1-2'))?.count || 0) / analytics.totalEntries * 100)}% of entries indicate very low mood</li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Recommended Actions:</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Schedule wellness activities during low-energy periods</li>
              <li>• Increase counselor availability mid-week</li>
              <li>• Promote stress management resources</li>
              <li>• Monitor users with consistently low mood ratings</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoodAnalytics;
