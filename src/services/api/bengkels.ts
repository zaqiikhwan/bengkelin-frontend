import type { AxiosInstance } from 'axios';
import type {
  APIResponse, Bengkel, BengkelDetailResponse, Pagination,
  CreateBengkelRequest, CreateBengkelV2Request,
  UpdateBengkelProfileRequest, UpdateBengkelOperationalRequest,
  CreateBengkelAddressRequest, CreateBengkelServicesRequest,
  CreateBengkelServicesV2Request, UpdateServiceOptionsRequest,
  CreateTestimonialRequest, CreateTestimonialV2Request, AddAddressRequest,
} from '../../types/api';

// Public Bengkel Discovery
export function getBengkels(api: AxiosInstance, page = 1, limit = 10): Promise<APIResponse<{ items?: Bengkel[]; bengkels?: Bengkel[]; total?: number; pagination?: Pagination }>> {
  return api.get(`/bengkels?page=${page}&limit=${limit}`).then(r => r.data);
}

export function searchBengkels(api: AxiosInstance, query: string, service?: string, page = 1, limit = 10): Promise<APIResponse<{ items?: Bengkel[]; bengkels?: Bengkel[]; total?: number; pagination?: Pagination }>> {
  const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
  if (query) params.append('q', query);
  if (service) params.append('service', service);
  return api.get(`/bengkels/search?${params}`).then(r => r.data);
}

export function getNearestBengkels(api: AxiosInstance, lat: number, lng: number, page = 1, limit = 10): Promise<APIResponse<{ bengkels: Bengkel[]; total: number }>> {
  return api.get(`/bengkels/nearest?lat=${lat}&lng=${lng}&page=${page}&limit=${limit}`).then(r => r.data);
}

export function getBengkelDetail(api: AxiosInstance, bengkelId: string, page = 1, limit = 10): Promise<APIResponse<BengkelDetailResponse>> {
  const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
  return api.get(`/bengkels/${bengkelId}?${params}`).then(r => r.data);
}

export function getBengkelDetails(api: AxiosInstance, bengkelId: string): Promise<APIResponse<Bengkel>> {
  return api.get(`/bengkels/testimoni/${bengkelId}`).then(r => r.data);
}

export function getBengkelSchedule(api: AxiosInstance, bengkelId: string, day: string): Promise<APIResponse> {
  return api.get(`/bengkels/order/schedule?bengkel_id=${bengkelId}&day=${day}`).then(r => r.data);
}

export function getBengkelOperationalDay(api: AxiosInstance, bengkelId: string, day: string): Promise<APIResponse> {
  return api.get(`/bengkels/${bengkelId}/operational/${day}`).then(r => r.data);
}

// Bengkel Management (Mitra)
export function createBengkel(api: AxiosInstance, data: CreateBengkelRequest): Promise<APIResponse<Bengkel>> {
  return api.post('/bengkels/new', data).then(r => r.data);
}

export function createBengkelV2(api: AxiosInstance, data: CreateBengkelV2Request): Promise<APIResponse> {
  return api.post('/bengkels/new', data).then(r => r.data);
}

export function getBengkelProfile(api: AxiosInstance): Promise<APIResponse<Bengkel>> {
  return api.get('/bengkels/profile').then(r => r.data);
}

export function updateBengkelProfile(api: AxiosInstance, data: Partial<Bengkel>): Promise<APIResponse<Bengkel>> {
  return api.patch('/bengkels/profile', data).then(r => r.data);
}

export function updateBengkelProfileV2(api: AxiosInstance, data: UpdateBengkelProfileRequest): Promise<APIResponse<Bengkel>> {
  return api.patch('/bengkels/profile', data).then(r => r.data);
}

export function updateBengkelMontir(api: AxiosInstance, jumlah_montir: number): Promise<APIResponse> {
  return api.patch('/bengkels/montir', { jumlah_montir }).then(r => r.data);
}

export function updateBengkelOperational(api: AxiosInstance, data: { hari: string; jam_buka: string }[]): Promise<APIResponse> {
  return api.patch('/bengkels/operasional', { operasionals: data }).then(r => r.data);
}

export function updateBengkelOperationalV2(api: AxiosInstance, data: UpdateBengkelOperationalRequest): Promise<APIResponse> {
  return api.patch('/bengkels/operasional', data).then(r => r.data);
}

export function addBengkelAddress(api: AxiosInstance, data: AddAddressRequest): Promise<APIResponse> {
  return api.post('/bengkels/address', data).then(r => r.data);
}

export function createBengkelAddressV2(api: AxiosInstance, data: CreateBengkelAddressRequest): Promise<APIResponse> {
  return api.post('/bengkels/address', data).then(r => r.data);
}

export function addBengkelService(api: AxiosInstance, data: CreateBengkelServicesV2Request): Promise<APIResponse> {
  return api.post('/bengkels/service', data).then(r => r.data);
}

export function createBengkelServicesV2(api: AxiosInstance, data: CreateBengkelServicesRequest): Promise<APIResponse> {
  return api.post('/bengkels/service', data).then(r => r.data);
}

export function updateBengkelService(api: AxiosInstance, data: CreateBengkelServicesV2Request): Promise<APIResponse> {
  return api.patch('/bengkels/service', data).then(r => r.data);
}

export function deleteBengkelService(api: AxiosInstance, serviceId: number): Promise<APIResponse> {
  return api.delete(`/bengkels/service/${serviceId}`).then(r => r.data);
}

export function updateBengkelServiceOptions(api: AxiosInstance, data: { home_service?: boolean; store_service?: boolean; is_open?: boolean }): Promise<APIResponse> {
  return api.patch('/bengkels/service/opsi', data).then(r => r.data);
}

export function updateBengkelServiceOptionsV2(api: AxiosInstance, data: UpdateServiceOptionsRequest): Promise<APIResponse> {
  return api.patch('/bengkels/service/opsi', data).then(r => r.data);
}

export function uploadBengkelPhoto(api: AxiosInstance, file: File): Promise<APIResponse> {
  const formData = new FormData();
  formData.append('photo', file);
  return api.post('/bengkels/photo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(r => r.data);
}

export function uploadBengkelPhotos(api: AxiosInstance, files: File[]): Promise<APIResponse> {
  const formData = new FormData();
  files.forEach(file => formData.append('photos', file));
  return api.post('/bengkels/photo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(r => r.data);
}

export function deleteBengkelPhoto(api: AxiosInstance, photoId: number): Promise<APIResponse> {
  return api.delete(`/bengkels/photo/${photoId}`).then(r => r.data);
}

export function updateBengkelAvatar(api: AxiosInstance, file: File): Promise<APIResponse> {
  const formData = new FormData();
  formData.append('avatar', file);
  return api.patch('/bengkels/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(r => r.data);
}

// V2 bengkel methods
export function getAllBengkelsV2(api: AxiosInstance, page = 1, limit = 10): Promise<APIResponse<{ bengkels: Bengkel[]; pagination: Pagination }>> {
  return api.get(`/bengkels/all?page=${page}&limit=${limit}`).then(r => r.data);
}

export function searchBengkelsV2(api: AxiosInstance, params: { q?: string; latitude?: number; longitude?: number; radius?: number; page?: number; limit?: number }): Promise<APIResponse<{ bengkels: Bengkel[]; pagination: Pagination }>> {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) searchParams.append(key, value.toString());
  });
  return api.get(`/bengkels/search?${searchParams}`).then(r => r.data);
}

export function getNearestBengkelsV2(api: AxiosInstance, params: { latitude: number; longitude: number; radius?: number; page?: number; limit?: number }): Promise<APIResponse<{ bengkels: Bengkel[]; pagination: Pagination }>> {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) searchParams.append(key, value.toString());
  });
  return api.get(`/bengkels/nearest?${searchParams}`).then(r => r.data);
}

export function getBengkelDetailsV2(api: AxiosInstance, bengkelId: string): Promise<APIResponse<Bengkel>> {
  return api.get(`/bengkels/${bengkelId}`).then(r => r.data);
}

// Testimonials
export function createTestimonial(api: AxiosInstance, bengkelId: string, data: CreateTestimonialRequest): Promise<APIResponse> {
  return api.post(`/bengkels/testimoni/${bengkelId}`, data).then(r => r.data);
}

export function createTestimonialV2(api: AxiosInstance, bengkelId: string, data: CreateTestimonialV2Request): Promise<APIResponse> {
  return api.post(`/bengkels/${bengkelId}/testimonial`, data).then(r => r.data);
}
