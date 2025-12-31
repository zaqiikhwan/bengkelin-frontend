import React from 'react';
import { Link, useNavigate, Outlet } from 'react-router-dom';
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
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';

const Layout: React.FC = () => {
  const { user, mitra, userType, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Navigation items based on user type
  const userNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Bengkels', href: '/bengkels', icon: WrenchScrewdriverIcon },
    { name: 'My Orders', href: '/orders', icon: CalendarIcon },
    { name: 'My Vehicles', href: '/vehicles', icon: TruckIcon },
    { name: 'Addresses', href: '/addresses', icon: MapPinIcon },
    { name: 'Chat', href: '/chat', icon: ChatBubbleLeftRightIcon },
    { name: 'Profile', href: '/profile', icon: UserIcon },
  ];

  const mitraNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'My Bengkel', href: '/bengkel', icon: BuildingStorefrontIcon },
    { name: 'Orders', href: '/orders', icon: CalendarIcon },
    { name: 'Chat', href: '/chat', icon: ChatBubbleLeftRightIcon },
    { name: 'Profile', href: '/profile', icon: UserIcon },
  ];

  const navigation = userType === 'mitras' ? mitraNavigation : userNavigation;
  const currentUser = userType === 'mitras' ? mitra : user;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <WrenchScrewdriverIcon className="h-8 w-8 text-primary-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">
                  {import.meta.env.VITE_APP_NAME}
                </span>
                {userType && (
                  <span className="ml-3 px-2 py-1 text-xs font-medium bg-primary-100 text-primary-800 rounded-full">
                    {userType === 'mitras' ? 'Bengkel Owner' : 'Customer'}
                  </span>
                )}
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  >
                    <item.icon className="h-4 w-4 mr-2" />
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <UserIcon className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-700">
                  {currentUser?.first_name} {currentUser?.last_name}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Mobile navigation */}
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="flex items-center px-3 py-2 text-base font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              >
                <item.icon className="h-5 w-5 mr-3" />
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>

      {/* Health Check Link */}
      <div className="fixed bottom-4 right-4">
        <Link
          to="/health"
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500 hover:text-gray-700 bg-white shadow-sm hover:shadow-md transition-shadow"
        >
          <HeartIcon className="h-4 w-4 mr-2" />
          Health
        </Link>
      </div>
    </div>
  );
};

export default Layout;