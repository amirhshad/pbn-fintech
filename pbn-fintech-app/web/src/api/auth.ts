import apiClient from './client';
import { User } from '../types';

export interface LoginResponse {
  message: string;
  verificationCodeSent: boolean;
}

export interface VerifyPhoneResponse {
  message: string;
  token: string;
  user: User;
}

export const authApi = {
  login: async (phoneNumber: string) => {
    const response = await apiClient.post<LoginResponse>('/auth/login', { phoneNumber });
    return response.data;
  },

  verifyPhone: async (phoneNumber: string, verificationCode: string) => {
    const response = await apiClient.post<VerifyPhoneResponse>('/auth/verify-phone', {
      phoneNumber,
      verificationCode,
    });
    return response.data;
  },

  register: async (fullName: string, phoneNumber: string) => {
    const response = await apiClient.post('/auth/register', {
      fullName,
      phoneNumber,
    });
    return response.data;
  },

  getProfile: async () => {
    const response = await apiClient.get<User>('/auth/profile');
    return response.data;
  },

  logout: async () => {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  },
};
