import { createContext, useState, useEffect } from 'react';
import { api, authAPI } from '../services/api';
import toast from 'react-hot-toast';
import PropTypes from 'prop-types';

const AuthContext = createContext(null);

export default AuthContext;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          setToken(storedToken);
          api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;

          // Fetch user profile
          const response = await authAPI.getProfile();
          setUser(response.data.data.user);
        } catch (error) {
          // Token is invalid, clear it
          localStorage.removeItem('token');
          delete api.defaults.headers.common['Authorization'];
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authAPI.login(email, password);

      const { token: newToken, user: userData } = response.data.data;

      // Store token in localStorage
      localStorage.setItem('token', newToken);

      // Set token in API headers
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

      // Update state
      setToken(newToken);
      setUser(userData);

      toast.success('Login successful! 🌱');
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Login failed';
      toast.error(errorMessage);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);

      const { token: newToken, user: newUser } = response.data.data;

      // Store token in localStorage
      localStorage.setItem('token', newToken);

      // Set token in API headers
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

      // Update state
      setToken(newToken);
      setUser(newUser);

      toast.success('Registration successful! Welcome aboard! 🌱');
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Registration failed';
      toast.error(errorMessage);
      throw error;
    }
  };

  const logout = () => {
    // Clear localStorage
    localStorage.removeItem('token');

    // Clear API headers
    delete api.defaults.headers.common['Authorization'];

    // Clear state
    setToken(null);
    setUser(null);

    toast.success('Logged out successfully');
  };

  const value = {
    user,
    token,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!token && !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
