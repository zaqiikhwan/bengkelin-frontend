import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { WrenchScrewdriverIcon, UserIcon, BuildingStorefrontIcon } from '@heroicons/react/24/outline';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState<'users' | 'mitras'>('users');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { loginAsUser, loginAsMitra, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      console.log('User already authenticated, redirecting...');
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (userType === 'users') {
        await loginAsUser(email, password);
      } else {
        await loginAsMitra(email, password);
      }
      
      console.log('Login successful, redirecting to dashboard...');
      setSuccess('Login successful! Redirecting...');
      
      // Simple redirect - let the useEffect in App.tsx handle the redirect
      // The authentication state will trigger the redirect automatically
      
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <WrenchScrewdriverIcon className="h-12 w-12 text-primary-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to {import.meta.env.VITE_APP_NAME}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link
              to="/register"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              create a new account
            </Link>
          </p>
        </div>

        {/* User Type Selection */}
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={() => setUserType('users')}
            className={`flex-1 flex items-center justify-center px-4 py-3 border rounded-lg text-sm font-medium transition-colors ${
              userType === 'users'
                ? 'border-primary-500 bg-primary-50 text-primary-700'
                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <UserIcon className="h-5 w-5 mr-2" />
            Customer
          </button>
          <button
            type="button"
            onClick={() => setUserType('mitras')}
            className={`flex-1 flex items-center justify-center px-4 py-3 border rounded-lg text-sm font-medium transition-colors ${
              userType === 'mitras'
                ? 'border-primary-500 bg-primary-50 text-primary-700'
                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <BuildingStorefrontIcon className="h-5 w-5 mr-2" />
            Bengkel Owner
          </button>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-danger-50 border border-danger-200 text-danger-600 px-4 py-3 rounded-md">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-success-100 border border-success-200 text-success-600 px-4 py-3 rounded-md">
              <p>{success}</p>
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="Enter your email"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="Enter your password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || !!success}
              className="btn-primary w-full"
            >
              {loading ? 'Signing in...' : success ? 'Login Successful!' : `Sign in as ${userType === 'users' ? 'Customer' : 'Bengkel Owner'}`}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Signing in as a {userType === 'users' ? 'Customer' : 'Bengkel Owner'}
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;