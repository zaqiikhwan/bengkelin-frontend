import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
  HomeIcon, 
  WrenchScrewdriverIcon, 
  CalendarIcon, 
  UserIcon,
  ArrowRightOnRectangleIcon,
  HeartIcon,
  TruckIcon,
  MapPinIcon,
  BuildingStorefrontIcon,
  ChatBubbleLeftRightIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import { DarkModeToggle } from './DarkModeToggle';

const Layout: React.FC = () => {
  const { user, mitra, userType, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dropdownButtonRef = useRef<HTMLButtonElement>(null);

  // Close dropdown on Escape key or outside click
  useEffect(() => {
    if (!accountDropdownOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setAccountDropdownOpen(false);
        dropdownButtonRef.current?.focus();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setAccountDropdownOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [accountDropdownOpen]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  // Main navigation items
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

  // Account dropdown items (only for users)
  const accountItems = userType === 'users' 
    ? [
        { name: 'Profile', href: '/profile', icon: UserIcon },
        { name: 'My Vehicles', href: '/vehicles', icon: TruckIcon },
        { name: 'Addresses', href: '/addresses', icon: MapPinIcon },
      ]
    : [
        { name: 'Profile', href: '/profile', icon: UserIcon },
      ];

  const currentUser = userType === 'mitras' ? mitra : user;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Skip to content link for keyboard users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary-600 focus:text-white focus:rounded-lg"
      >
        Skip to content
      </a>

      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              {/* Logo */}
              <div className="flex-shrink-0 flex items-center">
                <WrenchScrewdriverIcon className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">
                  {import.meta.env.VITE_APP_NAME}
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
                <div className="relative flex items-center h-16" ref={dropdownRef}>
                  <button
                    ref={dropdownButtonRef}
                    onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
                    aria-haspopup="true"
                    aria-expanded={accountDropdownOpen}
                    aria-controls="account-dropdown-menu"
                    className={`inline-flex items-center px-3 h-16 text-sm font-medium border-b-2 transition-colors ${
                      accountItems.some(item => isActive(item.href))
                        ? 'border-primary-600 dark:border-primary-400 text-primary-600 dark:text-primary-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <UserIcon className="h-4 w-4 mr-2" />
                    My Account
                    <ChevronDownIcon className={`h-4 w-4 ml-1 transition-transform ${accountDropdownOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
                  </button>

                  {/* Dropdown Menu */}
                  {accountDropdownOpen && (
                    <div
                      id="account-dropdown-menu"
                      role="menu"
                      aria-label="Account menu"
                      className="absolute right-0 top-full mt-0 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-50"
                    >
                      <div className="py-1">
                        {accountItems.map((item) => (
                          <Link
                            key={item.name}
                            to={item.href}
                            role="menuitem"
                            onClick={() => setAccountDropdownOpen(false)}
                            className={`flex items-center px-4 py-2 text-sm transition-colors ${
                              isActive(item.href)
                                ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                          >
                            <item.icon className="h-4 w-4 mr-3" aria-hidden="true" />
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
              {/* Dark Mode Toggle */}
              <DarkModeToggle />
              
              {/* User info - hidden on mobile */}
              <div className="hidden md:flex items-center space-x-2">
                <UserIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {currentUser?.first_name} {currentUser?.last_name}
                </span>
              </div>

              {/* Logout button - hidden on mobile */}
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
              {/* Main navigation */}
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

              {/* Account items */}
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

              {/* User info and logout */}
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

      {/* Main content */}
      <main id="main-content" className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>

      {/* Health Check Link */}
      <div className="fixed bottom-4 right-4">
        <Link
          to="/health"
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500 hover:text-gray-700 bg-white dark:bg-gray-800 dark:text-gray-300 dark:hover:text-white shadow-sm hover:shadow-md transition-all"
        >
          <HeartIcon className="h-4 w-4 mr-2" />
          Health
        </Link>
      </div>
    </div>
  );
};

export default Layout;