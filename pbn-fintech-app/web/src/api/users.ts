import apiClient from './client';
import { User, UserStats } from '../types';

export const usersApi = {
  getProfile: async (userId: string) => {
    const response = await apiClient.get<User>(`/users/${userId}/profile`);
    return response.data;
  },

  updateProfile: async (data: Partial<User>) => {
    const response = await apiClient.put<User>('/users/profile', data);
    return response.data;
  },

  updateLocation: async (lat: number, lng: number) => {
    const response = await apiClient.put('/users/location', {
      latitude: lat,
      longitude: lng,
    });
    return response.data;
  },

  getStats: async () => {
    const response = await apiClient.get<UserStats>('/users/stats');
    return response.data;
  },
};
