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
  Order,
  CreateBengkelRequest,
  AddAddressRequest,
  AddVehicleRequest,
  UpdateVehicleRequest,
  CreateOrderRequest,
  UpdateOrderRequest,
  CreateTestimonialRequest,
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
  private baseURL: string;

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
        originalRequest._retry = true;
        
        try {
          const refreshToken = localStorage.getItem('refresh_token');
          const userType = localStorage.getItem('user_type') as 'users' | 'mitras' | null;
          if (refreshToken && userType) {
            const response = await this.refreshToken(refreshToken, userType);
            const { access_token, refresh_token } = response.data || {};
            
            if (access_token && refresh_token) {
              localStorage.setItem('access_token', access_token);
              localStorage.setItem('refresh_token', refresh_token);
              
              // Retry original request with new token
              originalRequest.headers.Authorization = `Bearer ${access_token}`;
              return originalRequest.baseURL?.includes('/v2') ? this.apiV2(originalRequest) : this.api(originalRequest);
            }
          }
        } catch (refreshError) {
          // Refresh failed, redirect to login
          this.logout();
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }
      
      return Promise.reject(error);
    };

    this.api.interceptors.response.use((response) => response, responseInterceptor);
    this.apiV2.interceptors.response.use((response) => response, responseInterceptor);
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

  // Token Management
  async refreshToken(refreshToken: string, userType: 'users' | 'mitras'): Promise<APIResponse<AuthResponse>> {
    const response = await this.api.post(`/${userType}/auth/refresh`, {
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

  // User Profile Management
  async getUserProfile(): Promise<APIResponse<User>> {
    const response = await this.api.get('/users/profile');
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
    const response = await this.api.patch('/mitras/auth/profile', data);
    return response.data;
  }

  async addMitraBank(data: { bank_name: string; bank_number: string }): Promise<APIResponse> {
    const response = await this.api.post('/mitras/auth/bank', data);
    return response.data;
  }

  async updateMitraBank(data: { bank_name: string; bank_number: string }): Promise<APIResponse> {
    const response = await this.api.patch('/mitras/auth/bank', data);
    return response.data;
  }

  // Bengkel Management
  async createBengkel(data: CreateBengkelRequest): Promise<APIResponse<Bengkel>> {
    const response = await this.api.post('/bengkels/new', data);
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

  async addBengkelService(data: { nama_service: string }): Promise<APIResponse> {
    const response = await this.api.post('/bengkels/service', data);
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
  async getBengkels(page = 1, limit = 10): Promise<APIResponse<{ bengkels: Bengkel[]; total: number }>> {
    const response = await this.api.get(`/bengkels?page=${page}&limit=${limit}`);
    return response.data;
  }

  async searchBengkels(query: string, service?: string, page = 1, limit = 10): Promise<APIResponse<{ bengkels: Bengkel[]; total: number }>> {
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

  async getBengkelSchedule(day: string): Promise<APIResponse> {
    const response = await this.api.get(`/bengkels/order/schedule?day=${day}`);
    return response.data;
  }

  // Order Management
  async createOrder(userId: string, data: CreateOrderRequest): Promise<APIResponse<Order>> {
    const response = await this.api.post(`/bengkels/order/service/${userId}`, data);
    return response.data;
  }

  async getOrderDetails(orderId: string, userType: 'user' | 'mitra' = 'user'): Promise<APIResponse<Order>> {
    const endpoint = userType === 'mitra' 
      ? `/bengkels/order/mitra/service/${orderId}`
      : `/bengkels/order/service/${orderId}`;
    const response = await this.api.get(endpoint);
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

  async getUserOrders(page = 1, limit = 10): Promise<APIResponse<{ orders: Order[]; total: number }>> {
    const response = await this.api.get(`/bengkels/orders/list/user?page=${page}&limit=${limit}`);
    return response.data;
  }

  async getMitraOrders(page = 1, limit = 10): Promise<APIResponse<{ orders: Order[]; total: number }>> {
    const response = await this.api.get(`/bengkels/orders/list/mitra?page=${page}&limit=${limit}`);
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
    const response = await this.apiV2.post('/chat/rooms', data);
    return response.data;
  }

  async getChatRooms(page = 1, limit = 20): Promise<APIResponse<ChatRoomsResponse>> {
    const response = await this.apiV2.get(`/chat/rooms?page=${page}&limit=${limit}`);
    return response.data;
  }

  async getChatRoom(roomId: string): Promise<APIResponse<ChatRoom>> {
    const response = await this.apiV2.get(`/chat/rooms/${roomId}`);
    return response.data;
  }

  async getRoomMessages(roomId: string, page = 1, limit = 50, before?: string): Promise<APIResponse<MessagesResponse>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });
    if (before) params.append('before', before);
    
    const response = await this.apiV2.get(`/chat/rooms/${roomId}/messages?${params}`);
    return response.data;
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
    const response = await this.apiV2.post('/chat/typing', data);
    return response.data;
  }

  // Bengkel Chat Methods
  async getBengkelChatRooms(bengkelId: string, page = 1, limit = 20): Promise<APIResponse<ChatRoomsResponse>> {
    const response = await this.apiV2.get(`/chat/bengkel/rooms?bengkel_id=${bengkelId}&page=${page}&limit=${limit}`);
    return response.data;
  }

  async getBengkelChatRoom(roomId: string): Promise<APIResponse<ChatRoom>> {
    const response = await this.apiV2.get(`/chat/bengkel/rooms/${roomId}`);
    return response.data;
  }

  async getBengkelRoomMessages(roomId: string, page = 1, limit = 50, before?: string): Promise<APIResponse<MessagesResponse>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });
    if (before) params.append('before', before);
    
    const response = await this.apiV2.get(`/chat/bengkel/rooms/${roomId}/messages?${params}`);
    return response.data;
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