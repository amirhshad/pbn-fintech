import apiClient from './client';
import { ApiResponse, CashRequest, CreateCashRequestPayload } from '../types';

export const cashRequestsApi = {
  // Create a new cash request
  create: async (payload: CreateCashRequestPayload): Promise<ApiResponse<CashRequest>> => {
    const response = await apiClient.post<ApiResponse<CashRequest>>('/cash-requests', payload);
    return response.data;
  },

  // Get nearby cash requests
  getNearby: async (params: {
    lat: number;
    lng: number;
    radius?: number;
    type?: 'NEED_CASH' | 'HAVE_CASH';
    minAmount?: number;
    maxAmount?: number;
  }): Promise<ApiResponse<CashRequest[]>> => {
    const response = await apiClient.get<ApiResponse<CashRequest[]>>('/cash-requests/nearby', {
      params,
    });
    return response.data;
  },

  // Get specific cash request by ID
  getById: async (id: string): Promise<ApiResponse<CashRequest>> => {
    const response = await apiClient.get<ApiResponse<CashRequest>>(`/cash-requests/${id}`);
    return response.data;
  },

  // Get current user's requests
  getMyRequests: async (includeInactive?: boolean): Promise<ApiResponse<CashRequest[]>> => {
    const response = await apiClient.get<ApiResponse<CashRequest[]>>('/cash-requests/user/me', {
      params: { includeInactive },
    });
    return response.data;
  },

  // Update a cash request
  update: async (id: string, data: Partial<CashRequest>): Promise<ApiResponse<CashRequest>> => {
    const response = await apiClient.put<ApiResponse<CashRequest>>(`/cash-requests/${id}`, data);
    return response.data;
  },

  // Cancel a cash request
  cancel: async (id: string): Promise<ApiResponse<CashRequest>> => {
    const response = await apiClient.delete<ApiResponse<CashRequest>>(`/cash-requests/${id}`);
    return response.data;
  },
};
