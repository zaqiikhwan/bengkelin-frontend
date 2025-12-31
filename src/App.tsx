import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Layout from './components/Layout';
import LoginPage from './pages/Login';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import BengkelsPage from './pages/BengkelsPage';
import OrdersPage from './pages/OrdersPage';
import HealthPage from './pages/HealthPage';
import VehiclesPage from './pages/VehiclesPage';
import AddressesPage from './pages/AddressesPage';
import ChatPage from './pages/ChatPage';
import BengkelManagementPage from './pages/BengkelManagementPage';
import BookingPage from './pages/BookingPage';
import ProtectedRoute from './components/ProtectedRoute';
import './index.css';

// Public Route Component (redirect to dashboard if authenticated)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  // Force re-render when authentication state changes
  useEffect(() => {
    if (isAuthenticated) {
      console.log('Authentication state changed to true, should redirect');
    }
  }, [isAuthenticated]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // If authenticated, redirect to dashboard
  if (isAuthenticated) {
    console.log('User is authenticated, redirecting to dashboard...');
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Public routes */}
            <Route 
              path="/login" 
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              } 
            />
            <Route 
              path="/register" 
              element={
                <PublicRoute>
                  <RegisterPage />
                </PublicRoute>
              } 
            />

            {/* Protected routes */}
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="bengkels" element={<BengkelsPage />} />
              <Route path="bengkel" element={<BengkelManagementPage />} />
              <Route path="orders" element={<OrdersPage />} />
              <Route path="vehicles" element={<VehiclesPage />} />
              <Route path="addresses" element={<AddressesPage />} />
              <Route path="chat" element={<ChatPage />} />
              <Route path="health" element={<HealthPage />} />
              <Route path="booking/:bengkelId" element={<BookingPage />} />
            </Route>

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
