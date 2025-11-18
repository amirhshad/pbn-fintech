import React, { useEffect, useState } from 'react';
import { matchesApi } from '../api/matches';
import { Match } from '../types';
import { motion } from 'framer-motion';
import {
  FiLoader,
  FiUsers,
  FiDollarSign,
  FiPercent,
  FiCheckCircle,
  FiClock,
  FiHash,
} from 'react-icons/fi';

export const MatchesPage: React.FC = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const data = await matchesApi.getUserMatches();
        setMatches(data);
      } catch (error) {
        console.error('Failed to fetch matches:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  const handleAcceptMatch = async (matchId: string) => {
    try {
      await matchesApi.acceptMatch(matchId);
      const data = await matchesApi.getUserMatches();
      setMatches(data);
    } catch (error) {
      console.error('Failed to accept match:', error);
    }
  };

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
          <div className="text-gray-600 text-lg font-medium">Loading matches...</div>
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
            <div className="w-16 h-16 bg-gradient-success rounded-2xl flex items-center justify-center shadow-lg">
              <FiUsers className="text-white text-3xl" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">My Matches</h1>
              <p className="text-gray-600">
                {matches.length === 0
                  ? 'No active matches'
                  : `${matches.length} match${matches.length > 1 ? 'es' : ''} found`}
              </p>
            </div>
          </div>
        </motion.div>

        {matches.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center"
          >
            <div className="w-24 h-24 mx-auto mb-6 bg-green-50 rounded-2xl flex items-center justify-center">
              <FiUsers className="text-success-600 text-5xl" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No matches yet</h3>
            <p className="text-gray-600 text-lg">
              Create a cash request to get matched with users nearby!
            </p>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            {matches.map((match) => {
              const isAccepted = match.status === 'ACCEPTED';
              const isPending = match.status === 'PENDING';

              return (
                <motion.div
                  key={match.id}
                  variants={itemVariants}
                  className="card bg-white hover:shadow-2xl"
                  whileHover={{ y: -4 }}
                >
                  <div className="flex items-start justify-between flex-wrap gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Match ID */}
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center">
                          <FiHash className="text-primary-600 text-xl" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">
                            Match #{match.id.slice(0, 8)}
                          </h3>
                          <span
                            className={`badge ${
                              isAccepted
                                ? 'badge-success'
                                : isPending
                                ? 'badge-warning'
                                : 'badge-primary'
                            }`}
                          >
                            {isAccepted && <FiCheckCircle className="mr-1" />}
                            {isPending && <FiClock className="mr-1" />}
                            {match.status}
                          </span>
                        </div>
                      </div>

                      {/* Match Details */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 rounded-xl p-4">
                          <div className="flex items-center gap-2 mb-1">
                            <FiDollarSign className="text-primary-600 text-lg" />
                            <span className="text-xs text-gray-500 font-medium">Amount</span>
                          </div>
                          <div className="text-2xl font-bold text-gray-900">
                            €{match.matchedAmount.toFixed(2)}
                          </div>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-4">
                          <div className="flex items-center gap-2 mb-1">
                            <FiPercent className="text-success-600 text-lg" />
                            <span className="text-xs text-gray-500 font-medium">Match Score</span>
                          </div>
                          <div className="text-2xl font-bold text-success-600">
                            {match.matchScore.toFixed(0)}%
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Accept Button */}
                    {match.status === 'PENDING' && !match.user1Accepted && (
                      <motion.button
                        onClick={() => handleAcceptMatch(match.id)}
                        className="btn btn-success shadow-xl"
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <FiCheckCircle className="mr-2" />
                        Accept Match
                      </motion.button>
                    )}
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
