import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../hooks/useAppDispatch';
import { usersApi } from '../api/users';
import { UserStats } from '../types';
import { motion } from 'framer-motion';
import {
  FiDollarSign,
  FiTrendingUp,
  FiCheckCircle,
  FiPercent,
  FiMap,
  FiUsers,
  FiFileText,
  FiStar,
} from 'react-icons/fi';
import { HiCash, HiCurrencyDollar } from 'react-icons/hi';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const [stats, setStats] = useState<UserStats | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await usersApi.getStats();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    };

    fetchStats();
  }, []);

  if (!user) {
    return null;
  }

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

  return (
    <div className="min-h-screen bg-gradient-app">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-8"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Welcome back, {user.fullName}!
              </h1>
              <p className="text-gray-600 text-lg flex items-center gap-2">
                <FiDollarSign className="text-primary-600" />
                {user.phoneNumber}
              </p>
            </div>
            <div className="bg-gradient-primary rounded-2xl p-6 text-white shadow-lg">
              <div className="flex items-center gap-2 justify-center mb-1">
                <FiStar className="text-yellow-300 text-2xl" />
                <span className="text-4xl font-bold">
                  {stats?.trustScore?.toFixed(1) || user.trustScore.toFixed(1)}
                </span>
              </div>
              <p className="text-sm text-center opacity-90">Trust Score</p>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <motion.div variants={itemVariants} className="card bg-white hover:shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-4xl font-bold text-primary-600 mb-2">
                  {stats?.totalTransactions || user.totalTransactions}
                </div>
                <div className="text-gray-600 font-medium">Total Transactions</div>
              </div>
              <div className="w-14 h-14 bg-primary-50 rounded-xl flex items-center justify-center">
                <FiTrendingUp className="text-primary-600 text-2xl" />
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="card bg-white hover:shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-4xl font-bold text-success-600 mb-2">
                  {stats?.successfulTransactions || user.successfulTransactions}
                </div>
                <div className="text-gray-600 font-medium">Successful</div>
              </div>
              <div className="w-14 h-14 bg-green-50 rounded-xl flex items-center justify-center">
                <FiCheckCircle className="text-success-600 text-2xl" />
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="card bg-white hover:shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-4xl font-bold text-primary-600 mb-2">
                  {stats?.completionRate ? `${stats.completionRate.toFixed(0)}%` : '100%'}
                </div>
                <div className="text-gray-600 font-medium">Completion Rate</div>
              </div>
              <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center">
                <FiPercent className="text-primary-600 text-2xl" />
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Main Actions */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
        >
          <motion.button
            variants={itemVariants}
            onClick={() => navigate('/cash-requests/create?type=NEED_CASH')}
            className="bg-gradient-danger text-white rounded-2xl shadow-xl p-8 md:p-10 hover:shadow-2xl transition-all text-left group"
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-white/30 transition-all">
              <HiCurrencyDollar className="text-white text-4xl" />
            </div>
            <h3 className="text-3xl font-bold mb-2">I Need Cash</h3>
            <p className="text-red-100 text-lg">
              Find someone nearby who has cash to exchange
            </p>
          </motion.button>

          <motion.button
            variants={itemVariants}
            onClick={() => navigate('/cash-requests/create?type=HAVE_CASH')}
            className="bg-gradient-success text-white rounded-2xl shadow-xl p-8 md:p-10 hover:shadow-2xl transition-all text-left group"
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-white/30 transition-all">
              <HiCash className="text-white text-4xl" />
            </div>
            <h3 className="text-3xl font-bold mb-2">I Have Cash</h3>
            <p className="text-green-100 text-lg">
              Help someone who needs cash nearby
            </p>
          </motion.button>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <motion.button
            variants={itemVariants}
            onClick={() => navigate('/cash-requests')}
            className="card bg-white text-left group"
            whileHover={{ scale: 1.02, y: -4 }}
          >
            <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center mb-3 group-hover:bg-primary-100 transition-colors">
              <FiMap className="text-primary-600 text-2xl" />
            </div>
            <h4 className="font-bold text-gray-900 text-lg mb-2">Browse Nearby Requests</h4>
            <p className="text-sm text-gray-600">See who needs cash near you</p>
          </motion.button>

          <motion.button
            variants={itemVariants}
            onClick={() => navigate('/matches')}
            className="card bg-white text-left group"
            whileHover={{ scale: 1.02, y: -4 }}
          >
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mb-3 group-hover:bg-green-100 transition-colors">
              <FiUsers className="text-success-600 text-2xl" />
            </div>
            <h4 className="font-bold text-gray-900 text-lg mb-2">My Matches</h4>
            <p className="text-sm text-gray-600">View and manage your matches</p>
          </motion.button>

          <motion.button
            variants={itemVariants}
            onClick={() => navigate('/transactions')}
            className="card bg-white text-left group"
            whileHover={{ scale: 1.02, y: -4 }}
          >
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-3 group-hover:bg-blue-100 transition-colors">
              <FiFileText className="text-primary-600 text-2xl" />
            </div>
            <h4 className="font-bold text-gray-900 text-lg mb-2">Transaction History</h4>
            <p className="text-sm text-gray-600">View past transactions</p>
          </motion.button>
        </motion.div>

        {/* How It Works */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            How It Works
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                step: '1',
                title: 'Post Request',
                description: 'Create a cash exchange request with amount and location',
                color: 'primary',
              },
              {
                step: '2',
                title: 'Get Matched',
                description: 'Find compatible users within 5km radius',
                color: 'success',
              },
              {
                step: '3',
                title: 'Meet Safely',
                description: 'Coordinate at verified public locations',
                color: 'warning',
              },
              {
                step: '4',
                title: 'Exchange & Rate',
                description: 'Complete exchange and rate each other',
                color: 'primary',
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="text-center"
              >
                <div
                  className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center shadow-lg ${
                    item.color === 'primary'
                      ? 'bg-gradient-primary'
                      : item.color === 'success'
                      ? 'bg-gradient-success'
                      : 'bg-gradient-to-br from-warning-500 to-warning-600'
                  }`}
                >
                  <span className="text-white text-2xl font-bold">{item.step}</span>
                </div>
                <h4 className="font-bold text-gray-900 mb-2">{item.title}</h4>
                <p className="text-sm text-gray-600">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};
