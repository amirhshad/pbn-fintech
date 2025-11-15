import apiClient, { setAuthToken, removeAuthToken } from './client';
import { ApiResponse, AuthResponse, LoginPayload, VerifySMSPayload, User } from '../types';

export const authApi = {
  // Login with phone number
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', payload);

    // Save token if login successful
    if (response.data.success && response.data.data.token) {
      await setAuthToken(response.data.data.token);
    }

    return response.data;
  },

  // Verify SMS code
  verify: async (payload: VerifySMSPayload): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/verify', payload);

    // Save token if verification successful
    if (response.data.success && response.data.data.token) {
      await setAuthToken(response.data.data.token);
    }

    return response.data;
  },

  // Get current user profile
  getProfile: async (): Promise<ApiResponse<User>> => {
    const response = await apiClient.get<ApiResponse<User>>('/users/me');
    return response.data;
  },

  // Logout
  logout: async (): Promise<void> => {
    await removeAuthToken();
  },

  // Update profile
  updateProfile: async (data: Partial<User>): Promise<ApiResponse<User>> => {
    const response = await apiClient.put<ApiResponse<User>>('/users/me', data);
    return response.data;
  },
};
