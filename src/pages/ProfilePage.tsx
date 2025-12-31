import React, { useState, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { apiService } from '../services/api';
import { 
  UserIcon, 
  EnvelopeIcon, 
  PhoneIcon, 
  XMarkIcon,
  CameraIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';
import type { UserUpdateRequest, AddAddressRequest } from '../types/api';

interface ProfileFormData extends UserUpdateRequest {
  latitude?: number;
  longitude?: number;
  address_label?: string;
  full_address?: string;
  note?: string;
}

const ProfilePage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [formData, setFormData] = useState<ProfileFormData>({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    phone_number: user?.phone_number || '',
    latitude: 0,
    longitude: 0,
    address_label: '',
    full_address: '',
    note: ''
  });

  const handleAvatarImageClick = () => {
    if (user?.avatar_url) {
      setIsImagePreviewOpen(true);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    setIsUploadingAvatar(true);
    setError('');
    setSuccess('');

    try {
      const response = await apiService.updateUserAvatar(file);
      
      if (response.success) {
        setSuccess('Avatar updated successfully!');
        await refreshUser(); // Refresh user data to get new avatar URL
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(response.message || 'Failed to update avatar');
      }
    } catch (err: any) {
      console.error('Avatar update error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to update avatar');
    } finally {
      setIsUploadingAvatar(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleEditClick = async () => {
    setError('');
    setSuccess('');
    setIsLoading(true);
    
    try {
      // Fetch complete profile data from GET /users/profile
      const response = await apiService.getUserProfile();
      
      if (response.success && response.data) {
        const profileData = response.data as any;
        
        // Set form with complete profile data
        setFormData({
          first_name: profileData.first_name || user?.first_name || '',
          last_name: profileData.last_name || user?.last_name || '',
          phone_number: profileData.phone_number || user?.phone_number || '',
          latitude: profileData.addresses?.[0]?.latitude || 0,
          longitude: profileData.addresses?.[0]?.longitude || 0,
          address_label: profileData.addresses?.[0]?.address_label || '',
          full_address: profileData.addresses?.[0]?.full_address || '',
          note: profileData.addresses?.[0]?.note || ''
        });
      } else {
        // Fallback to basic user data if profile endpoint fails
        setFormData({
          first_name: user?.first_name || '',
          last_name: user?.last_name || '',
          phone_number: user?.phone_number || '',
          latitude: 0,
          longitude: 0,
          address_label: '',
          full_address: '',
          note: ''
        });
      }
    } catch (error) {
      console.warn('Failed to fetch profile data, using basic user data:', error);
      // Fallback to basic user data
      setFormData({
        first_name: user?.first_name || '',
        last_name: user?.last_name || '',
        phone_number: user?.phone_number || '',
        latitude: 0,
        longitude: 0,
        address_label: '',
        full_address: '',
        note: ''
      });
    } finally {
      setIsLoading(false);
      setIsEditModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsEditModalOpen(false);
    setError('');
    setSuccess('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'latitude' || name === 'longitude' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      // Separate profile data from address data
      const profileData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone_number: formData.phone_number
      };

      const addressData = {
        latitude: formData.latitude || 0,
        longitude: formData.longitude || 0,
        address_label: formData.address_label || '',
        full_address: formData.full_address || '',
        note: formData.note || ''
      };

      // Update profile first
      const profileResponse = await apiService.updateUserProfile(profileData);
      
      if (!profileResponse.success) {
        setError(profileResponse.message || 'Failed to update profile');
        return;
      }

      // Update address if any address fields are provided
      if (addressData.full_address || addressData.address_label) {
        try {
          let addressResponse;
          
          // Check if user already has an address by looking at the current profile data
          const currentProfile = await apiService.getUserProfile();
          const hasExistingAddress = currentProfile.success && 
                                   currentProfile.data && 
                                   currentProfile.data.addresses &&
                                   currentProfile.data.addresses.length > 0;
          
          if (hasExistingAddress) {
            // User has existing address - update it with ID
            console.log('Updating existing address with PATCH /users/address/:id');
            addressResponse = await apiService.updateUserAddress(1, addressData); // Using ID 1 for primary address
          } else {
            // User has no address - create/set primary address without ID
            console.log('Setting primary address with PATCH /users/address');
            addressResponse = await apiService.setUserPrimaryAddress(addressData);
          }
          
          if (!addressResponse.success) {
            console.warn('Address update failed, but profile was updated:', addressResponse.message);
            setSuccess('Profile updated successfully! (Address update failed)');
          } else {
            setSuccess('Profile and address updated successfully!');
          }
        } catch (addressError) {
          console.warn('Address endpoint not implemented yet:', addressError);
          setSuccess('Profile updated successfully! (Address management coming soon)');
        }
      } else {
        setSuccess('Profile updated successfully!');
      }

      await refreshUser(); // Refresh user data in context
      
      // Close modal after a short delay
      setTimeout(() => {
        handleCloseModal();
      }, 1500);

    } catch (err: any) {
      console.error('Profile update error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Profile</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage your account information and preferences.
          </p>
        </div>
      </div>

      <div className="mt-8 max-w-2xl">
        {/* Success/Error Messages */}
        {success && (
          <div className="mb-4 bg-success-100 border border-success-200 text-success-600 px-4 py-3 rounded-md">
            {success}
          </div>
        )}

        {error && (
          <div className="mb-4 bg-danger-50 border border-danger-200 text-danger-600 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        <div className="card">
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative">
              {user?.avatar_url ? (
                <div className="relative group">
                  <img
                    src={user.avatar_url}
                    alt={`${user.first_name} ${user.last_name}`}
                    className="h-16 w-16 rounded-full object-cover border-2 border-gray-200 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={handleAvatarImageClick}
                    onError={(e) => {
                      console.error('Avatar image failed to load:', user.avatar_url);
                      console.error('Error details:', e);
                      // Hide the broken image and show fallback
                      e.currentTarget.style.display = 'none';
                      const fallback = e.currentTarget.parentElement?.nextElementSibling as HTMLElement;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                    onLoad={() => {
                      console.log('Avatar image loaded successfully:', user.avatar_url);
                    }}
                    crossOrigin="anonymous"
                  />
                  
                  {/* Hover overlay - pointer-events-none to not block clicks */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-full transition-all duration-200 flex items-center justify-center pointer-events-none">
                    <PhotoIcon className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              ) : null}
              
              {/* Fallback avatar - always present but hidden if image loads */}
              <div 
                className="h-16 w-16 bg-primary-100 rounded-full flex items-center justify-center border-2 border-gray-200"
                style={{ display: user?.avatar_url ? 'none' : 'flex' }}
              >
                <UserIcon className="h-8 w-8 text-primary-600" />
              </div>
              
              {/* Avatar Upload Button */}
              <button
                onClick={handleAvatarClick}
                disabled={isUploadingAvatar}
                className="absolute -bottom-1 -right-1 h-6 w-6 bg-primary-600 text-white rounded-full flex items-center justify-center hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Change avatar"
              >
                {isUploadingAvatar ? (
                  <div className="animate-spin rounded-full h-3 w-3 border border-white border-t-transparent"></div>
                ) : (
                  <CameraIcon className="h-3 w-3" />
                )}
              </button>
              
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {user?.first_name} {user?.last_name}
              </h2>
              <p className="text-gray-500">Customer</p>
              <p className="text-xs text-gray-400 mt-1">
                {user?.avatar_url ? 'Click image to preview • Click camera to change' : 'Click camera icon to change avatar'}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <EnvelopeIcon className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">Email</p>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <PhoneIcon className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">Phone</p>
                <p className="text-sm text-gray-500">{user?.phone_number}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <button 
              onClick={handleEditClick}
              disabled={isLoading}
              className="btn-primary"
            >
              {isLoading ? 'Loading...' : 'Edit Profile'}
            </button>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Edit Profile</h3>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
                    First Name *
                  </label>
                  <input
                    type="text"
                    id="first_name"
                    name="first_name"
                    required
                    value={formData.first_name}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="Enter your first name"
                  />
                </div>

                <div>
                  <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    id="last_name"
                    name="last_name"
                    required
                    value={formData.last_name}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="Enter your last name"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="phone_number"
                  name="phone_number"
                  required
                  value={formData.phone_number}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="Enter your phone number"
                />
              </div>

              <div>
                <label htmlFor="address_label" className="block text-sm font-medium text-gray-700">
                  Address Label
                </label>
                <input
                  type="text"
                  id="address_label"
                  name="address_label"
                  value={formData.address_label || ''}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="e.g., Home, Office"
                />
              </div>

              <div>
                <label htmlFor="full_address" className="block text-sm font-medium text-gray-700">
                  Full Address
                </label>
                <textarea
                  id="full_address"
                  name="full_address"
                  rows={3}
                  value={formData.full_address || ''}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="Enter your full address"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="latitude" className="block text-sm font-medium text-gray-700">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    id="latitude"
                    name="latitude"
                    value={formData.latitude || 0}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="e.g., -6.2088"
                  />
                </div>

                <div>
                  <label htmlFor="longitude" className="block text-sm font-medium text-gray-700">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    id="longitude"
                    name="longitude"
                    value={formData.longitude || 0}
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
                  value={formData.note || ''}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="Additional notes (optional)"
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
                  {isSubmitting ? 'Updating...' : 'Update Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {isImagePreviewOpen && user?.avatar_url && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-full">
            {/* Close button */}
            <button
              onClick={() => setIsImagePreviewOpen(false)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 z-10"
            >
              <XMarkIcon className="h-8 w-8" />
            </button>
            
            {/* Image */}
            <img
              src={user.avatar_url}
              alt={`${user.first_name} ${user.last_name} - Full Size`}
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl cursor-pointer"
              onClick={() => setIsImagePreviewOpen(false)}
            />
            
            {/* Image info */}
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-4 rounded-b-lg">
              <p className="text-sm font-medium">{user.first_name} {user.last_name}</p>
              <p className="text-xs text-gray-300">Click anywhere to close</p>
            </div>
          </div>
          
          {/* Click outside to close */}
          <div 
            className="absolute inset-0 -z-10"
            onClick={() => setIsImagePreviewOpen(false)}
          ></div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;