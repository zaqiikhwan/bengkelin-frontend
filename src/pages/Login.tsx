import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { WrenchScrewdriverIcon, UserIcon, BuildingStorefrontIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { DarkModeToggle } from '../components/DarkModeToggle';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
      
      // Handle specific error messages for better UX
      let errorMessage = err.message || 'Login failed';
      
      // For mitra login errors, provide more context
      if (userType === 'mitras') {
        if (errorMessage.includes('not registered yet')) {
          errorMessage = 'Mitra account not found. Please register first to create your bengkel account.';
        } else if (errorMessage.includes('Invalid email or password')) {
          errorMessage = 'Invalid email or password. Please check your credentials and try again.';
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors">
      {/* Dark Mode Toggle - Fixed Position */}
      <div className="fixed top-4 right-4 z-50">
        <DarkModeToggle />
      </div>
      
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <WrenchScrewdriverIcon className="h-12 w-12 text-primary-600 dark:text-primary-400" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Sign in to {import.meta.env.VITE_APP_NAME}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Or{' '}
            <Link
              to="/register"
              className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
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
                ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900 dark:text-primary-300 dark:border-primary-600'
                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
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
                ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900 dark:text-primary-300 dark:border-primary-600'
                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            <BuildingStorefrontIcon className="h-5 w-5 mr-2" />
            Bengkel Owner
          </button>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-danger-50 border border-danger-200 text-danger-600 px-4 py-3 rounded-md dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
              <p>{error}</p>
              {error.includes('not registered yet') && userType === 'mitras' && (
                <div className="mt-2">
                  <Link
                    to="/register"
                    className="text-sm font-medium text-primary-600 hover:text-primary-500 underline dark:text-primary-400 dark:hover:text-primary-300"
                  >
                    Register as Bengkel Owner here →
                  </Link>
                </div>
              )}
            </div>
          )}
          {success && (
            <div className="bg-success-100 border border-success-200 text-success-600 px-4 py-3 rounded-md dark:bg-green-900/20 dark:border-green-800 dark:text-green-400">
              <p>{success}</p>
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
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
                className="input-field dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                placeholder="Enter your email"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pr-10 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || !!success}
              className="btn-primary w-full dark:bg-primary-600 dark:hover:bg-primary-700"
            >
              {loading ? 'Signing in...' : success ? 'Login Successful!' : `Sign in as ${userType === 'users' ? 'Customer' : 'Bengkel Owner'}`}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Signing in as a {userType === 'users' ? 'Customer' : 'Bengkel Owner'}
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;