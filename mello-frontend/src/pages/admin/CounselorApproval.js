import React, { useState, useEffect } from 'react';
import { UserCheck, UserX, Eye, Phone, Mail, MapPin, Award } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const CounselorApproval = () => {
  const { getAuthenticatedAxios } = useAuth();
  const [pendingCounselors, setPendingCounselors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPendingCounselors();
  }, []);

  const fetchPendingCounselors = async () => {
    try {
      const axios = getAuthenticatedAxios();
      const response = await axios.get('/api/admin/counselors/pending');
      setPendingCounselors(response.data);
    } catch (error) {
      console.error('Error fetching pending counselors:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproval = async (counselorId, status) => {
    try {
      const axios = getAuthenticatedAxios();
      await axios.put('/api/admin/counselors/approve', {
        counselor_id: counselorId,
        status: status
      });
      
      // Remove from pending list
      setPendingCounselors(prev => prev.filter(c => c.id !== counselorId));
      
      alert(`Counselor ${status === 'APPROVED' ? 'approved' : 'rejected'} successfully!`);
    } catch (error) {
      console.error('Error updating counselor status:', error);
      alert('Failed to update counselor status');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          {[1, 2, 3].map(i => (
            <div key={i} className="card">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Counselor Approval</h1>
          <p className="text-gray-600 mt-2">Review and approve counselor applications</p>
        </div>
        <div className="bg-blue-50 px-4 py-2 rounded-lg">
          <span className="text-blue-800 font-medium">{pendingCounselors.length} Pending</span>
        </div>
      </div>

      {pendingCounselors.length === 0 ? (
        <div className="card text-center py-12">
          <UserCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No pending applications</h3>
          <p className="text-gray-600">All counselor applications have been reviewed.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {pendingCounselors.map((counselor) => (
            <div key={counselor.id} className="card">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-600 font-semibold text-xl">
                      {counselor.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{counselor.name}</h3>
                    <p className="text-gray-600">Specialization: {counselor.specialization}</p>
                    <p className="text-sm text-gray-500">Applied: {new Date(counselor.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                  Pending Review
                </span>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-3">
                  <div className="flex items-center text-gray-600">
                    <Mail className="h-4 w-4 mr-2" />
                    {counselor.email}
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    {counselor.phone_number}
                  </div>
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    {counselor.address}
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center text-gray-600">
                    <Award className="h-4 w-4 mr-2" />
                    License: {counselor.license_number}
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Eye className="h-4 w-4 mr-2" />
                    Specialization: {counselor.specialization}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleApproval(counselor.id, 'REJECTED')}
                  className="flex items-center px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50"
                >
                  <UserX className="h-4 w-4 mr-2" />
                  Reject
                </button>
                <button
                  onClick={() => handleApproval(counselor.id, 'APPROVED')}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <UserCheck className="h-4 w-4 mr-2" />
                  Approve
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CounselorApproval;
