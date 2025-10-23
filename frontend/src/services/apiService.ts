import axios from 'axios';

// API service for backend communication
class ApiService {
  constructor() {
    axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    this.setupInterceptors();
  }

  setupInterceptors() {
    // Request interceptor
    axios.interceptors.request.use(
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

    // Response interceptor
    axios.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Authentication
  async login(email: string, password: string) {
    const response = await axios.post('/api/auth/login', {
      username: email,
      password: password,
    });
    return response.data;
  }

  async register(userData: any) {
    const response = await axios.post('/api/auth/register', userData);
    return response.data;
  }

  async getProfile() {
    const response = await axios.get('/api/auth/me');
    return response.data;
  }

  async updateProfile(userData: any) {
    const response = await axios.put('/api/auth/me', userData);
    return response.data;
  }

  // Chat
  async sendMessage(messageData: any) {
    const response = await axios.post('/api/chat/send', messageData);
    return response.data;
  }

  async createSession(sessionData: any) {
    const response = await axios.post('/api/chat/sessions', sessionData);
    return response.data;
  }

  async getSessions() {
    const response = await axios.get('/api/chat/sessions');
    return response.data;
  }

  async getSession(sessionId: number) {
    const response = await axios.get(`/api/chat/sessions/${sessionId}`);
    return response.data;
  }

  async endSession(sessionId: number) {
    const response = await axios.post(`/api/chat/sessions/${sessionId}/end`);
    return response.data;
  }

  // Analytics
  async getUserProgress() {
    const response = await axios.get('/api/analytics/user-progress');
    return response.data;
  }

  async getLearningAnalytics() {
    const response = await axios.get('/api/analytics/learning-analytics');
    return response.data;
  }

  // Gamification
  async getGamificationStats() {
    const response = await axios.get('/api/gamification/stats');
    return response.data;
  }

  async getBadges() {
    const response = await axios.get('/api/gamification/badges');
    return response.data;
  }

  async claimBadge(badgeId: number) {
    const response = await axios.post(`/api/gamification/badges/${badgeId}/claim`);
    return response.data;
  }

  async getLeaderboard() {
    const response = await axios.get('/api/gamification/leaderboard');
    return response.data;
  }

  // Teacher
  async getTeacherDashboard() {
    const response = await axios.get('/api/teacher/dashboard');
    return response.data;
  }

  async getTeacherStudents() {
    const response = await axios.get('/api/teacher/students');
    return response.data;
  }

  async getTeacherReports() {
    const response = await axios.get('/api/teacher/reports');
    return response.data;
  }
}

export const apiService = new ApiService();
export default apiService;
