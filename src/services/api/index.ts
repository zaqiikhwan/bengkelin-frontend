import type {
  APIResponse, AuthResponse, LoginRequest, RegisterRequest,
  UserUpdateRequest, User, Mitra, Bengkel, BengkelDetailResponse,
  CreateBengkelRequest, CreateBengkelV2Request,
  UpdateBengkelProfileRequest, UpdateBengkelOperationalRequest,
  CreateBengkelAddressRequest, CreateBengkelServicesRequest,
  CreateBengkelServicesV2Request, UpdateServiceOptionsRequest,
  AddAddressRequest, AddVehicleRequest, UpdateVehicleRequest,
  CreateOrderRequest, CreateOrderFlexibleRequest, CreateOrderFlexibleRequestLegacy,
  CreateOrderServiceRequest, CreateOrderServiceRequestLegacy,
  CreateOrderV2Request, UpdateOrderV2Request, UpdateOrderRequest,
  UpdateOrderStatusRequest, UpdateOrderStatusEnhancedRequest,
  CreateTestimonialRequest, CreateTestimonialV2Request,
  CreateChatRoomRequest, SendMessageRequest,
  SendFileMessageRequest, EditMessageRequest, MarkReadRequest, TypingIndicatorRequest,
  UserAddress, Vehicle,
} from '../../types/api';
import { ApiClient } from './client';
import * as auth from './auth';
import * as users from './users';
import * as bengkels from './bengkels';
import * as orders from './orders';
import * as chat from './chat';
import * as health from './health';

class ApiService extends ApiClient {
  // ── Auth ──
  userLogin(data: LoginRequest): Promise<APIResponse<AuthResponse>> { return auth.userLogin(this.api, data); }
  userRegister(data: RegisterRequest): Promise<APIResponse<AuthResponse>> { return auth.userRegister(this.api, data); }
  userGoogleAuth(token: string): Promise<APIResponse<AuthResponse>> { return auth.userGoogleAuth(this.api, token); }
  mitraLogin(data: LoginRequest): Promise<APIResponse<AuthResponse>> { return auth.mitraLogin(this.api, data); }
  mitraRegister(data: RegisterRequest): Promise<APIResponse<AuthResponse>> { return auth.mitraRegister(this.api, data); }
  mitraGoogleAuth(token: string): Promise<APIResponse<AuthResponse>> { return auth.mitraGoogleAuth(this.api, token); }
  mitraLogout(refreshToken: string): Promise<APIResponse> { return auth.mitraLogout(this.api, refreshToken); }
  mitraLogoutAll(): Promise<APIResponse> { return auth.mitraLogoutAll(this.api); }

  // ── Users ──
  getUserProfile(): Promise<APIResponse<User>> { return users.getUserProfile(this.api); }
  updateUserProfile(data: UserUpdateRequest): Promise<APIResponse<User>> { return users.updateUserProfile(this.api, data); }
  updateUserAvatar(file: File): Promise<APIResponse> { return users.updateUserAvatar(this.api, file); }
  getMitraProfile(): Promise<APIResponse<Mitra>> { return users.getMitraProfile(this.api); }
  updateMitraProfile(data: Partial<Mitra>): Promise<APIResponse<Mitra>> { return users.updateMitraProfile(this.api, data); }
  addMitraBank(data: { bank_name: string; bank_number: string }): Promise<APIResponse> { return users.addMitraBank(this.api, data); }
  updateMitraBank(data: { bank_name: string; bank_number: string }): Promise<APIResponse> { return users.updateMitraBank(this.api, data); }
  addUserAddress(data: AddAddressRequest): Promise<APIResponse> { return users.addUserAddress(this.api, data); }
  getUserAddresses(): Promise<APIResponse<UserAddress[]>> { return users.getUserAddresses(this.api); }
  getUserAddress(addressId: number): Promise<APIResponse> { return users.getUserAddress(this.api, addressId); }
  updateUserAddress(addressId: number, data: AddAddressRequest): Promise<APIResponse> { return users.updateUserAddress(this.api, addressId, data); }
  setUserPrimaryAddress(data: AddAddressRequest): Promise<APIResponse> { return users.setUserPrimaryAddress(this.api, data); }
  deleteUserAddress(addressId: number): Promise<APIResponse> { return users.deleteUserAddress(this.api, addressId); }
  addUserVehicle(data: AddVehicleRequest): Promise<APIResponse> { return users.addUserVehicle(this.api, data); }
  getUserVehicles(): Promise<APIResponse<Vehicle[]>> { return users.getUserVehicles(this.api); }
  getUserVehicle(vehicleId: number): Promise<APIResponse> { return users.getUserVehicle(this.api, vehicleId); }
  updateUserVehicle(vehicleId: number, data: UpdateVehicleRequest): Promise<APIResponse> { return users.updateUserVehicle(this.api, vehicleId, data); }
  deleteUserVehicle(vehicleId: number): Promise<APIResponse> { return users.deleteUserVehicle(this.api, vehicleId); }

  // ── Bengkels ──
  getBengkels(page?: number, limit?: number) { return bengkels.getBengkels(this.api, page, limit); }
  searchBengkels(query: string, service?: string, page?: number, limit?: number) { return bengkels.searchBengkels(this.api, query, service, page, limit); }
  getNearestBengkels(lat: number, lng: number, page?: number, limit?: number) { return bengkels.getNearestBengkels(this.api, lat, lng, page, limit); }
  getBengkelDetail(bengkelId: string, page?: number, limit?: number): Promise<APIResponse<BengkelDetailResponse>> { return bengkels.getBengkelDetail(this.api, bengkelId, page, limit); }
  getBengkelDetails(bengkelId: string): Promise<APIResponse<Bengkel>> { return bengkels.getBengkelDetails(this.api, bengkelId); }
  getBengkelSchedule(bengkelId: string, day: string) { return bengkels.getBengkelSchedule(this.api, bengkelId, day); }
  getBengkelOperationalDay(bengkelId: string, day: string) { return bengkels.getBengkelOperationalDay(this.api, bengkelId, day); }
  createBengkel(data: CreateBengkelRequest) { return bengkels.createBengkel(this.api, data); }
  createBengkelV2(data: CreateBengkelV2Request) { return bengkels.createBengkelV2(this.api, data); }
  getBengkelProfile() { return bengkels.getBengkelProfile(this.api); }
  updateBengkelProfile(data: Partial<Bengkel>) { return bengkels.updateBengkelProfile(this.api, data); }
  updateBengkelProfileV2(data: UpdateBengkelProfileRequest) { return bengkels.updateBengkelProfileV2(this.api, data); }
  updateBengkelMontir(jumlah_montir: number) { return bengkels.updateBengkelMontir(this.api, jumlah_montir); }
  updateBengkelOperational(data: { hari: string; jam_buka: string }[]) { return bengkels.updateBengkelOperational(this.api, data); }
  updateBengkelOperationalV2(data: UpdateBengkelOperationalRequest) { return bengkels.updateBengkelOperationalV2(this.api, data); }
  addBengkelAddress(data: AddAddressRequest) { return bengkels.addBengkelAddress(this.api, data); }
  createBengkelAddressV2(data: CreateBengkelAddressRequest) { return bengkels.createBengkelAddressV2(this.api, data); }
  addBengkelService(data: CreateBengkelServicesV2Request) { return bengkels.addBengkelService(this.api, data); }
  createBengkelServicesV2(data: CreateBengkelServicesRequest) { return bengkels.createBengkelServicesV2(this.api, data); }
  updateBengkelService(data: CreateBengkelServicesV2Request) { return bengkels.updateBengkelService(this.api, data); }
  deleteBengkelService(serviceId: number) { return bengkels.deleteBengkelService(this.api, serviceId); }
  updateBengkelServiceOptions(data: { home_service?: boolean; store_service?: boolean; is_open?: boolean }) { return bengkels.updateBengkelServiceOptions(this.api, data); }
  updateBengkelServiceOptionsV2(data: UpdateServiceOptionsRequest) { return bengkels.updateBengkelServiceOptionsV2(this.api, data); }
  uploadBengkelPhoto(file: File) { return bengkels.uploadBengkelPhoto(this.api, file); }
  uploadBengkelPhotos(files: File[]) { return bengkels.uploadBengkelPhotos(this.api, files); }
  uploadBengkelPhotosV2(files: File[]) { return bengkels.uploadBengkelPhotos(this.api, files); }
  updateBengkelAvatar(file: File) { return bengkels.updateBengkelAvatar(this.api, file); }
  updateBengkelAvatarV2(file: File) { return bengkels.updateBengkelAvatar(this.api, file); }
  getAllBengkelsV2(page?: number, limit?: number) { return bengkels.getAllBengkelsV2(this.api, page, limit); }
  searchBengkelsV2(params: Parameters<typeof bengkels.searchBengkelsV2>[1]) { return bengkels.searchBengkelsV2(this.api, params); }
  getNearestBengkelsV2(params: Parameters<typeof bengkels.getNearestBengkelsV2>[1]) { return bengkels.getNearestBengkelsV2(this.api, params); }
  getBengkelDetailsV2(bengkelId: string) { return bengkels.getBengkelDetailsV2(this.api, bengkelId); }
  createTestimonial(bengkelId: string, data: CreateTestimonialRequest) { return bengkels.createTestimonial(this.api, bengkelId, data); }
  createTestimonialV2(bengkelId: string, data: CreateTestimonialV2Request) { return bengkels.createTestimonialV2(this.api, bengkelId, data); }

  // ── Orders ──
  createOrder(userId: string, data: CreateOrderRequest) { return orders.createOrder(this.api, userId, data); }
  createOrderFlexible(data: CreateOrderFlexibleRequest, mitraId?: string) { return orders.createOrderFlexible(this.api, data, this.getUserType(), mitraId); }
  createOrderSmart(services: { title: string; detail: string; price: number }[], options: Parameters<typeof orders.createOrderSmart>[2], mitraId?: string) { return orders.createOrderSmart(this.api, services, options, this.getUserType(), mitraId); }
  createOrderFlexibleLegacy(data: CreateOrderFlexibleRequestLegacy, mitraId?: string) { return orders.createOrderFlexibleLegacy(this.api, data, this.getUserType(), mitraId); }
  createOrderService(data: CreateOrderServiceRequest, userId?: string) { return orders.createOrderService(this.api, data, this.getUserType(), userId); }
  createOrderServiceLegacy(data: CreateOrderServiceRequestLegacy, userId?: string) { return orders.createOrderServiceLegacy(this.api, data, this.getUserType(), userId); }
  createOrderServiceSmart(services: { title: string; detail?: string; price: number }[], mitraId?: string, userId?: string) { return orders.createOrderServiceSmart(this.api, services, this.getUserType(), mitraId, userId); }
  createOrderServiceWithQuery(data: Omit<CreateOrderServiceRequest, 'mitra_id'>, mitraId: string) { return orders.createOrderServiceWithQuery(this.api, data, mitraId); }
  createOrderV2(data: CreateOrderV2Request) { return orders.createOrderV2(this.api, data); }
  getOrderDetails(orderId: string, userType?: 'user' | 'mitra') { return orders.getOrderDetails(this.api, orderId, userType); }
  getOrderDetailsV2(orderId: string) { return orders.getOrderDetailsV2(this.api, orderId); }
  getUserOrderDetails(pesananId: string) { return orders.getUserOrderDetails(this.api, pesananId); }
  getMitraOrderDetails(pesananId: string) { return orders.getMitraOrderDetails(this.api, pesananId); }
  updateOrder(orderId: string, data: UpdateOrderRequest) { return orders.updateOrder(this.api, orderId, data); }
  updateOrderV2(orderId: string, data: UpdateOrderV2Request) { return orders.updateOrderV2(this.api, orderId, data); }
  updateOrderStatus(orderId: string, status: number) { return orders.updateOrderStatus(this.api, orderId, status); }
  updateOrderStatusV2(orderId: string, data: UpdateOrderStatusRequest) { return orders.updateOrderStatusV2(this.api, orderId, data); }
  updateOrderStatusEnhanced(orderId: string, data: UpdateOrderStatusEnhancedRequest) { return orders.updateOrderStatusEnhanced(this.api, orderId, data); }
  confirmOrder(orderId: string) { return orders.confirmOrder(this.api, orderId); }
  startService(orderId: string) { return orders.startService(this.api, orderId); }
  completeOrder(orderId: string) { return orders.completeOrder(this.api, orderId); }
  cancelOrder(orderId: string, reason?: 'no_show' | 'service_unavailable' | 'payment_failed' | 'default') { return orders.cancelOrder(this.api, orderId, reason); }
  getUserOrders(page?: number, limit?: number) { return orders.getUserOrders(this.api, page, limit); }
  getMitraOrders(page?: number, limit?: number) { return orders.getMitraOrders(this.api, page, limit); }
  getUserOrdersV2(params?: Parameters<typeof orders.getUserOrdersV2>[1]) { return orders.getUserOrdersV2(this.api, params); }
  getBengkelOrdersV2(params?: Parameters<typeof orders.getBengkelOrdersV2>[1]) { return orders.getBengkelOrdersV2(this.api, params); }
  getUserDetails(userId: string) { return orders.getUserDetails(this.api, userId); }

  // ── Chat ──
  createChatRoom(data: CreateChatRoomRequest) { return chat.createChatRoom(this.apiV2, data); }
  getChatRooms(page?: number, limit?: number) { return chat.getChatRooms(this.apiV2, page, limit); }
  getChatRoom(roomId: string) { return chat.getChatRoom(this.apiV2, roomId); }
  getRoomMessages(roomId: string, limit?: number, before?: string, after?: string) { return chat.getRoomMessages(this.apiV2, roomId, limit, before, after); }
  sendMessage(data: SendMessageRequest) { return chat.sendMessage(this.apiV2, data); }
  sendFileMessage(data: SendFileMessageRequest) { return chat.sendFileMessage(this.apiV2, data); }
  editMessage(messageId: string, data: EditMessageRequest) { return chat.editMessage(this.apiV2, messageId, data); }
  deleteMessage(messageId: string) { return chat.deleteMessage(this.apiV2, messageId); }
  markMessagesAsRead(data: MarkReadRequest) { return chat.markMessagesAsRead(this.apiV2, data); }
  sendTypingIndicator(data: TypingIndicatorRequest) { return chat.sendTypingIndicator(this.apiV2, data); }
  getBengkelChatRooms(bengkelId: string, page?: number, limit?: number) { return chat.getBengkelChatRooms(this.apiV2, bengkelId, page, limit); }
  getBengkelChatRoom(roomId: string) { return chat.getBengkelChatRoom(this.apiV2, roomId); }
  getBengkelRoomMessages(roomId: string, limit?: number, before?: string, after?: string) { return chat.getBengkelRoomMessages(this.apiV2, roomId, limit, before, after); }
  getUserAppToken() { return chat.getUserAppToken(this.api); }
  getUserChatToken() { return chat.getUserChatToken(this.api); }
  getMitraAppToken() { return chat.getMitraAppToken(this.api); }
  getMitraChatToken() { return chat.getMitraChatToken(this.api); }
  createUserChatHistory(data: { message: string; recipient_id: string }) { return chat.createUserChatHistory(this.api, data); }
  createMitraChatHistory(data: { message: string; recipient_id: string }) { return chat.createMitraChatHistory(this.api, data); }
  getUserChatHistory(page?: number, limit?: number) { return chat.getUserChatHistory(this.api, page, limit); }
  getMitraChatHistory(page?: number, limit?: number) { return chat.getMitraChatHistory(this.api, page, limit); }

  // ── Health ──
  getHealthStatus() { return health.getHealthStatus(this.api); }
  getReadinessCheck() { return health.getReadinessCheck(this.api); }
  getLivenessCheck() { return health.getLivenessCheck(this.api); }

  // ── Validation ──
  async validateToken(): Promise<boolean> {
    try {
      const userType = this.getUserType();
      if (!this.getToken() || !userType) return false;
      const response = userType === 'users' ? await this.getUserProfile() : await this.getMitraProfile();
      return response.success;
    } catch (error: any) {
      if (error.response?.status === 401) this.clearAuthData();
      return false;
    }
  }
}

export const apiService = new ApiService();
export default apiService;
