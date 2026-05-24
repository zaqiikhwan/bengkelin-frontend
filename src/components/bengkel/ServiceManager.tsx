import React from 'react';
import { WrenchScrewdriverIcon, PlusIcon, PencilIcon, TrashIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import type { BengkelService } from '../../types/api';

interface EditServiceData {
  nama_service: string;
  description: string;
  price: number;
  is_available: boolean;
}

interface ServiceManagerProps {
  services: BengkelService[];
  newService: string;
  newServiceDescription: string;
  newServicePrice: number;
  editingService: number | null;
  editServiceData: EditServiceData;
  updating: boolean;
  onNewServiceChange: (name: string, description: string, price: number) => void;
  onAddService: () => void;
  onStartEdit: (service: BengkelService) => void;
  onCancelEdit: () => void;
  onEditDataChange: (data: Partial<EditServiceData>) => void;
  onUpdateService: () => void;
  onDeleteService: (id: number) => void;
}

const ServiceManager: React.FC<ServiceManagerProps> = React.memo(({
  services, newService, newServiceDescription, newServicePrice,
  editingService, editServiceData, updating,
  onNewServiceChange, onAddService, onStartEdit, onCancelEdit,
  onEditDataChange, onUpdateService, onDeleteService,
}) => {
  return (
    <div className="mt-8">
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <WrenchScrewdriverIcon className="h-6 w-6 text-primary-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Services Offered</h2>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6 mb-6">
          <h3 className="text-md font-medium text-gray-900 dark:text-white mb-4">Add New Service</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Service Name *</label>
              <input type="text" className="input-field w-full" placeholder="e.g., Ganti Oli Mesin" value={newService} onChange={(e) => onNewServiceChange(e.target.value, newServiceDescription, newServicePrice)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Price (Rp)</label>
              <input type="number" className="input-field w-full" placeholder="0" min="0" step="1000" value={newServicePrice} onChange={(e) => onNewServiceChange(newService, newServiceDescription, parseFloat(e.target.value) || 0)} />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
            <textarea className="input-field w-full" rows={3} placeholder="Describe your service..." value={newServiceDescription} onChange={(e) => onNewServiceChange(newService, e.target.value, newServicePrice)} />
          </div>
          <div className="mt-4 flex justify-end">
            <button className="btn-primary flex items-center" onClick={onAddService} disabled={updating || !newService.trim()}>
              <PlusIcon className="w-4 h-4 mr-2" />
              {updating ? 'Adding...' : 'Add Service'}
            </button>
          </div>
        </div>

        {services.length > 0 ? (
          <div className="space-y-4">
            <h3 className="text-md font-medium text-gray-900 dark:text-white">Your Services</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.map((service) => (
                <div key={service.id} className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-md transition-shadow">
                  {editingService === service.id ? (
                    <div className="space-y-3">
                      <input type="text" className="input-field w-full text-sm" value={editServiceData.nama_service} onChange={(e) => onEditDataChange({ nama_service: e.target.value })} />
                      <textarea className="input-field w-full text-sm" rows={2} value={editServiceData.description} onChange={(e) => onEditDataChange({ description: e.target.value })} />
                      <input type="number" className="input-field w-full text-sm" min="0" step="1000" value={editServiceData.price} onChange={(e) => onEditDataChange({ price: parseFloat(e.target.value) || 0 })} />
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id={`avail-${service.id}`} checked={editServiceData.is_available} onChange={(e) => onEditDataChange({ is_available: e.target.checked })} className="h-4 w-4 text-primary-600 rounded" />
                        <label htmlFor={`avail-${service.id}`} className="text-sm text-gray-700 dark:text-gray-300">Available</label>
                      </div>
                      <div className="flex space-x-2">
                        <button onClick={onUpdateService} disabled={updating} className="flex-1 bg-green-600 text-white px-3 py-2 rounded-md text-sm hover:bg-green-700 flex items-center justify-center">
                          <CheckIcon className="w-4 h-4 mr-1" /> Save
                        </button>
                        <button onClick={onCancelEdit} className="flex-1 bg-gray-500 text-white px-3 py-2 rounded-md text-sm hover:bg-gray-600 flex items-center justify-center">
                          <XMarkIcon className="w-4 h-4 mr-1" /> Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{service.nama_service}</h4>
                        {service.is_available !== false ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">Available</span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400">Unavailable</span>
                        )}
                      </div>
                      {service.description && <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">{service.description}</p>}
                      <div className="flex items-center justify-between">
                        <div>
                          {service.price && service.price > 0 ? (
                            <p className="text-sm font-semibold text-primary-600">Rp {service.price.toLocaleString('id-ID')}</p>
                          ) : (
                            <p className="text-sm text-gray-500 dark:text-gray-400">Price not set</p>
                          )}
                        </div>
                        <div className="flex space-x-1">
                          <button onClick={() => onStartEdit(service)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md" title="Edit service" aria-label="Edit service">
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button onClick={() => onDeleteService(service.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md" title="Delete service" aria-label="Delete service">
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <WrenchScrewdriverIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No services yet</h3>
            <p className="text-sm">Add your first service using the form above to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
});

ServiceManager.displayName = 'ServiceManager';
export default ServiceManager;
