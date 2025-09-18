import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Brain, Users, TrendingUp, Calendar, FileText, Eye, Filter } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const PatientAssessments = () => {
  const { getAuthenticatedAxios } = useAuth();
  const [assessments, setAssessments] = useState([]);
  const [filteredAssessments, setFilteredAssessments] = useState([]);
  const [analytics, setAnalytics] = useState({
    totalPatients: 0,
    completedAssessments: 0,
    averageScore: 0,
    improvementRate: 0
  });
  const [trendData, setTrendData] = useState([]);
  const [severityDistribution, setSeverityDistribution] = useState([]);
  const [filters, setFilters] = useState({
    timeRange: '30d',
    severity: 'all',
    search: ''
  });
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAssessments();
    fetchAnalytics();
    fetchTrendData();
    fetchSeverityDistribution();
  }, [filters.timeRange]);

  useEffect(() => {
    applyFilters();
  }, [assessments, filters]);

  const fetchAssessments = async () => {
    try {
      const axios = getAuthenticatedAxios();
      const response = await axios.get(`/api/counselor/assessments?range=${filters.timeRange}`);
      setAssessments(response.data);
    } catch (error) {
      console.error('Error fetching assessments:', error);
      // Mock data for development
      const mockAssessments = [
        {
          id: 1,
          patient_name: 'John D.',
          patient_id: 'P001',
          assessment_type: 'Depression Scale',
          score: 12,
          severity: 'Mild',
          completed_at: '2024-01-15T10:30:00Z',
          notes: 'Shows improvement from last session',
          previous_score: 18
        },
        {
          id: 2,
          patient_name: 'Sarah M.',
          patient_id: 'P002',
          assessment_type: 'Anxiety Inventory',
          score: 28,
          severity: 'Moderate',
          completed_at: '2024-01-14T14:20:00Z',
          notes: 'Academic stress related anxiety',
          previous_score: 32
        },
        {
          id: 3,
          patient_name: 'Alex K.',
          patient_id: 'P003',
          assessment_type: 'Stress Assessment',
          score: 35,
          severity: 'High',
          completed_at: '2024-01-13T16:45:00Z',
          notes: 'Requires immediate attention',
          previous_score: 31
        },
        {
          id: 4,
          patient_name: 'Emily R.',
          patient_id: 'P004',
          assessment_type: 'Depression Scale',
          score: 8,
          severity: 'Minimal',
          completed_at: '2024-01-12T11:15:00Z',
          notes: 'Significant improvement noted',
          previous_score: 22
        }
      ];
      setAssessments(mockAssessments);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const axios = getAuthenticatedAxios();
      const response = await axios.get(`/api/counselor/analytics?range=${filters.timeRange}`);
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      // Mock data for development
      setAnalytics({
        totalPatients: 24,
        completedAssessments: 67,
        averageScore: 18.5,
        improvementRate: 73.2
      });
    }
  };

  const fetchTrendData = async () => {
    try {
      const axios = getAuthenticatedAxios();
      const response = await axios.get(`/api/counselor/trends?range=${filters.timeRange}`);
      setTrendData(response.data);
    } catch (error) {
      console.error('Error fetching trend data:', error);
      // Mock data for development
      setTrendData([
        { date: '2024-01-08', avgScore: 22.3, assessments: 8 },
        { date: '2024-01-09', avgScore: 20.1, assessments: 12 },
        { date: '2024-01-10', avgScore: 19.8, assessments: 10 },
        { date: '2024-01-11', avgScore: 18.5, assessments: 15 },
        { date: '2024-01-12', avgScore: 17.2, assessments: 9 },
        { date: '2024-01-13', avgScore: 18.9, assessments: 7 },
        { date: '2024-01-14', avgScore: 16.8, assessments: 6 }
      ]);
    }
  };

  const fetchSeverityDistribution = async () => {
    try {
      const axios = getAuthenticatedAxios();
      const response = await axios.get(`/api/counselor/severity-distribution?range=${filters.timeRange}`);
      setSeverityDistribution(response.data);
    } catch (error) {
      console.error('Error fetching severity distribution:', error);
      // Mock data for development
      setSeverityDistribution([
        { name: 'Minimal', value: 15, color: '#22c55e' },
        { name: 'Mild', value: 28, color: '#eab308' },
        { name: 'Moderate', value: 18, color: '#f97316' },
        { name: 'High', value: 6, color: '#ef4444' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...assessments];

    // Severity filter
    if (filters.severity !== 'all') {
      filtered = filtered.filter(assessment => 
        assessment.severity.toLowerCase() === filters.severity.toLowerCase()
      );
    }

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(assessment => 
        assessment.patient_name.toLowerCase().includes(searchLower) ||
        assessment.assessment_type.toLowerCase().includes(searchLower) ||
        assessment.notes.toLowerCase().includes(searchLower)
      );
    }

    setFilteredAssessments(filtered);
  };

  const getSeverityColor = (severity) => {
    switch (severity.toLowerCase()) {
      case 'minimal':
        return 'bg-green-100 text-green-800';
      case 'mild':
        return 'bg-yellow-100 text-yellow-800';
      case 'moderate':
        return 'bg-orange-100 text-orange-800';
      case 'high':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreChange = (current, previous) => {
    if (!previous) return null;
    const change = previous - current; // Lower scores are better
    return {
      value: Math.abs(change),
      isImprovement: change > 0,
      percentage: Math.round((Math.abs(change) / previous) * 100)
    };
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
          <h1 className="text-3xl font-bold text-gray-900">Patient Assessment Analytics</h1>
          <p className="text-gray-600 mt-2">Monitor patient progress and assessment outcomes</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <select
            value={filters.timeRange}
            onChange={(e) => setFilters({...filters, timeRange: e.target.value})}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 3 months</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Patients</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.totalPatients}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <FileText className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Assessments</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.completedAssessments}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Brain className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Average Score</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.averageScore}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Improvement Rate</p>
              <p className="text-2xl font-bold text-green-600">{analytics.improvementRate}%</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Assessment Trends */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Assessment Score Trends</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={(date) => new Date(date).toLocaleDateString()} />
              <YAxis />
              <Tooltip 
                labelFormatter={(date) => new Date(date).toLocaleDateString()}
                formatter={(value, name) => [
                  name === 'avgScore' ? value.toFixed(1) : value,
                  name === 'avgScore' ? 'Average Score' : 'Assessments'
                ]}
              />
              <Line type="monotone" dataKey="avgScore" stroke="#8884d8" strokeWidth={2} name="avgScore" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Severity Distribution */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Severity Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={severityDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {severityDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Filters and Assessment List */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Recent Assessments</h2>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={filters.severity}
                onChange={(e) => setFilters({...filters, severity: e.target.value})}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">All Severities</option>
                <option value="minimal">Minimal</option>
                <option value="mild">Mild</option>
                <option value="moderate">Moderate</option>
                <option value="high">High</option>
              </select>
            </div>
            
            <input
              type="text"
              placeholder="Search assessments..."
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        {filteredAssessments.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No assessments found matching your criteria.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assessment Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Severity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progress
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAssessments.map((assessment) => {
                  const scoreChange = getScoreChange(assessment.score, assessment.previous_score);
                  return (
                    <tr key={assessment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{assessment.patient_name}</div>
                          <div className="text-sm text-gray-500">ID: {assessment.patient_id}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{assessment.assessment_type}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{assessment.score}</div>
                        {assessment.previous_score && (
                          <div className="text-xs text-gray-500">Previous: {assessment.previous_score}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(assessment.severity)}`}>
                          {assessment.severity}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {scoreChange && (
                          <div className={`text-sm ${scoreChange.isImprovement ? 'text-green-600' : 'text-red-600'}`}>
                            {scoreChange.isImprovement ? '↓' : '↑'} {scoreChange.value} ({scoreChange.percentage}%)
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(assessment.completed_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => setSelectedPatient(assessment)}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Assessment Detail Modal */}
      {selectedPatient && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Assessment Details</h3>
                <button
                  onClick={() => setSelectedPatient(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Patient</label>
                    <p className="text-sm text-gray-900">{selectedPatient.patient_name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Assessment Type</label>
                    <p className="text-sm text-gray-900">{selectedPatient.assessment_type}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Score</label>
                    <p className="text-sm text-gray-900">{selectedPatient.score}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Severity</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(selectedPatient.severity)}`}>
                      {selectedPatient.severity}
                    </span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Notes</label>
                  <p className="text-sm text-gray-900 mt-1">{selectedPatient.notes}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Completed At</label>
                  <p className="text-sm text-gray-900">{new Date(selectedPatient.completed_at).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientAssessments;
