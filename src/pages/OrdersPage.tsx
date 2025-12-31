import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import type { Order } from '../types/api';
import { 
  CalendarIcon, 
  WrenchScrewdriverIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const OrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const response = await apiService.getUserOrders(1, 50);
      if (response.success) {
        setOrders(response.data?.orders || []);
      }
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: number) => {
    switch (status) {
      case 0: return 'text-yellow-600 bg-yellow-100'; // pending
      case 1: return 'text-blue-600 bg-blue-100'; // confirmed
      case 2: return 'text-purple-600 bg-purple-100'; // in progress
      case 3: return 'text-success-600 bg-success-100'; // completed
      case 4: return 'text-red-600 bg-red-100'; // cancelled
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: number) => {
    switch (status) {
      case 0: return ClockIcon; // pending
      case 1: return CalendarIcon; // confirmed
      case 2: return WrenchScrewdriverIcon; // in progress
      case 3: return CheckCircleIcon; // completed
      case 4: return ExclamationTriangleIcon; // cancelled
      default: return CalendarIcon;
    }
  };

  const getStatusText = (status: number) => {
    switch (status) {
      case 0: return 'Pending';
      case 1: return 'Confirmed';
      case 2: return 'In Progress';
      case 3: return 'Completed';
      case 4: return 'Cancelled';
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
          <h1 className="text-2xl font-semibold text-gray-900">My Orders</h1>
          <p className="mt-2 text-sm text-gray-700">
            Track and manage your service orders.
          </p>
        </div>
      </div>

      {/* Orders List */}
      <div className="mt-8">
        <div className="space-y-4">
          {orders.map((order) => {
            const StatusIcon = getStatusIcon(order.status);
            return (
              <div key={order.id} className="card">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="h-12 w-12 bg-primary-100 rounded-lg flex items-center justify-center">
                      <StatusIcon className="h-6 w-6 text-primary-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Order #{order.id}
                        </h3>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {order.bengkel?.bengkel_name || 'Bengkel'}
                      </p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        <div className="flex items-center">
                          <CalendarIcon className="h-4 w-4 mr-1" />
                          <span>{new Date(order.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="font-medium text-gray-900">
                            Rp {order.total_price.toLocaleString()}
                          </span>
                        </div>
                      </div>
                      {order.note && (
                        <p className="text-sm text-gray-600 mt-2">
                          <span className="font-medium">Notes:</span> {order.note}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end space-x-2">
                  <button className="btn-secondary text-sm">
                    View Details
                  </button>
                  {order.status === 0 && (
                    <button className="btn-primary text-sm">
                      Cancel Order
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {orders.length === 0 && (
          <div className="text-center py-12">
            <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No orders found</h3>
            <p className="mt-1 text-sm text-gray-500">
              You haven't placed any orders yet.
            </p>
            <div className="mt-6">
              <button 
                onClick={() => navigate('/bengkels')}
                className="btn-primary"
              >
                Browse Bengkels
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;