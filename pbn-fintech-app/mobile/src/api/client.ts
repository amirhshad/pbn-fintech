import axios, { AxiosInstance, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../constants';

// Storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: '@pbn_auth_token',
  USER_DATA: '@pbn_user_data',
};

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token to requests
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting auth token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response) {
      // Handle 401 Unauthorized - clear token and redirect to login
      if (error.response.status === 401) {
        await AsyncStorage.multiRemove([
          STORAGE_KEYS.AUTH_TOKEN,
          STORAGE_KEYS.USER_DATA,
        ]);
        // Navigation will be handled by the auth slice
      }

      // Handle 403 Forbidden
      if (error.response.status === 403) {
        console.error('Access forbidden:', error.response.data);
      }

      // Handle 500 Server errors
      if (error.response.status >= 500) {
        console.error('Server error:', error.response.data);
      }
    } else if (error.request) {
      // Network error
      console.error('Network error - no response received:', error.message);
    } else {
      console.error('Request error:', error.message);
    }

    return Promise.reject(error);
  }
);

// Helper functions for token management
export const setAuthToken = async (token: string) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
  } catch (error) {
    console.error('Error saving auth token:', error);
  }
};

export const getAuthToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

export const removeAuthToken = async () => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  } catch (error) {
    console.error('Error removing auth token:', error);
  }
};

export default apiClient;
