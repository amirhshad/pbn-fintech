import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/useAppDispatch';
import { login, verifyPhone, register } from '../store/authSlice';
import { motion } from 'framer-motion';
import { FiPhone, FiUser, FiShield, FiArrowLeft } from 'react-icons/fi';

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
    <div className="min-h-screen bg-gradient-app flex items-center justify-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full"
      >
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-10">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="w-20 h-20 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
            >
              <FiPhone className="text-white text-4xl" />
            </motion.div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">PBN Fintech</h1>
            <p className="text-gray-600 text-lg">Peer-to-Peer Cash Exchange</p>
          </div>

          {/* Phone Step */}
          {step === 'phone' && (
            <motion.form
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handlePhoneSubmit}
            >
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-semibold mb-3">
                  <div className="flex items-center gap-2">
                    <FiPhone className="text-primary-600" />
                    Phone Number
                  </div>
                </label>
                <div className="flex shadow-sm">
                  <span className="inline-flex items-center px-4 rounded-l-xl border-2 border-r-0 border-gray-300 bg-gray-50 text-gray-600 text-base font-medium">
                    +31
                  </span>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="612345678"
                    className="input rounded-l-none flex-1"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2 bg-blue-50 p-3 rounded-lg border border-blue-100">
                  Test users: 612345678, 687654321, 655555555, 644444444
                </p>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-red-50 border-2 border-red-200 text-red-700 rounded-xl flex items-start gap-3"
                >
                  <span className="text-red-500 text-xl">⚠️</span>
                  <span>{error}</span>
                </motion.div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary w-full py-3 text-lg shadow-xl"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin">⏳</span> Loading...
                  </span>
                ) : (
                  'Continue'
                )}
              </button>
            </motion.form>
          )}

          {/* Register Step */}
          {step === 'register' && (
            <motion.form
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handleRegisterSubmit}
            >
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-semibold mb-3">
                  <div className="flex items-center gap-2">
                    <FiUser className="text-primary-600" />
                    Full Name
                  </div>
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  className="input"
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-semibold mb-3">
                  <div className="flex items-center gap-2">
                    <FiPhone className="text-primary-600" />
                    Phone Number
                  </div>
                </label>
                <div className="flex shadow-sm">
                  <span className="inline-flex items-center px-4 rounded-l-xl border-2 border-r-0 border-gray-300 bg-gray-50 text-gray-600 text-base font-medium">
                    +31
                  </span>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="input rounded-l-none flex-1"
                    required
                  />
                </div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-red-50 border-2 border-red-200 text-red-700 rounded-xl flex items-start gap-3"
                >
                  <span className="text-red-500 text-xl">⚠️</span>
                  <span>{error}</span>
                </motion.div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary w-full py-3 text-lg shadow-xl mb-3"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin">⏳</span> Registering...
                  </span>
                ) : (
                  'Register'
                )}
              </button>

              <button
                type="button"
                onClick={() => setStep('phone')}
                className="w-full flex items-center justify-center gap-2 text-primary-600 hover:text-primary-700 font-semibold py-2 transition-colors"
              >
                <FiArrowLeft /> Back
              </button>
            </motion.form>
          )}

          {/* Verify Step */}
          {step === 'verify' && (
            <motion.form
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handleVerificationSubmit}
            >
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-semibold mb-3">
                  <div className="flex items-center gap-2 justify-center">
                    <FiShield className="text-primary-600" />
                    Verification Code
                  </div>
                </label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="000000"
                  maxLength={6}
                  className="input text-center text-3xl tracking-widest font-bold"
                  required
                />
                <p className="text-xs text-gray-500 mt-3 bg-blue-50 p-3 rounded-lg border border-blue-100 text-center">
                  Check your phone for the verification code
                  <br />
                  <span className="font-semibold">(or use 123456 for test users)</span>
                </p>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-red-50 border-2 border-red-200 text-red-700 rounded-xl flex items-start gap-3"
                >
                  <span className="text-red-500 text-xl">⚠️</span>
                  <span>{error}</span>
                </motion.div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-success w-full py-3 text-lg shadow-xl mb-3"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin">⏳</span> Verifying...
                  </span>
                ) : (
                  'Verify & Continue'
                )}
              </button>

              <button
                type="button"
                onClick={() => setStep('phone')}
                className="w-full flex items-center justify-center gap-2 text-primary-600 hover:text-primary-700 font-semibold py-2 transition-colors"
              >
                <FiArrowLeft /> Back
              </button>
            </motion.form>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-gray-600 mt-6 text-sm">
          Secure peer-to-peer cash exchange platform
        </p>
      </motion.div>
    </div>
  );
};
