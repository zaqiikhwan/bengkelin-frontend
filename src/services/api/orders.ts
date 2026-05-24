import type { AxiosInstance } from 'axios';
import type {
  APIResponse, Order, OrderServiceCreationResponse, Pagination,
  CreateOrderRequest, CreateOrderFlexibleRequest, CreateOrderFlexibleRequestLegacy,
  CreateOrderServiceRequest, CreateOrderServiceRequestLegacy,
  CreateOrderV2Request, UpdateOrderV2Request, UpdateOrderRequest,
  UpdateOrderStatusRequest, UpdateOrderStatusEnhancedRequest, OrderStatusUpdateResponse,
} from '../../types/api';

// V2 Order Management
export function createOrderV2(api: AxiosInstance, data: CreateOrderV2Request): Promise<APIResponse<Order>> {
  return api.post('/orders', data).then(r => r.data);
}

export function getOrderDetailsV2(api: AxiosInstance, orderId: string): Promise<APIResponse<Order>> {
  return api.get(`/orders/${orderId}`).then(r => r.data);
}

export function updateOrderV2(api: AxiosInstance, orderId: string, data: UpdateOrderV2Request): Promise<APIResponse<Order>> {
  return api.patch(`/orders/${orderId}`, data).then(r => r.data);
}

export function updateOrderStatusV2(api: AxiosInstance, orderId: string, data: UpdateOrderStatusRequest): Promise<APIResponse<Order>> {
  return api.patch(`/orders/${orderId}/status`, data).then(r => r.data);
}

export function getUserOrdersV2(api: AxiosInstance, params?: { page?: number; limit?: number; status?: string }): Promise<APIResponse<{ orders: Order[]; pagination: Pagination }>> {
  const searchParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) searchParams.append(key, value.toString());
    });
  }
  return api.get(`/orders?${searchParams}`).then(r => r.data);
}

export function getBengkelOrdersV2(api: AxiosInstance, params?: { page?: number; limit?: number; status?: string }): Promise<APIResponse<{ orders: Order[]; pagination: Pagination }>> {
  const searchParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) searchParams.append(key, value.toString());
    });
  }
  return api.get(`/bengkels/orders?${searchParams}`).then(r => r.data);
}

// Legacy Order Management
export function createOrder(api: AxiosInstance, userId: string, data: CreateOrderRequest): Promise<APIResponse<Order>> {
  return api.post(`/bengkels/order/service/${userId}`, data).then(r => r.data);
}

export function createOrderFlexible(api: AxiosInstance, data: CreateOrderFlexibleRequest, userType: string | null, mitraId?: string): Promise<APIResponse<Order>> {
  if (userType === 'users') {
    if (!mitraId) throw new Error('Mitra ID is required for user orders');
    return api.post(`/bengkels/order/service?mitraId=${mitraId}`, data).then(r => r.data);
  } else if (userType === 'mitras') {
    return api.post('/bengkels/order/service', data).then(r => r.data);
  }
  throw new Error('Invalid user type for order creation');
}

export function createOrderFlexibleLegacy(api: AxiosInstance, data: CreateOrderFlexibleRequestLegacy, userType: string | null, mitraId?: string): Promise<APIResponse<Order>> {
  if (userType === 'users') {
    if (!mitraId) throw new Error('Mitra ID is required for user orders');
    return api.post(`/bengkels/order/service?mitraId=${mitraId}`, data).then(r => r.data);
  } else if (userType === 'mitras') {
    return api.post('/bengkels/order/service', data).then(r => r.data);
  }
  throw new Error('Invalid user type for order creation');
}

export async function createOrderSmart(
  api: AxiosInstance,
  services: { title: string; detail: string; price: number }[],
  options: { vehicle_id?: number; is_home_service?: boolean; home_service_schedule?: string; payment_method?: string; note?: string },
  userType: string | null,
  mitraId?: string
): Promise<APIResponse<Order>> {
  try {
    const structuredData: CreateOrderFlexibleRequest = { services, ...options };
    return await createOrderFlexible(api, structuredData, userType, mitraId);
  } catch (error) {
    const legacyData: CreateOrderFlexibleRequestLegacy = {
      title: services.map(s => s.title),
      detail: services.map(s => s.detail),
      price: services.map(s => s.price),
      ...options,
    };
    return await createOrderFlexibleLegacy(api, legacyData, userType, mitraId);
  }
}

// Order Service Creation
export function createOrderService(api: AxiosInstance, data: CreateOrderServiceRequest, userType: string | null, userId?: string): Promise<APIResponse<OrderServiceCreationResponse>> {
  if (userType === 'users') {
    if (!data.mitra_id) throw new Error('Mitra ID is required for user orders');
    return api.post('/bengkels/order/service', data).then(r => r.data);
  } else if (userType === 'mitras') {
    if (!userId) throw new Error('User ID is required when mitra creates order');
    const { mitra_id, ...orderData } = data;
    return api.post(`/bengkels/order/service/${userId}`, orderData).then(r => r.data);
  }
  throw new Error('Invalid user type for order creation');
}

export function createOrderServiceLegacy(api: AxiosInstance, data: CreateOrderServiceRequestLegacy, userType: string | null, userId?: string): Promise<APIResponse<OrderServiceCreationResponse>> {
  if (userType === 'users') {
    if (!data.mitra_id) throw new Error('Mitra ID is required for user orders');
    return api.post('/bengkels/order/service', data).then(r => r.data);
  } else if (userType === 'mitras') {
    if (!userId) throw new Error('User ID is required when mitra creates order');
    const { mitra_id, ...orderData } = data;
    return api.post(`/bengkels/order/service/${userId}`, orderData).then(r => r.data);
  }
  throw new Error('Invalid user type for order creation');
}

export async function createOrderServiceSmart(
  api: AxiosInstance,
  services: { title: string; detail?: string; price: number }[],
  userType: string | null,
  mitraId?: string,
  userId?: string
): Promise<APIResponse<OrderServiceCreationResponse>> {
  try {
    const structuredData: CreateOrderServiceRequest = { mitra_id: mitraId, services };
    return await createOrderService(api, structuredData, userType, userId);
  } catch (error) {
    const legacyData: CreateOrderServiceRequestLegacy = {
      mitra_id: mitraId,
      title: services.map(s => s.title),
      detail: services.map(s => s.detail || ''),
      price: services.map(s => s.price),
    };
    return await createOrderServiceLegacy(api, legacyData, userType, userId);
  }
}

export function createOrderServiceWithQuery(api: AxiosInstance, data: Omit<CreateOrderServiceRequest, 'mitra_id'>, mitraId: string): Promise<APIResponse<OrderServiceCreationResponse>> {
  return api.post(`/bengkels/order/service?mitraId=${mitraId}`, data).then(r => r.data);
}

// Order Details & Status
export function getOrderDetails(api: AxiosInstance, orderId: string, userType: 'user' | 'mitra' = 'user'): Promise<APIResponse<Order>> {
  const endpoint = userType === 'mitra' ? `/bengkels/order/mitra/service/${orderId}` : `/bengkels/order/service/${orderId}`;
  return api.get(endpoint).then(r => r.data);
}

export function getUserOrderDetails(api: AxiosInstance, pesananId: string): Promise<APIResponse<Order>> {
  return api.get(`/bengkels/order/service/${pesananId}`).then(r => r.data);
}

export function getMitraOrderDetails(api: AxiosInstance, pesananId: string): Promise<APIResponse<Order>> {
  return api.get(`/bengkels/order/mitra/service/${pesananId}`).then(r => r.data);
}

export function updateOrder(api: AxiosInstance, orderId: string, data: UpdateOrderRequest): Promise<APIResponse<Order>> {
  return api.patch(`/bengkels/order/service/${orderId}`, data).then(r => r.data);
}

export function updateOrderStatus(api: AxiosInstance, orderId: string, status: number): Promise<APIResponse<Order>> {
  return api.patch(`/bengkels/order/status/${orderId}`, { status }).then(r => r.data);
}

export function updateOrderStatusEnhanced(api: AxiosInstance, orderId: string, data: UpdateOrderStatusEnhancedRequest): Promise<APIResponse<OrderStatusUpdateResponse>> {
  if (data.status === 4 && !data.reason) {
    throw new Error('Cancellation reason is required when status is 4');
  }
  return api.patch(`/bengkels/order/status/${orderId}`, data).then(r => r.data);
}

export function confirmOrder(api: AxiosInstance, orderId: string): Promise<APIResponse<OrderStatusUpdateResponse>> {
  return updateOrderStatusEnhanced(api, orderId, { status: 1 });
}

export function startService(api: AxiosInstance, orderId: string): Promise<APIResponse<OrderStatusUpdateResponse>> {
  return updateOrderStatusEnhanced(api, orderId, { status: 2 });
}

export function completeOrder(api: AxiosInstance, orderId: string): Promise<APIResponse<OrderStatusUpdateResponse>> {
  return updateOrderStatusEnhanced(api, orderId, { status: 3 });
}

export function cancelOrder(api: AxiosInstance, orderId: string, reason: 'no_show' | 'service_unavailable' | 'payment_failed' | 'default' = 'default'): Promise<APIResponse<OrderStatusUpdateResponse>> {
  return updateOrderStatusEnhanced(api, orderId, { status: 4, reason });
}

export function getUserOrders(api: AxiosInstance, page = 1, limit = 10): Promise<APIResponse<{ orders: Order[]; total: number }>> {
  return api.get(`/bengkels/orders/list/user?page=${page}&limit=${limit}`).then(r => {
    if (r.data?.success && r.data?.data) {
      const apiData = r.data.data;
      return { success: true, message: r.data.message, data: { orders: apiData.pesanans || [], total: apiData.count || 0 } };
    }
    return r.data;
  });
}

export function getMitraOrders(api: AxiosInstance, page = 1, limit = 10): Promise<APIResponse<{ orders: Order[]; total: number }>> {
  return api.get(`/bengkels/orders/list/mitra?page=${page}&limit=${limit}`).then(r => {
    if (r.data?.success && r.data?.data) {
      const apiData = r.data.data;
      return { success: true, message: r.data.message, data: { orders: apiData.pesanans || [], total: apiData.count || 0 } };
    }
    return r.data;
  });
}

export function getUserDetails(api: AxiosInstance, userId: string): Promise<APIResponse<any>> {
  return api.get(`/bengkels/order/user/${userId}`).then(r => r.data);
}
