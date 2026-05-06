import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { apiService } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import type { BengkelDetailResponse, Vehicle, OrderServiceItem } from '../types/api';
import { 
  ChevronLeftIcon,
  TruckIcon,
  WrenchScrewdriverIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const BookingPage: React.FC = () => {
  const { bengkelId } = useParams<{ bengkelId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, userType } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Data states
  const [bengkel, setBengkel] = useState<BengkelDetailResponse | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  
  // Form states
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [selectedServices, setSelectedServices] = useState<OrderServiceItem[]>([]);
  const [serviceType, setServiceType] = useState<'home_service' | 'store_service'>('store_service');
  const [paymentMethod, setPaymentMethod] = useState<string>('cash');
  const [orderNote, setOrderNote] = useState<string>('');

  useEffect(() => {
    if (bengkelId) {
      loadBookingData();
    }
  }, [bengkelId]);

  const loadBookingData = async () => {
    try {
      setLoading(true);
      
      // Load bengkel data from API
      const bengkelResponse = await apiService.getBengkelDetail(bengkelId!);
      console.log('Bengkel API Response:', bengkelResponse); // Debug log
      
      if (bengkelResponse.success && bengkelResponse.data) {
        setBengkel(bengkelResponse.data);
        console.log('Bengkel services:', bengkelResponse.data.services); // Debug log
        
        // Check for pre-selected service from URL params
        const preSelectedServiceId = searchParams.get('service');
        if (preSelectedServiceId && bengkelResponse.data.services) {
          const preSelectedService = bengkelResponse.data.services.find(
            service => service.id.toString() === preSelectedServiceId
          );
          
          if (preSelectedService && preSelectedService.is_available) {
            const orderService: OrderServiceItem = {
              title: preSelectedService.nama_service,
              detail: preSelectedService.description || '',
              price: preSelectedService.price || 0
            };
            setSelectedServices([orderService]);
          }
        }
      } else {
        setError('Failed to load bengkel information');
        return;
      }
      
      // Load user vehicles
      let profileResponse;
      if (userType === 'users') {
        profileResponse = await apiService.getUserProfile();
      } else {
        profileResponse = await apiService.getMitraProfile();
      }
      
      if (profileResponse.success && profileResponse.data) {
        const userData = profileResponse.data as any;
        if (userData.vehicles) {
          setVehicles(userData.vehicles);
        }
      }
      
    } catch (error: any) {
      console.error('Failed to load booking data:', error);
      setError('Failed to load booking information');
    } finally {
      setLoading(false);
    }
  };

  const handleServiceToggle = (service: OrderServiceItem) => {
    setSelectedServices(prev => {
      const exists = prev.find(s => s.title === service.title);
      if (exists) {
        return prev.filter(s => s.title !== service.title);
      } else {
        return [...prev, service];
      }
    });
  };

  const handleSubmitBooking = async () => {
    if (!selectedVehicle || selectedServices.length === 0 || !user || !bengkel) {
      setError('Please complete all required fields');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      // Convert services to structured format
      const servicesData = selectedServices.map(service => ({
        title: service.title,
        detail: service.detail,
        price: service.price
      }));

      const orderOptions = {
        vehicle_id: selectedVehicle.vehicle_id,
        is_home_service: serviceType === 'home_service',
        payment_method: paymentMethod,
        note: orderNote
      };

      console.log('Creating order with services:', servicesData, 'options:', orderOptions);

      // Use the new Order Service Creation API
      const response = await apiService.createOrderServiceSmart(servicesData, bengkel.bengkel_id);
      
      console.log('Order creation response:', response); // Debug log
      
      if (response.success && response.data) {
        // Show success message with order details
        alert(`Order created successfully! Order ID: ${response.data.pesanan_id}`);
        navigate('/orders');
      } else {
        setError(response.message || 'Failed to create booking');
      }
    } catch (err: any) {
      console.error('Booking creation error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to create booking');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading bengkel information...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !bengkel) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-4">
            {error}
          </div>
          <button
            onClick={() => navigate('/bengkels')}
            className="btn-secondary"
          >
            Back to Bengkels
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate(`/bengkels/${bengkelId}`)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ChevronLeftIcon className="h-5 w-5 mr-1" />
          Back to Bengkel Details
        </button>
        
        <h1 className="text-2xl font-bold text-gray-900">Book Service</h1>
        {bengkel && (
          <div className="mt-2">
            <p className="text-lg text-gray-700">{bengkel.bengkel_name}</p>
            <p className="text-sm text-gray-500">{bengkel.bengkel_phone}</p>
            {bengkel.addresses && bengkel.addresses.length > 0 && (
              <p className="text-sm text-gray-500">{bengkel.addresses[0].full_address}</p>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Step Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-center space-x-4">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === currentStep 
                  ? 'bg-primary-600 text-white' 
                  : step < currentStep 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
              }`}>
                {step < currentStep ? '✓' : step}
              </div>
              <span className={`ml-2 text-sm ${
                step === currentStep ? 'text-primary-600 font-medium' : 'text-gray-500'
              }`}>
                {step === 1 ? 'Vehicle' : step === 2 ? 'Services' : 'Details'}
              </span>
              {step < 3 && <div className="w-8 h-0.5 bg-gray-200 ml-4" />}
            </div>
          ))}
        </div>
      </div>

      {/* Bengkel Info Card */}
      {bengkel && (
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex items-start space-x-4">
            {bengkel.avatar_url ? (
              <img
                src={bengkel.avatar_url}
                alt={bengkel.bengkel_name}
                className="w-16 h-16 rounded-lg object-cover border border-gray-200"
              />
            ) : (
              <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                <WrenchScrewdriverIcon className="w-8 h-8 text-gray-400" />
              </div>
            )}
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900">{bengkel.bengkel_name}</h2>
              <div className="mt-2 space-y-1">
                <p className="text-sm text-gray-600">📞 {bengkel.bengkel_phone}</p>
                <p className="text-sm text-gray-600">👨‍🔧 {bengkel.jumlah_montir} mechanics</p>
                {bengkel.addresses && bengkel.addresses.length > 0 && (
                  <p className="text-sm text-gray-600">📍 {bengkel.addresses[0].full_address}</p>
                )}
              </div>
              <div className="mt-3 flex items-center space-x-4">
                {bengkel.home_service && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    🏠 Home Service
                  </span>
                )}
                {bengkel.store_service && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    🏪 In-Store Service
                  </span>
                )}
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  bengkel.is_open 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {bengkel.is_open ? '✅ Open' : '❌ Closed'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 1: Select Vehicle */}
      {currentStep === 1 && (
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Select Your Vehicle</h2>
          {vehicles.length === 0 ? (
            <div className="text-center py-8">
              <TruckIcon className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-gray-500">No vehicles found</p>
              <button
                onClick={() => navigate('/vehicles')}
                className="mt-4 btn-primary"
              >
                Add Vehicle
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {vehicles.map((vehicle) => (
                <div
                  key={vehicle.vehicle_id}
                  onClick={() => setSelectedVehicle(vehicle)}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedVehicle?.vehicle_id === vehicle.vehicle_id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <TruckIcon className="h-8 w-8 text-gray-400" />
                    <div>
                      <h3 className="font-medium">{vehicle.vehicle_number}</h3>
                      <p className="text-sm text-gray-500">
                        {vehicle.vehicle_type} • {vehicle.vehicle_color}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {selectedVehicle && (
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setCurrentStep(2)}
                className="btn-primary"
              >
                Next: Select Services
              </button>
            </div>
          )}
        </div>
      )}

      {/* Step 2: Select Services */}
      {currentStep === 2 && (
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Select Services</h2>
          
          {bengkel?.services && bengkel.services.length > 0 ? (
            <div className="space-y-4">
              {bengkel.services
                .filter(service => service.is_available) // Only show available services
                .map((service) => {
                  const orderService: OrderServiceItem = {
                    title: service.nama_service,
                    detail: service.description || '',
                    price: service.price || 0
                  };
                  
                  const isSelected = selectedServices.find(s => s.title === service.nama_service);
                  
                  return (
                    <div
                      key={service.id}
                      onClick={() => handleServiceToggle(orderService)}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        isSelected
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <WrenchScrewdriverIcon className="h-6 w-6 text-gray-400" />
                          <div>
                            <h3 className="font-medium">{service.nama_service}</h3>
                            {service.description && (
                              <p className="text-sm text-gray-500">{service.description}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          {service.price && service.price > 0 ? (
                            <p className="font-medium">
                              {new Intl.NumberFormat('id-ID', {
                                style: 'currency',
                                currency: 'IDR',
                                minimumFractionDigits: 0
                              }).format(service.price)}
                            </p>
                          ) : (
                            <p className="text-sm text-gray-500">Contact for price</p>
                          )}
                          {isSelected && (
                            <CheckCircleIcon className="h-5 w-5 text-primary-600 ml-auto mt-1" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : (
            <div className="text-center py-8">
              <WrenchScrewdriverIcon className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-gray-500">No services available for booking</p>
              <button
                onClick={() => navigate(`/bengkels/${bengkelId}`)}
                className="mt-4 btn-secondary"
              >
                Back to Bengkel Details
              </button>
            </div>
          )}
          
          <div className="mt-6 flex justify-between">
            <button
              onClick={() => setCurrentStep(1)}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ChevronLeftIcon className="h-5 w-5 mr-1" />
              Previous
            </button>
            
            {selectedServices.length > 0 && (
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm text-gray-500">Total</p>
                  <p className="font-semibold text-lg">
                    {new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                      minimumFractionDigits: 0
                    }).format(selectedServices.reduce((total, service) => total + service.price, 0))}
                  </p>
                </div>
                <button
                  onClick={() => setCurrentStep(3)}
                  className="btn-primary"
                >
                  Next: Order Details
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 3: Order Details */}
      {currentStep === 3 && (
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Order Details</h2>
          
          {/* Service Type Selection */}
          {bengkel && (bengkel.home_service || bengkel.store_service) && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">Service Type</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {bengkel.store_service && (
                  <div
                    onClick={() => setServiceType('store_service')}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      serviceType === 'store_service'
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">🏪</div>
                      <div>
                        <h3 className="font-medium">In-Store Service</h3>
                        <p className="text-sm text-gray-500">Bring your vehicle to the workshop</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {bengkel.home_service && (
                  <div
                    onClick={() => setServiceType('home_service')}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      serviceType === 'home_service'
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">🏠</div>
                      <div>
                        <h3 className="font-medium">Home Service</h3>
                        <p className="text-sm text-gray-500">We come to your location</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Payment Method */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">Payment Method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="input-field w-full"
            >
              <option value="cash">Cash</option>
              <option value="transfer">Bank Transfer</option>
              <option value="e-wallet">E-Wallet</option>
            </select>
          </div>

          {/* Order Notes */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">Additional Notes (Optional)</label>
            <textarea
              value={orderNote}
              onChange={(e) => setOrderNote(e.target.value)}
              rows={3}
              className="input-field w-full"
              placeholder="Any special instructions or requests..."
            />
          </div>

          {/* Order Summary */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-gray-900 mb-3">Order Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Vehicle:</span>
                <span>{selectedVehicle?.vehicle_number} ({selectedVehicle?.vehicle_type})</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Service Type:</span>
                <span>{serviceType === 'home_service' ? 'Home Service' : 'In-Store Service'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Payment:</span>
                <span>{paymentMethod}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Services:</span>
                <span>{selectedServices.length} service(s)</span>
              </div>
              
              {/* Services List */}
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="space-y-1">
                  {selectedServices.map((service, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-gray-600">{service.title}</span>
                      <span className="font-medium">
                        {new Intl.NumberFormat('id-ID', {
                          style: 'currency',
                          currency: 'IDR',
                          minimumFractionDigits: 0
                        }).format(service.price)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-medium">
                  <span>Total Amount:</span>
                  <span>
                    {new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                      minimumFractionDigits: 0
                    }).format(selectedServices.reduce((total, service) => total + service.price, 0))}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => setCurrentStep(2)}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ChevronLeftIcon className="h-5 w-5 mr-1" />
              Previous
            </button>
            
            <button
              onClick={handleSubmitBooking}
              disabled={submitting}
              className="btn-primary"
            >
              {submitting ? 'Creating Booking...' : 'Create Booking'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingPage;