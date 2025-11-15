import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppDispatch';
import { loadUserFromStorage } from '../../store/authSlice';

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
        // User not found in storage
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <div className="text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
