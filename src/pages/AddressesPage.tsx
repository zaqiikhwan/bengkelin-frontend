import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { apiService } from '../services/api';
import type { UserAddress, AddAddressRequest } from '../types/api';
import { 
  MapPinIcon, 
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const AddressesPage: React.FC = () => {
  const { userType } = useAuth();
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<UserAddress | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [formData, setFormData] = useState<AddAddressRequest>({
    latitude: 0,
    longitude: 0,
    address_label: '',
    full_address: '',
    note: '',
    is_primary: false
  });

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      setLoading(true);
      // Get address information from the profile endpoint based on user type
      let response;
      if (userType === 'users') {
        response = await apiService.getUserProfile();
      } else {
        response = await apiService.getMitraProfile();
      }
      
      if (response.success && response.data) {
        const profileData = response.data as any;
        
        // Check if user has address information in their profile
        if (profileData.addresses && profileData.addresses.length > 0) {
          // Use the addresses from the profile data
          setAddresses(profileData.addresses);
        } else {
          setAddresses([]);
        }
      } else {
        setAddresses([]);
      }
    } catch (error: any) {
      console.warn('Profile endpoint not available yet:', error);
      // Show a message that this feature is coming soon
      setError('Address information will be available when profile endpoint is implemented.');
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = () => {
    setEditingAddress(null);
    setFormData({
      latitude: 0,
      longitude: 0,
      address_label: '',
      full_address: '',
      note: '',
      is_primary: false
    });
    setError('');
    setSuccess('');
    setIsModalOpen(true);
  };

  const handleEditAddress = (address: UserAddress) => {
    setEditingAddress(address);
    setFormData({
      latitude: address.latitude,
      longitude: address.longitude,
      address_label: address.address_label,
      full_address: address.full_address,
      note: address.note || '',
      is_primary: address.is_primary || false
    });
    setError('');
    setSuccess('');
    setIsModalOpen(true);
  };

  const handleDeleteAddress = async (addressId: number) => {
    if (!confirm('Are you sure you want to delete this address?')) {
      return;
    }

    try {
      const response = await apiService.deleteUserAddress(addressId);
      if (response.success) {
        // Remove from local state immediately
        setAddresses(prev => prev.filter(addr => addr.address_id !== addressId));
        setSuccess('Address deleted successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(response.message || 'Failed to delete address');
      }
    } catch (err: any) {
      console.error('Delete address error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to delete address');
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingAddress(null);
    setError('');
    setSuccess('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : 
              name === 'latitude' || name === 'longitude' ? parseFloat(value) || 0 : 
              value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      let response;
      
      if (editingAddress) {
        // Update existing address using PATCH /address/:addressId
        response = await apiService.updateUserAddress(editingAddress.address_id, formData);
      } else {
        // Add new address using POST /address
        response = await apiService.addUserAddress(formData);
      }
      
      if (response.success) {
        setSuccess(`Address ${editingAddress ? 'updated' : 'added'} successfully!`);
        await loadAddresses(); // Reload addresses from server
        
        // Close modal after a short delay
        setTimeout(() => {
          handleCloseModal();
        }, 1500);
      } else {
        setError(response.message || `Failed to ${editingAddress ? 'update' : 'add'} address`);
      }
    } catch (err: any) {
      console.error('Address operation error:', err);
      setError(err.response?.data?.message || err.message || `Failed to ${editingAddress ? 'update' : 'add'} address`);
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
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">My Addresses</h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            Manage your saved addresses for home service bookings.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button onClick={handleAddAddress} className="btn-primary">
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Address
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

      {addresses.length === 0 && !error ? (
        <div className="text-center py-12">
          <MapPinIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No addresses saved</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Add your addresses to enable home service bookings.
          </p>
          <div className="mt-6">
            <button onClick={handleAddAddress} className="btn-primary">
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Address
            </button>
          </div>
        </div>
      ) : addresses.length === 0 && error ? (
        <div className="text-center py-12">
          <MapPinIcon className="mx-auto h-12 w-12 text-yellow-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Address Information</h3>
          <p className="mt-1 text-sm text-gray-500">
            Your address information is managed through your profile.
          </p>
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800">
              <strong>How it works:</strong>
            </p>
            <ul className="mt-2 text-xs text-blue-700 list-disc list-inside">
              <li>Primary address is managed via Profile → Edit Profile</li>
              <li>Address information comes from GET /users/profile</li>
              <li>Additional addresses will use separate endpoints when implemented</li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {addresses.map((address) => (
            <div key={address.address_id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="h-12 w-12 bg-primary-100 rounded-lg flex items-center justify-center">
                    <MapPinIcon className="h-6 w-6 text-primary-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {address.address_label}
                      </h3>
                      {address.is_primary && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Primary
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {address.full_address}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Coordinates: {address.latitude}, {address.longitude}
                    </p>
                    {address.note && (
                      <p className="text-sm text-gray-500 mt-2">
                        <span className="font-medium">Note:</span> {address.note}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleEditAddress(address)}
                    className="p-2 text-gray-400 hover:text-gray-600"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteAddress(address.address_id)}
                    className="p-2 text-gray-400 hover:text-red-600"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Address Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 dark:bg-gray-900 bg-opacity-50 dark:bg-opacity-70 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border border-gray-200 dark:border-gray-700 w-full max-w-2xl shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {editingAddress ? 'Edit Address' : 'Add New Address'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
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
                <label htmlFor="address_label" className="block text-sm font-medium text-gray-700">
                  Address Label *
                </label>
                <input
                  type="text"
                  id="address_label"
                  name="address_label"
                  required
                  value={formData.address_label}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="e.g., Home, Office, etc."
                />
              </div>

              <div>
                <label htmlFor="full_address" className="block text-sm font-medium text-gray-700">
                  Full Address *
                </label>
                <textarea
                  id="full_address"
                  name="full_address"
                  required
                  rows={3}
                  value={formData.full_address}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="Enter the complete address"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="latitude" className="block text-sm font-medium text-gray-700">
                    Latitude *
                  </label>
                  <input
                    type="number"
                    step="any"
                    id="latitude"
                    name="latitude"
                    required
                    value={formData.latitude}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="e.g., -6.2088"
                  />
                </div>

                <div>
                  <label htmlFor="longitude" className="block text-sm font-medium text-gray-700">
                    Longitude *
                  </label>
                  <input
                    type="number"
                    step="any"
                    id="longitude"
                    name="longitude"
                    required
                    value={formData.longitude}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="e.g., 106.8456"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="note" className="block text-sm font-medium text-gray-700">
                  Note
                </label>
                <textarea
                  id="note"
                  name="note"
                  rows={2}
                  value={formData.note}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="Additional notes (optional)"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_primary"
                  name="is_primary"
                  checked={formData.is_primary || false}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600 rounded"
                />
                <label htmlFor="is_primary" className="ml-2 block text-sm text-gray-900 dark:text-white">
                  Set as primary address
                </label>
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
                  {isSubmitting ? (editingAddress ? 'Updating...' : 'Adding...') : (editingAddress ? 'Update Address' : 'Add Address')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddressesPage;