import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Add request interceptor to include auth token
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

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Authentication services
export const authService = {
  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  async register(userData) {
    const response = await api.post('/auth/register', userData);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  async verifyToken() {
    const response = await api.get('/auth/verify');
    return response.data;
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated() {
    return !!localStorage.getItem('token');
  }
};

// Dashboard services
export const dashboardService = {
  async getOverview(userRole = 'general') {
    const response = await api.get(`/dashboard/overview?user_role=${userRole}`);
    return response.data;
  },

  async getTimeline(days = 7) {
    const response = await api.get(`/dashboard/timeline?days=${days}`);
    return response.data;
  },

  async getLocationData(locationId) {
    const response = await api.get(`/dashboard/location/${locationId}`);
    return response.data;
  },

  async getEconomicImpact(timeRange = '30d') {
    const response = await api.get(`/dashboard/economic-impact?time_range=${timeRange}`);
    return response.data;
  }
};

// Threat services
export const threatService = {
  async getThreats(filters = {}) {
    const params = new URLSearchParams(filters);
    const response = await api.get(`/threats?${params}`);
    return response.data;
  },

  async getThreatById(id) {
    const response = await api.get(`/threats/${id}`);
    return response.data;
  },

  async createThreat(threatData) {
    const response = await api.post('/threats', threatData);
    return response.data;
  },

  async updateThreatStatus(id, status, notes) {
    const response = await api.patch(`/threats/${id}/status`, {
      is_active: status,
      resolution_notes: notes
    });
    return response.data;
  },

  async getPredictions(locationId) {
    const response = await api.get(`/threats/predictions/forecast?location_id=${locationId}`);
    return response.data;
  },

  async getStatistics(timeRange = '24h') {
    const response = await api.get(`/threats/stats/summary?time_range=${timeRange}`);
    return response.data;
  }
};

// Alert services
export const alertService = {
  async getAlerts(filters = {}) {
    const params = new URLSearchParams(filters);
    const response = await api.get(`/alerts?${params}`);
    return response.data;
  },

  async getAlertById(id) {
    const response = await api.get(`/alerts/${id}`);
    return response.data;
  },

  async markAsRead(alertId) {
    const response = await api.patch(`/alerts/${alertId}/read`);
    return response.data;
  },

  async markMultipleAsRead(alertIds, userId) {
    const response = await api.patch('/alerts/bulk/read', {
      alert_ids: alertIds,
      user_id: userId
    });
    return response.data;
  },

  async getStatistics(userId, timeRange = '24h') {
    const response = await api.get(`/alerts/stats/${userId}?time_range=${timeRange}`);
    return response.data;
  }
};

// User services
export const userService = {
  async getProfile() {
    const response = await api.get('/users/profile');
    return response.data;
  },

  async updateProfile(profileData) {
    const response = await api.patch('/users/profile', profileData);
    return response.data;
  },

  async getPreferences() {
    const response = await api.get('/users/preferences');
    return response.data;
  },

  async updatePreferences(preferences) {
    const response = await api.put('/users/preferences', preferences);
    return response.data;
  },

  async getActivity(limit = 20, offset = 0) {
    const response = await api.get(`/users/activity?limit=${limit}&offset=${offset}`);
    return response.data;
  },

  async getStatistics() {
    const response = await api.get('/users/statistics');
    return response.data;
  }
};

export default api;
