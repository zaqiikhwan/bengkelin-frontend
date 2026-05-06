import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { apiService } from '../services/api';
import type { Vehicle, AddVehicleRequest } from '../types/api';
import { 
  TruckIcon, 
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const VehiclesPage: React.FC = () => {
  const { userType } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [formData, setFormData] = useState<AddVehicleRequest>({
    vehicle_type: '',
    vehicle_color: '',
    vehicle_number: ''
  });

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      // Get vehicles from profile based on user type
      let response;
      if (userType === 'users') {
        response = await apiService.getUserProfile();
      } else {
        response = await apiService.getMitraProfile();
      }
      
      if (response.success && response.data) {
        const userData = response.data as any;
        if (userData.vehicles) {
          setVehicles(userData.vehicles);
        } else {
          setVehicles([]);
        }
      } else {
        setVehicles([]);
      }
    } catch (error: any) {
      console.warn('Failed to load vehicles:', error);
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddVehicle = () => {
    setEditingVehicle(null);
    setFormData({
      vehicle_type: '',
      vehicle_color: '',
      vehicle_number: ''
    });
    setError('');
    setSuccess('');
    setIsModalOpen(true);
  };

  const handleEditVehicle = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      vehicle_type: vehicle.vehicle_type,
      vehicle_color: vehicle.vehicle_color,
      vehicle_number: vehicle.vehicle_number
    });
    setError('');
    setSuccess('');
    setIsModalOpen(true);
  };

  const handleDeleteVehicle = async (vehicleId: number) => {
    if (!confirm('Are you sure you want to delete this vehicle?')) {
      return;
    }

    try {
      const response = await apiService.deleteUserVehicle(vehicleId);
      if (response.success) {
        setVehicles(prev => prev.filter(vehicle => vehicle.vehicle_id !== vehicleId));
        setSuccess('Vehicle deleted successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(response.message || 'Failed to delete vehicle');
      }
    } catch (err: any) {
      console.error('Delete vehicle error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to delete vehicle');
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingVehicle(null);
    setError('');
    setSuccess('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      let response;
      
      if (editingVehicle) {
        // Update existing vehicle
        response = await apiService.updateUserVehicle(editingVehicle.vehicle_id, formData);
      } else {
        // Add new vehicle
        response = await apiService.addUserVehicle(formData);
      }
      
      if (response.success) {
        setSuccess(`Vehicle ${editingVehicle ? 'updated' : 'added'} successfully!`);
        await loadVehicles(); // Reload vehicles from server
        
        // Close modal after a short delay
        setTimeout(() => {
          handleCloseModal();
        }, 1500);
      } else {
        setError(response.message || `Failed to ${editingVehicle ? 'update' : 'add'} vehicle`);
      }
    } catch (err: any) {
      console.error('Vehicle operation error:', err);
      setError(err.response?.data?.message || err.message || `Failed to ${editingVehicle ? 'update' : 'add'} vehicle`);
    } finally {
      setIsSubmitting(false);
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
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">My Vehicles</h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            Manage your vehicles for service bookings.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button onClick={handleAddVehicle} className="btn-primary">
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Vehicle
          </button>
        </div>
      </div>

      {success && (
        <div className="mt-4 bg-success-100 border border-success-200 text-success-600 px-4 py-3 rounded-md">
          {success}
        </div>
      )}

      {error && (
        <div className="mt-4 bg-danger-50 border border-danger-200 text-danger-600 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {vehicles.length === 0 ? (
        <div className="text-center py-12">
          <TruckIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No vehicles registered</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Add your vehicles to enable service bookings.
          </p>
          <div className="mt-6">
            <button onClick={handleAddVehicle} className="btn-primary">
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Vehicle
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {vehicles.map((vehicle) => (
            <div key={vehicle.vehicle_id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="h-12 w-12 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                    <TruckIcon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {vehicle.vehicle_number}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {vehicle.vehicle_type} • {vehicle.vehicle_color}
                    </p>
                    {vehicle.photos && vehicle.photos.length > 0 && (
                      <div className="mt-2 flex space-x-2">
                        {vehicle.photos.slice(0, 3).map((photo) => (
                          <img
                            key={photo.id}
                            src={photo.photo_url}
                            alt="Vehicle"
                            className="h-16 w-16 object-cover rounded-md"
                          />
                        ))}
                        {vehicle.photos.length > 3 && (
                          <div className="h-16 w-16 bg-gray-100 rounded-md flex items-center justify-center">
                            <span className="text-xs text-gray-500">+{vehicle.photos.length - 3}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleEditVehicle(vehicle)}
                    className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteVehicle(vehicle.vehicle_id)}
                    className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Vehicle Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 dark:bg-gray-900 bg-opacity-50 dark:bg-opacity-70 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border border-gray-200 dark:border-gray-700 w-full max-w-md shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-danger-50 border border-danger-200 text-danger-600 px-4 py-3 rounded-md">
                  {error}
                </div>
              )}
              {success && (
                <div className="bg-success-100 border border-success-200 text-success-600 px-4 py-3 rounded-md">
                  {success}
                </div>
              )}

              <div>
                <label htmlFor="vehicle_type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Vehicle Type *
                </label>
                <select
                  id="vehicle_type"
                  name="vehicle_type"
                  required
                  value={formData.vehicle_type}
                  onChange={handleInputChange}
                  className="input-field"
                >
                  <option value="">Select vehicle type</option>
                  <option value="Mobil">Mobil</option>
                  <option value="Motor">Motor</option>
                  <option value="Truk">Truk</option>
                  <option value="Bus">Bus</option>
                </select>
              </div>

              <div>
                <label htmlFor="vehicle_number" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  License Plate *
                </label>
                <input
                  type="text"
                  id="vehicle_number"
                  name="vehicle_number"
                  required
                  value={formData.vehicle_number}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="e.g., B 1234 ABC"
                />
              </div>

              <div>
                <label htmlFor="vehicle_color" className="block text-sm font-medium text-gray-700">
                  Color *
                </label>
                <input
                  type="text"
                  id="vehicle_color"
                  name="vehicle_color"
                  required
                  value={formData.vehicle_color}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="e.g., Putih, Hitam, Merah"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary"
                >
                  {isSubmitting ? (editingVehicle ? 'Updating...' : 'Adding...') : (editingVehicle ? 'Update Vehicle' : 'Add Vehicle')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehiclesPage;