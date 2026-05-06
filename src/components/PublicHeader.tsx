import React from 'react';
import { Link } from 'react-router-dom';
import { BuildingStorefrontIcon } from '@heroicons/react/24/outline';

const PublicHeader: React.FC = () => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <BuildingStorefrontIcon className="h-8 w-8 text-primary-600" />
            <span className="text-xl font-bold text-gray-900">Bengkelin</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              to="/bengkels" 
              className="text-gray-700 hover:text-primary-600 transition-colors"
            >
              Find Bengkels
            </Link>
            <Link 
              to="/login" 
              className="text-gray-700 hover:text-primary-600 transition-colors"
            >
              Login
            </Link>
            <Link 
              to="/register" 
              className="btn-primary"
            >
              Register
            </Link>
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button className="text-gray-700 hover:text-primary-600">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default PublicHeader;