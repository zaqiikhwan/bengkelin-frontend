import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import type { Bengkel } from '../types/api';
import { 
  WrenchScrewdriverIcon, 
  MapPinIcon, 
  StarIcon,
  PhoneIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

const BengkelsPage: React.FC = () => {
  const navigate = useNavigate();
  const [bengkels, setBengkels] = useState<Bengkel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadBengkels();
  }, []);

  const loadBengkels = async () => {
    try {
      const response = await apiService.getBengkels(1, 20);
      if (response.success) {
        setBengkels(response.data?.bengkels || []);
      }
    } catch (error) {
      console.error('Failed to load bengkels:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadBengkels();
      return;
    }

    setLoading(true);
    try {
      const response = await apiService.searchBengkels(searchQuery);
      if (response.success) {
        setBengkels(response.data?.bengkels || []);
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Bengkels</h1>
          <p className="mt-2 text-sm text-gray-700">
            Find and book services at nearby bengkels.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="mt-6">
        <div className="flex space-x-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search bengkels..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="input-field pl-10"
              />
            </div>
          </div>
          <button
            onClick={handleSearch}
            className="btn-primary"
          >
            Search
          </button>
        </div>
      </div>

      {/* Bengkels Grid */}
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {bengkels.map((bengkel) => (
          <div key={bengkel.bengkel_id} className="card hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  <WrenchScrewdriverIcon className="h-6 w-6 text-primary-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {bengkel.bengkel_name}
                  </h3>
                  <div className="flex items-center mt-1">
                    <StarIcon className="h-4 w-4 text-yellow-400 mr-1" />
                    <span className="text-sm text-gray-600">
                      4.5/5
                    </span>
                  </div>
                </div>
              </div>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                bengkel.is_open ? 'text-success-600 bg-success-100' : 'text-danger-600 bg-danger-100'
              }`}>
                {bengkel.is_open ? 'Open' : 'Closed'}
              </span>
            </div>

            <p className="mt-3 text-sm text-gray-600 line-clamp-2">
              Professional automotive repair services
            </p>

            <div className="mt-4 space-y-2">
              <div className="flex items-center text-sm text-gray-500">
                <MapPinIcon className="h-4 w-4 mr-2" />
                <span className="truncate">{bengkel.addresses?.[0]?.full_address || 'Address not available'}</span>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <PhoneIcon className="h-4 w-4 mr-2" />
                <span>{bengkel.bengkel_phone}</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200 flex space-x-2">
              <button 
                onClick={() => navigate(`/booking/${bengkel.bengkel_id}`)}
                className="btn-primary flex-1"
              >
                Book Service
              </button>
              <button className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {bengkels.length === 0 && (
        <div className="text-center py-12">
          <WrenchScrewdriverIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No bengkels found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search criteria.
          </p>
        </div>
      )}
    </div>
  );
};

export default BengkelsPage;