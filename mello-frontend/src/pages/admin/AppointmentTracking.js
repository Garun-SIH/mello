import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, MapPin, Phone, Mail, Filter, Search, Download } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const AppointmentTracking = () => {
  const { getAuthenticatedAxios } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [counselors, setCounselors] = useState([]);
  const [filters, setFilters] = useState({
    status: 'all',
    counselor: 'all',
    dateRange: '7d',
    search: ''
  });
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
    fetchCounselors();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [appointments, filters]);

  const fetchAppointments = async () => {
    try {
      const axios = getAuthenticatedAxios();
      const response = await axios.get('/api/admin/appointments');
      setAppointments(response.data);
      calculateStats(response.data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      // Mock data for development
      const mockAppointments = [
        {
          id: 1,
          user_name: 'John Doe',
          user_email: 'john@university.edu',
          counselor_name: 'Dr. Sarah Wilson',
          counselor_specialization: 'Anxiety & Depression',
          preferred_datetime: '2024-01-16T10:00:00Z',
          status: 'confirmed',
          issue_description: 'Dealing with exam stress and anxiety',
          urgency: 'medium',
          created_at: '2024-01-15T09:00:00Z'
        },
        {
          id: 2,
          user_name: 'Jane Smith',
          user_email: 'jane@university.edu',
          counselor_name: 'Dr. Michael Brown',
          counselor_specialization: 'Academic Counseling',
          preferred_datetime: '2024-01-16T14:30:00Z',
          status: 'pending',
          issue_description: 'Need guidance on career choices',
          urgency: 'low',
          created_at: '2024-01-15T11:30:00Z'
        },
        {
          id: 3,
          user_name: 'Alex Johnson',
          user_email: 'alex@university.edu',
          counselor_name: 'Dr. Sarah Wilson',
          counselor_specialization: 'Anxiety & Depression',
          preferred_datetime: '2024-01-15T16:00:00Z',
          status: 'completed',
          issue_description: 'Social anxiety in group settings',
          urgency: 'high',
          created_at: '2024-01-14T10:00:00Z'
        },
        {
          id: 4,
          user_name: 'Emily Davis',
          user_email: 'emily@university.edu',
          counselor_name: 'Dr. Lisa Garcia',
          counselor_specialization: 'Relationship Counseling',
          preferred_datetime: '2024-01-17T11:00:00Z',
          status: 'cancelled',
          issue_description: 'Relationship issues with roommate',
          urgency: 'medium',
          created_at: '2024-01-15T14:20:00Z'
        }
      ];
      setAppointments(mockAppointments);
      calculateStats(mockAppointments);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCounselors = async () => {
    try {
      const axios = getAuthenticatedAxios();
      const response = await axios.get('/api/admin/counselors');
      setCounselors(response.data);
    } catch (error) {
      console.error('Error fetching counselors:', error);
      // Mock data for development
      setCounselors([
        { id: 1, name: 'Dr. Sarah Wilson', specialization: 'Anxiety & Depression' },
        { id: 2, name: 'Dr. Michael Brown', specialization: 'Academic Counseling' },
        { id: 3, name: 'Dr. Lisa Garcia', specialization: 'Relationship Counseling' }
      ]);
    }
  };

  const calculateStats = (appointmentData) => {
    const stats = appointmentData.reduce((acc, appointment) => {
      acc.total++;
      acc[appointment.status]++;
      return acc;
    }, { total: 0, pending: 0, confirmed: 0, completed: 0, cancelled: 0 });
    
    setStats(stats);
  };

  const applyFilters = () => {
    let filtered = [...appointments];

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(apt => apt.status === filters.status);
    }

    // Counselor filter
    if (filters.counselor !== 'all') {
      filtered = filtered.filter(apt => apt.counselor_name === filters.counselor);
    }

    // Date range filter
    const now = new Date();
    const dateThreshold = new Date();
    switch (filters.dateRange) {
      case '7d':
        dateThreshold.setDate(now.getDate() - 7);
        break;
      case '30d':
        dateThreshold.setDate(now.getDate() - 30);
        break;
      case '90d':
        dateThreshold.setDate(now.getDate() - 90);
        break;
      default:
        dateThreshold.setFullYear(now.getFullYear() - 1);
    }
    filtered = filtered.filter(apt => new Date(apt.created_at) >= dateThreshold);

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(apt => 
        apt.user_name.toLowerCase().includes(searchLower) ||
        apt.counselor_name.toLowerCase().includes(searchLower) ||
        apt.issue_description.toLowerCase().includes(searchLower)
      );
    }

    setFilteredAppointments(filtered);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
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

  const exportAppointments = async () => {
    try {
      const axios = getAuthenticatedAxios();
      const response = await axios.get('/api/admin/appointments/export', {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `appointments-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting appointments:', error);
      alert('Failed to export appointments');
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
          <h1 className="text-3xl font-bold text-gray-900">Appointment Tracking</h1>
          <p className="text-gray-600 mt-2">Monitor and manage counselor appointments</p>
        </div>
        
        <button
          onClick={exportAppointments}
          className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          <Download className="h-4 w-4 mr-2" />
          Export Data
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="card">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-sm text-gray-600">Total</p>
          </div>
        </div>
        <div className="card">
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            <p className="text-sm text-gray-600">Pending</p>
          </div>
        </div>
        <div className="card">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.confirmed}</p>
            <p className="text-sm text-gray-600">Confirmed</p>
          </div>
        </div>
        <div className="card">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
            <p className="text-sm text-gray-600">Completed</p>
          </div>
        </div>
        <div className="card">
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
            <p className="text-sm text-gray-600">Cancelled</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Filter className="h-4 w-4 inline mr-1" />
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="h-4 w-4 inline mr-1" />
              Counselor
            </label>
            <select
              value={filters.counselor}
              onChange={(e) => setFilters({...filters, counselor: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Counselors</option>
              {counselors.map(counselor => (
                <option key={counselor.id} value={counselor.name}>{counselor.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="h-4 w-4 inline mr-1" />
              Date Range
            </label>
            <select
              value={filters.dateRange}
              onChange={(e) => setFilters({...filters, dateRange: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 3 months</option>
              <option value="1y">Last year</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Search className="h-4 w-4 inline mr-1" />
              Search
            </label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
              placeholder="Search appointments..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Appointments List */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Appointments ({filteredAppointments.length})
        </h2>

        {filteredAppointments.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No appointments found matching your criteria.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Counselor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Issue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Urgency
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAppointments.map((appointment) => (
                  <tr key={appointment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{appointment.user_name}</div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          {appointment.user_email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{appointment.counselor_name}</div>
                        <div className="text-sm text-gray-500">{appointment.counselor_specialization}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(appointment.preferred_datetime).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {new Date(appointment.preferred_datetime).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate" title={appointment.issue_description}>
                        {appointment.issue_description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
                        {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getUrgencyColor(appointment.urgency)}`}>
                        {appointment.urgency.charAt(0).toUpperCase() + appointment.urgency.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentTracking;
