import axios from 'axios';
import {
  isDemoMode,
  DEMO_USER,
  DEMO_STATS,
  DEMO_CASH_REQUESTS,
  DEMO_MATCHES,
  DEMO_TRANSACTIONS
} from '../utils/demoData';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Demo mode request interceptor
if (isDemoMode()) {
  apiClient.interceptors.request.use(
    async (config) => {
      // Intercept all requests and return demo data
      const url = config.url || '';

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 300));

      // Return mock responses based on endpoint
      if (url.includes('/users/stats')) {
        throw { response: { data: { success: true, data: DEMO_STATS }, status: 200 }, config, isDemo: true };
      }
      if (url.includes('/users/profile')) {
        throw { response: { data: { success: true, data: { user: DEMO_USER } }, status: 200 }, config, isDemo: true };
      }
      if (url.includes('/cash-requests')) {
        throw { response: { data: { success: true, data: DEMO_CASH_REQUESTS }, status: 200 }, config, isDemo: true };
      }
      if (url.includes('/matches')) {
        throw { response: { data: { success: true, data: DEMO_MATCHES }, status: 200 }, config, isDemo: true };
      }
      if (url.includes('/transactions')) {
        throw { response: { data: { success: true, data: DEMO_TRANSACTIONS }, status: 200 }, config, isDemo: true };
      }

      // Default success response for other endpoints
      throw { response: { data: { success: true, message: 'Demo mode' }, status: 200 }, config, isDemo: true };
    }
  );
}

// Request interceptor to add auth token
apiClient.interceptors.request.use(
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
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle demo mode responses
    if (error.isDemo && error.response) {
      return Promise.resolve(error.response);
    }

    if (error.response?.status === 401) {
      // Token expired or invalid (skip in demo mode)
      if (!isDemoMode()) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
