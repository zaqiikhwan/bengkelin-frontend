import React from 'react';
import { WrenchScrewdriverIcon } from '@heroicons/react/24/outline';

interface ServiceOptionsFormProps {
  serviceOptions: { home_service: boolean; store_service: boolean; is_open: boolean };
  updating: boolean;
  onChange: (options: { home_service: boolean; store_service: boolean; is_open: boolean }) => void;
  onSubmit: () => void;
}

const ServiceOptionsForm: React.FC<ServiceOptionsFormProps> = React.memo(({ serviceOptions, updating, onChange, onSubmit }) => {
  return (
    <div className="card">
      <div className="flex items-center space-x-3 mb-4">
        <WrenchScrewdriverIcon className="h-6 w-6 text-primary-600" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Service Options</h2>
      </div>
      <div className="space-y-4">
        <div className="flex items-center">
          <input type="checkbox" className="h-4 w-4 text-primary-600 rounded" checked={serviceOptions.home_service} onChange={(e) => onChange({ ...serviceOptions, home_service: e.target.checked })} />
          <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">Home Service Available</label>
        </div>
        <div className="flex items-center">
          <input type="checkbox" className="h-4 w-4 text-primary-600 rounded" checked={serviceOptions.store_service} onChange={(e) => onChange({ ...serviceOptions, store_service: e.target.checked })} />
          <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">Store Service Available</label>
        </div>
        <div className="flex items-center">
          <input type="checkbox" className="h-4 w-4 text-primary-600 rounded" checked={serviceOptions.is_open} onChange={(e) => onChange({ ...serviceOptions, is_open: e.target.checked })} />
          <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">Currently Open</label>
        </div>
        <button className="btn-primary" onClick={onSubmit} disabled={updating}>
          {updating ? 'Updating...' : 'Update Options'}
        </button>
      </div>
    </div>
  );
});

ServiceOptionsForm.displayName = 'ServiceOptionsForm';
export default ServiceOptionsForm;
