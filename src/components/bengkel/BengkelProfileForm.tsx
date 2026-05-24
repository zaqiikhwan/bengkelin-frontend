import React from 'react';
import { BuildingStorefrontIcon } from '@heroicons/react/24/outline';

interface BengkelProfileFormProps {
  profileForm: { bengkel_name: string; bengkel_phone: string; jumlah_montir: number };
  updating: boolean;
  onFormChange: (data: Partial<{ bengkel_name: string; bengkel_phone: string; jumlah_montir: number }>) => void;
  onSubmit: () => void;
}

const BengkelProfileForm: React.FC<BengkelProfileFormProps> = React.memo(({ profileForm, updating, onFormChange, onSubmit }) => {
  return (
    <div className="card">
      <div className="flex items-center space-x-3 mb-4">
        <BuildingStorefrontIcon className="h-6 w-6 text-primary-600" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Bengkel Profile</h2>
      </div>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Bengkel Name</label>
          <input type="text" className="input-field" placeholder="Enter bengkel name" value={profileForm.bengkel_name} onChange={(e) => onFormChange({ bengkel_name: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</label>
          <input type="tel" className="input-field" placeholder="Enter phone number" value={profileForm.bengkel_phone} onChange={(e) => onFormChange({ bengkel_phone: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Number of Mechanics</label>
          <input type="number" className="input-field" placeholder="Enter number of mechanics" min="1" value={profileForm.jumlah_montir} onChange={(e) => onFormChange({ jumlah_montir: parseInt(e.target.value) || 1 })} />
        </div>
        <button className="btn-primary" onClick={onSubmit} disabled={updating}>
          {updating ? 'Updating...' : 'Update Profile'}
        </button>
      </div>
    </div>
  );
});

BengkelProfileForm.displayName = 'BengkelProfileForm';
export default BengkelProfileForm;
