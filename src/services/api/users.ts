import type { AxiosInstance } from 'axios';
import type {
  APIResponse, User, Mitra, UserUpdateRequest, UserAddress, Vehicle,
  AddAddressRequest, AddVehicleRequest, UpdateVehicleRequest,
} from '../../types/api';

// User Profile
export function getUserProfile(api: AxiosInstance): Promise<APIResponse<User>> {
  return api.get('/users/profile').then(r => r.data);
}

export function updateUserProfile(api: AxiosInstance, data: UserUpdateRequest): Promise<APIResponse<User>> {
  return api.patch('/users/profile', data).then(r => r.data);
}

export function updateUserAvatar(api: AxiosInstance, file: File): Promise<APIResponse> {
  const formData = new FormData();
  formData.append('avatar', file);
  return api.patch('/users/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(r => r.data);
}

// Mitra Profile
export function getMitraProfile(api: AxiosInstance): Promise<APIResponse<Mitra>> {
  return api.get('/mitras/profile').then(r => r.data);
}

export function updateMitraProfile(api: AxiosInstance, data: Partial<Mitra>): Promise<APIResponse<Mitra>> {
  return api.patch('/mitras/profile', data).then(r => r.data);
}

export function addMitraBank(api: AxiosInstance, data: { bank_name: string; bank_number: string }): Promise<APIResponse> {
  return api.post('/mitras/bank', data).then(r => r.data);
}

export function updateMitraBank(api: AxiosInstance, data: { bank_name: string; bank_number: string }): Promise<APIResponse> {
  return api.patch('/mitras/bank', data).then(r => r.data);
}

// User Addresses
export function addUserAddress(api: AxiosInstance, data: AddAddressRequest): Promise<APIResponse> {
  return api.post('/users/address', data).then(r => r.data);
}

export function getUserAddresses(api: AxiosInstance): Promise<APIResponse<UserAddress[]>> {
  return api.get('/users/addresses').then(r => r.data);
}

export function getUserAddress(api: AxiosInstance, addressId: number): Promise<APIResponse> {
  return api.get(`/users/address/${addressId}`).then(r => r.data);
}

export function updateUserAddress(api: AxiosInstance, addressId: number, data: AddAddressRequest): Promise<APIResponse> {
  return api.patch(`/users/address/${addressId}`, data).then(r => r.data);
}

export function setUserPrimaryAddress(api: AxiosInstance, data: AddAddressRequest): Promise<APIResponse> {
  return api.patch('/users/address', data).then(r => r.data);
}

export function deleteUserAddress(api: AxiosInstance, addressId: number): Promise<APIResponse> {
  return api.delete(`/users/address/${addressId}`).then(r => r.data);
}

// User Vehicles
export function addUserVehicle(api: AxiosInstance, data: AddVehicleRequest): Promise<APIResponse> {
  return api.post('/users/vehicle', data).then(r => r.data);
}

export function getUserVehicles(api: AxiosInstance): Promise<APIResponse<Vehicle[]>> {
  return api.get('/users/vehicles').then(r => r.data);
}

export function getUserVehicle(api: AxiosInstance, vehicleId: number): Promise<APIResponse> {
  return api.get(`/users/vehicle/${vehicleId}`).then(r => r.data);
}

export function updateUserVehicle(api: AxiosInstance, vehicleId: number, data: UpdateVehicleRequest): Promise<APIResponse> {
  return api.patch(`/users/vehicle/${vehicleId}`, data).then(r => r.data);
}

export function deleteUserVehicle(api: AxiosInstance, vehicleId: number): Promise<APIResponse> {
  return api.delete(`/users/vehicle/${vehicleId}`).then(r => r.data);
}
