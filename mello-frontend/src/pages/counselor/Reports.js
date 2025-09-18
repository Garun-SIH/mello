import React, { useState, useEffect } from 'react';
import { FileText, Download, Plus, Calendar, User, BarChart3, Send, Filter } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Reports = () => {
  const { getAuthenticatedAxios } = useAuth();
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all',
    timeRange: '30d',
    search: ''
  });
  const [formData, setFormData] = useState({
    title: '',
    type: 'patient_progress',
    patient_id: '',
    content: '',
    recommendations: '',
    priority: 'medium'
  });
  const [patients, setPatients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchReports();
    fetchPatients();
  }, [filters.timeRange]);

  useEffect(() => {
    applyFilters();
  }, [reports, filters]);

  const fetchReports = async () => {
    try {
      const axios = getAuthenticatedAxios();
      const response = await axios.get(`/api/counselor/reports?range=${filters.timeRange}`);
      setReports(response.data);
    } catch (error) {
      console.error('Error fetching reports:', error);
      // Mock data for development
      const mockReports = [
        {
          id: 1,
          title: 'Monthly Progress Report - John D.',
          type: 'patient_progress',
          patient_name: 'John D.',
          patient_id: 'P001',
          content: 'Patient has shown significant improvement in managing anxiety symptoms. Regular attendance and active participation in sessions.',
          recommendations: 'Continue current therapy approach. Consider introducing group therapy sessions.',
          priority: 'medium',
          status: 'submitted',
          created_at: '2024-01-15T10:30:00Z',
          submitted_at: '2024-01-15T11:00:00Z'
        },
        {
          id: 2,
          title: 'Crisis Intervention Report - Sarah M.',
          type: 'incident',
          patient_name: 'Sarah M.',
          patient_id: 'P002',
          content: 'Emergency session conducted due to severe anxiety episode. Patient was experiencing panic attacks related to upcoming exams.',
          recommendations: 'Immediate follow-up required. Consider medication consultation with psychiatrist.',
          priority: 'high',
          status: 'submitted',
          created_at: '2024-01-14T16:20:00Z',
          submitted_at: '2024-01-14T16:45:00Z'
        },
        {
          id: 3,
          title: 'Treatment Plan Review - Alex K.',
          type: 'treatment_plan',
          patient_name: 'Alex K.',
          patient_id: 'P003',
          content: 'Comprehensive review of 3-month treatment plan. Patient has achieved most initial goals.',
          recommendations: 'Transition to maintenance phase. Reduce session frequency to bi-weekly.',
          priority: 'medium',
          status: 'draft',
          created_at: '2024-01-13T14:15:00Z',
          submitted_at: null
        },
        {
          id: 4,
          title: 'Assessment Summary - Emily R.',
          type: 'assessment',
          patient_name: 'Emily R.',
          patient_id: 'P004',
          content: 'Initial assessment completed. Patient presents with mild depression and academic stress.',
          recommendations: 'Begin cognitive behavioral therapy. Schedule weekly sessions for first month.',
          priority: 'medium',
          status: 'submitted',
          created_at: '2024-01-12T09:30:00Z',
          submitted_at: '2024-01-12T10:00:00Z'
        }
      ];
      setReports(mockReports);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const axios = getAuthenticatedAxios();
      const response = await axios.get('/api/counselor/patients');
      setPatients(response.data);
    } catch (error) {
      console.error('Error fetching patients:', error);
      // Mock data for development
      setPatients([
        { id: 'P001', name: 'John D.' },
        { id: 'P002', name: 'Sarah M.' },
        { id: 'P003', name: 'Alex K.' },
        { id: 'P004', name: 'Emily R.' },
        { id: 'P005', name: 'Mike T.' }
      ]);
    }
  };

  const applyFilters = () => {
    let filtered = [...reports];

    // Type filter
    if (filters.type !== 'all') {
      filtered = filtered.filter(report => report.type === filters.type);
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(report => report.status === filters.status);
    }

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(report => 
        report.title.toLowerCase().includes(searchLower) ||
        report.patient_name.toLowerCase().includes(searchLower) ||
        report.content.toLowerCase().includes(searchLower)
      );
    }

    setFilteredReports(filtered);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const axios = getAuthenticatedAxios();
      const response = await axios.post('/api/counselor/reports', formData);
      
      setReports(prev => [response.data, ...prev]);
      setFormData({
        title: '',
        type: 'patient_progress',
        patient_id: '',
        content: '',
        recommendations: '',
        priority: 'medium'
      });
      setShowCreateForm(false);
      alert('Report created successfully!');
    } catch (error) {
      console.error('Error creating report:', error);
      alert('Failed to create report');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitReport = async (reportId) => {
    try {
      const axios = getAuthenticatedAxios();
      await axios.post(`/api/counselor/reports/${reportId}/submit`);
      
      setReports(prev => prev.map(report => 
        report.id === reportId 
          ? { ...report, status: 'submitted', submitted_at: new Date().toISOString() }
          : report
      ));
      alert('Report submitted successfully!');
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('Failed to submit report');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'submitted':
        return 'bg-green-100 text-green-800';
      case 'reviewed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'patient_progress':
        return <BarChart3 className="h-4 w-4" />;
      case 'incident':
        return <FileText className="h-4 w-4" />;
      case 'treatment_plan':
        return <Calendar className="h-4 w-4" />;
      case 'assessment':
        return <User className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
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
          <h1 className="text-3xl font-bold text-gray-900">Reports & Documentation</h1>
          <p className="text-gray-600 mt-2">Create and manage patient reports for admin review</p>
        </div>
        
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Report
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Filter className="h-4 w-4 inline mr-1" />
              Report Type
            </label>
            <select
              value={filters.type}
              onChange={(e) => setFilters({...filters, type: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="patient_progress">Patient Progress</option>
              <option value="incident">Incident Report</option>
              <option value="treatment_plan">Treatment Plan</option>
              <option value="assessment">Assessment</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="submitted">Submitted</option>
              <option value="reviewed">Reviewed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Time Range</label>
            <select
              value={filters.timeRange}
              onChange={(e) => setFilters({...filters, timeRange: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 3 months</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
              placeholder="Search reports..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-6">
        {filteredReports.length === 0 ? (
          <div className="card">
            <p className="text-gray-500 text-center py-8">No reports found matching your criteria.</p>
          </div>
        ) : (
          filteredReports.map((report) => (
            <div key={report.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      {getTypeIcon(report.type)}
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{report.title}</h3>
                      <p className="text-sm text-gray-600">Patient: {report.patient_name}</p>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Content:</h4>
                    <p className="text-gray-700 text-sm">{report.content}</p>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Recommendations:</h4>
                    <p className="text-gray-700 text-sm">{report.recommendations}</p>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(report.status)}`}>
                      {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                    </span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(report.priority)}`}>
                      {report.priority.charAt(0).toUpperCase() + report.priority.slice(1)} Priority
                    </span>
                    <span className="text-xs text-gray-500">
                      Created: {new Date(report.created_at).toLocaleDateString()}
                    </span>
                    {report.submitted_at && (
                      <span className="text-xs text-gray-500">
                        Submitted: {new Date(report.submitted_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="ml-4 flex flex-col space-y-2">
                  {report.status === 'draft' && (
                    <button
                      onClick={() => handleSubmitReport(report.id)}
                      className="flex items-center px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
                    >
                      <Send className="h-3 w-3 mr-1" />
                      Submit
                    </button>
                  )}
                  <button className="flex items-center px-3 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700">
                    <Download className="h-3 w-3 mr-1" />
                    Export
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Report Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Create New Report</h3>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Enter report title"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    >
                      <option value="patient_progress">Patient Progress</option>
                      <option value="incident">Incident Report</option>
                      <option value="treatment_plan">Treatment Plan</option>
                      <option value="assessment">Assessment</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Patient</label>
                    <select
                      value={formData.patient_id}
                      onChange={(e) => setFormData({...formData, patient_id: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select patient</option>
                      {patients.map(patient => (
                        <option key={patient.id} value={patient.id}>{patient.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({...formData, content: e.target.value})}
                    rows="4"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Enter report content..."
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Recommendations</label>
                  <textarea
                    value={formData.recommendations}
                    onChange={(e) => setFormData({...formData, recommendations: e.target.value})}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Enter recommendations..."
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                
                <div className="flex items-center space-x-4 pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    {isSubmitting ? 'Creating...' : 'Create Report'}
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
