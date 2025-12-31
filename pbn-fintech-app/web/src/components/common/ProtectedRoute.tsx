import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppDispatch';
import { loadUserFromStorage } from '../../store/authSlice';
import { isDemoMode } from '../../utils/demoData';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        await dispatch(loadUserFromStorage()).unwrap();
      } catch (error) {
        // User not found in storage (skip in demo mode)
        if (isDemoMode()) {
          // In demo mode, try loading again
          await dispatch(loadUserFromStorage()).unwrap();
        }
      } finally {
        setLoading(false);
      }
    };

    if (!isAuthenticated) {
      loadUser();
    } else {
      setLoading(false);
    }
  }, [dispatch, isAuthenticated]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">💰</div>
          <div className="text-xl font-semibold text-gray-700">Loading PBN Fintech...</div>
        </div>
      </div>
    );
  }

  // In demo mode, always allow access
  if (isDemoMode() || isAuthenticated) {
    return <>{children}</>;
  }

  return <Navigate to="/login" replace />;
};
