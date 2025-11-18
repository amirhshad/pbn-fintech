import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { cashRequestsApi } from '../api/cashRequests';
import { motion } from 'framer-motion';
import {
  FiDollarSign,
  FiMapPin,
  FiNavigation,
  FiFileText,
  FiArrowLeft,
} from 'react-icons/fi';
import { HiCash, HiCurrencyDollar } from 'react-icons/hi';

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

  const Icon = requestType === 'NEED_CASH' ? HiCurrencyDollar : HiCash;
  const colorScheme =
    requestType === 'NEED_CASH'
      ? 'bg-gradient-danger text-red-700'
      : 'bg-gradient-success text-green-700';

  return (
    <div className="min-h-screen bg-gradient-app py-8">
      <div className="max-w-2xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          {/* Header */}
          <div className={`${colorScheme} p-8 text-white`}>
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <FiArrowLeft className="text-2xl" />
              </button>
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg ${
                  requestType === 'NEED_CASH' ? 'bg-red-500/30' : 'bg-green-500/30'
                }`}
              >
                <Icon className="text-4xl" />
              </div>
            </div>
            <h1 className="text-3xl font-bold">
              {requestType === 'NEED_CASH' ? 'I Need Cash' : 'I Have Cash'}
            </h1>
            <p className="text-white/90 mt-2">
              {requestType === 'NEED_CASH'
                ? 'Create a request to find cash nearby'
                : 'Help someone who needs cash'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8">
            <div className="space-y-6">
              {/* Amount */}
              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-3">
                  <div className="flex items-center gap-2">
                    <FiDollarSign className="text-primary-600" />
                    Amount (EUR)
                  </div>
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="200"
                  min="10"
                  max="500"
                  step="10"
                  className="input text-lg"
                  required
                />
                <p className="text-xs text-gray-500 mt-2 bg-blue-50 p-2 rounded-lg">
                  Minimum: €10 | Maximum: €500
                </p>
              </div>

              {/* Location */}
              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-3">
                  <div className="flex items-center gap-2">
                    <FiMapPin className="text-primary-600" />
                    Location Description
                  </div>
                </label>
                <input
                  type="text"
                  value={locationDescription}
                  onChange={(e) => setLocationDescription(e.target.value)}
                  placeholder="e.g., Amsterdam Central Station"
                  className="input"
                  required
                />
                <div className="mt-2 flex items-center gap-2 text-xs text-gray-500 bg-green-50 p-3 rounded-lg">
                  <FiNavigation className="text-success-600" />
                  {location
                    ? `Location detected: ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`
                    : 'Detecting your location...'}
                </div>
              </div>

              {/* Radius */}
              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-3">
                  <div className="flex items-center gap-2">
                    <FiNavigation className="text-primary-600" />
                    Search Radius
                  </div>
                </label>
                <select value={radiusKm} onChange={(e) => setRadiusKm(e.target.value)} className="input">
                  <option value="1">1 km - Very close</option>
                  <option value="2">2 km - Walking distance</option>
                  <option value="5">5 km - Short bike ride (recommended)</option>
                  <option value="10">10 km - Longer distance</option>
                </select>
              </div>

              {/* Special Requirements */}
              <div>
                <label className="block text-gray-700 text-sm font-semibold mb-3">
                  <div className="flex items-center gap-2">
                    <FiFileText className="text-primary-600" />
                    Special Requirements <span className="text-gray-400">(Optional)</span>
                  </div>
                </label>
                <textarea
                  value={specialRequirements}
                  onChange={(e) => setSpecialRequirements(e.target.value)}
                  placeholder="e.g., Prefer meeting at a bank or public place"
                  rows={4}
                  className="input resize-none"
                />
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 bg-red-50 border-2 border-red-200 text-red-700 rounded-xl flex items-start gap-3"
              >
                <span className="text-red-500 text-xl">⚠️</span>
                <span>{error}</span>
              </motion.div>
            )}

            <div className="flex gap-3 mt-8">
              <button
                type="submit"
                disabled={loading || !location}
                className={`btn flex-1 py-3 text-lg shadow-xl ${
                  requestType === 'NEED_CASH' ? 'btn-danger' : 'btn-success'
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin">⏳</span> Creating...
                  </span>
                ) : (
                  'Create Request'
                )}
              </button>

              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="px-8 py-3 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-semibold transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};
