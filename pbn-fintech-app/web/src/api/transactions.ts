import apiClient from './client';
import { Transaction } from '../types';

export const transactionsApi = {
  create: async (matchId: string) => {
    const response = await apiClient.post<Transaction>('/transactions', { matchId });
    return response.data;
  },

  confirmTransaction: async (transactionId: string) => {
    const response = await apiClient.post<Transaction>(`/transactions/${transactionId}/confirm`);
    return response.data;
  },

  getById: async (transactionId: string) => {
    const response = await apiClient.get<Transaction>(`/transactions/${transactionId}`);
    return response.data;
  },

  getUserTransactions: async () => {
    const response = await apiClient.get<Transaction[]>('/transactions/user/me');
    return response.data;
  },

  cancel: async (transactionId: string) => {
    const response = await apiClient.post(`/transactions/${transactionId}/cancel`);
    return response.data;
  },
};
