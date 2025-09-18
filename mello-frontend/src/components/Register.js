import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Mail, Lock, User, GraduationCap, Phone, MapPin, FileText } from 'lucide-react';
import axios from 'axios';

export default function Register() {
  const { currentUser, userProfile } = useAuth();
  const [isCompletingRegistration, setIsCompletingRegistration] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    role: 'user'
  });

  useEffect(() => {
    // Check if user is already authenticated but needs to complete registration
    if (currentUser && userProfile?.needsRegistration) {
      setIsCompletingRegistration(true);
      setFormData(prev => ({
        ...prev,
        email: currentUser.email || '',
        name: currentUser.displayName || ''
      }));
    }
  }, [currentUser, userProfile]);
  
  // User-specific fields
  const [userFields, setUserFields] = useState({
    age: '',
    university: '',
    preferred_language: 'en'
  });
  
  // Counselor-specific fields
  const [counselorFields, setCounselorFields] = useState({
    specialization: '',
    license_number: '',
    phone_number: '',
    address: ''
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  function handleInputChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }

  function handleUserFieldChange(e) {
    const { name, value } = e.target;
    setUserFields(prev => ({
      ...prev,
      [name]: value
    }));
  }

  function handleCounselorFieldChange(e) {
    const { name, value } = e.target;
    setCounselorFields(prev => ({
      ...prev,
      [name]: value
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!isCompletingRegistration) {
      if (formData.password !== formData.confirmPassword) {
        return setError('Passwords do not match');
      }

      if (formData.password.length < 6) {
        return setError('Password must be at least 6 characters');
      }
    }

    try {
      setError('');
      setLoading(true);
      
      let userData = {};
      
      if (formData.role === 'user') {
        userData = {
          name: formData.name,
          age: parseInt(userFields.age),
          university: userFields.university,
          preferred_language: userFields.preferred_language
        };
      } else if (formData.role === 'counselor') {
        userData = {
          name: formData.name,
          specialization: counselorFields.specialization,
          license_number: counselorFields.license_number,
          phone_number: counselorFields.phone_number,
          address: counselorFields.address
        };
      }
      
      if (isCompletingRegistration) {
        // Complete registration for existing Firebase user
        const idToken = await currentUser.getIdToken();
        const registrationData = {
          firebase_uid: currentUser.uid,
          email: currentUser.email,
          ...userData
        };
        
        let endpoint;
        switch (formData.role) {
          case 'user':
            endpoint = '/api/auth/register/user';
            break;
          case 'counselor':
            endpoint = '/api/auth/register/counselor';
            break;
          default:
            throw new Error('Invalid role');
        }
        
        await axios.post(`${process.env.REACT_APP_API_URL}${endpoint}`, registrationData, {
          headers: {
            'Authorization': `Bearer ${idToken}`
          }
        });
      } else {
        // New user registration
        await register(formData.email, formData.password, userData, formData.role);
      }
      
      if (formData.role === 'counselor') {
        alert('Registration submitted! Your application will be reviewed by our admin team.');
      }
      
      navigate('/dashboard');
    } catch (error) {
      setError('Failed to create account: ' + error.message);
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
            <UserPlus className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isCompletingRegistration ? 'Complete Your Registration' : 'Join Mello'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {isCompletingRegistration 
              ? 'Please provide additional information to complete your account setup' 
              : 'Create your account to get started'
            }
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}
          
          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              I am registering as:
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, role: 'user' }))}
                className={`p-3 text-sm font-medium rounded-lg border-2 transition-colors ${
                  formData.role === 'user'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Student/User
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, role: 'counselor' }))}
                className={`p-3 text-sm font-medium rounded-lg border-2 transition-colors ${
                  formData.role === 'counselor'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Counselor
              </button>
            </div>
          </div>
          
          {/* Common Fields */}
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="appearance-none relative block w-full pl-10 pr-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            
            {!isCompletingRegistration && (
              <>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      className="appearance-none relative block w-full pl-10 pr-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required
                      className="appearance-none relative block w-full pl-10 pr-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Create a password"
                      value={formData.password}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    Confirm Password
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      required
                      className="appearance-none relative block w-full pl-10 pr-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </>
            )}
            
            {isCompletingRegistration && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-700 text-sm">
                  <strong>Email:</strong> {currentUser?.email}
                </p>
                <p className="text-blue-600 text-xs mt-1">
                  You're already signed in. Please complete your profile below.
                </p>
              </div>
            )}
          </div>

          {/* User-specific fields */}
          {formData.role === 'user' && (
            <div className="space-y-4 border-t pt-4">
              <h3 className="text-sm font-medium text-gray-700">Student Information</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="age" className="block text-sm font-medium text-gray-700">
                    Age
                  </label>
                  <input
                    id="age"
                    name="age"
                    type="number"
                    min="16"
                    max="100"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={userFields.age}
                    onChange={handleUserFieldChange}
                  />
                </div>
                
                <div>
                  <label htmlFor="preferred_language" className="block text-sm font-medium text-gray-700">
                    Language
                  </label>
                  <select
                    id="preferred_language"
                    name="preferred_language"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={userFields.preferred_language}
                    onChange={handleUserFieldChange}
                  >
                    <option value="en">English</option>
                    <option value="hi">Hindi</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label htmlFor="university" className="block text-sm font-medium text-gray-700">
                  University/College
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <GraduationCap className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="university"
                    name="university"
                    type="text"
                    required
                    className="appearance-none relative block w-full pl-10 pr-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Enter your university/college name"
                    value={userFields.university}
                    onChange={handleUserFieldChange}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Counselor-specific fields */}
          {formData.role === 'counselor' && (
            <div className="space-y-4 border-t pt-4">
              <h3 className="text-sm font-medium text-gray-700">Professional Information</h3>
              
              <div>
                <label htmlFor="specialization" className="block text-sm font-medium text-gray-700">
                  Specialization
                </label>
                <select
                  id="specialization"
                  name="specialization"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={counselorFields.specialization}
                  onChange={handleCounselorFieldChange}
                >
                  <option value="">Select specialization</option>
                  <option value="anxiety">Anxiety Disorders</option>
                  <option value="depression">Depression</option>
                  <option value="stress">Stress Management</option>
                  <option value="relationships">Relationship Counseling</option>
                  <option value="academic">Academic Stress</option>
                  <option value="general">General Counseling</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="license_number" className="block text-sm font-medium text-gray-700">
                  License Number
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FileText className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="license_number"
                    name="license_number"
                    type="text"
                    required
                    className="appearance-none relative block w-full pl-10 pr-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Enter your professional license number"
                    value={counselorFields.license_number}
                    onChange={handleCounselorFieldChange}
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="phone_number"
                    name="phone_number"
                    type="tel"
                    required
                    className="appearance-none relative block w-full pl-10 pr-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Enter your phone number"
                    value={counselorFields.phone_number}
                    onChange={handleCounselorFieldChange}
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                  Address
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-gray-400" />
                  </div>
                  <textarea
                    id="address"
                    name="address"
                    rows="2"
                    required
                    className="appearance-none relative block w-full pl-10 pr-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Enter your professional address"
                    value={counselorFields.address}
                    onChange={handleCounselorFieldChange}
                  />
                </div>
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                Sign in here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
