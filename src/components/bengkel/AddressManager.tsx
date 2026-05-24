import React from 'react';
import { MapPinIcon, PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import type { BengkelAddress } from '../../types/api';

interface AddressForm {
  address_label: string;
  full_address: string;
  latitude: number;
  longitude: number;
  note: string;
}

interface AddressManagerProps {
  addresses: BengkelAddress[];
  addressForm: AddressForm;
  updating: boolean;
  onFormChange: (data: Partial<AddressForm>) => void;
  onSubmit: () => void;
}

const AddressManager: React.FC<AddressManagerProps> = React.memo(({ addresses, addressForm, updating, onFormChange, onSubmit }) => {
  return (
    <div className="card">
      <div className="flex items-center space-x-3 mb-6">
        <MapPinIcon className="h-6 w-6 text-primary-600" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Address Management</h2>
      </div>

      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6 mb-6">
        <h3 className="text-md font-medium text-gray-900 dark:text-white mb-4">Add New Address</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Address Label *</label>
            <input type="text" className="input-field w-full" placeholder="e.g., Main Workshop" value={addressForm.address_label} onChange={(e) => onFormChange({ address_label: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Address *</label>
            <textarea className="input-field w-full" rows={3} placeholder="Enter complete address" value={addressForm.full_address} onChange={(e) => onFormChange({ full_address: e.target.value })} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Latitude</label>
              <input type="number" step="any" className="input-field w-full" placeholder="-6.2088" value={addressForm.latitude} onChange={(e) => onFormChange({ latitude: parseFloat(e.target.value) || 0 })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Longitude</label>
              <input type="number" step="any" className="input-field w-full" placeholder="106.8456" value={addressForm.longitude} onChange={(e) => onFormChange({ longitude: parseFloat(e.target.value) || 0 })} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Notes</label>
            <input type="text" className="input-field w-full" placeholder="e.g., Near the main road" value={addressForm.note} onChange={(e) => onFormChange({ note: e.target.value })} />
          </div>
          <div className="flex justify-end">
            <button className="btn-primary flex items-center" onClick={onSubmit} disabled={updating || !addressForm.address_label.trim() || !addressForm.full_address.trim()}>
              <PlusIcon className="w-4 h-4 mr-2" />
              {updating ? 'Adding...' : 'Add Address'}
            </button>
          </div>
        </div>
      </div>

      {addresses.length > 0 ? (
        <div>
          <h3 className="text-md font-medium text-gray-900 dark:text-white mb-4">Your Addresses ({addresses.length})</h3>
          <div className="space-y-3">
            {addresses.map((address) => (
              <div key={address.id} className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <MapPinIcon className="w-4 h-4 text-primary-600" />
                      <span className="font-medium text-sm text-gray-900 dark:text-white">{address.address_label}</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{address.full_address}</p>
                    {address.note && <p className="text-xs text-gray-500 dark:text-gray-400 italic">Note: {address.note}</p>}
                    <div className="text-xs text-gray-400 dark:text-gray-500 mt-2">Coordinates: {address.latitude}, {address.longitude}</div>
                  </div>
                  <div className="flex space-x-1 ml-4">
                    <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md" title="Edit address" aria-label="Edit address">
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md" title="Delete address" aria-label="Delete address">
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <MapPinIcon className="mx-auto h-8 w-8 text-gray-400 mb-2" />
          <p className="text-sm">No addresses added yet. Add your bengkel location above.</p>
        </div>
      )}
    </div>
  );
});

AddressManager.displayName = 'AddressManager';
export default AddressManager;
