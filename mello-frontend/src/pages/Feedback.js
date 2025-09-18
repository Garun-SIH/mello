import React, { useState, useEffect } from 'react';
import { Star, Send, CheckCircle, User, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Feedback = () => {
  const { getAuthenticatedAxios } = useAuth();
  const [counselors, setCounselors] = useState([]);
  const [selectedCounselor, setSelectedCounselor] = useState('');
  const [feedbackData, setFeedbackData] = useState({
    rating: 5,
    feedback_text: '',
    helpful_aspects: [],
    improvement_suggestions: [],
    would_recommend: true,
    session_date: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [myFeedback, setMyFeedback] = useState([]);

  const helpfulAspectOptions = [
    'Active listening',
    'Practical advice',
    'Empathetic approach',
    'Professional knowledge',
    'Patient approach',
    'Clear communication',
    'Supportive environment',
    'Problem-solving techniques'
  ];

  const improvementOptions = [
    'More time for discussion',
    'Better scheduling flexibility',
    'Follow-up sessions',
    'Additional resources',
    'Different communication style',
    'More interactive approach'
  ];

  useEffect(() => {
    fetchCounselors();
    fetchMyFeedback();
  }, []);

  const fetchCounselors = async () => {
    try {
      const axios = getAuthenticatedAxios();
      const response = await axios.get('/api/counselor/list');
      setCounselors(response.data);
    } catch (error) {
      console.error('Error fetching counselors:', error);
    }
  };

  const fetchMyFeedback = async () => {
    try {
      const axios = getAuthenticatedAxios();
      const response = await axios.get('/api/feedback/my-feedback');
      setMyFeedback(response.data);
    } catch (error) {
      console.error('Error fetching feedback:', error);
    }
  };

  const handleRatingClick = (rating) => {
    setFeedbackData({ ...feedbackData, rating });
  };

  const handleAspectToggle = (aspect) => {
    const aspects = feedbackData.helpful_aspects.includes(aspect)
      ? feedbackData.helpful_aspects.filter(a => a !== aspect)
      : [...feedbackData.helpful_aspects, aspect];
    setFeedbackData({ ...feedbackData, helpful_aspects: aspects });
  };

  const handleImprovementToggle = (improvement) => {
    const improvements = feedbackData.improvement_suggestions.includes(improvement)
      ? feedbackData.improvement_suggestions.filter(i => i !== improvement)
      : [...feedbackData.improvement_suggestions, improvement];
    setFeedbackData({ ...feedbackData, improvement_suggestions: improvements });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCounselor) {
      alert('Please select a counselor');
      return;
    }

    setIsLoading(true);
    try {
      const axios = getAuthenticatedAxios();
      await axios.post('/api/feedback/', {
        counselor_id: parseInt(selectedCounselor),
        feedback_type: 'counselor',
        ...feedbackData
      });

      setIsSubmitted(true);
      // Reset form
      setFeedbackData({
        rating: 5,
        feedback_text: '',
        helpful_aspects: [],
        improvement_suggestions: [],
        would_recommend: true,
        session_date: ''
      });
      setSelectedCounselor('');
      fetchMyFeedback();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Failed to submit feedback. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <div className="card">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h2>
          <p className="text-gray-600 mb-6">
            Your feedback has been submitted successfully. It helps us improve our services.
          </p>
          <button
            onClick={() => setIsSubmitted(false)}
            className="btn-primary"
          >
            Submit Another Feedback
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Give Feedback</h1>
        <p className="text-gray-600">Help us improve by sharing your experience with our counselors</p>
      </div>

      {/* Feedback Form */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Submit New Feedback</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Counselor Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Counselor *
            </label>
            <select
              value={selectedCounselor}
              onChange={(e) => setSelectedCounselor(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            >
              <option value="">Choose a counselor...</option>
              {counselors.map((counselor) => (
                <option key={counselor.id} value={counselor.id}>
                  {counselor.name} - {counselor.specialization}
                </option>
              ))}
            </select>
          </div>

          {/* Session Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Session Date
            </label>
            <input
              type="date"
              value={feedbackData.session_date}
              onChange={(e) => setFeedbackData({ ...feedbackData, session_date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Overall Rating *
            </label>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleRatingClick(star)}
                  className={`p-1 ${star <= feedbackData.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                >
                  <Star className="h-8 w-8 fill-current" />
                </button>
              ))}
              <span className="ml-2 text-sm text-gray-600">({feedbackData.rating}/5)</span>
            </div>
          </div>

          {/* Feedback Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Feedback *
            </label>
            <textarea
              value={feedbackData.feedback_text}
              onChange={(e) => setFeedbackData({ ...feedbackData, feedback_text: e.target.value })}
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Share your experience with the counselor..."
              required
            />
          </div>

          {/* Helpful Aspects */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What was most helpful? (Select all that apply)
            </label>
            <div className="grid grid-cols-2 gap-2">
              {helpfulAspectOptions.map((aspect) => (
                <label key={aspect} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={feedbackData.helpful_aspects.includes(aspect)}
                    onChange={() => handleAspectToggle(aspect)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700">{aspect}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Improvement Suggestions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Areas for improvement (Optional)
            </label>
            <div className="grid grid-cols-2 gap-2">
              {improvementOptions.map((improvement) => (
                <label key={improvement} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={feedbackData.improvement_suggestions.includes(improvement)}
                    onChange={() => handleImprovementToggle(improvement)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700">{improvement}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Would Recommend */}
          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={feedbackData.would_recommend}
                onChange={(e) => setFeedbackData({ ...feedbackData, would_recommend: e.target.checked })}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">I would recommend this counselor to others</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <Send className="h-4 w-4" />
            <span>{isLoading ? 'Submitting...' : 'Submit Feedback'}</span>
          </button>
        </form>
      </div>

      {/* My Previous Feedback */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">My Previous Feedback</h2>
        
        {myFeedback.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No feedback submitted yet.</p>
        ) : (
          <div className="space-y-4">
            {myFeedback.map((feedback, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="font-medium text-gray-900">{feedback.counselor_name}</span>
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${star <= feedback.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(feedback.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <p className="text-gray-700 text-sm">{feedback.feedback_text}</p>
                {feedback.helpful_aspects && feedback.helpful_aspects.length > 0 && (
                  <div className="mt-2">
                    <span className="text-xs text-gray-500">Helpful aspects: </span>
                    <span className="text-xs text-gray-700">{feedback.helpful_aspects.join(', ')}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Feedback;
