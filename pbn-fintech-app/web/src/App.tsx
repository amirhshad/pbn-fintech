import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { Layout } from './components/common/Layout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { CreateCashRequestPage } from './pages/CreateCashRequestPage';
import { BrowseCashRequestsPage } from './pages/BrowseCashRequestsPage';
import { MatchesPage } from './pages/MatchesPage';
import { TransactionsPage } from './pages/TransactionsPage';

function App() {
  return (
    <Provider store={store}>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <DashboardPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/cash-requests"
            element={
              <ProtectedRoute>
                <Layout>
                  <BrowseCashRequestsPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/cash-requests/create"
            element={
              <ProtectedRoute>
                <Layout>
                  <CreateCashRequestPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/matches"
            element={
              <ProtectedRoute>
                <Layout>
                  <MatchesPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/transactions"
            element={
              <ProtectedRoute>
                <Layout>
                  <TransactionsPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Default route */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </Provider>
  );
}

export default App;
