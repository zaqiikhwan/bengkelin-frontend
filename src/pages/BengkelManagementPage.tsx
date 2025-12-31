import React from 'react';
// import { useAuth } from '../hooks/useAuth';
import { 
  BuildingStorefrontIcon,
  ClockIcon,
  WrenchScrewdriverIcon,
  PhotoIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';

const BengkelManagementPage: React.FC = () => {
  // const { mitra } = useAuth();

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">My Bengkel</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage your bengkel profile, services, and operational settings.
          </p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Bengkel Profile */}
        <div className="card">
          <div className="flex items-center space-x-3 mb-4">
            <BuildingStorefrontIcon className="h-6 w-6 text-primary-600" />
            <h2 className="text-lg font-semibold text-gray-900">Bengkel Profile</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Bengkel Name</label>
              <input type="text" className="input-field" placeholder="Enter bengkel name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone Number</label>
              <input type="tel" className="input-field" placeholder="Enter phone number" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Number of Mechanics</label>
              <input type="number" className="input-field" placeholder="Enter number of mechanics" />
            </div>
            <button className="btn-primary">Update Profile</button>
          </div>
        </div>

        {/* Service Options */}
        <div className="card">
          <div className="flex items-center space-x-3 mb-4">
            <WrenchScrewdriverIcon className="h-6 w-6 text-primary-600" />
            <h2 className="text-lg font-semibold text-gray-900">Service Options</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center">
              <input type="checkbox" className="h-4 w-4 text-primary-600 rounded" />
              <label className="ml-2 text-sm text-gray-700">Home Service Available</label>
            </div>
            <div className="flex items-center">
              <input type="checkbox" className="h-4 w-4 text-primary-600 rounded" />
              <label className="ml-2 text-sm text-gray-700">Store Service Available</label>
            </div>
            <div className="flex items-center">
              <input type="checkbox" className="h-4 w-4 text-primary-600 rounded" />
              <label className="ml-2 text-sm text-gray-700">Currently Open</label>
            </div>
            <button className="btn-primary">Update Options</button>
          </div>
        </div>

        {/* Operational Hours */}
        <div className="card">
          <div className="flex items-center space-x-3 mb-4">
            <ClockIcon className="h-6 w-6 text-primary-600" />
            <h2 className="text-lg font-semibold text-gray-900">Operational Hours</h2>
          </div>
          <div className="space-y-3">
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
              <div key={day} className="flex items-center space-x-3">
                <div className="w-20 text-sm text-gray-700">{day}</div>
                <input type="time" className="input-field flex-1" />
                <span className="text-gray-500">-</span>
                <input type="time" className="input-field flex-1" />
                <input type="checkbox" className="h-4 w-4 text-primary-600 rounded" />
              </div>
            ))}
          </div>
          <button className="btn-primary mt-4">Update Hours</button>
        </div>

        {/* Address */}
        <div className="card">
          <div className="flex items-center space-x-3 mb-4">
            <MapPinIcon className="h-6 w-6 text-primary-600" />
            <h2 className="text-lg font-semibold text-gray-900">Address</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Address Label</label>
              <input type="text" className="input-field" placeholder="e.g., Main Workshop" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Address</label>
              <textarea className="input-field" rows={3} placeholder="Enter complete address"></textarea>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Latitude</label>
                <input type="number" step="any" className="input-field" placeholder="Latitude" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Longitude</label>
                <input type="number" step="any" className="input-field" placeholder="Longitude" />
              </div>
            </div>
            <button className="btn-primary">Update Address</button>
          </div>
        </div>
      </div>

      {/* Services */}
      <div className="mt-8">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <WrenchScrewdriverIcon className="h-6 w-6 text-primary-600" />
              <h2 className="text-lg font-semibold text-gray-900">Services Offered</h2>
            </div>
            <button className="btn-primary">Add Service</button>
          </div>
          <div className="text-center py-8 text-gray-500">
            <WrenchScrewdriverIcon className="mx-auto h-8 w-8 text-gray-400 mb-2" />
            <p>No services added yet. Click "Add Service" to get started.</p>
          </div>
        </div>
      </div>

      {/* Photos */}
      <div className="mt-8">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <PhotoIcon className="h-6 w-6 text-primary-600" />
              <h2 className="text-lg font-semibold text-gray-900">Bengkel Photos</h2>
            </div>
            <button className="btn-primary">Upload Photos</button>
          </div>
          <div className="text-center py-8 text-gray-500">
            <PhotoIcon className="mx-auto h-8 w-8 text-gray-400 mb-2" />
            <p>No photos uploaded yet. Add photos to showcase your bengkel.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BengkelManagementPage;