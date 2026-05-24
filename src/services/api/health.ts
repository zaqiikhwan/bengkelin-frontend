import type { AxiosInstance } from 'axios';
import type { APIResponse, HealthStatus } from '../../types/api';

export function getHealthStatus(api: AxiosInstance): Promise<APIResponse<HealthStatus>> {
  return api.get('/health').then(r => r.data);
}

export function getReadinessCheck(api: AxiosInstance): Promise<APIResponse> {
  return api.get('/ready').then(r => r.data);
}

export function getLivenessCheck(api: AxiosInstance): Promise<APIResponse> {
  return api.get('/live').then(r => r.data);
}
