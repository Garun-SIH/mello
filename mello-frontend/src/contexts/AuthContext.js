import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { auth } from '../firebase';
import axios from 'axios';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Register user with Firebase and backend
  async function register(email, password, userData, role) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Get Firebase ID token
      const idToken = await user.getIdToken();
      
      // Register with backend based on role
      const registrationData = {
        firebase_uid: user.uid,
        email: user.email,
        ...userData
      };
      
      let endpoint;
      switch (role) {
        case 'user':
          endpoint = '/api/auth/register/user';
          break;
        case 'counselor':
          endpoint = '/api/auth/register/counselor';
          break;
        case 'admin':
          endpoint = '/api/auth/register/admin';
          break;
        default:
          throw new Error('Invalid role');
      }
      
      await axios.post(`${process.env.REACT_APP_API_URL}${endpoint}`, registrationData, {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });
      
      return user;
    } catch (error) {
      throw error;
    }
  }

  // Login user
  async function login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      throw error;
    }
  }

  // Logout user
  async function logout() {
    try {
      await signOut(auth);
      setUserProfile(null);
    } catch (error) {
      throw error;
    }
  }

  // Get user profile from backend
  const fetchUserProfile = useCallback(async () => {
    try {
      if (currentUser) {
        console.log('Current user:', currentUser.uid, currentUser.email);
        const idToken = await currentUser.getIdToken();
        console.log('Fetching profile from:', `${process.env.REACT_APP_API_URL}/api/auth/profile`);
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/auth/profile`, {
          headers: {
            'Authorization': `Bearer ${idToken}`
          }
        });
        console.log('Profile response:', response.data);
        setUserProfile(response.data);
        return response.data;
      } else {
        console.log('No current user found');
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      console.error('Error details:', error.response?.data);
      if (error.response?.status === 404) {
        // User exists in Firebase but not in backend - needs registration
        setUserProfile({ needsRegistration: true });
        return { needsRegistration: true };
      }
      return null;
    }
  }, [currentUser]);

  // Update user profile
  async function updateProfile(profileData) {
    try {
      if (currentUser) {
        const idToken = await currentUser.getIdToken();
        await axios.put(`${process.env.REACT_APP_API_URL}/api/auth/profile`, profileData, {
          headers: {
            'Authorization': `Bearer ${idToken}`
          }
        });
        await fetchUserProfile(); // Refresh profile
      }
    } catch (error) {
      throw error;
    }
  }

  // Get authenticated axios instance
  function getAuthenticatedAxios() {
    const instance = axios.create({
      baseURL: process.env.REACT_APP_API_URL
    });

    instance.interceptors.request.use(async (config) => {
      if (currentUser) {
        const token = await currentUser.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    return instance;
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('Auth state changed:', user?.email);
      setCurrentUser(user);
      if (user) {
        // Add a small delay to allow backend registration to complete
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        let retryCount = 0;
        const maxRetries = 3;
        
        while (retryCount < maxRetries) {
          try {
            const idToken = await user.getIdToken();
            console.log(`Fetching profile for user (attempt ${retryCount + 1}):`, user.email);
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/auth/profile`, {
              headers: {
                'Authorization': `Bearer ${idToken}`
              }
            });
            console.log('Profile fetched successfully:', response.data);
            setUserProfile(response.data);
            break; // Success, exit retry loop
          } catch (error) {
            console.error(`Failed to fetch user profile (attempt ${retryCount + 1}):`, error);
            retryCount++;
            
            if (retryCount >= maxRetries) {
              console.error('Error status:', error.response?.status);
              console.error('Error data:', error.response?.data);
              
              if (error.response?.status === 404 || error.response?.status === 401) {
                // User exists in Firebase but not in backend - needs registration
                console.log('User needs registration, redirecting...');
                setUserProfile({ needsRegistration: true });
              } else if (error.code === 'NETWORK_ERROR' || !error.response || error.message.includes('Network Error')) {
                // Backend might be down
                console.log('Backend connection error, checking server...');
                try {
                  // Try to ping the backend health endpoint
                  await axios.get(`${process.env.REACT_APP_API_URL}/health`, { timeout: 5000 });
                  // If health check passes but profile fails, user needs registration
                  setUserProfile({ needsRegistration: true });
                } catch (healthError) {
                  console.log('Backend server is not responding');
                  setUserProfile({ backendError: true });
                }
              } else {
                setUserProfile(null);
              }
            } else {
              // Wait before retrying
              await new Promise(resolve => setTimeout(resolve, 1500));
            }
          }
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userProfile,
    register,
    login,
    logout,
    fetchUserProfile,
    updateProfile,
    getAuthenticatedAxios
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
