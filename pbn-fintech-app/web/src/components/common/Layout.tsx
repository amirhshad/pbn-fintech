import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppDispatch';
import { logout } from '../../store/authSlice';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <Link to="/dashboard" className="text-xl font-bold text-primary-600">
              PBN Fintech
            </Link>

            <div className="flex items-center gap-4">
              <Link to="/dashboard" className="text-gray-700 hover:text-primary-600">
                Dashboard
              </Link>
              <Link to="/cash-requests" className="text-gray-700 hover:text-primary-600">
                Requests
              </Link>
              <Link to="/matches" className="text-gray-700 hover:text-primary-600">
                Matches
              </Link>
              <Link to="/transactions" className="text-gray-700 hover:text-primary-600">
                History
              </Link>

              <div className="border-l pl-4 ml-4">
                <span className="text-gray-700 mr-4">{user?.fullName}</span>
                <button
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-gray-900"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>{children}</main>
    </div>
  );
};
