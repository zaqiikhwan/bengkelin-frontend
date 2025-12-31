import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { WrenchScrewdriverIcon, UserIcon, BuildingStorefrontIcon } from '@heroicons/react/24/outline';

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    password: '',
    confirm_password: ''
  });
  const [userType, setUserType] = useState<'users' | 'mitras'>('users');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { registerAsUser, registerAsMitra, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      console.log('User already authenticated, redirecting...');
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirm_password) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      if (userType === 'users') {
        await registerAsUser(formData);
      } else {
        await registerAsMitra(formData);
      }
      
      console.log('Registration successful, redirecting to dashboard...');
      setSuccess('Registration successful! Redirecting...');
      
      // Try React Router navigation first, then fallback to window.location
      setTimeout(() => {
        try {
          navigate('/dashboard', { replace: true });
          console.log('React Router navigation attempted');
        } catch (navError) {
          console.error('React Router navigation failed:', navError);
        }
        
        // Also use window.location as backup after a short delay
        setTimeout(() => {
          if (window.location.pathname !== '/dashboard') {
            console.log('Fallback to window.location redirect');
            window.location.href = '/dashboard';
          }
        }, 500);
      }, 500);
      
    } catch (err: any) {
      setError(err.message || 'Registration failed');
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
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link
              to="/login"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              sign in to your existing account
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
                  First Name
                </label>
                <input
                  id="first_name"
                  name="first_name"
                  type="text"
                  required
                  value={formData.first_name}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="First name"
                />
              </div>
              <div>
                <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
                  Last Name
                </label>
                <input
                  id="last_name"
                  name="last_name"
                  type="text"
                  required
                  value={formData.last_name}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Last name"
                />
              </div>
            </div>
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
                value={formData.email}
                onChange={handleChange}
                className="input-field"
                placeholder="Enter your email"
              />
            </div>
            <div>
              <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                id="phone_number"
                name="phone_number"
                type="tel"
                required
                value={formData.phone_number}
                onChange={handleChange}
                className="input-field"
                placeholder="Enter your phone number"
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
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={handleChange}
                className="input-field"
                placeholder="Enter your password"
              />
            </div>
            <div>
              <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <input
                id="confirm_password"
                name="confirm_password"
                type="password"
                autoComplete="new-password"
                required
                value={formData.confirm_password}
                onChange={handleChange}
                className="input-field"
                placeholder="Confirm your password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || !!success}
              className="btn-primary w-full"
            >
              {loading ? 'Creating account...' : success ? 'Registration Successful!' : `Create ${userType === 'users' ? 'Customer' : 'Bengkel Owner'} account`}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Creating account as a {userType === 'users' ? 'Customer' : 'Bengkel Owner'}
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;