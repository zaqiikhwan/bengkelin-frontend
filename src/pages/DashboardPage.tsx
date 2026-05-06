import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { apiService } from '../services/api';
import type { Bengkel, Order } from '../types/api';
import { 
  CalendarIcon, 
  WrenchScrewdriverIcon, 
  ClockIcon,
  CheckCircleIcon,
  MapPinIcon,
  StarIcon
} from '@heroicons/react/24/outline';

const DashboardPage: React.FC = () => {
  const { user, mitra, userType } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [bengkels, setBengkels] = useState<Bengkel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [userType]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      if (userType === 'users') {
        // Load data for regular users
        const [ordersRes, bengkelsRes] = await Promise.all([
          apiService.getUserOrders(1, 5),
          apiService.getBengkels(1, 4)
        ]);
        
        if (ordersRes.success) {
          setOrders(ordersRes.data?.orders || []);
        }
        
        if (bengkelsRes.success) {
          setBengkels(bengkelsRes.data?.bengkels || []);
        }
      } else {
        // Load data for mitra users
        const [ordersRes, mitraProfileRes] = await Promise.all([
          apiService.getMitraOrders(1, 5),
          apiService.getMitraProfile()
        ]);
        
        if (ordersRes.success) {
          setOrders(ordersRes.data?.orders || []);
        }
        
        // For mitra, show their own bengkel instead of all bengkels
        if (mitraProfileRes.success && mitraProfileRes.data?.bengkel) {
          setBengkels(mitraProfileRes.data.bengkel);
        }
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: number) => {
    switch (status) {
      case 0: return 'text-yellow-600 bg-yellow-100'; // created
      case 1: return 'text-primary-600 bg-primary-100'; // confirmed
      case 2: return 'text-purple-600 bg-purple-100'; // finished
      case 3: return 'text-success-600 bg-success-100'; // paid
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: number) => {
    switch (status) {
      case 0: return 'Created';
      case 1: return 'Confirmed';
      case 2: return 'Finished';
      case 3: return 'Paid';
      default: return 'Unknown';
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
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Welcome back, {user?.first_name || mitra?.first_name} {user?.last_name || mitra?.last_name}!
          </h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            {userType === 'users' 
              ? "Here's what's happening with your orders and available bengkels."
              : "Here's what's happening with your bengkel and orders."
            }
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CalendarIcon className="h-6 w-6 text-gray-400 dark:text-gray-500" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  Total Orders
                </dt>
                <dd className="text-lg font-medium text-gray-900 dark:text-white">
                  {orders.length}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <WrenchScrewdriverIcon className="h-6 w-6 text-gray-400 dark:text-gray-500" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  {userType === 'users' ? 'Available Bengkels' : 'My Bengkels'}
                </dt>
                <dd className="text-lg font-medium text-gray-900 dark:text-white">
                  {bengkels.length}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ClockIcon className="h-6 w-6 text-gray-400 dark:text-gray-500" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  Pending Orders
                </dt>
                <dd className="text-lg font-medium text-gray-900 dark:text-white">
                  {orders.filter(o => o.status === 0).length}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircleIcon className="h-6 w-6 text-gray-400 dark:text-gray-500" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                  Completed
                </dt>
                <dd className="text-lg font-medium text-gray-900 dark:text-white">
                  {orders.filter(o => o.status === 3).length}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="mt-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Recent Orders</h2>
          </div>
        </div>
        <div className="mt-4 card">
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {orders.length === 0 ? (
              <li className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                No orders found
              </li>
            ) : (
              orders.map((order) => (
                <li key={order.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <CalendarIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          Order #{order.id}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {order.bengkel?.bengkel_name || 'Bengkel'} • {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        Rp {order.total_price.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>

      {/* Available Bengkels */}
      <div className="mt-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
              {userType === 'users' ? 'Available Bengkels' : 'My Bengkels'}
            </h2>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {bengkels.map((bengkel) => (
            <div key={bengkel.bengkel_id} className="card">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <WrenchScrewdriverIcon className="h-6 w-6 text-gray-400 dark:text-gray-500" />
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    {bengkel.bengkel_name}
                  </h3>
                  <div className="flex items-center mt-1">
                    <MapPinIcon className="h-4 w-4 text-gray-400 dark:text-gray-500 mr-1" />
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {bengkel.addresses?.[0]?.full_address || 'Address not available'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <StarIcon className="h-4 w-4 text-yellow-400 mr-1" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      ⭐ 4.5/5
                    </span>
                  </div>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    bengkel.is_open ? 'text-success-600 bg-success-100' : 'text-danger-600 bg-danger-100'
                  }`}>
                    {bengkel.is_open ? 'Open' : 'Closed'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;