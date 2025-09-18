import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, CheckCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';

const Booking = () => {
  const [counselors, setCounselors] = useState([]);
  const [selectedCounselor, setSelectedCounselor] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [studentId] = useState(() => `student_${Math.random().toString(36).substr(2, 9)}`);
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCounselors();
  }, []);

  const fetchCounselors = async () => {
    try {
      const response = await axios.get('/api/counselors');
      setCounselors(response.data);
    } catch (error) {
      console.error('Error fetching counselors:', error);
      setError('Failed to load counselors. Please try again.');
    }
  };

  const fetchAvailableSlots = async (counselorId) => {
    try {
      const response = await axios.get(`/api/counselors/${counselorId}/available-slots`);
      setAvailableSlots(response.data.available_slots);
    } catch (error) {
      console.error('Error fetching slots:', error);
      setError('Failed to load available slots. Please try again.');
    }
  };

  const handleCounselorSelect = (counselor) => {
    setSelectedCounselor(counselor);
    setSelectedSlot(null);
    fetchAvailableSlots(counselor.id);
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!selectedCounselor || !selectedSlot) return;

    setIsLoading(true);
    setError('');

    try {
      await axios.post('/api/book', {
        student_id: studentId,
        counselor_id: selectedCounselor.id,
        slot: selectedSlot,
        notes: notes
      });

      setBookingSuccess(true);
      setSelectedCounselor(null);
      setSelectedSlot(null);
      setNotes('');
    } catch (error) {
      console.error('Error creating booking:', error);
      setError('Failed to create booking. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  if (bookingSuccess) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Booking Confirmed!</h2>
          <p className="text-gray-600 mb-6">
            Your counseling session has been successfully booked. You'll receive a confirmation email shortly.
          </p>
          <button
            onClick={() => setBookingSuccess(false)}
            className="btn-primary"
          >
            Book Another Session
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Book a Counseling Session</h1>
        <p className="text-gray-600">
          Schedule a confidential session with one of our professional counselors. 
          All sessions are private and designed to support your mental wellness journey.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Counselor Selection */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Choose a Counselor</h2>
          <div className="space-y-4">
            {counselors.map((counselor) => (
              <div
                key={counselor.id}
                onClick={() => handleCounselorSelect(counselor)}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedCounselor?.id === counselor.id
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-primary-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{counselor.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{counselor.specialization}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Slot Selection and Booking */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Time Slot</h2>
          
          {!selectedCounselor ? (
            <p className="text-gray-500 text-center py-8">
              Please select a counselor first to view available time slots.
            </p>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto">
                {availableSlots.map((slot, index) => {
                  const { date, time } = formatDateTime(slot);
                  return (
                    <button
                      key={index}
                      onClick={() => setSelectedSlot(slot)}
                      className={`p-3 text-left border rounded-lg transition-colors ${
                        selectedSlot === slot
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">{date}</span>
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span>{time}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {selectedSlot && (
                <form onSubmit={handleBooking} className="space-y-4 pt-4 border-t">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Additional Notes (Optional)
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Any specific concerns or topics you'd like to discuss..."
                      className="input-field h-20 resize-none"
                    />
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-2">Booking Summary</h3>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><strong>Counselor:</strong> {selectedCounselor.name}</p>
                      <p><strong>Date & Time:</strong> {formatDateTime(selectedSlot).date} at {formatDateTime(selectedSlot).time}</p>
                      <p><strong>Duration:</strong> 50 minutes</p>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-primary w-full disabled:opacity-50"
                  >
                    {isLoading ? 'Booking...' : 'Confirm Booking'}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Information Section */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-medium text-blue-800 mb-3">What to Expect</h3>
        <ul className="text-blue-700 text-sm space-y-2">
          <li>• Sessions are 50 minutes long and completely confidential</li>
          <li>• You'll receive a confirmation email with session details</li>
          <li>• Sessions can be conducted via video call or phone</li>
          <li>• You can reschedule or cancel up to 24 hours before your session</li>
          <li>• All our counselors are licensed professionals</li>
        </ul>
      </div>
    </div>
  );
};

export default Booking;
