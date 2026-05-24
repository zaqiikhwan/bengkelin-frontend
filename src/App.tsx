import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { ToastProvider } from './contexts/ToastContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Lazy-loaded pages
const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/Login'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const BengkelListPage = lazy(() => import('./pages/BengkelListPage'));
const BengkelDetailPage = lazy(() => import('./pages/BengkelDetailPage'));
const OrdersPage = lazy(() => import('./pages/OrdersPage'));
const OrderDetailsPage = lazy(() => import('./pages/OrderDetailsPage'));
const HealthPage = lazy(() => import('./pages/HealthPage'));
const VehiclesPage = lazy(() => import('./pages/VehiclesPage'));
const AddressesPage = lazy(() => import('./pages/AddressesPage'));
const ChatPage = lazy(() => import('./pages/ChatPage'));
const BengkelManagementPage = lazy(() => import('./pages/BengkelManagementPage'));
const BookingPage = lazy(() => import('./pages/BookingPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
  </div>
);

// Public Route Component (redirect to dashboard if authenticated)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      console.log('Authentication state changed to true, should redirect');
    }
  }, [isAuthenticated]);

  if (isLoading) {
    return <PageLoader />;
  }

  if (isAuthenticated) {
    console.log('User is authenticated, redirecting to dashboard...');
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
      <ToastProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Public landing page */}
                <Route path="/" element={<LandingPage />} />

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

                {/* Public bengkel routes */}
                <Route path="/bengkels" element={<BengkelListPage />} />
                <Route path="/bengkels/:id" element={<BengkelDetailPage />} />

                {/* Protected routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Layout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<DashboardPage />} />
                </Route>

                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Layout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<ProfilePage />} />
                </Route>

                <Route
                  path="/orders"
                  element={
                    <ProtectedRoute>
                      <Layout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<OrdersPage />} />
                  <Route path=":orderId" element={<OrderDetailsPage />} />
                </Route>

                <Route
                  path="/vehicles"
                  element={
                    <ProtectedRoute>
                      <Layout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<VehiclesPage />} />
                </Route>

                <Route
                  path="/addresses"
                  element={
                    <ProtectedRoute>
                      <Layout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<AddressesPage />} />
                </Route>

                <Route
                  path="/chat"
                  element={
                    <ProtectedRoute>
                      <Layout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<ChatPage />} />
                </Route>

                <Route
                  path="/bengkel"
                  element={
                    <ProtectedRoute>
                      <Layout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<BengkelManagementPage />} />
                </Route>

                <Route
                  path="/health"
                  element={
                    <ProtectedRoute>
                      <Layout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<HealthPage />} />
                </Route>

                <Route
                  path="/booking/:bengkelId"
                  element={
                    <ProtectedRoute>
                      <Layout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<BookingPage />} />
                </Route>

                {/* Catch all route */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>
          </div>
        </Router>
      </AuthProvider>
      </ToastProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
