import apiClient from './client';
import { ApiResponse, Transaction } from '../types';

export const transactionsApi = {
  // Create a transaction from an accepted match
  create: async (matchId: string): Promise<ApiResponse<Transaction>> => {
    const response = await apiClient.post<ApiResponse<Transaction>>('/transactions', { matchId });
    return response.data;
  },

  // Confirm a transaction
  confirm: async (transactionId: string): Promise<ApiResponse<Transaction>> => {
    const response = await apiClient.post<ApiResponse<Transaction>>(`/transactions/${transactionId}/confirm`);
    return response.data;
  },

  // Get specific transaction
  getById: async (transactionId: string): Promise<ApiResponse<Transaction>> => {
    const response = await apiClient.get<ApiResponse<Transaction>>(`/transactions/${transactionId}`);
    return response.data;
  },

  // Get current user's transactions
  getMyTransactions: async (status?: string): Promise<ApiResponse<Transaction[]>> => {
    const response = await apiClient.get<ApiResponse<Transaction[]>>('/transactions/user/me', {
      params: { status },
    });
    return response.data;
  },

  // Cancel a transaction
  cancel: async (transactionId: string, reason?: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.post<ApiResponse<any>>(`/transactions/${transactionId}/cancel`, { reason });
    return response.data;
  },
};
