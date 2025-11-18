import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cashRequestsApi } from '../api/cashRequests';
import { CashRequest } from '../types';
import { motion } from 'framer-motion';
import {
  FiLoader,
  FiSearch,
  FiMapPin,
  FiInfo,
  FiNavigation,
  FiCalendar,
  FiDollarSign,
} from 'react-icons/fi';
import { HiCurrencyDollar, HiCash } from 'react-icons/hi';

export const BrowseCashRequestsPage: React.FC = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<CashRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          setLocation({ lat: 52.3676, lng: 4.9041 }); // Amsterdam default
        }
      );
    }
  }, []);

  useEffect(() => {
    const fetchRequests = async () => {
      if (!location) return;

      try {
        const data = await cashRequestsApi.getNearby(location.lat, location.lng, 5);
        setRequests(data);
      } catch (error) {
        console.error('Failed to fetch requests:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [location]);

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
          <div className="text-gray-600 text-lg font-medium">Loading nearby requests...</div>
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
            <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center">
              <FiMapPin className="text-primary-600 text-3xl" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">
                Nearby Cash Requests
              </h1>
              <p className="text-gray-600 flex items-center gap-2">
                <FiNavigation className="text-success-600" />
                Showing requests within 5km
              </p>
            </div>
          </div>
        </motion.div>

        {requests.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center"
          >
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-50 rounded-2xl flex items-center justify-center">
              <FiSearch className="text-gray-400 text-5xl" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No requests nearby</h3>
            <p className="text-gray-600 mb-6 text-lg">
              Be the first to create a request in your area!
            </p>
            <motion.button
              onClick={() => navigate('/dashboard')}
              className="btn btn-primary text-lg px-8 py-3 shadow-xl"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <FiDollarSign className="mr-2" />
              Create Request
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            {requests.map((request) => {
              const Icon = request.requestType === 'NEED_CASH' ? HiCurrencyDollar : HiCash;
              const isNeedCash = request.requestType === 'NEED_CASH';

              return (
                <motion.div
                  key={request.id}
                  variants={itemVariants}
                  className="card bg-white hover:shadow-2xl"
                  whileHover={{ y: -4 }}
                >
                  <div className="flex items-start justify-between flex-wrap gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Amount and Type */}
                      <div className="flex items-center gap-3 mb-4 flex-wrap">
                        <div
                          className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                            isNeedCash ? 'bg-red-50' : 'bg-green-50'
                          }`}
                        >
                          <Icon
                            className={`text-3xl ${
                              isNeedCash ? 'text-danger-600' : 'text-success-600'
                            }`}
                          />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900">
                            €{request.amount.toFixed(2)}
                          </h3>
                          <span
                            className={`badge ${
                              isNeedCash ? 'badge-danger' : 'badge-success'
                            }`}
                          >
                            {isNeedCash ? 'Needs Cash' : 'Has Cash'}
                          </span>
                        </div>
                      </div>

                      {/* Location */}
                      <div className="flex items-start gap-2 mb-3">
                        <FiMapPin className="text-primary-600 text-lg mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 font-medium">
                          {request.locationDescription}
                        </span>
                      </div>

                      {/* Details */}
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                        <div className="flex items-center gap-1">
                          <FiNavigation className="text-primary-600" />
                          <span>{request.radiusKm}km radius</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FiCalendar className="text-primary-600" />
                          <span>{new Date(request.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {/* Special Requirements */}
                      {request.specialRequirements && (
                        <div className="bg-blue-50 border-2 border-blue-100 rounded-xl p-3 flex items-start gap-2">
                          <FiInfo className="text-primary-600 text-lg mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700 text-sm">
                            {request.specialRequirements}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Match Button */}
                    <motion.button
                      onClick={() => navigate(`/matches/create?requestId=${request.id}`)}
                      className="btn btn-primary shadow-xl"
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Match
                    </motion.button>
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
