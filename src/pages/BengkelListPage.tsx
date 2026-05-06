import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import PublicHeader from '../components/PublicHeader';
import { 
  BuildingStorefrontIcon,
  MapPinIcon,
  StarIcon,
  PhoneIcon,
  CheckCircleIcon,
  XCircleIcon,
  MagnifyingGlassIcon,
  UserIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import type { Bengkel } from '../types/api';

const BengkelListPage: React.FC = () => {
  const { isAuthenticated, user, mitra, logout } = useAuth();
  const [bengkels, setBengkels] = useState<Bengkel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    loadBengkels();
  }, []);

  const loadBengkels = async (page = 1, search = '') => {
    try {
      setLoading(page === 1);
      if (page > 1) setLoadingMore(true);
      
      let response;
      if (search.trim()) {
        response = await apiService.searchBengkels(search, undefined, page, 10);
      } else {
        response = await apiService.getBengkels(page, 10);
      }
      
      console.log('API Response:', response); // Debug log
      
      if (response.success && response.data) {
        // Handle both old and new API response structures
        const responseData = response.data as any;
        const bengkelItems = responseData.items || responseData.bengkels || [];
        const pagination = responseData.pagination || {};
        
        if (page === 1) {
          setBengkels(bengkelItems);
        } else {
          setBengkels(prev => [...prev, ...bengkelItems]);
        }
        
        // Use pagination data if available, otherwise fallback to old structure
        const total = pagination.total || responseData.total || 0;
        const totalPagesCount = pagination.total_pages || Math.ceil(total / 10);
        
        setTotalPages(totalPagesCount);
        setCurrentPage(page);
      } else {
        // Handle case where no data is returned
        if (page === 1) {
          setBengkels([]);
        }
        setTotalPages(1);
      }
    } catch (err: any) {
      console.error('Failed to load bengkels:', err);
      setError('Failed to load bengkels');
      if (page === 1) {
        setBengkels([]);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadBengkels(1, searchQuery);
  };

  const loadMore = () => {
    if (currentPage < totalPages) {
      loadBengkels(currentPage + 1, searchQuery);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <div key={star}>
            {star <= rating ? (
              <StarSolidIcon className="h-4 w-4 text-yellow-400" />
            ) : (
              <StarIcon className="h-4 w-4 text-gray-300" />
            )}
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const content = (
    <>
      {/* Header */}
      {!isAuthenticated && (
        <div className="bg-white dark:bg-gray-800 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Find Bengkels</h1>
                <p className="text-gray-600 dark:text-gray-400">Discover trusted automotive workshops near you</p>
              </div>
            </div>
            
            {/* Search */}
            <form onSubmit={handleSearch} className="mt-6">
              <div className="flex space-x-4">
                <div className="flex-1 relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
                  <input
                    type="text"
                    className="input-field pl-10 w-full"
                    placeholder="Search bengkels by name or service..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn-primary">
                  Search
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Authenticated Header */}
      {isAuthenticated && (
        <div className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <Link to="/dashboard" className="flex items-center space-x-2">
                  <BuildingStorefrontIcon className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                  <span className="text-xl font-bold text-gray-900 dark:text-white">Bengkelin</span>
                </Link>
              </div>
              
              <nav className="hidden md:flex space-x-8">
                <Link to="/dashboard" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 px-3 py-2 text-sm font-medium">
                  Dashboard
                </Link>
                <Link to="/bengkels" className="text-primary-600 dark:text-primary-400 px-3 py-2 text-sm font-medium border-b-2 border-primary-600 dark:border-primary-400">
                  Find Bengkels
                </Link>
                <Link to="/orders" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 px-3 py-2 text-sm font-medium">
                  My Orders
                </Link>
                <Link to="/chat" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 px-3 py-2 text-sm font-medium">
                  Chat
                </Link>
              </nav>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <UserIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {user?.first_name || mitra?.first_name || 'User'}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center space-x-1 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 px-3 py-2 text-sm font-medium"
                >
                  <ArrowRightOnRectangleIcon className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className={`${isAuthenticated ? 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'} py-8`}>
        {/* Search for authenticated users */}
        {isAuthenticated && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Find Bengkels</h1>
                <p className="text-gray-600 dark:text-gray-400">Discover trusted automotive workshops near you</p>
              </div>
            </div>
            
            <form onSubmit={handleSearch}>
              <div className="flex space-x-4">
                <div className="flex-1 relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
                  <input
                    type="text"
                    className="input-field pl-10 w-full"
                    placeholder="Search bengkels by name or service..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn-primary">
                  Search
                </button>
              </div>
            </form>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}

        {bengkels.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bengkels.map((bengkel) => (
                <Link
                  key={bengkel.bengkel_id}
                  to={`/bengkels/${bengkel.bengkel_id}`}
                  className="card hover:shadow-lg transition-shadow cursor-pointer"
                >
                  {/* Bengkel Image */}
                  <div className="relative h-48 bg-gray-200 rounded-t-lg overflow-hidden">
                    {bengkel.avatar_url ? (
                      <img
                        src={bengkel.avatar_url}
                        alt={bengkel.bengkel_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BuildingStorefrontIcon className="w-16 h-16 text-gray-400" />
                      </div>
                    )}
                    
                    {/* Status Badge */}
                    <div className="absolute top-3 right-3">
                      {bengkel.is_open ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircleIcon className="w-3 h-3 mr-1" />
                          Open
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <XCircleIcon className="w-3 h-3 mr-1" />
                          Closed
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Bengkel Info */}
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{bengkel.bengkel_name}</h3>
                    
                    {/* Rating */}
                    <div className="flex items-center space-x-2 mb-3">
                      {renderStars(4)} {/* Default rating since it's not in the basic bengkel type */}
                      <span className="text-sm text-gray-600 dark:text-gray-400">(4.0)</span>
                    </div>

                    {/* Contact */}
                    <div className="flex items-center space-x-2 mb-3">
                      <PhoneIcon className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">{bengkel.bengkel_phone}</span>
                    </div>

                    {/* Address */}
                    {bengkel.addresses && bengkel.addresses.length > 0 && (
                      <div className="flex items-start space-x-2 mb-3">
                        <MapPinIcon className="w-4 h-4 text-gray-400 dark:text-gray-500 mt-0.5" />
                        <span className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {bengkel.addresses[0]?.full_address || 'Address not available'}
                        </span>
                      </div>
                    )}

                    {/* Services */}
                    <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                      {bengkel.home_service && (
                        <span className="flex items-center">
                          <CheckCircleIcon className="w-3 h-3 mr-1 text-green-500" />
                          Home Service
                        </span>
                      )}
                      {bengkel.store_service && (
                        <span className="flex items-center">
                          <CheckCircleIcon className="w-3 h-3 mr-1 text-green-500" />
                          In-Store
                        </span>
                      )}
                    </div>

                    {/* Service Count */}
                    {bengkel.services && bengkel.services.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                        <span className="text-sm text-primary-600 dark:text-primary-400 font-medium">
                          {bengkel.services?.length || 0} services available
                        </span>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>

            {/* Load More */}
            {currentPage < totalPages && (
              <div className="text-center mt-8">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="btn-secondary"
                >
                  {loadingMore ? 'Loading...' : 'Load More Bengkels'}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <BuildingStorefrontIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No bengkels found</h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchQuery ? 'Try adjusting your search terms.' : 'No bengkels are available at the moment.'}
            </p>
          </div>
        )}
      </div>
    </>
  );

  // Use different layouts based on authentication status
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {!isAuthenticated && <PublicHeader />}
      {content}
    </div>
  );
};

export default BengkelListPage;