import React, { useEffect, useState } from 'react';
import { transactionsApi } from '../api/transactions';
import { Transaction } from '../types';
import { motion } from 'framer-motion';
import {
  FiLoader,
  FiFileText,
  FiDollarSign,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiHash,
  FiPercent,
} from 'react-icons/fi';

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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="badge badge-success">
            <FiCheckCircle className="mr-1" />
            {status}
          </span>
        );
      case 'PENDING':
        return (
          <span className="badge badge-warning">
            <FiClock className="mr-1" />
            {status}
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="badge badge-danger">
            <FiXCircle className="mr-1" />
            {status}
          </span>
        );
      default:
        return (
          <span className="badge badge-primary">
            <FiClock className="mr-1" />
            {status}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-app flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-20 h-20 mx-auto mb-6 bg-primary-50 rounded-2xl flex items-center justify-center">
            <FiLoader className="text-primary-600 text-4xl animate-spin" />
          </div>
          <div className="text-gray-600 text-lg font-medium">Loading transactions...</div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-app py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-8"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-lg">
              <FiFileText className="text-white text-3xl" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">
                Transaction History
              </h1>
              <p className="text-gray-600">
                {transactions.length === 0
                  ? 'No transactions yet'
                  : `${transactions.length} transaction${transactions.length > 1 ? 's' : ''}`}
              </p>
            </div>
          </div>
        </motion.div>

        {transactions.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center"
          >
            <div className="w-24 h-24 mx-auto mb-6 bg-blue-50 rounded-2xl flex items-center justify-center">
              <FiFileText className="text-primary-600 text-5xl" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No transactions yet</h3>
            <p className="text-gray-600 text-lg">
              Complete your first cash exchange to see your history here!
            </p>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            {transactions.map((transaction) => {
              const isCompleted = transaction.status === 'COMPLETED';
              const isPending = transaction.status === 'PENDING';
              const isCancelled = transaction.status === 'CANCELLED';

              return (
                <motion.div
                  key={transaction.id}
                  variants={itemVariants}
                  className="card bg-white hover:shadow-2xl"
                  whileHover={{ y: -4 }}
                >
                  <div className="flex items-start justify-between flex-wrap gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Transaction Code */}
                      <div className="flex items-center gap-3 mb-4">
                        <div
                          className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                            isCompleted
                              ? 'bg-green-50'
                              : isPending
                              ? 'bg-yellow-50'
                              : isCancelled
                              ? 'bg-red-50'
                              : 'bg-blue-50'
                          }`}
                        >
                          {isCompleted && <FiCheckCircle className="text-success-600 text-2xl" />}
                          {isPending && <FiClock className="text-warning-600 text-2xl" />}
                          {isCancelled && <FiXCircle className="text-danger-600 text-2xl" />}
                          {!isCompleted && !isPending && !isCancelled && (
                            <FiHash className="text-primary-600 text-2xl" />
                          )}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">
                            Transaction #{transaction.transactionCode}
                          </h3>
                          {getStatusBadge(transaction.status)}
                        </div>
                      </div>

                      {/* Transaction Details */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="bg-gray-50 rounded-xl p-4">
                          <div className="flex items-center gap-2 mb-1">
                            <FiDollarSign className="text-primary-600 text-lg" />
                            <span className="text-xs text-gray-500 font-medium">Amount</span>
                          </div>
                          <div className="text-2xl font-bold text-gray-900">
                            €{transaction.amount.toFixed(2)}
                          </div>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-4">
                          <div className="flex items-center gap-2 mb-1">
                            <FiPercent className="text-danger-600 text-lg" />
                            <span className="text-xs text-gray-500 font-medium">Platform Fee</span>
                          </div>
                          <div className="text-2xl font-bold text-danger-600">
                            €{transaction.platformFee.toFixed(2)}
                          </div>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-4">
                          <div className="flex items-center gap-2 mb-1">
                            <FiCalendar className="text-primary-600 text-lg" />
                            <span className="text-xs text-gray-500 font-medium">Date</span>
                          </div>
                          <div className="text-sm font-semibold text-gray-900">
                            {new Date(transaction.createdAt).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(transaction.createdAt).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
};
