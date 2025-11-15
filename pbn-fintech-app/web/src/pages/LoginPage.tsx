import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/useAppDispatch';
import { login, verifyPhone, register } from '../store/authSlice';

export const LoginPage: React.FC = () => {
  const [step, setStep] = useState<'phone' | 'verify' | 'register'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, error: authError } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Format phone number to include +31 prefix
    const formattedPhone = phoneNumber.startsWith('+31')
      ? phoneNumber
      : `+31${phoneNumber.replace(/^0+/, '')}`;

    try {
      await dispatch(login(formattedPhone)).unwrap();
      setStep('verify');
    } catch (err: any) {
      // If user doesn't exist, go to registration
      if (err.message?.includes('not found')) {
        setStep('register');
      } else {
        setError(err.message || 'Login failed');
      }
    }
  };

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const formattedPhone = phoneNumber.startsWith('+31')
      ? phoneNumber
      : `+31${phoneNumber.replace(/^0+/, '')}`;

    try {
      await dispatch(verifyPhone({ phoneNumber: formattedPhone, code: verificationCode })).unwrap();
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Verification failed');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const formattedPhone = phoneNumber.startsWith('+31')
      ? phoneNumber
      : `+31${phoneNumber.replace(/^0+/, '')}`;

    try {
      await dispatch(register({ fullName, phoneNumber: formattedPhone })).unwrap();
      setStep('verify');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">PBN Fintech</h1>
          <p className="text-gray-600 mt-2">Peer-to-Peer Cash Exchange</p>
        </div>

        {step === 'phone' && (
          <form onSubmit={handlePhoneSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Phone Number
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                  +31
                </span>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="612345678"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Test users: 612345678, 687654321, 655555555, 644444444
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {isLoading ? 'Loading...' : 'Continue'}
            </button>
          </form>
        )}

        {step === 'register' && (
          <form onSubmit={handleRegisterSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Phone Number
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                  +31
                </span>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {isLoading ? 'Registering...' : 'Register'}
            </button>

            <button
              type="button"
              onClick={() => setStep('phone')}
              className="w-full mt-2 text-primary-600 hover:text-primary-700"
            >
              Back
            </button>
          </form>
        )}

        {step === 'verify' && (
          <form onSubmit={handleVerificationSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Verification Code
              </label>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="Enter 6-digit code"
                maxLength={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-center text-2xl tracking-widest"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Check your phone for the verification code (or use 123456 for test users)
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {isLoading ? 'Verifying...' : 'Verify'}
            </button>

            <button
              type="button"
              onClick={() => setStep('phone')}
              className="w-full mt-2 text-primary-600 hover:text-primary-700"
            >
              Back
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
