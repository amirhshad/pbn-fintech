import React, { useEffect, useState } from 'react';
import { matchesApi } from '../api/matches';
import { Match } from '../types';

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <div className="text-gray-600">Loading matches...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">My Matches</h1>

        {matches.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-6xl mb-4">🤝</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No matches yet</h3>
            <p className="text-gray-600">Create a cash request to get matched with users nearby!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {matches.map((match) => (
              <div key={match.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Match #{match.id.slice(0, 8)}
                    </h3>
                    <p className="text-gray-600 text-sm mb-2">
                      Amount: €{match.matchedAmount.toFixed(2)}
                    </p>
                    <p className="text-gray-600 text-sm mb-2">
                      Match Score: {match.matchScore.toFixed(0)}%
                    </p>
                    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                      match.status === 'ACCEPTED'
                        ? 'bg-green-100 text-green-800'
                        : match.status === 'PENDING'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {match.status}
                    </span>
                  </div>

                  {match.status === 'PENDING' && !match.user1Accepted && (
                    <button
                      onClick={() => handleAcceptMatch(match.id)}
                      className="ml-4 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
                    >
                      Accept
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
