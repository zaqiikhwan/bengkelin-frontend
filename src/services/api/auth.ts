import type { AxiosInstance } from 'axios';
import type { APIResponse, AuthResponse, LoginRequest, RegisterRequest } from '../../types/api';

export function userLogin(api: AxiosInstance, data: LoginRequest): Promise<APIResponse<AuthResponse>> {
  return api.post('/users/auth/login', data).then(r => r.data);
}

export function userRegister(api: AxiosInstance, data: RegisterRequest): Promise<APIResponse<AuthResponse>> {
  return api.post('/users/auth/register', data).then(r => r.data);
}

export function userGoogleAuth(api: AxiosInstance, token: string): Promise<APIResponse<AuthResponse>> {
  return api.post('/users/auth/google', { token }).then(r => r.data);
}

export function mitraLogin(api: AxiosInstance, data: LoginRequest): Promise<APIResponse<AuthResponse>> {
  return api.post('/mitras/auth/login', data).then(r => r.data);
}

export function mitraRegister(api: AxiosInstance, data: RegisterRequest): Promise<APIResponse<AuthResponse>> {
  return api.post('/mitras/auth/register', data).then(r => r.data);
}

export function mitraGoogleAuth(api: AxiosInstance, token: string): Promise<APIResponse<AuthResponse>> {
  return api.post('/mitras/auth/google', { token }).then(r => r.data);
}

export function mitraLogout(api: AxiosInstance, refreshToken: string): Promise<APIResponse> {
  return api.post('/mitras/auth/logout', { refresh_token: refreshToken }).then(r => r.data);
}

export function mitraLogoutAll(api: AxiosInstance): Promise<APIResponse> {
  return api.post('/mitras/auth/logout-all').then(r => r.data);
}
