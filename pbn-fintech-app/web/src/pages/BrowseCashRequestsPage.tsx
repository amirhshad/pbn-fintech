import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cashRequestsApi } from '../api/cashRequests';
import { CashRequest } from '../types';

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <div className="text-gray-600">Loading nearby requests...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Nearby Cash Requests</h1>

        {requests.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No requests nearby</h3>
            <p className="text-gray-600 mb-4">Be the first to create a request in your area!</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-primary-600 text-white py-2 px-6 rounded-md hover:bg-primary-700"
            >
              Create Request
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div key={request.id} className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">
                        {request.requestType === 'NEED_CASH' ? '💵' : '💰'}
                      </span>
                      <h3 className="text-lg font-semibold text-gray-900">
                        €{request.amount.toFixed(2)}
                      </h3>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        request.requestType === 'NEED_CASH'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {request.requestType === 'NEED_CASH' ? 'Needs Cash' : 'Has Cash'}
                      </span>
                    </div>

                    <p className="text-gray-600 text-sm mb-2">
                      📍 {request.locationDescription}
                    </p>

                    <p className="text-gray-500 text-xs">
                      Radius: {request.radiusKm}km • Created: {new Date(request.createdAt).toLocaleDateString()}
                    </p>

                    {request.specialRequirements && (
                      <p className="text-gray-600 text-sm mt-2">
                        ℹ️ {request.specialRequirements}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => navigate(`/matches/create?requestId=${request.id}`)}
                    className="ml-4 bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700"
                  >
                    Match
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
