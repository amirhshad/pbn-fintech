import React, { useEffect, useState } from 'react';
import { transactionsApi } from '../api/transactions';
import { Transaction } from '../types';

export const TransactionsPage: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const data = await transactionsApi.getUserTransactions();
        setTransactions(data);
      } catch (error) {
        console.error('Failed to fetch transactions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <div className="text-gray-600">Loading transactions...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Transaction History</h1>

        {transactions.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No transactions yet</h3>
            <p className="text-gray-600">Complete your first cash exchange to see your history here!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Transaction #{transaction.transactionCode}
                    </h3>
                    <p className="text-gray-600 text-sm mb-1">
                      Amount: €{transaction.amount.toFixed(2)}
                    </p>
                    <p className="text-gray-600 text-sm mb-1">
                      Platform Fee: €{transaction.platformFee.toFixed(2)}
                    </p>
                    <p className="text-gray-600 text-sm mb-2">
                      Date: {new Date(transaction.createdAt).toLocaleString()}
                    </p>
                    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                      transaction.status === 'COMPLETED'
                        ? 'bg-green-100 text-green-800'
                        : transaction.status === 'PENDING'
                        ? 'bg-yellow-100 text-yellow-800'
                        : transaction.status === 'CANCELLED'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {transaction.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
