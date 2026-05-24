import axios from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import type { APIResponse, AuthResponse } from '../../types/api';

export class ApiClient {
  protected api: AxiosInstance;
  protected apiV2: AxiosInstance;
  protected refreshApi: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: Array<{ resolve: (value: unknown) => void; reject: (reason?: unknown) => void }> = [];

  constructor() {
    const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';
    this.api = axios.create({
      baseURL,
      headers: { 'Content-Type': 'application/json' },
    });

    const baseURLV2 = baseURL.replace('/v1', '/v2');
    this.apiV2 = axios.create({
      baseURL: baseURLV2,
      headers: { 'Content-Type': 'application/json' },
    });

    this.refreshApi = axios.create({
      baseURL,
      headers: { 'Content-Type': 'application/json' },
    });

    const requestInterceptor = (config: InternalAxiosRequestConfig) => {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    };

    this.api.interceptors.request.use(requestInterceptor, (error) => Promise.reject(error));
    this.apiV2.interceptors.request.use(requestInterceptor, (error) => Promise.reject(error));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const responseInterceptor = async (error: any) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry) {
        if (this.isRefreshing) {
          return new Promise((resolve, reject) => {
            this.failedQueue.push({ resolve, reject });
          }).then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return originalRequest.baseURL?.includes('/v2') ? this.apiV2(originalRequest) : this.api(originalRequest);
          }).catch(err => Promise.reject(err));
        }

        originalRequest._retry = true;
        this.isRefreshing = true;

        try {
          const refreshToken = localStorage.getItem('refresh_token');
          const userType = localStorage.getItem('user_type') as 'users' | 'mitras' | null;

          if (refreshToken && userType) {
            const response = await this.refreshToken(refreshToken, userType);
            const { access_token, refresh_token } = response.data || {};

            if (access_token && refresh_token) {
              localStorage.setItem('access_token', access_token);
              localStorage.setItem('refresh_token', refresh_token);
              this.processQueue(null, access_token);
              originalRequest.headers.Authorization = `Bearer ${access_token}`;
              return originalRequest.baseURL?.includes('/v2') ? this.apiV2(originalRequest) : this.api(originalRequest);
            }
          }
          throw new Error('Token refresh failed');
        } catch (refreshError) {
          this.processQueue(refreshError as Error, null);
          this.logout();
          window.location.href = '/login';
          return Promise.reject(refreshError);
        } finally {
          this.isRefreshing = false;
        }
      }
      return Promise.reject(error);
    };

    this.api.interceptors.response.use((response) => response, responseInterceptor);
    this.apiV2.interceptors.response.use((response) => response, responseInterceptor);
  }

  private processQueue(error: Error | null, token: string | null) {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) reject(error);
      else resolve(token);
    });
    this.failedQueue = [];
  }

  protected async refreshToken(refreshToken: string, userType: 'users' | 'mitras'): Promise<APIResponse<AuthResponse>> {
    const response = await this.refreshApi.post(`/${userType}/auth/refresh`, {
      refresh_token: refreshToken,
    });
    return response.data;
  }

  async logout(userType: 'users' | 'mitras' = 'users'): Promise<void> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) {
      try {
        await this.api.post(`/${userType}/auth/logout`, {
          refresh_token: refreshToken,
        });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_type');
  }

  async logoutAll(userType: 'users' | 'mitras' = 'users'): Promise<void> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) {
      try {
        await this.api.post(`/${userType}/auth/logout-all`, {
          refresh_token: refreshToken,
        });
      } catch (error) {
        console.error('Logout all error:', error);
      }
    }
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_type');
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  getUserType(): 'users' | 'mitras' | null {
    return localStorage.getItem('user_type') as 'users' | 'mitras' | null;
  }

  setUserType(type: 'users' | 'mitras'): void {
    localStorage.setItem('user_type', type);
  }

  protected clearAuthData(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_type');
  }
}
