import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiService } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../contexts/ToastContext';
import type { Order } from '../types/api';
import { 
  ChevronLeftIcon,
  CalendarIcon,
  WrenchScrewdriverIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  TruckIcon,
  MapPinIcon,
  PhoneIcon,
  UserIcon,
  PrinterIcon
} from '@heroicons/react/24/outline';

const OrderDetailsPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { userType } = useAuth();
  const toast = useToast();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState<'no_show' | 'service_unavailable' | 'payment_failed' | 'default'>('default');

  useEffect(() => {
    if (orderId) {
      loadOrderDetails();
    }
  }, [orderId]);

  const loadOrderDetails = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Loading order details for ID:', orderId, 'User type:', userType);
      
      let response;
      if (userType === 'mitras') {
        response = await apiService.getMitraOrderDetails(orderId!);
      } else {
        response = await apiService.getUserOrderDetails(orderId!);
      }
      
      console.log('Order details response:', response);
      
      if (response.success && response.data) {
        setOrder(response.data);
      } else {
        setError(response.message || 'Failed to load order details');
      }
    } catch (error: any) {
      console.error('Failed to load order details:', error);
      if (error.response?.status === 404) {
        setError('Order not found or you do not have access to this order');
      } else if (error.response?.status === 401) {
        setError('Authentication required');
      } else if (error.response?.status === 403) {
        if (userType === 'mitras') {
          setError('Access denied. This order does not belong to your bengkel or you do not have a bengkel.');
        } else {
          setError('Access denied. You do not have permission to view this order.');
        }
      } else {
        setError(error.response?.data?.message || 'Failed to load order details');
      }
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

  const handleStatusUpdate = async (newStatus: number, reason?: 'no_show' | 'service_unavailable' | 'payment_failed' | 'default') => {
    if (!order) return;
    
    try {
      setUpdating(true);
      setError('');
      
      let response;
      switch (newStatus) {
        case 1:
          response = await apiService.confirmOrder(order.id);
          break;
        case 2:
          response = await apiService.startService(order.id);
          break;
        case 3:
          response = await apiService.completeOrder(order.id);
          break;
        case 4:
          response = await apiService.cancelOrder(order.id, reason || 'default');
          break;
        default:
          throw new Error('Invalid status');
      }
      
      if (response.success && response.data) {
        // Update the order with new status and timestamps
        setOrder(prev => prev ? {
          ...prev,
          status: response.data!.status,
          confirmed_at: response.data!.confirmed_at || prev.confirmed_at,
          finished_at: response.data!.finished_at || prev.finished_at,
          cancelled_at: response.data!.cancelled_at || prev.cancelled_at,
          cancelled_by: response.data!.cancelled_by || prev.cancelled_by,
          cancelled_reason: response.data!.cancelled_reason || prev.cancelled_reason,
          updated_at: response.data!.updated_at
        } : null);
        
        // Show success message
        const statusText = getStatusText(newStatus);
        toast.success(`Order ${statusText.toLowerCase()} successfully!`);
      } else {
        setError(response.message || 'Failed to update order status');
      }
    } catch (error: any) {
      console.error('Failed to update order status:', error);
      if (error.response?.status === 400) {
        const errorData = error.response.data;
        if (errorData.message?.includes('transition')) {
          setError('Invalid status transition. Please check the current order status.');
        } else if (errorData.message?.includes('reason')) {
          setError('Cancellation reason is required.');
        } else {
          setError(errorData.message || 'Invalid request');
        }
      } else if (error.response?.status === 403) {
        setError('Access denied. This order does not belong to your bengkel.');
      } else {
        setError(error.message || 'Failed to update order status');
      }
    } finally {
      setUpdating(false);
      setShowCancelModal(false);
    }
  };

  const handleCancelOrder = () => {
    setShowCancelModal(true);
  };

  const confirmCancelOrder = () => {
    handleStatusUpdate(4, cancelReason);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading order details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-4">
            {error}
          </div>
          <button
            onClick={() => navigate('/orders')}
            className="btn-secondary"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400">Order not found</p>
          <button
            onClick={() => navigate('/orders')}
            className="mt-4 btn-secondary"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  const StatusIcon = getStatusIcon(order.status);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate('/orders')}
            className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white print:hidden"
          >
            <ChevronLeftIcon className="h-5 w-5 mr-1" />
            Back to Orders
          </button>
          
          <button
            onClick={handlePrint}
            className="flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md transition-colors print:hidden"
          >
            <PrinterIcon className="h-5 w-5 mr-2" />
            Print as PDF
          </button>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {userType === 'mitras' ? 'Bengkel Order Details' : 'Order Details'}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Order ID: {order.id}</p>
          </div>
          
          <div className="flex items-center space-x-2">
            <StatusIcon className="h-6 w-6 text-gray-400 dark:text-gray-500" />
            <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(order.status)}`}>
              {getStatusText(order.status)}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Services */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Services</h2>
            <div className="space-y-4">
              {order.order_services?.map((service) => (
                <div key={service.id} className="flex items-start justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <WrenchScrewdriverIcon className="h-6 w-6 text-gray-400 dark:text-gray-500 mt-1" />
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">{service.title}</h3>
                      {service.detail && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{service.detail}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        minimumFractionDigits: 0
                      }).format(service.price)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bengkel Information */}
          {order.bengkel && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Workshop Details</h2>
              <div className="flex items-start space-x-4">
                {order.bengkel.avatar_url ? (
                  <img
                    src={order.bengkel.avatar_url}
                    alt={order.bengkel.bengkel_name}
                    className="w-16 h-16 rounded-lg object-cover border border-gray-200 dark:border-gray-700"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                    <WrenchScrewdriverIcon className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{order.bengkel.bengkel_name}</h3>
                  {order.bengkel.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{order.bengkel.description}</p>
                  )}
                  
                  <div className="mt-3 space-y-2">
                    {order.bengkel.bengkel_phone && (
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <PhoneIcon className="h-4 w-4 mr-2" />
                        <span>{order.bengkel.bengkel_phone}</span>
                      </div>
                    )}
                    
                    {order.bengkel.addresses && order.bengkel.addresses.length > 0 && (
                      <div className="flex items-start text-sm text-gray-600 dark:text-gray-400">
                        <MapPinIcon className="h-4 w-4 mr-2 mt-0.5" />
                        <div>
                          <p>{order.bengkel.addresses[0].full_address}</p>
                          {order.bengkel.addresses[0].note && (
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{order.bengkel.addresses[0].note}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Vehicle Information */}
          {order.vehicle && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Vehicle Details</h2>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <TruckIcon className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">{order.vehicle.vehicle_number}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {order.vehicle.vehicle_type} • {order.vehicle.vehicle_color}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Order Notes */}
          {order.note && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Order Notes</h2>
              <p className="text-gray-700 dark:text-gray-300">{order.note}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Order Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    minimumFractionDigits: 0
                  }).format((order.total_price || 0) - (order.admin_fee || 0) - (order.home_service_fee || 0))}
                </span>
              </div>
              
              {order.admin_fee > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Admin Fee:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                      minimumFractionDigits: 0
                    }).format(order.admin_fee)}
                  </span>
                </div>
              )}
              
              {order.home_service_fee > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Home Service Fee:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                      minimumFractionDigits: 0
                    }).format(order.home_service_fee)}
                  </span>
                </div>
              )}
              
              <div className="border-t dark:border-gray-700 pt-3">
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-900 dark:text-white">Total:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                      minimumFractionDigits: 0
                    }).format(order.total_price)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Order Information</h2>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-gray-600 dark:text-gray-400">Service Type:</span>
                <p className="font-medium text-gray-900 dark:text-white mt-1">
                  {order.is_home_service ? 'Home Service' : 'In-Store Service'}
                </p>
              </div>
              
              {order.payment_method && (
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Payment Method:</span>
                  <p className="font-medium text-gray-900 dark:text-white mt-1 capitalize">{order.payment_method}</p>
                </div>
              )}
              
              <div>
                <span className="text-gray-600 dark:text-gray-400">Order Date:</span>
                <p className="font-medium text-gray-900 dark:text-white mt-1">
                  {new Date(order.created_at).toLocaleDateString('id-ID', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              
              {order.confirmed_at && (
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Confirmed At:</span>
                  <p className="font-medium text-gray-900 dark:text-white mt-1">
                    {new Date(order.confirmed_at).toLocaleDateString('id-ID', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              )}
              
              {order.finished_at && (
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Completed At:</span>
                  <p className="font-medium text-gray-900 dark:text-white mt-1">
                    {new Date(order.finished_at).toLocaleDateString('id-ID', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Customer Information */}
          {order.user && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Customer Information</h2>
              <div className="flex items-center space-x-3">
                {order.user.avatar_url ? (
                  <img
                    src={order.user.avatar_url}
                    alt={`${order.user.first_name} ${order.user.last_name}`}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                    <UserIcon className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {order.user.first_name} {order.user.last_name}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{order.user.email}</p>
                  {order.user.phone_number && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">{order.user.phone_number}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Mitra Actions */}
          {userType === 'mitras' && order.status < 3 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6 print:hidden">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Order Actions</h2>
              <div className="space-y-3">
                {order.status === 0 && (
                  <button 
                    onClick={() => handleStatusUpdate(1)}
                    disabled={updating}
                    className="w-full btn-primary disabled:opacity-50"
                  >
                    {updating ? 'Confirming...' : 'Confirm Order'}
                  </button>
                )}
                {order.status === 1 && (
                  <button 
                    onClick={() => handleStatusUpdate(2)}
                    disabled={updating}
                    className="w-full btn-primary disabled:opacity-50"
                  >
                    {updating ? 'Starting...' : 'Start Service'}
                  </button>
                )}
                {order.status === 2 && (
                  <button 
                    onClick={() => handleStatusUpdate(3)}
                    disabled={updating}
                    className="w-full btn-primary disabled:opacity-50"
                  >
                    {updating ? 'Completing...' : 'Complete Order'}
                  </button>
                )}
                {order.status < 2 && (
                  <button 
                    onClick={handleCancelOrder}
                    disabled={updating}
                    className="w-full btn-secondary text-red-600 border-red-200 hover:bg-red-50 disabled:opacity-50"
                  >
                    Cancel Order
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Cancellation Information */}
          {order.status === 4 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Cancellation Details</h2>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Cancelled At:</span>
                  <p className="font-medium text-gray-900 dark:text-white mt-1">
                    {order.cancelled_at ? new Date(order.cancelled_at).toLocaleDateString('id-ID', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : 'N/A'}
                  </p>
                </div>
                {order.cancelled_reason && (
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Reason:</span>
                    <p className="font-medium text-gray-900 dark:text-white mt-1 capitalize">
                      {order.cancelled_reason.replace('cancelled_', '').replace('_', ' ')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Cancellation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-gray-600 dark:bg-gray-900 bg-opacity-50 dark:bg-opacity-70 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border border-gray-200 dark:border-gray-700 w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Cancel Order</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Please select a reason for cancelling this order:
              </p>
              
              <div className="space-y-2 mb-6">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="cancelReason"
                    value="no_show"
                    checked={cancelReason === 'no_show'}
                    onChange={(e) => setCancelReason(e.target.value as any)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-900 dark:text-white">Customer No Show</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="cancelReason"
                    value="service_unavailable"
                    checked={cancelReason === 'service_unavailable'}
                    onChange={(e) => setCancelReason(e.target.value as any)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-900 dark:text-white">Service Unavailable</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="cancelReason"
                    value="payment_failed"
                    checked={cancelReason === 'payment_failed'}
                    onChange={(e) => setCancelReason(e.target.value as any)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-900 dark:text-white">Payment Failed</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="cancelReason"
                    value="default"
                    checked={cancelReason === 'default'}
                    onChange={(e) => setCancelReason(e.target.value as any)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-900 dark:text-white">Other Reason</span>
                </label>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="btn-secondary"
                  disabled={updating}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmCancelOrder}
                  className="btn-primary bg-red-600 hover:bg-red-700"
                  disabled={updating}
                >
                  {updating ? 'Cancelling...' : 'Confirm Cancellation'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetailsPage;