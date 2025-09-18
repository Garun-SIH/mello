import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, TrendingUp, Users, Filter, Search, Eye, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const PatientFeedback = () => {
  const { getAuthenticatedAxios } = useAuth();
  const [feedback, setFeedback] = useState([]);
  const [filteredFeedback, setFilteredFeedback] = useState([]);
  const [stats, setStats] = useState({
    totalFeedback: 0,
    averageRating: 0,
    positiveRate: 0,
    responseRate: 0
  });
  const [filters, setFilters] = useState({
    rating: 'all',
    timeRange: '30d',
    search: ''
  });
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchFeedback();
    fetchStats();
  }, [filters.timeRange]);

  useEffect(() => {
    applyFilters();
  }, [feedback, filters]);

  const fetchFeedback = async () => {
    try {
      const axios = getAuthenticatedAxios();
      const response = await axios.get(`/api/counselor/feedback?range=${filters.timeRange}`);
      setFeedback(response.data);
    } catch (error) {
      console.error('Error fetching feedback:', error);
      // Mock data for development
      const mockFeedback = [
        {
          id: 1,
          patient_name: 'John D.',
          session_date: '2024-01-15T10:30:00Z',
          rating: 5,
          feedback_text: 'Dr. Wilson was incredibly helpful and understanding. I felt heard and supported throughout our session.',
          helpful_aspects: ['Active listening', 'Practical advice', 'Empathetic approach'],
          improvement_suggestions: [],
          would_recommend: true,
          created_at: '2024-01-15T11:00:00Z'
        },
        {
          id: 2,
          patient_name: 'Sarah M.',
          session_date: '2024-01-14T14:20:00Z',
          rating: 4,
          feedback_text: 'Good session overall. The techniques shared were useful, though I would have liked more time to discuss specific situations.',
          helpful_aspects: ['Coping strategies', 'Professional knowledge'],
          improvement_suggestions: ['More time for discussion', 'More specific examples'],
          would_recommend: true,
          created_at: '2024-01-14T15:00:00Z'
        },
        {
          id: 3,
          patient_name: 'Alex K.',
          session_date: '2024-01-13T16:45:00Z',
          rating: 5,
          feedback_text: 'Excellent counselor! Really helped me understand my anxiety patterns and gave me practical tools to manage them.',
          helpful_aspects: ['Clear explanations', 'Practical tools', 'Patient approach'],
          improvement_suggestions: [],
          would_recommend: true,
          created_at: '2024-01-13T17:15:00Z'
        },
        {
          id: 4,
          patient_name: 'Emily R.',
          session_date: '2024-01-12T11:15:00Z',
          rating: 3,
          feedback_text: 'The session was okay. Some helpful insights but felt a bit rushed. Would appreciate more personalized approach.',
          helpful_aspects: ['Professional knowledge'],
          improvement_suggestions: ['More time per session', 'More personalized approach', 'Better pacing'],
          would_recommend: false,
          created_at: '2024-01-12T12:00:00Z'
        },
        {
          id: 5,
          patient_name: 'Mike T.',
          session_date: '2024-01-11T09:30:00Z',
          rating: 5,
          feedback_text: 'Outstanding session! Dr. Wilson created a safe space where I could open up about my struggles. The homework exercises are really helping.',
          helpful_aspects: ['Safe environment', 'Homework exercises', 'Non-judgmental attitude'],
          improvement_suggestions: [],
          would_recommend: true,
          created_at: '2024-01-11T10:15:00Z'
        }
      ];
      setFeedback(mockFeedback);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const axios = getAuthenticatedAxios();
      const response = await axios.get(`/api/counselor/feedback-stats?range=${filters.timeRange}`);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Mock data for development
      setStats({
        totalFeedback: 28,
        averageRating: 4.3,
        positiveRate: 85.7,
        responseRate: 76.2
      });
    }
  };

  const applyFilters = () => {
    let filtered = [...feedback];

    // Rating filter
    if (filters.rating !== 'all') {
      const ratingValue = parseInt(filters.rating);
      filtered = filtered.filter(item => item.rating === ratingValue);
    }

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(item => 
        item.patient_name.toLowerCase().includes(searchLower) ||
        item.feedback_text.toLowerCase().includes(searchLower) ||
        item.helpful_aspects.some(aspect => aspect.toLowerCase().includes(searchLower)) ||
        item.improvement_suggestions.some(suggestion => suggestion.toLowerCase().includes(searchLower))
      );
    }

    setFilteredFeedback(filtered);
  };

  const getRatingColor = (rating) => {
    if (rating >= 4) return 'text-green-600';
    if (rating >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${
          index < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
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
          <h1 className="text-3xl font-bold text-gray-900">Patient Feedback</h1>
          <p className="text-gray-600 mt-2">Review feedback from your counseling sessions</p>
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <MessageSquare className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Feedback</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalFeedback}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Star className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Average Rating</p>
              <p className="text-2xl font-bold text-gray-900">{stats.averageRating}/5</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <ThumbsUp className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Positive Rate</p>
              <p className="text-2xl font-bold text-green-600">{stats.positiveRate}%</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Response Rate</p>
              <p className="text-2xl font-bold text-gray-900">{stats.responseRate}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Recent Feedback</h2>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={filters.rating}
                onChange={(e) => setFilters({...filters, rating: e.target.value})}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search feedback..."
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Feedback List */}
      <div className="space-y-6">
        {filteredFeedback.length === 0 ? (
          <div className="card">
            <p className="text-gray-500 text-center py-8">No feedback found matching your criteria.</p>
          </div>
        ) : (
          filteredFeedback.map((item) => (
            <div key={item.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-3">
                    <h3 className="text-lg font-medium text-gray-900">{item.patient_name}</h3>
                    <div className="flex items-center space-x-1">
                      {renderStars(item.rating)}
                      <span className={`ml-2 text-sm font-medium ${getRatingColor(item.rating)}`}>
                        {item.rating}/5
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {item.would_recommend ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                          <ThumbsUp className="h-3 w-3 mr-1" />
                          Recommends
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
                          <ThumbsDown className="h-3 w-3 mr-1" />
                          Doesn't Recommend
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-4">{item.feedback_text}</p>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    {item.helpful_aspects.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">What was helpful:</h4>
                        <ul className="space-y-1">
                          {item.helpful_aspects.map((aspect, index) => (
                            <li key={index} className="text-sm text-green-700 flex items-center">
                              <ThumbsUp className="h-3 w-3 mr-2" />
                              {aspect}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {item.improvement_suggestions.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Suggestions for improvement:</h4>
                        <ul className="space-y-1">
                          {item.improvement_suggestions.map((suggestion, index) => (
                            <li key={index} className="text-sm text-orange-700 flex items-center">
                              <TrendingUp className="h-3 w-3 mr-2" />
                              {suggestion}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="ml-4 text-right">
                  <p className="text-sm text-gray-500">
                    Session: {new Date(item.session_date).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-500">
                    Feedback: {new Date(item.created_at).toLocaleDateString()}
                  </p>
                  <button
                    onClick={() => setSelectedFeedback(item)}
                    className="mt-2 p-2 text-primary-600 hover:bg-primary-50 rounded"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Feedback Detail Modal */}
      {selectedFeedback && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Detailed Feedback</h3>
                <button
                  onClick={() => setSelectedFeedback(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">{selectedFeedback.patient_name}</h4>
                    <p className="text-sm text-gray-500">
                      Session: {new Date(selectedFeedback.session_date).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-1">
                    {renderStars(selectedFeedback.rating)}
                    <span className={`ml-2 text-sm font-medium ${getRatingColor(selectedFeedback.rating)}`}>
                      {selectedFeedback.rating}/5
                    </span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Feedback</label>
                  <p className="text-sm text-gray-900 mt-1">{selectedFeedback.feedback_text}</p>
                </div>
                
                {selectedFeedback.helpful_aspects.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Helpful Aspects</label>
                    <ul className="mt-1 space-y-1">
                      {selectedFeedback.helpful_aspects.map((aspect, index) => (
                        <li key={index} className="text-sm text-gray-900 flex items-center">
                          <ThumbsUp className="h-3 w-3 mr-2 text-green-600" />
                          {aspect}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {selectedFeedback.improvement_suggestions.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Improvement Suggestions</label>
                    <ul className="mt-1 space-y-1">
                      {selectedFeedback.improvement_suggestions.map((suggestion, index) => (
                        <li key={index} className="text-sm text-gray-900 flex items-center">
                          <TrendingUp className="h-3 w-3 mr-2 text-orange-600" />
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Would recommend: </span>
                    {selectedFeedback.would_recommend ? (
                      <span className="text-green-600">Yes</span>
                    ) : (
                      <span className="text-red-600">No</span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">
                    Submitted: {new Date(selectedFeedback.created_at).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientFeedback;
