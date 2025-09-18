import React, { useState, useEffect } from 'react';
import { TrendingUp, Calendar, Heart, Battery, Moon, Sun, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const MoodTracker = () => {
  const { getAuthenticatedAxios } = useAuth();
  const [moodData, setMoodData] = useState({
    mood_score: 5,
    energy_level: 5,
    stress_level: 5,
    sleep_hours: 8,
    notes: ''
  });
  const [moodHistory, setMoodHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchMoodHistory();
  }, []);

  const fetchMoodHistory = async () => {
    try {
      const axios = getAuthenticatedAxios();
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/mood/`);
      setMoodHistory(response.data);
    } catch (error) {
      console.error('Error fetching mood history:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const axios = getAuthenticatedAxios();
      await axios.post(`${process.env.REACT_APP_API_URL}/api/mood/`, moodData);
      
      // Reset form and refresh history
      setMoodData({
        mood_score: 5,
        energy_level: 5,
        stress_level: 5,
        sleep_hours: 8,
        notes: ''
      });
      fetchMoodHistory();
      
      alert('Mood entry saved successfully!');
    } catch (error) {
      console.error('Error saving mood entry:', error);
      console.error('Error details:', error.response?.data);
      alert('Failed to save mood entry: ' + (error.response?.data?.detail || error.message));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEntry = async (entryId) => {
    if (!window.confirm('Are you sure you want to delete this mood entry?')) {
      return;
    }

    try {
      const axios = getAuthenticatedAxios();
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/mood/${entryId}`);
      
      // Refresh history after deletion
      fetchMoodHistory();
      alert('Mood entry deleted successfully!');
    } catch (error) {
      console.error('Error deleting mood entry:', error);
      alert('Failed to delete mood entry: ' + (error.response?.data?.detail || error.message));
    }
  };

  const getMoodEmoji = (score) => {
    if (score <= 2) return '😢';
    if (score <= 4) return '😕';
    if (score <= 6) return '😐';
    if (score <= 8) return '🙂';
    return '😊';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Mood Tracker</h1>
        <p className="text-gray-600">Track your daily mood and mental wellness</p>
      </div>

      {/* Today's Mood Entry */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <Heart className="h-5 w-5 text-red-500 mr-2" />
          How are you feeling today?
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Mood Score */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Overall Mood {getMoodEmoji(moodData.mood_score)}
            </label>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Very Sad</span>
              <input
                type="range"
                min="1"
                max="10"
                value={moodData.mood_score}
                onChange={(e) => setMoodData({...moodData, mood_score: parseInt(e.target.value)})}
                className="flex-1"
              />
              <span className="text-sm text-gray-500">Very Happy</span>
              <span className="text-sm font-medium text-gray-900 w-8">{moodData.mood_score}</span>
            </div>
          </div>

          {/* Energy Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Battery className="h-4 w-4 mr-1" />
              Energy Level
            </label>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Very Low</span>
              <input
                type="range"
                min="1"
                max="10"
                value={moodData.energy_level}
                onChange={(e) => setMoodData({...moodData, energy_level: parseInt(e.target.value)})}
                className="flex-1"
              />
              <span className="text-sm text-gray-500">Very High</span>
              <span className="text-sm font-medium text-gray-900 w-8">{moodData.energy_level}</span>
            </div>
          </div>

          {/* Stress Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <TrendingUp className="h-4 w-4 mr-1" />
              Stress Level
            </label>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Very Low</span>
              <input
                type="range"
                min="1"
                max="10"
                value={moodData.stress_level}
                onChange={(e) => setMoodData({...moodData, stress_level: parseInt(e.target.value)})}
                className="flex-1"
              />
              <span className="text-sm text-gray-500">Very High</span>
              <span className="text-sm font-medium text-gray-900 w-8">{moodData.stress_level}</span>
            </div>
          </div>

          {/* Sleep Hours */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Moon className="h-4 w-4 mr-1" />
              Sleep Hours
            </label>
            <input
              type="number"
              min="0"
              max="24"
              step="0.5"
              value={moodData.sleep_hours}
              onChange={(e) => setMoodData({...moodData, sleep_hours: parseFloat(e.target.value)})}
              className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <span className="ml-2 text-sm text-gray-500">hours</span>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={moodData.notes}
              onChange={(e) => setMoodData({...moodData, notes: e.target.value})}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="How was your day? Any specific thoughts or events?"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Saving...' : 'Save Mood Entry'}
          </button>
        </form>
      </div>

      {/* Mood History */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <Calendar className="h-5 w-5 text-blue-500 mr-2" />
          Recent Mood History
        </h2>

        {moodHistory.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No mood entries yet. Start tracking your mood today!</p>
        ) : (
          <div className="space-y-4">
            {moodHistory.slice(0, 7).map((entry, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <span className="text-2xl">{getMoodEmoji(entry.mood_score)}</span>
                  <div>
                    <p className="font-medium text-gray-900">
                      {new Date(entry.date).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-600">
                      Mood: {entry.mood_score}/10 • Energy: {entry.energy_level}/10 • Stress: {entry.stress_level}/10
                    </p>
                    {entry.notes && (
                      <p className="text-sm text-gray-500 mt-1">{entry.notes}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-right text-sm text-gray-500">
                    <p>{entry.sleep_hours}h sleep</p>
                  </div>
                  <button
                    onClick={() => handleDeleteEntry(entry.id)}
                    className="text-red-500 hover:text-red-700 p-1 rounded-md hover:bg-red-50 transition-colors"
                    title="Delete entry"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MoodTracker;
