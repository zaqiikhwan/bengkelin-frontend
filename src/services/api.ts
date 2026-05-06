import axios from 'axios';
import type { AxiosInstance } from 'axios';
import type { 
  APIResponse, 
  AuthResponse, 
  LoginRequest, 
  RegisterRequest,
  UserUpdateRequest,
  User,
  UserAddress,
  Vehicle,
  Mitra,
  Bengkel,
  BengkelDetailResponse,
  Order,
  CreateBengkelRequest,
  CreateBengkelV2Request,
  UpdateBengkelProfileRequest,
  UpdateBengkelOperationalRequest,
  CreateBengkelAddressRequest,
  CreateBengkelServicesRequest,
  CreateBengkelServicesV2Request,
  UpdateServiceOptionsRequest,
  AddAddressRequest,
  AddVehicleRequest,
  UpdateVehicleRequest,
  CreateOrderRequest,
  CreateOrderFlexibleRequest,
  CreateOrderFlexibleRequestLegacy,
  CreateOrderServiceRequest,
  CreateOrderServiceRequestLegacy,
  OrderServiceCreationResponse,
  CreateOrderV2Request,
  UpdateOrderV2Request,
  UpdateOrderStatusRequest,
  UpdateOrderStatusEnhancedRequest,
  OrderStatusUpdateResponse,
  UpdateOrderRequest,
  CreateTestimonialRequest,
  CreateTestimonialV2Request,
  HealthStatus,
  ChatRoom,
  ChatMessage,
  ChatRoomsResponse,
  MessagesResponse,
  MessageReadReceipt,
  CreateChatRoomRequest,
  SendMessageRequest,
  SendFileMessageRequest,
  EditMessageRequest,
  MarkReadRequest,
  TypingIndicatorRequest
} from '../types/api';

class ApiService {
  private api: AxiosInstance;
  private apiV2: AxiosInstance;
  private refreshApi: AxiosInstance; // Separate instance for refresh token calls
  private baseURL: string;
  private isRefreshing = false; // Flag to prevent multiple simultaneous refresh attempts
  private failedQueue: Array<{ resolve: Function; reject: Function }> = [];

  constructor() {
    this.baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';
    this.api = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Create separate instance for v2 endpoints
    const baseURLV2 = this.baseURL.replace('/v1', '/v2');
    this.apiV2 = axios.create({
      baseURL: baseURLV2,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Create separate instance for refresh token calls (no interceptors)
    this.refreshApi = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token for both instances
    const requestInterceptor = (config: any) => {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    };

    this.api.interceptors.request.use(requestInterceptor, (error) => Promise.reject(error));
    this.apiV2.interceptors.request.use(requestInterceptor, (error) => Promise.reject(error));

    // Response interceptor to handle token refresh for both instances
    const responseInterceptor = async (error: any) => {
      const originalRequest = error.config;
      
      if (error.response?.status === 401 && !originalRequest._retry) {
        if (this.isRefreshing) {
          // If already refreshing, queue this request
          return new Promise((resolve, reject) => {
            this.failedQueue.push({ resolve, reject });
          }).then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return originalRequest.baseURL?.includes('/v2') ? this.apiV2(originalRequest) : this.api(originalRequest);
          }).catch(err => {
            return Promise.reject(err);
          });
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
              
              // Process queued requests
              this.processQueue(null, access_token);
              
              // Retry original request with new token
              originalRequest.headers.Authorization = `Bearer ${access_token}`;
              return originalRequest.baseURL?.includes('/v2') ? this.apiV2(originalRequest) : this.api(originalRequest);
            }
          }
          
          // If we get here, refresh failed
          throw new Error('Token refresh failed');
          
        } catch (refreshError) {
          // Process queued requests with error
          this.processQueue(refreshError, null);
          
          // Refresh failed, redirect to login
          console.log('Token refresh failed, logging out user');
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

  private processQueue(error: any, token: string | null) {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    });
    
    this.failedQueue = [];
  }

  // User Authentication
  async userLogin(data: LoginRequest): Promise<APIResponse<AuthResponse>> {
    try {
      console.log('API userLogin called with:', { email: data.email });
      const response = await this.api.post('/users/auth/login', data);
      console.log('API userLogin raw response:', response);
      console.log('API userLogin response data:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('API userLogin error:', error);
      console.error('API userLogin error response:', error.response?.data);
      throw error;
    }
  }

  async userRegister(data: RegisterRequest): Promise<APIResponse<AuthResponse>> {
    const response = await this.api.post('/users/auth/register', data);
    return response.data;
  }

  async userGoogleAuth(token: string): Promise<APIResponse<AuthResponse>> {
    const response = await this.api.post('/users/auth/google', { token });
    return response.data;
  }

  // Mitra Authentication
  async mitraLogin(data: LoginRequest): Promise<APIResponse<AuthResponse>> {
    const response = await this.api.post('/mitras/auth/login', data);
    return response.data;
  }

  async mitraRegister(data: RegisterRequest): Promise<APIResponse<AuthResponse>> {
    const response = await this.api.post('/mitras/auth/register', data);
    return response.data;
  }

  async mitraGoogleAuth(token: string): Promise<APIResponse<AuthResponse>> {
    const response = await this.api.post('/mitras/auth/google', { token });
    return response.data;
  }

  // Mitra Logout Methods
  async mitraLogout(refreshToken: string): Promise<APIResponse> {
    const response = await this.api.post('/mitras/auth/logout', {
      refresh_token: refreshToken,
    });
    return response.data;
  }

  async mitraLogoutAll(): Promise<APIResponse> {
    const response = await this.api.post('/mitras/auth/logout-all');
    return response.data;
  }

  // Token Management
  async refreshToken(refreshToken: string, userType: 'users' | 'mitras'): Promise<APIResponse<AuthResponse>> {
    // Use separate refresh API instance to avoid interceptor loops
    const response = await this.refreshApi.post(`/${userType}/auth/refresh`, {
      refresh_token: refreshToken,
    });
    return response.data;
  }

  async logout(userType: 'users' | 'mitras' = 'users'): Promise<void> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) {
      try {
        if (userType === 'mitras') {
          await this.mitraLogout(refreshToken);
        } else {
          await this.api.post(`/${userType}/auth/logout`, {
            refresh_token: refreshToken,
          });
        }
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
        if (userType === 'mitras') {
          await this.mitraLogoutAll();
        } else {
          await this.api.post(`/${userType}/auth/logout-all`, {
            refresh_token: refreshToken,
          });
        }
      } catch (error) {
        console.error('Logout all error:', error);
      }
    }
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_type');
  }

  // User Profile Management
  async getUserProfile(): Promise<APIResponse<User>> {
    const response = await this.api.get('/users/profile');
    return response.data;
  }

  // Mitra Profile Management  
  async getMitraProfile(): Promise<APIResponse<Mitra>> {
    const response = await this.api.get('/mitras/profile');
    return response.data;
  }

  async updateUserProfile(data: UserUpdateRequest): Promise<APIResponse<User>> {
    const response = await this.api.patch('/users/profile', data);
    return response.data;
  }

  async updateUserAvatar(file: File): Promise<APIResponse> {
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await this.api.patch('/users/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }

  // User Address Management
  async addUserAddress(data: AddAddressRequest): Promise<APIResponse> {
    const response = await this.api.post('/users/address', data);
    return response.data;
  }

  async getUserAddresses(): Promise<APIResponse<UserAddress[]>> {
    const response = await this.api.get('/users/addresses');
    return response.data;
  }

  async getUserAddress(addressId: number): Promise<APIResponse> {
    const response = await this.api.get(`/users/address/${addressId}`);
    return response.data;
  }

  async updateUserAddress(addressId: number, data: AddAddressRequest): Promise<APIResponse> {
    const response = await this.api.patch(`/users/address/${addressId}`, data);
    return response.data;
  }

  async setUserPrimaryAddress(data: AddAddressRequest): Promise<APIResponse> {
    const response = await this.api.patch('/users/address', data);
    return response.data;
  }

  async deleteUserAddress(addressId: number): Promise<APIResponse> {
    const response = await this.api.delete(`/users/address/${addressId}`);
    return response.data;
  }

  // User Vehicle Management
  async addUserVehicle(data: AddVehicleRequest): Promise<APIResponse> {
    const response = await this.api.post('/users/vehicle', data);
    return response.data;
  }

  async getUserVehicles(): Promise<APIResponse<Vehicle[]>> {
    const response = await this.api.get('/users/vehicles');
    return response.data;
  }

  async getUserVehicle(vehicleId: number): Promise<APIResponse> {
    const response = await this.api.get(`/users/vehicle/${vehicleId}`);
    return response.data;
  }

  async updateUserVehicle(vehicleId: number, data: UpdateVehicleRequest): Promise<APIResponse> {
    const response = await this.api.patch(`/users/vehicle/${vehicleId}`, data);
    return response.data;
  }

  async deleteUserVehicle(vehicleId: number): Promise<APIResponse> {
    const response = await this.api.delete(`/users/vehicle/${vehicleId}`);
    return response.data;
  }

  // Mitra Profile Management
  async updateMitraProfile(data: Partial<Mitra>): Promise<APIResponse<Mitra>> {
    const response = await this.api.patch('/mitras/profile', data);
    return response.data;
  }

  async addMitraBank(data: { bank_name: string; bank_number: string }): Promise<APIResponse> {
    const response = await this.api.post('/mitras/bank', data);
    return response.data;
  }

  async updateMitraBank(data: { bank_name: string; bank_number: string }): Promise<APIResponse> {
    const response = await this.api.patch('/mitras/bank', data);
    return response.data;
  }

  // Bengkel Management
  async createBengkel(data: CreateBengkelRequest): Promise<APIResponse<Bengkel>> {
    const response = await this.api.post('/bengkels/new', data);
    return response.data;
  }

  // New V2 Bengkel Management Methods (Mitra Only)
  async createBengkelV2(data: CreateBengkelV2Request): Promise<APIResponse> {
    const response = await this.api.post('/bengkels/new', data);
    return response.data;
  }

  async updateBengkelProfileV2(data: UpdateBengkelProfileRequest): Promise<APIResponse<Bengkel>> {
    const response = await this.api.patch('/bengkels/profile', data);
    return response.data;
  }

  async updateBengkelMontirV2(jumlah_montir: number): Promise<APIResponse> {
    const response = await this.api.patch('/bengkels/montir', { jumlah_montir });
    return response.data;
  }

  async updateBengkelOperationalV2(data: UpdateBengkelOperationalRequest): Promise<APIResponse> {
    const response = await this.api.patch('/bengkels/operasional', data);
    return response.data;
  }

  async createBengkelAddressV2(data: CreateBengkelAddressRequest): Promise<APIResponse> {
    const response = await this.api.post('/bengkels/address', data);
    return response.data;
  }

  async createBengkelServicesV2(data: CreateBengkelServicesRequest): Promise<APIResponse> {
    const response = await this.api.post('/bengkels/service', data);
    return response.data;
  }

  async uploadBengkelPhotosV2(files: File[]): Promise<APIResponse> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('photos', file);
    });
    const response = await this.api.post('/bengkels/photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }

  async updateBengkelServiceOptionsV2(data: UpdateServiceOptionsRequest): Promise<APIResponse> {
    const response = await this.api.patch('/bengkels/service/opsi', data);
    return response.data;
  }

  async updateBengkelAvatarV2(file: File): Promise<APIResponse> {
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await this.api.patch('/bengkels/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }

  async getBengkelProfileV2(): Promise<APIResponse<Bengkel>> {
    const response = await this.api.get('/bengkels/profile');
    return response.data;
  }

  async getAllBengkelsV2(page = 1, limit = 10): Promise<APIResponse<{ bengkels: Bengkel[]; pagination: any }>> {
    const response = await this.api.get(`/bengkels/all?page=${page}&limit=${limit}`);
    return response.data;
  }

  async searchBengkelsV2(params: {
    q?: string;
    latitude?: number;
    longitude?: number;
    radius?: number;
    page?: number;
    limit?: number;
  }): Promise<APIResponse<{ bengkels: Bengkel[]; pagination: any }>> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });
    
    const response = await this.api.get(`/bengkels/search?${searchParams}`);
    return response.data;
  }

  async getNearestBengkelsV2(params: {
    latitude: number;
    longitude: number;
    radius?: number;
    page?: number;
    limit?: number;
  }): Promise<APIResponse<{ bengkels: Bengkel[]; pagination: any }>> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });
    
    const response = await this.api.get(`/bengkels/nearest?${searchParams}`);
    return response.data;
  }

  async getBengkelDetailsV2(bengkelId: string): Promise<APIResponse<Bengkel>> {
    const response = await this.api.get(`/bengkels/${bengkelId}`);
    return response.data;
  }

  async getBengkelOperationalDay(bengkelId: string, day: string): Promise<APIResponse> {
    const response = await this.api.get(`/bengkels/${bengkelId}/operational/${day}`);
    return response.data;
  }

  async createTestimonialV2(bengkelId: string, data: CreateTestimonialV2Request): Promise<APIResponse> {
    const response = await this.api.post(`/bengkels/${bengkelId}/testimonial`, data);
    return response.data;
  }

  async getBengkelProfile(): Promise<APIResponse<Bengkel>> {
    const response = await this.api.get('/bengkels/profile');
    return response.data;
  }

  async updateBengkelProfile(data: Partial<Bengkel>): Promise<APIResponse<Bengkel>> {
    const response = await this.api.patch('/bengkels/profile', data);
    return response.data;
  }

  async addBengkelAddress(data: AddAddressRequest): Promise<APIResponse> {
    const response = await this.api.post('/bengkels/address', data);
    return response.data;
  }

  async addBengkelService(data: CreateBengkelServicesV2Request): Promise<APIResponse> {
    const response = await this.api.post('/bengkels/service', data);
    return response.data;
  }

  async updateBengkelService(data: CreateBengkelServicesV2Request): Promise<APIResponse> {
    const response = await this.api.patch('/bengkels/service', data);
    return response.data;
  }

  async deleteBengkelService(serviceId: number): Promise<APIResponse> {
    const response = await this.api.delete(`/bengkels/service/${serviceId}`);
    return response.data;
  }

  // Public Bengkel Detail (no auth required)
  async getBengkelDetail(bengkelId: string, page = 1, limit = 10): Promise<APIResponse<BengkelDetailResponse>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });
    const response = await this.api.get(`/bengkels/${bengkelId}?${params}`);
    return response.data;
  }

  async uploadBengkelPhoto(file: File): Promise<APIResponse> {
    const formData = new FormData();
    formData.append('photo', file);
    const response = await this.api.post('/bengkels/photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }

  async uploadBengkelPhotos(files: File[]): Promise<APIResponse> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('photos', file);
    });
    const response = await this.api.post('/bengkels/photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }

  async updateBengkelServiceOptions(data: { 
    home_service?: boolean; 
    store_service?: boolean; 
    is_open?: boolean 
  }): Promise<APIResponse> {
    const response = await this.api.patch('/bengkels/service/opsi', data);
    return response.data;
  }

  async updateBengkelMontir(jumlah_montir: number): Promise<APIResponse> {
    const response = await this.api.patch('/bengkels/montir', { jumlah_montir });
    return response.data;
  }

  async updateBengkelOperational(data: { 
    hari: string; 
    jam_buka: string 
  }[]): Promise<APIResponse> {
    const response = await this.api.patch('/bengkels/operasional', { operasionals: data });
    return response.data;
  }

  async updateBengkelAvatar(file: File): Promise<APIResponse> {
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await this.api.patch('/bengkels/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }

  // Service Discovery
  async getBengkels(page = 1, limit = 10): Promise<APIResponse<{ items?: Bengkel[]; bengkels?: Bengkel[]; total?: number; pagination?: any }>> {
    const response = await this.api.get(`/bengkels?page=${page}&limit=${limit}`);
    return response.data;
  }

  async searchBengkels(query: string, service?: string, page = 1, limit = 10): Promise<APIResponse<{ items?: Bengkel[]; bengkels?: Bengkel[]; total?: number; pagination?: any }>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });
    if (query) params.append('q', query);
    if (service) params.append('service', service);
    
    const response = await this.api.get(`/bengkels/search?${params}`);
    return response.data;
  }

  async getNearestBengkels(lat: number, lng: number, page = 1, limit = 10): Promise<APIResponse<{ bengkels: Bengkel[]; total: number }>> {
    const response = await this.api.get(`/bengkels/nearest?lat=${lat}&lng=${lng}&page=${page}&limit=${limit}`);
    return response.data;
  }

  async getBengkelDetails(bengkelId: string): Promise<APIResponse<Bengkel>> {
    const response = await this.api.get(`/bengkels/testimoni/${bengkelId}`);
    return response.data;
  }

  async getBengkelSchedule(bengkelId: string, day: string): Promise<APIResponse> {
    const response = await this.api.get(`/bengkels/order/schedule?bengkel_id=${bengkelId}&day=${day}`);
    return response.data;
  }

  // Order Management - Enhanced with flexible authentication
  async createOrder(userId: string, data: CreateOrderRequest): Promise<APIResponse<Order>> {
    // Legacy method - kept for backward compatibility
    const response = await this.api.post(`/bengkels/order/service/${userId}`, data);
    return response.data;
  }

  // New flexible order creation method - Uses structured format
  async createOrderFlexible(data: CreateOrderFlexibleRequest, mitraId?: string): Promise<APIResponse<Order>> {
    const userType = this.getUserType();
    
    console.log('Creating order with structured format:', data);
    
    if (userType === 'users') {
      // User creates order for themselves - requires mitraId as query parameter
      if (!mitraId) {
        throw new Error('Mitra ID is required for user orders');
      }
      const response = await this.api.post(`/bengkels/order/service?mitraId=${mitraId}`, data);
      return response.data;
    } else if (userType === 'mitras') {
      // Mitra creates order for user - uses the flexible endpoint
      const response = await this.api.post('/bengkels/order/service', data);
      return response.data;
    } else {
      throw new Error('Invalid user type for order creation');
    }
  }

  // Smart order creation method - tries new format first, falls back to legacy
  async createOrderSmart(services: { title: string; detail: string; price: number; }[], options: {
    vehicle_id?: number;
    is_home_service?: boolean;
    home_service_schedule?: string;
    payment_method?: string;
    note?: string;
  }, mitraId?: string): Promise<APIResponse<Order>> {
    
    // Try new structured format first
    try {
      const structuredData: CreateOrderFlexibleRequest = {
        services: services,
        ...options
      };
      
      console.log('Attempting order creation with structured format:', structuredData);
      return await this.createOrderFlexible(structuredData, mitraId);
      
    } catch (error: any) {
      console.warn('Structured format failed, trying legacy format:', error);
      
      // Fallback to legacy format
      const legacyData: CreateOrderFlexibleRequestLegacy = {
        title: services.map(s => s.title),
        detail: services.map(s => s.detail),
        price: services.map(s => s.price),
        ...options
      };
      
      console.log('Attempting order creation with legacy format:', legacyData);
      return await this.createOrderFlexibleLegacy(legacyData, mitraId);
    }
  }

  // Legacy method for backward compatibility
  async createOrderFlexibleLegacy(data: CreateOrderFlexibleRequestLegacy, mitraId?: string): Promise<APIResponse<Order>> {
    const userType = this.getUserType();
    
    console.log('Creating order with legacy format:', data);
    
    if (userType === 'users') {
      if (!mitraId) {
        throw new Error('Mitra ID is required for user orders');
      }
      const response = await this.api.post(`/bengkels/order/service?mitraId=${mitraId}`, data);
      return response.data;
    } else if (userType === 'mitras') {
      const response = await this.api.post('/bengkels/order/service', data);
      return response.data;
    } else {
      throw new Error('Invalid user type for order creation');
    }
  }

  // Order Service Creation API - New Implementation
  // Supports both user self-orders and mitra-created orders with flexible authentication
  async createOrderService(data: CreateOrderServiceRequest, userId?: string): Promise<APIResponse<OrderServiceCreationResponse>> {
    const userType = this.getUserType();
    
    console.log('Creating order service with structured format:', data);
    
    if (userType === 'users') {
      // User creating order for themselves
      if (!data.mitra_id) {
        throw new Error('Mitra ID is required for user orders');
      }
      
      // Use mitra_id from request body
      const response = await this.api.post('/bengkels/order/service', data);
      return response.data;
    } else if (userType === 'mitras') {
      // Mitra creating order for user
      if (!userId) {
        throw new Error('User ID is required when mitra creates order');
      }
      
      // Remove mitra_id from data as it's ignored for mitra-created orders
      const { mitra_id, ...orderData } = data;
      const response = await this.api.post(`/bengkels/order/service/${userId}`, orderData);
      return response.data;
    } else {
      throw new Error('Invalid user type for order creation');
    }
  }

  // Order Service Creation API - Legacy Format Support
  async createOrderServiceLegacy(data: CreateOrderServiceRequestLegacy, userId?: string): Promise<APIResponse<OrderServiceCreationResponse>> {
    const userType = this.getUserType();
    
    console.log('Creating order service with legacy format:', data);
    
    if (userType === 'users') {
      // User creating order for themselves
      if (!data.mitra_id) {
        throw new Error('Mitra ID is required for user orders');
      }
      
      // Use mitra_id from request body
      const response = await this.api.post('/bengkels/order/service', data);
      return response.data;
    } else if (userType === 'mitras') {
      // Mitra creating order for user
      if (!userId) {
        throw new Error('User ID is required when mitra creates order');
      }
      
      // Remove mitra_id from data as it's ignored for mitra-created orders
      const { mitra_id, ...orderData } = data;
      const response = await this.api.post(`/bengkels/order/service/${userId}`, orderData);
      return response.data;
    } else {
      throw new Error('Invalid user type for order creation');
    }
  }

  // Smart Order Service Creation - Tries new format first, falls back to legacy
  async createOrderServiceSmart(
    services: { title: string; detail?: string; price: number; }[], 
    mitraId?: string, 
    userId?: string
  ): Promise<APIResponse<OrderServiceCreationResponse>> {
    
    // Try new structured format first
    try {
      const structuredData: CreateOrderServiceRequest = {
        mitra_id: mitraId,
        services: services
      };
      
      console.log('Attempting order service creation with structured format:', structuredData);
      return await this.createOrderService(structuredData, userId);
      
    } catch (error: any) {
      console.warn('Structured format failed, trying legacy format:', error);
      
      // Fallback to legacy format
      const legacyData: CreateOrderServiceRequestLegacy = {
        mitra_id: mitraId,
        title: services.map(s => s.title),
        detail: services.map(s => s.detail || ''),
        price: services.map(s => s.price)
      };
      
      console.log('Attempting order service creation with legacy format:', legacyData);
      return await this.createOrderServiceLegacy(legacyData, userId);
    }
  }

  // Alternative method using query parameter for mitra_id (user self-orders)
  async createOrderServiceWithQuery(data: Omit<CreateOrderServiceRequest, 'mitra_id'>, mitraId: string): Promise<APIResponse<OrderServiceCreationResponse>> {
    const userType = this.getUserType();
    
    if (userType !== 'users') {
      throw new Error('Query parameter method is only for user self-orders');
    }
    
    console.log('Creating order service with query parameter:', { data, mitraId });
    
    const response = await this.api.post(`/bengkels/order/service?mitraId=${mitraId}`, data);
    return response.data;
  }

  // New V2 Order Management Methods
  async createOrderV2(data: CreateOrderV2Request): Promise<APIResponse<Order>> {
    const response = await this.api.post('/orders', data);
    return response.data;
  }

  async getOrderDetailsV2(orderId: string): Promise<APIResponse<Order>> {
    const response = await this.api.get(`/orders/${orderId}`);
    return response.data;
  }

  async updateOrderV2(orderId: string, data: UpdateOrderV2Request): Promise<APIResponse<Order>> {
    const response = await this.api.patch(`/orders/${orderId}`, data);
    return response.data;
  }

  async updateOrderStatusV2(orderId: string, data: UpdateOrderStatusRequest): Promise<APIResponse<Order>> {
    const response = await this.api.patch(`/orders/${orderId}/status`, data);
    return response.data;
  }

  async getUserOrdersV2(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<APIResponse<{ orders: Order[]; pagination: any }>> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const response = await this.api.get(`/orders?${searchParams}`);
    return response.data;
  }

  async getBengkelOrdersV2(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<APIResponse<{ orders: Order[]; pagination: any }>> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const response = await this.api.get(`/bengkels/orders?${searchParams}`);
    return response.data;
  }

  async getOrderDetails(orderId: string, userType: 'user' | 'mitra' = 'user'): Promise<APIResponse<Order>> {
    const endpoint = userType === 'mitra' 
      ? `/bengkels/order/mitra/service/${orderId}`
      : `/bengkels/order/service/${orderId}`;
    const response = await this.api.get(endpoint);
    return response.data;
  }

  // New method specifically for the user order details endpoint
  async getUserOrderDetails(pesananId: string): Promise<APIResponse<Order>> {
    const response = await this.api.get(`/bengkels/order/service/${pesananId}`);
    return response.data;
  }

  // New method specifically for mitra order details endpoint
  async getMitraOrderDetails(pesananId: string): Promise<APIResponse<Order>> {
    const response = await this.api.get(`/bengkels/order/mitra/service/${pesananId}`);
    return response.data;
  }

  async updateOrder(orderId: string, data: UpdateOrderRequest): Promise<APIResponse<Order>> {
    const response = await this.api.patch(`/bengkels/order/service/${orderId}`, data);
    return response.data;
  }

  async updateOrderStatus(orderId: string, status: number): Promise<APIResponse<Order>> {
    const response = await this.api.patch(`/bengkels/order/status/${orderId}`, { status });
    return response.data;
  }

  // Enhanced order status update with cancellation support
  async updateOrderStatusEnhanced(orderId: string, data: UpdateOrderStatusEnhancedRequest): Promise<APIResponse<OrderStatusUpdateResponse>> {
    console.log('Updating order status:', { orderId, data });
    
    // Validate cancellation reason requirement
    if (data.status === 4 && !data.reason) {
      throw new Error('Cancellation reason is required when status is 4');
    }
    
    const response = await this.api.patch(`/bengkels/order/status/${orderId}`, data);
    return response.data;
  }

  // Convenience methods for specific status updates
  async confirmOrder(orderId: string): Promise<APIResponse<OrderStatusUpdateResponse>> {
    return this.updateOrderStatusEnhanced(orderId, { status: 1 });
  }

  async startService(orderId: string): Promise<APIResponse<OrderStatusUpdateResponse>> {
    return this.updateOrderStatusEnhanced(orderId, { status: 2 });
  }

  async completeOrder(orderId: string): Promise<APIResponse<OrderStatusUpdateResponse>> {
    return this.updateOrderStatusEnhanced(orderId, { status: 3 });
  }

  async cancelOrder(orderId: string, reason: 'no_show' | 'service_unavailable' | 'payment_failed' | 'default' = 'default'): Promise<APIResponse<OrderStatusUpdateResponse>> {
    return this.updateOrderStatusEnhanced(orderId, { status: 4, reason });
  }

  async getUserOrders(page = 1, limit = 10): Promise<APIResponse<{ orders: Order[]; total: number }>> {
    const response = await this.api.get(`/bengkels/orders/list/user?page=${page}&limit=${limit}`);
    
    // Handle the actual API response structure which uses 'pesanans' instead of 'orders'
    if (response.data && response.data.success && response.data.data) {
      const apiData = response.data.data;
      return {
        success: true,
        message: response.data.message,
        data: {
          orders: apiData.pesanans || [],
          total: apiData.count || 0
        }
      };
    }
    
    return response.data;
  }

  async getMitraOrders(page = 1, limit = 10): Promise<APIResponse<{ orders: Order[]; total: number }>> {
    const response = await this.api.get(`/bengkels/orders/list/mitra?page=${page}&limit=${limit}`);
    
    // Handle the actual API response structure which uses 'pesanans' instead of 'orders'
    if (response.data && response.data.success && response.data.data) {
      const apiData = response.data.data;
      return {
        success: true,
        message: response.data.message,
        data: {
          orders: apiData.pesanans || [],
          total: apiData.count || 0
        }
      };
    }
    
    return response.data;
  }

  async getUserDetails(userId: string): Promise<APIResponse<User>> {
    const response = await this.api.get(`/bengkels/order/user/${userId}`);
    return response.data;
  }

  // Reviews & Testimonials
  async createTestimonial(bengkelId: string, data: CreateTestimonialRequest): Promise<APIResponse> {
    const response = await this.api.post(`/bengkels/testimoni/${bengkelId}`, data);
    return response.data;
  }

  // Chat System - WebSocket v2 API
  async createChatRoom(data: CreateChatRoomRequest): Promise<APIResponse<ChatRoom>> {
    console.log('Creating chat room with data:', data);
    console.log('Current user type:', this.getUserType());
    console.log('Current token:', this.getToken()?.substring(0, 20) + '...');
    
    try {
      const response = await this.apiV2.post('/chat/rooms', data);
      console.log('Chat room creation response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Chat room creation error:', error.response?.data || error);
      throw error;
    }
  }

  async getChatRooms(page = 1, limit = 20): Promise<APIResponse<ChatRoomsResponse>> {
    console.log('Getting user chat rooms');
    console.log('Request URL:', `/chat/rooms?page=${page}&limit=${limit}`);
    console.log('User type:', this.getUserType());
    
    try {
      const response = await this.apiV2.get(`/chat/rooms?page=${page}&limit=${limit}`);
      console.log('User chat rooms response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Get user chat rooms error:', error.response?.data || error);
      throw error;
    }
  }

  async getChatRoom(roomId: string): Promise<APIResponse<ChatRoom>> {
    const response = await this.apiV2.get(`/chat/rooms/${roomId}`);
    return response.data;
  }

  async getRoomMessages(roomId: string, limit = 50, before?: string, after?: string): Promise<APIResponse<MessagesResponse>> {
    console.log('Getting user room messages for room:', roomId);
    
    const params = new URLSearchParams({
      limit: limit.toString()
    });
    
    // Cursor-based pagination parameters
    if (before) params.append('before', before);
    if (after) params.append('after', after);
    
    const url = `/chat/rooms/${roomId}/messages?${params}`;
    console.log('User messages request URL:', url);
    
    try {
      const response = await this.apiV2.get(url);
      console.log('User messages response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Get user messages error:', error.response?.data || error);
      throw error;
    }
  }

  async sendMessage(data: SendMessageRequest): Promise<APIResponse<ChatMessage>> {
    const response = await this.apiV2.post('/chat/messages', data);
    return response.data;
  }

  async sendFileMessage(data: SendFileMessageRequest): Promise<APIResponse<ChatMessage>> {
    const formData = new FormData();
    formData.append('room_id', data.room_id);
    formData.append('file', data.file);
    if (data.reply_to_id) {
      formData.append('reply_to_id', data.reply_to_id);
    }
    
    const response = await this.apiV2.post('/chat/messages/file', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }

  async editMessage(messageId: string, data: EditMessageRequest): Promise<APIResponse<ChatMessage>> {
    const response = await this.apiV2.patch(`/chat/messages/${messageId}`, data);
    return response.data;
  }

  async deleteMessage(messageId: string): Promise<APIResponse> {
    const response = await this.apiV2.delete(`/chat/messages/${messageId}`);
    return response.data;
  }

  async markMessagesAsRead(data: MarkReadRequest): Promise<APIResponse<MessageReadReceipt[]>> {
    const response = await this.apiV2.post('/chat/messages/read', data);
    return response.data;
  }

  async sendTypingIndicator(data: TypingIndicatorRequest): Promise<APIResponse> {
    const response = await this.apiV2.post('/chat/realtime/typing', data);
    return response.data;
  }

  // Bengkel Chat Methods
  async getBengkelChatRooms(bengkelId: string, page = 1, limit = 20): Promise<APIResponse<ChatRoomsResponse>> {
    console.log('Getting bengkel chat rooms for bengkel ID:', bengkelId);
    console.log('Request URL:', `/chat/bengkel/rooms?bengkel_id=${bengkelId}&page=${page}&limit=${limit}`);
    
    try {
      const response = await this.apiV2.get(`/chat/bengkel/rooms?bengkel_id=${bengkelId}&page=${page}&limit=${limit}`);
      console.log('Bengkel chat rooms response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Get bengkel chat rooms error:', error.response?.data || error);
      throw error;
    }
  }

  async getBengkelChatRoom(roomId: string): Promise<APIResponse<ChatRoom>> {
    const response = await this.apiV2.get(`/chat/bengkel/rooms/${roomId}`);
    return response.data;
  }

  async getBengkelRoomMessages(roomId: string, limit = 50, before?: string, after?: string): Promise<APIResponse<MessagesResponse>> {
    console.log('Getting bengkel room messages for room:', roomId);
    
    const params = new URLSearchParams({
      limit: limit.toString()
    });
    
    // Cursor-based pagination parameters
    if (before) params.append('before', before);
    if (after) params.append('after', after);
    
    const url = `/chat/bengkel/rooms/${roomId}/messages?${params}`;
    console.log('Bengkel messages request URL:', url);
    
    try {
      const response = await this.apiV2.get(url);
      console.log('Bengkel messages response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Get bengkel messages error:', error.response?.data || error);
      throw error;
    }
  }

  // Legacy Chat System (v1)
  async getUserAppToken(): Promise<APIResponse<{ token: string }>> {
    const response = await this.api.get('/chats/appToken');
    return response.data;
  }

  async getUserChatToken(): Promise<APIResponse<{ token: string }>> {
    const response = await this.api.get('/chats/chatToken');
    return response.data;
  }

  async getMitraAppToken(): Promise<APIResponse<{ token: string }>> {
    const response = await this.api.get('/chats/appTokenMitra');
    return response.data;
  }

  async getMitraChatToken(): Promise<APIResponse<{ token: string }>> {
    const response = await this.api.get('/chats/chatTokenMitra');
    return response.data;
  }

  async createUserChatHistory(data: { message: string; recipient_id: string }): Promise<APIResponse> {
    const response = await this.api.post('/chats/user/history', data);
    return response.data;
  }

  async createMitraChatHistory(data: { message: string; recipient_id: string }): Promise<APIResponse> {
    const response = await this.api.post('/chats/bengkel/history', data);
    return response.data;
  }

  async getUserChatHistory(page = 1, limit = 50): Promise<APIResponse> {
    const response = await this.api.get(`/chats/user/history?page=${page}&limit=${limit}`);
    return response.data;
  }

  async getMitraChatHistory(page = 1, limit = 50): Promise<APIResponse> {
    const response = await this.api.get(`/chats/bengkel/history?page=${page}&limit=${limit}`);
    return response.data;
  }

  // Health Check
  async getHealthStatus(): Promise<APIResponse<HealthStatus>> {
    const response = await this.api.get('/health');
    return response.data;
  }

  async getReadinessCheck(): Promise<APIResponse> {
    const response = await this.api.get('/ready');
    return response.data;
  }

  async getLivenessCheck(): Promise<APIResponse> {
    const response = await this.api.get('/live');
    return response.data;
  }

  // Utility methods
  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  }

  async validateToken(): Promise<boolean> {
    try {
      const token = localStorage.getItem('access_token');
      const userType = localStorage.getItem('user_type');
      
      if (!token || !userType) {
        return false;
      }

      // Try to make a simple authenticated request to validate token
      let response;
      if (userType === 'users') {
        response = await this.getUserProfile();
      } else {
        response = await this.getMitraProfile();
      }
      
      return response.success;
    } catch (error: any) {
      // If token is invalid, clear it
      if (error.response?.status === 401) {
        this.clearAuthData();
      }
      return false;
    }
  }

  private clearAuthData(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_type');
  }

  // Debug method to check authentication status
  async debugAuth(): Promise<void> {
    const token = this.getToken();
    const userType = this.getUserType();
    
    console.log('=== Authentication Debug ===');
    console.log('Token exists:', !!token);
    console.log('Token preview:', token?.substring(0, 50) + '...');
    console.log('User type:', userType);
    console.log('Is authenticated:', this.isAuthenticated());
    
    // Try to decode JWT payload (just for debugging)
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('JWT payload:', payload);
      } catch (e) {
        console.log('Could not decode JWT payload');
      }
    }
    
    // Test v1 endpoint
    try {
      const v1Response = await this.api.get('/health');
      console.log('V1 API test successful:', v1Response.status);
    } catch (error: any) {
      console.log('V1 API test failed:', error.response?.status, error.response?.data);
    }
    
    // Test v2 endpoint with simple health check if available
    try {
      const v2Response = await this.apiV2.get('/health');
      console.log('V2 API test successful:', v2Response.status);
    } catch (error: any) {
      console.log('V2 API test failed:', error.response?.status, error.response?.data);
    }
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
}

export const apiService = new ApiService();
export default apiService;