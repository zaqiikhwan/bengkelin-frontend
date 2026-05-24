import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { apiService } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import PublicHeader from '../components/PublicHeader';
import { DarkModeToggle } from '../components/DarkModeToggle';
import BengkelCard from '../components/BengkelCard';
import { SkeletonCard } from '../components/ui/Skeleton';
import {
  BuildingStorefrontIcon,
  MagnifyingGlassIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  WrenchScrewdriverIcon,
  HomeIcon,
  CalendarIcon,
  ChatBubbleLeftRightIcon,
  ChevronDownIcon,
  TruckIcon,
  MapPinIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import type { Bengkel } from '../types/api';

const BengkelListPage: React.FC = () => {
  const { isAuthenticated, user, mitra, userType, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [bengkels, setBengkels] = useState<Bengkel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;
  const currentUser = userType === 'mitras' ? mitra : user;

  const mainNavigation = userType === 'mitras'
    ? [
        { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
        { name: 'My Bengkel', href: '/bengkel', icon: BuildingStorefrontIcon },
        { name: 'Orders', href: '/orders', icon: CalendarIcon },
        { name: 'Chat', href: '/chat', icon: ChatBubbleLeftRightIcon },
      ]
    : [
        { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
        { name: 'Bengkels', href: '/bengkels', icon: WrenchScrewdriverIcon },
        { name: 'My Orders', href: '/orders', icon: CalendarIcon },
        { name: 'Chat', href: '/chat', icon: ChatBubbleLeftRightIcon },
      ];

  const accountItems = userType === 'mitras'
    ? [{ name: 'Profile', href: '/profile', icon: UserIcon }]
    : [
        { name: 'Profile', href: '/profile', icon: UserIcon },
        { name: 'My Vehicles', href: '/vehicles', icon: TruckIcon },
        { name: 'Addresses', href: '/addresses', icon: MapPinIcon },
      ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const loadBengkels = useCallback(async (page = 1, search = '') => {
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
  }, []);

  useEffect(() => {
    loadBengkels();
  }, [loadBengkels]);

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadBengkels(1, searchQuery);
  }, [loadBengkels, searchQuery]);

  const loadMore = useCallback(() => {
    if (currentPage < totalPages) {
      loadBengkels(currentPage + 1, searchQuery);
    }
  }, [loadBengkels, currentPage, totalPages, searchQuery]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
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

      {/* Authenticated Header - matches Layout nav */}
      {isAuthenticated && (
        <nav className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700 transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                {/* Logo */}
                <div className="flex-shrink-0 flex items-center">
                  <WrenchScrewdriverIcon className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                  <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">
                    Bengkelin
                  </span>
                  {userType && (
                    <span className="ml-3 px-2 py-1 text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-300 rounded-full">
                      {userType === 'mitras' ? 'Bengkel Owner' : 'Customer'}
                    </span>
                  )}
                </div>

                {/* Desktop Navigation */}
                <div className="hidden md:ml-6 md:flex md:items-center md:space-x-4">
                  {mainNavigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`inline-flex items-center px-3 h-16 text-sm font-medium border-b-2 transition-colors ${
                        isActive(item.href)
                          ? 'border-primary-600 dark:border-primary-400 text-primary-600 dark:text-primary-400'
                          : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <item.icon className="h-4 w-4 mr-2" />
                      {item.name}
                    </Link>
                  ))}

                  {/* My Account Dropdown */}
                  <div className="relative flex items-center h-16">
                    <button
                      onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
                      className={`inline-flex items-center px-3 h-16 text-sm font-medium border-b-2 transition-colors ${
                        accountItems.some(item => isActive(item.href))
                          ? 'border-primary-600 dark:border-primary-400 text-primary-600 dark:text-primary-400'
                          : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <UserIcon className="h-4 w-4 mr-2" />
                      My Account
                      <ChevronDownIcon className={`h-4 w-4 ml-1 transition-transform ${accountDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {accountDropdownOpen && (
                      <div className="absolute right-0 top-full mt-0 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-50">
                        <div className="py-1">
                          {accountItems.map((item) => (
                            <Link
                              key={item.name}
                              to={item.href}
                              onClick={() => setAccountDropdownOpen(false)}
                              className={`flex items-center px-4 py-2 text-sm transition-colors ${
                                isActive(item.href)
                                  ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                              }`}
                            >
                              <item.icon className="h-4 w-4 mr-3" />
                              {item.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right side items */}
              <div className="flex items-center space-x-2">
                <DarkModeToggle />
                <div className="hidden md:flex items-center space-x-2">
                  <UserIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {currentUser?.first_name} {currentUser?.last_name}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="hidden md:inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                >
                  <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
                  Logout
                </button>

                {/* Mobile menu button */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
                >
                  <span className="sr-only">Open main menu</span>
                  {mobileMenuOpen ? (
                    <XMarkIcon className="block h-6 w-6" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t dark:border-gray-700">
              <div className="px-2 pt-2 pb-3 space-y-1">
                {mainNavigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors ${
                      isActive(item.href)
                        ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700'
                    }`}
                  >
                    <item.icon className="h-5 w-5 mr-3" />
                    {item.name}
                  </Link>
                ))}
                <div className="pt-2 border-t dark:border-gray-700">
                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    My Account
                  </div>
                  {accountItems.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors ${
                        isActive(item.href)
                          ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700'
                      }`}
                    >
                      <item.icon className="h-5 w-5 mr-3" />
                      {item.name}
                    </Link>
                  ))}
                </div>
                <div className="pt-4 pb-3 border-t dark:border-gray-700">
                  <div className="flex items-center px-3 mb-3">
                    <UserIcon className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                    <div className="ml-3">
                      <div className="text-base font-medium text-gray-800 dark:text-white">
                        {currentUser?.first_name} {currentUser?.last_name}
                      </div>
                      <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {currentUser?.email}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="flex items-center w-full px-3 py-2 rounded-md text-base font-medium text-gray-500 hover:text-red-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-red-400 dark:hover:bg-gray-700 transition-colors"
                  >
                    <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3" />
                    Logout
                  </button>
                </div>
              </div>
            </div>
          )}
        </nav>
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
                <BengkelCard key={bengkel.bengkel_id} bengkel={bengkel} />
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