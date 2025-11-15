import apiClient from './client';
import { ApiResponse, Match } from '../types';

export const matchesApi = {
  // Find potential matches for a request
  findMatches: async (requestId: string): Promise<ApiResponse<Match[]>> => {
    const response = await apiClient.get<ApiResponse<Match[]>>(`/matches/find/${requestId}`);
    return response.data;
  },

  // Create a match between two requests
  create: async (data: { requestId1: string; requestId2: string }): Promise<ApiResponse<Match>> => {
    const response = await apiClient.post<ApiResponse<Match>>('/matches', data);
    return response.data;
  },

  // Accept a match
  accept: async (matchId: string): Promise<ApiResponse<Match>> => {
    const response = await apiClient.post<ApiResponse<Match>>(`/matches/${matchId}/accept`);
    return response.data;
  },

  // Get current user's matches
  getMyMatches: async (status?: string): Promise<ApiResponse<Match[]>> => {
    const response = await apiClient.get<ApiResponse<Match[]>>('/matches/user/me', {
      params: { status },
    });
    return response.data;
  },

  // Get specific match details
  getById: async (matchId: string): Promise<ApiResponse<Match>> => {
    const response = await apiClient.get<ApiResponse<Match>>(`/matches/${matchId}`);
    return response.data;
  },
};
