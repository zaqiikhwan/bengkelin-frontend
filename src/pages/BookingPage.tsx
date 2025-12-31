import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiService } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import type { Bengkel, Vehicle, CreateOrderRequest, OrderServiceItem } from '../types/api';
import { 
  ChevronLeftIcon,
  ChevronRightIcon,
  TruckIcon,
  WrenchScrewdriverIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const BookingPage: React.FC = () => {
  const { bengkelId } = useParams<{ bengkelId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Data states
  const [bengkel, setBengkel] = useState<Bengkel | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  
  // Form states
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [selectedServices, setSelectedServices] = useState<OrderServiceItem[]>([]);

  useEffect(() => {
    if (bengkelId) {
      loadBookingData();
    }
  }, [bengkelId]);

  const loadBookingData = async () => {
    try {
      setLoading(true);
      
      // Load user vehicles
      const profileResponse = await apiService.getUserProfile();
      if (profileResponse.success && profileResponse.data?.vehicles) {
        setVehicles(profileResponse.data.vehicles);
      }
      
      // Mock bengkel data for now
      setBengkel({
        bengkel_id: bengkelId!,
        bengkel_name: 'Bengkel Makmur',
        bengkel_phone: '+6281234567890',
        jumlah_montir: 5,
        home_service: true,
        store_service: true,
        is_open: true,
        avatar_url: '',
        created_at: '',
        updated_at: '',
        operasionals: [],
        photos: [],
        services: [],
        addresses: []
      });
      
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
    if (!selectedVehicle || selectedServices.length === 0 || !user) {
      setError('Please complete all required fields');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const orderData: CreateOrderRequest = {
        vehicle_id: selectedVehicle.vehicle_id,
        services: selectedServices
      };

      const response = await apiService.createOrder(user.id, orderData);
      
      if (response.success) {
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
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/bengkels')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ChevronLeftIcon className="h-5 w-5 mr-1" />
          Back to Bengkels
        </button>
        
        <h1 className="text-2xl font-bold text-gray-900">Book Service</h1>
        {bengkel && (
          <p className="text-gray-600">{bengkel.bengkel_name}</p>
        )}
      </div>

      {error && (
        <div className="mb-6 bg-danger-50 border border-danger-200 text-danger-600 px-4 py-3 rounded-md">
          {error}
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
          <div className="space-y-4">
            {[
              { title: 'Ganti Oli Mesin', detail: 'Oli SAE 10W-40 + Filter', price: 120000 },
              { title: 'Tune Up', detail: 'Pemeriksaan dan penyetelan mesin', price: 150000 },
              { title: 'Ganti Ban', detail: 'Pemasangan ban baru', price: 200000 },
              { title: 'Service AC', detail: 'Pembersihan dan isi freon', price: 100000 }
            ].map((service) => (
              <div
                key={service.title}
                onClick={() => handleServiceToggle(service)}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedServices.find(s => s.title === service.title)
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <WrenchScrewdriverIcon className="h-6 w-6 text-gray-400" />
                    <div>
                      <h3 className="font-medium">{service.title}</h3>
                      <p className="text-sm text-gray-500">{service.detail}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">Rp {service.price.toLocaleString()}</p>
                    {selectedServices.find(s => s.title === service.title) && (
                      <CheckCircleIcon className="h-5 w-5 text-primary-600 ml-auto mt-1" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 flex justify-between">
            <button
              onClick={() => setCurrentStep(1)}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ChevronLeftIcon className="h-5 w-5 mr-1" />
              Previous
            </button>
            
            {selectedServices.length > 0 && (
              <button
                onClick={handleSubmitBooking}
                disabled={submitting}
                className="btn-primary"
              >
                {submitting ? 'Creating Booking...' : 'Create Booking'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingPage;