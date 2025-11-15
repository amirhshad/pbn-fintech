import apiClient from './client';
import { CashRequest } from '../types';

export interface CreateCashRequestData {
  requestType: 'NEED_CASH' | 'HAVE_CASH';
  amount: number;
  locationLat: number;
  locationLng: number;
  locationDescription?: string;
  radiusKm?: number;
  specialRequirements?: string;
  minUserRating?: number;
}

export const cashRequestsApi = {
  create: async (data: CreateCashRequestData) => {
    const response = await apiClient.post<CashRequest>('/cash-requests', data);
    return response.data;
  },

  getNearby: async (lat: number, lng: number, radiusKm: number = 5) => {
    const response = await apiClient.get<CashRequest[]>('/cash-requests/nearby', {
      params: { lat, lng, radiusKm },
    });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get<CashRequest>(`/cash-requests/${id}`);
    return response.data;
  },

  getUserRequests: async () => {
    const response = await apiClient.get<CashRequest[]>('/cash-requests/user/me');
    return response.data;
  },

  update: async (id: string, data: Partial<CreateCashRequestData>) => {
    const response = await apiClient.put<CashRequest>(`/cash-requests/${id}`, data);
    return response.data;
  },

  cancel: async (id: string) => {
    const response = await apiClient.delete(`/cash-requests/${id}`);
    return response.data;
  },
};
