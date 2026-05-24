import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { apiService } from '../services/api';
import { BuildingStorefrontIcon } from '@heroicons/react/24/outline';
import BengkelProfileForm from '../components/bengkel/BengkelProfileForm';
import ServiceOptionsForm from '../components/bengkel/ServiceOptionsForm';
import OperationalHoursForm from '../components/bengkel/OperationalHoursForm';
import AddressManager from '../components/bengkel/AddressManager';
import ServiceManager from '../components/bengkel/ServiceManager';
import PhotoManager from '../components/bengkel/PhotoManager';
import type { Bengkel, BengkelOperational, BengkelService } from '../types/api';

interface ApiError {
  response?: { data?: { message?: string }; status?: number };
  message?: string;
}

const BengkelManagementPage: React.FC = () => {
  const { isAuthenticated, userType } = useAuth();
  const [bengkel, setBengkel] = useState<Bengkel | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [profileForm, setProfileForm] = useState({ bengkel_name: '', bengkel_phone: '', jumlah_montir: 1 });
  const [serviceOptions, setServiceOptions] = useState({ home_service: false, store_service: false, is_open: false });
  const [operationalHours, setOperationalHours] = useState<BengkelOperational[]>([]);
  const [createOperationalForm, setCreateOperationalForm] = useState({
    operasionals: [
      { hari: 'Senin', jam_buka: '08:00', jam_tutup: '17:00', is_active: true },
      { hari: 'Selasa', jam_buka: '08:00', jam_tutup: '17:00', is_active: true },
      { hari: 'Rabu', jam_buka: '08:00', jam_tutup: '17:00', is_active: true },
      { hari: 'Kamis', jam_buka: '08:00', jam_tutup: '17:00', is_active: true },
      { hari: 'Jumat', jam_buka: '08:00', jam_tutup: '17:00', is_active: true },
    ],
  });

  const [newService, setNewService] = useState('');
  const [newServiceDescription, setNewServiceDescription] = useState('');
  const [newServicePrice, setNewServicePrice] = useState(0);
  const [editingService, setEditingService] = useState<number | null>(null);
  const [editServiceData, setEditServiceData] = useState({ nama_service: '', description: '', price: 0, is_available: true });
  const [addressForm, setAddressForm] = useState({ address_label: '', full_address: '', latitude: 0, longitude: 0, note: '' });

  useEffect(() => { loadBengkelProfile(); }, []);

  const loadBengkelProfile = async () => {
    try {
      setLoading(true);
      const mitraResponse = await apiService.getMitraProfile();
      if (mitraResponse.success && mitraResponse.data) {
        if (mitraResponse.data.bengkel && mitraResponse.data.bengkel.length > 0) {
          const d = mitraResponse.data.bengkel[0];
          setBengkel(d);
          setProfileForm({ bengkel_name: d.bengkel_name || '', bengkel_phone: d.bengkel_phone || '', jumlah_montir: d.jumlah_montir || 1 });
          setServiceOptions({ home_service: d.home_service || false, store_service: d.store_service || false, is_open: d.is_open || false });
          setOperationalHours(d.operasionals || []);
        } else {
          setBengkel(null);
          setError('No bengkel found. Please create a bengkel first.');
        }
      }
    } catch {
      setError('Failed to load bengkel profile');
    } finally {
      setLoading(false);
    }
  };

  const handleApiError = (err: unknown, fallback: string) => {
    const e = err as ApiError;
    setError(e.response?.data?.message || e.message || fallback);
  };

  const createBengkel = async () => {
    try {
      setUpdating(true); setError(''); setSuccess('');
      const response = await apiService.createBengkelV2({
        bengkel_name: profileForm.bengkel_name,
        bengkel_phone: profileForm.bengkel_phone,
        jumlah_montir: profileForm.jumlah_montir,
        operasionals: createOperationalForm.operasionals,
      });
      if (response.success) { setSuccess('Bengkel created successfully!'); await loadBengkelProfile(); }
    } catch (err) { handleApiError(err, 'Failed to create bengkel'); } finally { setUpdating(false); }
  };

  const updateProfile = async () => {
    try {
      setUpdating(true); setError(''); setSuccess('');
      const response = await apiService.updateBengkelProfile(profileForm);
      if (response.success) { setSuccess('Profile updated!'); await loadBengkelProfile(); }
    } catch (err) { handleApiError(err, 'Failed to update profile'); } finally { setUpdating(false); }
  };

  const updateServiceOptions = async () => {
    try {
      setUpdating(true); setError(''); setSuccess('');
      const response = await apiService.updateBengkelServiceOptions(serviceOptions);
      if (response.success) { setSuccess('Service options updated!'); await loadBengkelProfile(); }
    } catch (err) { handleApiError(err, 'Failed to update service options'); } finally { setUpdating(false); }
  };

  const updateOperationalHours = async () => {
    try {
      setUpdating(true); setError(''); setSuccess('');
      const response = await apiService.updateBengkelOperationalV2({
        operasionals: operationalHours.map((op) => ({ id: op.id || 0, hari: op.hari, jam_buka: op.jam_buka, jam_tutup: op.jam_tutup || '17:00', is_active: true })),
      });
      if (response.success) { setSuccess('Operational hours updated!'); await loadBengkelProfile(); }
    } catch (err) { handleApiError(err, 'Failed to update operational hours'); } finally { setUpdating(false); }
  };

  const addService = async () => {
    if (!isAuthenticated || userType !== 'mitras' || !newService.trim()) return;
    try {
      setUpdating(true); setError(''); setSuccess('');
      const response = await apiService.addBengkelService({
        services: [{ nama_service: newService.trim(), description: newServiceDescription.trim(), price: newServicePrice, is_available: true }],
      });
      if (response.success) { setSuccess('Service added!'); setNewService(''); setNewServiceDescription(''); setNewServicePrice(0); await loadBengkelProfile(); }
    } catch (err) { handleApiError(err, 'Failed to add service'); } finally { setUpdating(false); }
  };

  const updateService = async () => {
    if (!editingService) return;
    try {
      setUpdating(true); setError(''); setSuccess('');
      const response = await apiService.updateBengkelService({
        services: [{ id: editingService, nama_service: editServiceData.nama_service.trim(), description: editServiceData.description.trim(), price: editServiceData.price, is_available: editServiceData.is_available }],
      });
      if (response.success) { setSuccess('Service updated!'); setEditingService(null); await loadBengkelProfile(); }
    } catch (err) { handleApiError(err, 'Failed to update service'); } finally { setUpdating(false); }
  };

  const deleteService = async (serviceId: number) => {
    if (!confirm('Are you sure you want to delete this service?')) return;
    try {
      setUpdating(true); setError(''); setSuccess('');
      const response = await apiService.deleteBengkelService(serviceId);
      if (response.success) { setSuccess('Service deleted!'); await loadBengkelProfile(); }
    } catch (err) { handleApiError(err, 'Failed to delete service'); } finally { setUpdating(false); }
  };

  const startEditService = (service: BengkelService) => {
    setEditingService(service.id);
    setEditServiceData({ nama_service: service.nama_service, description: service.description || '', price: service.price || 0, is_available: service.is_available !== false });
  };

  const addAddress = async () => {
    try {
      setUpdating(true); setError(''); setSuccess('');
      const response = await apiService.addBengkelAddress(addressForm);
      if (response.success) { setSuccess('Address added!'); setAddressForm({ address_label: '', full_address: '', latitude: 0, longitude: 0, note: '' }); await loadBengkelProfile(); }
    } catch (err) { handleApiError(err, 'Failed to add address'); } finally { setUpdating(false); }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    try {
      setUpdating(true); setError(''); setSuccess('');
      const response = await apiService.uploadBengkelPhotos(files);
      if (response.success) { setSuccess(`${files.length} photo(s) uploaded!`); await loadBengkelProfile(); }
    } catch (err) { handleApiError(err, 'Failed to upload photos'); } finally { setUpdating(false); }
  };

  const handleOperationalChange = (day: string, field: 'jam_buka' | 'jam_tutup' | 'enabled', value: string | boolean) => {
    setOperationalHours((prev) => {
      const existing = prev.find((op) => op.hari === day);
      if (existing) {
        return prev.map((op) => op.hari === day ? { ...op, [field === 'enabled' ? 'is_active' : field]: value, ...(field !== 'jam_tutup' && !op.jam_tutup ? { jam_tutup: '17:00' } : {}) } : op);
      } else if (field === 'enabled' && value === true) {
        return [...prev, { id: 0, hari: day, jam_buka: '08:00', jam_tutup: '17:00', is_active: true }];
      }
      return prev;
    });
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>;
  }

  if (!isAuthenticated || userType !== 'mitras') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Authentication Required</h2>
          <p className="text-gray-600 dark:text-gray-400">Please log in as a mitra to access this page.</p>
        </div>
      </div>
    );
  }

  if (!bengkel) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Create Your Bengkel</h1>
            <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">You don't have a bengkel yet. Create one to start managing your workshop.</p>
          </div>
        </div>
        {error && <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-md">{error}</div>}
        <div className="mt-8 max-w-md">
          <div className="card">
            <div className="flex items-center space-x-3 mb-4">
              <BuildingStorefrontIcon className="h-6 w-6 text-primary-600" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Bengkel Information</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Bengkel Name</label>
                <input type="text" className="input-field" placeholder="Enter bengkel name" value={profileForm.bengkel_name} onChange={(e) => setProfileForm((p) => ({ ...p, bengkel_name: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</label>
                <input type="tel" className="input-field" placeholder="Enter phone number" value={profileForm.bengkel_phone} onChange={(e) => setProfileForm((p) => ({ ...p, bengkel_phone: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Number of Mechanics</label>
                <input type="number" className="input-field" min="1" value={profileForm.jumlah_montir} onChange={(e) => setProfileForm((p) => ({ ...p, jumlah_montir: parseInt(e.target.value) || 1 }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Operational Hours</label>
                <div className="space-y-2">
                  {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'].map((day) => {
                    const existing = createOperationalForm.operasionals.find((op) => op.hari === day);
                    return (
                      <div key={day} className="flex items-center space-x-3">
                        <input type="checkbox" checked={!!existing && existing.is_active} onChange={(e) => {
                          if (e.target.checked) setCreateOperationalForm((p) => ({ operasionals: [...p.operasionals.filter((op) => op.hari !== day), { hari: day, jam_buka: '08:00', jam_tutup: '17:00', is_active: true }] }));
                          else setCreateOperationalForm((p) => ({ operasionals: p.operasionals.filter((op) => op.hari !== day) }));
                        }} className="h-4 w-4 text-primary-600 rounded" />
                        <label className="text-sm text-gray-700 dark:text-gray-300 w-16">{day}</label>
                        {existing && existing.is_active && (
                          <>
                            <input type="time" value={existing.jam_buka} onChange={(e) => setCreateOperationalForm((p) => ({ operasionals: p.operasionals.map((op) => op.hari === day ? { ...op, jam_buka: e.target.value } : op) }))} className="text-sm border-gray-300 rounded-md" />
                            <span className="text-gray-500">-</span>
                            <input type="time" value={existing.jam_tutup} onChange={(e) => setCreateOperationalForm((p) => ({ operasionals: p.operasionals.map((op) => op.hari === day ? { ...op, jam_tutup: e.target.value } : op) }))} className="text-sm border-gray-300 rounded-md" />
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
              <button className="btn-primary w-full" onClick={createBengkel} disabled={updating || !profileForm.bengkel_name || !profileForm.bengkel_phone || createOperationalForm.operasionals.length === 0}>
                {updating ? 'Creating...' : 'Create Bengkel'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">My Bengkel</h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">Manage your bengkel profile, services, and operational settings.</p>
        </div>
      </div>

      {error && <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-md">{error}</div>}
      {success && <div className="mt-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 px-4 py-3 rounded-md">{success}</div>}

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <BengkelProfileForm profileForm={profileForm} updating={updating} onFormChange={(d) => setProfileForm((p) => ({ ...p, ...d }))} onSubmit={updateProfile} />
        <ServiceOptionsForm serviceOptions={serviceOptions} updating={updating} onChange={setServiceOptions} onSubmit={updateServiceOptions} />
        <OperationalHoursForm operationalHours={operationalHours} updating={updating} onDayChange={handleOperationalChange} onToggleDay={(day) => setOperationalHours((p) => p.filter((op) => op.hari !== day))} onSubmit={updateOperationalHours} />
        <AddressManager addresses={bengkel?.addresses || []} addressForm={addressForm} updating={updating} onFormChange={(d) => setAddressForm((p) => ({ ...p, ...d }))} onSubmit={addAddress} />
      </div>

      <ServiceManager
        services={bengkel?.services || []}
        newService={newService} newServiceDescription={newServiceDescription} newServicePrice={newServicePrice}
        editingService={editingService} editServiceData={editServiceData} updating={updating}
        onNewServiceChange={(n, d, p) => { setNewService(n); setNewServiceDescription(d); setNewServicePrice(p); }}
        onAddService={addService} onStartEdit={startEditService} onCancelEdit={() => setEditingService(null)}
        onEditDataChange={(d) => setEditServiceData((p) => ({ ...p, ...d }))} onUpdateService={updateService} onDeleteService={deleteService}
      />

      <PhotoManager photos={bengkel?.photos || []} onUpload={handlePhotoUpload} />
    </div>
  );
};

export default BengkelManagementPage;
