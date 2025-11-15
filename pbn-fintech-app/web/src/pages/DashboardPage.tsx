import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../hooks/useAppDispatch';
import { usersApi } from '../api/users';
import { UserStats } from '../types';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await usersApi.getStats();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Welcome, {user.fullName}!</h1>
              <p className="text-gray-600 mt-1">
                {user.phoneNumber}
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 justify-end">
                <span className="text-yellow-500 text-2xl">⭐</span>
                <span className="text-3xl font-bold text-gray-900">
                  {stats?.trustScore?.toFixed(1) || user.trustScore.toFixed(1)}
                </span>
              </div>
              <p className="text-sm text-gray-600">Trust Score</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-primary-600">
              {stats?.totalTransactions || user.totalTransactions}
            </div>
            <div className="text-gray-600 mt-1">Total Transactions</div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-green-600">
              {stats?.successfulTransactions || user.successfulTransactions}
            </div>
            <div className="text-gray-600 mt-1">Successful</div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-blue-600">
              {stats?.completionRate ? `${stats.completionRate.toFixed(0)}%` : '100%'}
            </div>
            <div className="text-gray-600 mt-1">Completion Rate</div>
          </div>
        </div>

        {/* Main Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <button
            onClick={() => navigate('/cash-requests/create?type=NEED_CASH')}
            className="bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg shadow-lg p-8 hover:from-red-600 hover:to-red-700 transition-all transform hover:scale-105"
          >
            <div className="text-6xl mb-4">💵</div>
            <h3 className="text-2xl font-bold mb-2">I Need Cash</h3>
            <p className="text-red-100">Find someone nearby who has cash to exchange</p>
          </button>

          <button
            onClick={() => navigate('/cash-requests/create?type=HAVE_CASH')}
            className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg shadow-lg p-8 hover:from-green-600 hover:to-green-700 transition-all transform hover:scale-105"
          >
            <div className="text-6xl mb-4">💰</div>
            <h3 className="text-2xl font-bold mb-2">I Have Cash</h3>
            <p className="text-green-100">Help someone who needs cash nearby</p>
          </button>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/cash-requests')}
            className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow text-left"
          >
            <div className="text-2xl mb-2">🗺️</div>
            <h4 className="font-semibold text-gray-900">Browse Nearby Requests</h4>
            <p className="text-sm text-gray-600 mt-1">See who needs cash near you</p>
          </button>

          <button
            onClick={() => navigate('/matches')}
            className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow text-left"
          >
            <div className="text-2xl mb-2">🤝</div>
            <h4 className="font-semibold text-gray-900">My Matches</h4>
            <p className="text-sm text-gray-600 mt-1">View and manage your matches</p>
          </button>

          <button
            onClick={() => navigate('/transactions')}
            className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow text-left"
          >
            <div className="text-2xl mb-2">📋</div>
            <h4 className="font-semibold text-gray-900">Transaction History</h4>
            <p className="text-sm text-gray-600 mt-1">View past transactions</p>
          </button>
        </div>

        {/* How It Works */}
        <div className="mt-8 bg-blue-50 rounded-lg shadow p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">How It Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl mb-2">1️⃣</div>
              <h4 className="font-semibold mb-1">Post Request</h4>
              <p className="text-sm text-gray-600">Create a cash exchange request with amount and location</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">2️⃣</div>
              <h4 className="font-semibold mb-1">Get Matched</h4>
              <p className="text-sm text-gray-600">Find compatible users within 5km radius</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">3️⃣</div>
              <h4 className="font-semibold mb-1">Meet Safely</h4>
              <p className="text-sm text-gray-600">Coordinate at verified public locations</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">4️⃣</div>
              <h4 className="font-semibold mb-1">Exchange & Rate</h4>
              <p className="text-sm text-gray-600">Complete exchange and rate each other</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
