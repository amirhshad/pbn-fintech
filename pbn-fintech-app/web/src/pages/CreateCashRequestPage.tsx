import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { cashRequestsApi } from '../api/cashRequests';

export const CreateCashRequestPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const requestType = (searchParams.get('type') || 'NEED_CASH') as 'NEED_CASH' | 'HAVE_CASH';

  const [amount, setAmount] = useState('');
  const [locationDescription, setLocationDescription] = useState('');
  const [radiusKm, setRadiusKm] = useState('5');
  const [specialRequirements, setSpecialRequirements] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          // Default to Amsterdam center
          setLocation({ lat: 52.3676, lng: 4.9041 });
        }
      );
    } else {
      // Default to Amsterdam center
      setLocation({ lat: 52.3676, lng: 4.9041 });
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!location) {
      setError('Location not available. Please enable location services.');
      return;
    }

    setLoading(true);

    try {
      await cashRequestsApi.create({
        requestType,
        amount: parseFloat(amount),
        locationLat: location.lat,
        locationLng: location.lng,
        locationDescription,
        radiusKm: parseInt(radiusKm),
        specialRequirements: specialRequirements || undefined,
      });

      navigate('/cash-requests');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            {requestType === 'NEED_CASH' ? '💵 I Need Cash' : '💰 I Have Cash'}
          </h1>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Amount (EUR)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="200"
                min="10"
                max="500"
                step="10"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Min: €10, Max: €500
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Location Description
              </label>
              <input
                type="text"
                value={locationDescription}
                onChange={(e) => setLocationDescription(e.target.value)}
                placeholder="e.g., Amsterdam Central Station"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                {location ? `Coordinates: ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : 'Getting location...'}
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Search Radius (km)
              </label>
              <select
                value={radiusKm}
                onChange={(e) => setRadiusKm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="1">1 km</option>
                <option value="2">2 km</option>
                <option value="5">5 km (default)</option>
                <option value="10">10 km</option>
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Special Requirements (Optional)
              </label>
              <textarea
                value={specialRequirements}
                onChange={(e) => setSpecialRequirements(e.target.value)}
                placeholder="e.g., Prefer meeting at a bank"
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading || !location}
                className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Request'}
              </button>

              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
