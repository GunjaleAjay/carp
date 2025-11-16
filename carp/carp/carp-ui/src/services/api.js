import axios from 'axios';
import toast from 'react-hot-toast';

// Create axios instance
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 30000, // Increased timeout for route planning (30 seconds)
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem('token');
          delete api.defaults.headers.common['Authorization'];

          // Only show toast if not already on login page
          if (!window.location.pathname.includes('/login')) {
            toast.error('Session expired. Please login again.');
            window.location.href = '/login';
          }
          break;

        case 403:
          toast.error('Access denied. You do not have permission to perform this action.');
          break;

        case 404:
          toast.error('Resource not found.');
          break;

        case 422:
          // Validation errors
          if (data.errors) {
            const errorMessages = Object.values(data.errors).flat();
            errorMessages.forEach((message) => toast.error(message));
          } else {
            toast.error(data.error || 'Validation failed.');
          }
          break;

        case 429:
          // Don't show toast for rate limit errors - they're handled silently
          // The user can retry after a moment
          console.warn('Rate limit reached. Please wait a moment before retrying.');
          break;

        case 500:
          toast.error('Server error. Please try again later.');
          break;

        default:
          toast.error(data?.error || 'An unexpected error occurred.');
      }
    } else if (error.request) {
      // Network error
      toast.error('Network error. Please check your connection.');
    } else {
      // Other error
      toast.error('An unexpected error occurred.');
    }

    return Promise.reject(error);
  }
);

// API endpoints
export const authAPI = {
  login: (email, password) =>
    api.post('/auth/login', { email, password }),

  register: (userData) => api.post('/auth/register', userData),

  getProfile: () => api.get('/auth/me'),

  updateProfile: (userData) => api.put('/auth/profile', userData),

  changePassword: (currentPassword, newPassword) =>
    api.post('/auth/change-password', { current_password: currentPassword, new_password: newPassword }),

  logout: () => api.post('/auth/logout'),
};

export const usersAPI = {
  getPreferences: () => api.get('/users/preferences'),

  updatePreferences: (preferences) => api.put('/users/preferences', preferences),

  getStats: () => api.get('/users/stats'),

  getActivity: (params) => api.get('/users/activity', { params }),

  deleteAccount: () => api.delete('/users/account'),
};

export const vehiclesAPI = {
  getVehicles: () => api.get('/vehicles'),

  getVehicle: (id) => api.get(`/vehicles/${id}`),

  addVehicle: (vehicleData) => api.post('/vehicles', vehicleData),

  updateVehicle: (id, vehicleData) => api.put(`/vehicles/${id}`, vehicleData),

  deleteVehicle: (id) => api.delete(`/vehicles/${id}`),

  setDefaultVehicle: (id) => api.post(`/vehicles/${id}/default`),

  getEmissionFactors: () => api.get('/vehicles/emission-factors'),

  calculateEmissions: (distance, vehicleId) =>
    api.post('/vehicles/calculate-emissions', { distance_km: distance, vehicle_id: vehicleId }),
};

export const routesAPI = {
  planRoute: (routeData) => api.post('/routes/plan', routeData),

  getRouteAlternatives: (routeData) => api.post('/routes/alternatives', routeData),

  saveRoute: (routeData) => api.post('/routes/save', routeData),

  getRouteHistory: (params) => api.get('/routes/history', { params }),

  getRoute: (id) => api.get(`/routes/${id}`),

  deleteRoute: (id) => api.delete(`/routes/${id}`),

  getEcoSuggestions: (routeData) => api.post('/routes/eco-suggestions', routeData),

  getNearbyEcoOptions: (params) => api.get('/routes/nearby-eco', { params }),
};

export const analyticsAPI = {
  getDashboard: () => api.get('/analytics/dashboard'),

  getEmissionStats: (params) => api.get('/analytics/emissions', { params }),

  getCarbonSavings: () => api.get('/analytics/carbon-savings'),

  getLeaderboard: (params) => api.get('/analytics/leaderboard', { params }),

  getTrends: (params) => api.get('/analytics/trends', { params }),
};

export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),

  getUsers: (params) => api.get('/admin/users', { params }),

  getUser: (id) => api.get(`/admin/users/${id}`),

  updateUserStatus: (id, status) => api.put(`/admin/users/${id}/status`, { status }),

  deleteUser: (id) => api.delete(`/admin/users/${id}`),

  getEmissionFactors: () => api.get('/admin/emission-factors'),

  addEmissionFactor: (factorData) => api.post('/admin/emission-factors', factorData),

  updateEmissionFactor: (id, factorData) => api.put(`/admin/emission-factors/${id}`, factorData),

  deleteEmissionFactor: (id) => api.delete(`/admin/emission-factors/${id}`),

  getLogs: (params) => api.get('/admin/logs', { params }),

  getSystemStats: () => api.get('/admin/stats'),

  getUserAnalytics: (params) => api.get('/admin/analytics/users', { params }),

  getEmissionAnalytics: (params) => api.get('/admin/analytics/emissions', { params }),

  exportData: (params) => api.get('/admin/export', { params }),

  getSystemHealth: () => api.get('/admin/health'),
};
