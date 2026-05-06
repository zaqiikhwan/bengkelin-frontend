import React from 'react';
import { Link } from 'react-router-dom';
import PublicHeader from '../components/PublicHeader';
import { 
  BuildingStorefrontIcon,
  WrenchScrewdriverIcon,
  StarIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <PublicHeader />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Find Trusted Bengkels
            </h1>
            <p className="text-xl text-primary-100 mb-8 max-w-3xl mx-auto">
              Discover reliable automotive workshops near you. Book services, read reviews, and get your vehicle serviced by trusted professionals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/bengkels" className="btn-primary bg-white text-primary-600 hover:bg-gray-50">
                Find Bengkels
                <ArrowRightIcon className="w-5 h-5 ml-2" />
              </Link>
              <Link to="/register" className="btn-secondary border-white text-white hover:bg-white hover:text-primary-600">
                Join as Mitra
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Bengkelin?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We connect you with verified automotive workshops that provide quality service at fair prices.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BuildingStorefrontIcon className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Verified Bengkels</h3>
              <p className="text-gray-600">
                All workshops are verified and reviewed by our team to ensure quality service.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <WrenchScrewdriverIcon className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Quality Service</h3>
              <p className="text-gray-600">
                Professional mechanics with years of experience in automotive repair and maintenance.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <StarIcon className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Customer Reviews</h3>
              <p className="text-gray-600">
                Read authentic reviews from other customers to make informed decisions.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Get Started?</h2>
          <p className="text-lg text-gray-300 mb-8">
            Find the perfect bengkel for your vehicle maintenance needs.
          </p>
          <Link to="/bengkels" className="btn-primary">
            Browse Bengkels
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;