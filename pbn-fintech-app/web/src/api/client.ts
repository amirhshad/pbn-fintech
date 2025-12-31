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
      const createMockError = (data: any) => {
        const error = new Error('Demo mode mock response') as any;
        error.response = { data, status: 200 };
        error.config = config;
        error.isDemo = true;
        return error;
      };

      if (url.includes('/users/stats')) {
        throw createMockError({ success: true, data: DEMO_STATS });
      }
      if (url.includes('/users/profile')) {
        throw createMockError({ success: true, data: { user: DEMO_USER } });
      }
      if (url.includes('/cash-requests')) {
        throw createMockError({ success: true, data: DEMO_CASH_REQUESTS });
      }
      if (url.includes('/matches')) {
        throw createMockError({ success: true, data: DEMO_MATCHES });
      }
      if (url.includes('/transactions')) {
        throw createMockError({ success: true, data: DEMO_TRANSACTIONS });
      }

      // Default success response for other endpoints
      throw createMockError({ success: true, message: 'Demo mode' });
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
