import apiClient from './client';
import { Match } from '../types';

export const matchesApi = {
  findMatches: async (requestId: string) => {
    const response = await apiClient.get<Match[]>(`/matches/find/${requestId}`);
    return response.data;
  },

  createMatch: async (requestId1: string, requestId2: string) => {
    const response = await apiClient.post<Match>('/matches', {
      requestId1,
      requestId2,
    });
    return response.data;
  },

  acceptMatch: async (matchId: string) => {
    const response = await apiClient.post<Match>(`/matches/${matchId}/accept`);
    return response.data;
  },

  getUserMatches: async () => {
    const response = await apiClient.get<Match[]>('/matches/user/me');
    return response.data;
  },

  getById: async (matchId: string) => {
    const response = await apiClient.get<Match>(`/matches/${matchId}`);
    return response.data;
  },
};
