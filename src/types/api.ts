// Authentication Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  password: string;
  confirm_password: string;
}

// Pagination Types
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export interface UserUpdateRequest {
  first_name: string;
  last_name: string;
  phone_number: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  user?: UserInfo;
  mitra?: MitraInfo;
}

export interface UserInfo {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;
  avatar_url?: string;
}

export interface MitraInfo {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;
  bank_name?: string;
  bank_number?: string;
}

// Error Response Types
export interface APIErrorDetails {
  code: string;
  message: string;
  details?: string;
}

export interface APIErrorResponse {
  success: false;
  message: string;
  errors: APIErrorDetails | string;
  data: null;
}

// API Response Types
export interface APIResponse<T = unknown> {
  success: boolean;
  message: string;
  errors?: Record<string, string[]> | string;
  data?: T;
}

// User Models
export interface User {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  addresses: UserAddress[];
  vehicles: Vehicle[];
}

export interface UserAddress {
  address_id: number;
  latitude: number;
  longitude: number;
  address_label: string;
  full_address: string;
  note?: string;
  is_primary?: boolean;
}

export interface Vehicle {
  vehicle_id: number;
  vehicle_type: string;
  vehicle_color: string;
  vehicle_number: string;
  photos: VehiclePhoto[];
}

export interface VehiclePhoto {
  id: number;
  photo_url: string;
}

// Mitra Models
export interface Mitra {
  mitra_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  bank_name?: string;
  bank_number?: string;
  created_at: string;
  updated_at: string;
  bengkel: Bengkel[];
}

// Bengkel Models
export interface Bengkel {
  bengkel_id: string;
  bengkel_name: string;
  bengkel_phone: string;
  description?: string;
  jumlah_montir: number;
  home_service?: boolean;
  store_service?: boolean;
  is_open?: boolean;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  operasionals: BengkelOperational[];
  photos: BengkelPhoto[];
  services: BengkelService[];
  addresses: BengkelAddress[];
  testimonials?: BengkelTestimonial[];
}

export interface BengkelOperational {
  id: number;
  hari: string; // Day of week
  jam_buka: string; // Opening time (e.g., "08:00")
  jam_tutup?: string; // Closing time (e.g., "17:00")
  is_active?: boolean | null; // true/false/null for flexible control
}

export interface BengkelAddress {
  id: number;
  latitude: number;
  longitude: number;
  address_label: string;
  full_address: string;
  note?: string;
}

export interface BengkelService {
  id: number;
  nama_service: string;
  description?: string;
  price?: number;
  is_available?: boolean;
}

export interface BengkelPhoto {
  id: number;
  photo_url: string;
}

export interface BengkelTestimonial {
  id: number;
  user_name: string;
  rating: number;
  testimoni: string;
  created_at: string;
}

export interface BengkelRating {
  average_rating: number;
  total_reviews: number;
  total_rating_sum: number;
}

export interface BengkelDetailResponse {
  bengkel_id: string;
  bengkel_name: string;
  bengkel_phone: string;
  jumlah_montir: number;
  home_service: boolean;
  store_service: boolean;
  is_open: boolean;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  services: BengkelService[];
  operasionals: BengkelOperational[];
  photos: BengkelPhoto[];
  addresses: BengkelAddress[];
  testimonials: {
    data: BengkelTestimonial[];
    total_count: number;
    page?: number;
    limit?: number;
    total_pages?: number;
    showing?: number;
    message?: string;
  };
  rating: BengkelRating;
  user_context: {
    is_authenticated: boolean;
    user_type?: string;
    user_id?: string;
    can_book_service?: boolean;
    can_leave_review?: boolean;
    is_owner?: boolean;
    management_access?: boolean;
  };
  analytics?: {
    total_services: number;
    total_photos: number;
    total_addresses: number;
    operational_days: number;
  };
  call_to_action?: {
    message: string;
    login_url: string;
    register_url: string;
  };
}

// Order Models
export interface Order {
  id: string;
  user_id: string;
  bengkel_id: string;
  vehicle_id: number;
  status: number; // 0=pending, 1=confirmed, 2=in_progress, 3=completed, 4=cancelled
  is_home_service?: boolean;
  total_price: number;
  admin_fee: number;
  home_service_fee: number;
  home_service_schedule?: string;
  payment_method?: string;
  note?: string;
  confirmed_at?: string;
  paid_at?: string;
  finished_at?: string;
  cancelled_at?: string;
  cancelled_by?: string;
  cancelled_reason?: string;
  created_at: string;
  updated_at: string;
  user: User;
  bengkel: Bengkel;
  vehicle: Vehicle;
  order_services: OrderService[];
}

export interface OrderService {
  id: number;
  order_id: string;
  title: string;
  detail: string;
  price: number;
  created_at: string;
  updated_at: string;
}

// Review Models
export interface BengkelTestimonial {
  id: number;
  testimoni: string;
  rating: number;
  user: User;
  order: Order;
}

// Chat Models
export interface ChatHistory {
  id: number;
  message: string;
  sender_type: 'user' | 'mitra';
  created_at: string;
}

// Form Types
export interface CreateBengkelRequest {
  bengkel_name: string;
  bengkel_phone: string;
  jumlah_montir: number;
}

// New V2 Bengkel Management Types
export interface CreateBengkelV2Request {
  bengkel_name: string;
  bengkel_phone: string;
  jumlah_montir: number;
  // Support both legacy and new formats
  hari?: string[];
  jam_buka?: string[];
  // New format with detailed operational hours
  operasionals?: {
    hari: string;
    jam_buka: string;
    jam_tutup: string;
    is_active?: boolean;
  }[];
}

export interface UpdateBengkelProfileRequest {
  bengkel_name?: string;
  bengkel_phone?: string;
  jumlah_montir?: number;
}

export interface UpdateBengkelOperationalRequest {
  operasionals: {
    id?: number; // 0 for new records, existing ID for updates
    hari: string;
    jam_buka: string;
    jam_tutup: string;
    is_active?: boolean | null; // true/false/null for flexible control
  }[];
}

export interface CreateBengkelAddressRequest {
  latitude: number;
  longitude: number;
  address_label: string;
  full_address: string;
  note?: string;
}

export interface CreateBengkelServicesRequest {
  nama_service: string[];
}

export interface BengkelServiceItem {
  id?: number;
  nama_service: string;
  description: string;
  price: number;
  is_available: boolean;
}

export interface CreateBengkelServicesV2Request {
  services: BengkelServiceItem[];
}

export interface UpdateServiceOptionsRequest {
  home_service?: boolean;
  store_service?: boolean;
  is_open?: boolean;
}

export interface AddAddressRequest {
  latitude: number;
  longitude: number;
  address_label: string;
  full_address: string;
  note?: string;
  is_primary?: boolean;
}

export interface AddVehicleRequest {
  vehicle_type: string;
  vehicle_color: string;
  vehicle_number: string;
}

export interface UpdateVehicleRequest {
  vehicle_type?: string;
  vehicle_color?: string;
  vehicle_number?: string;
}

export interface CreateOrderRequest {
  vehicle_id: number;
  is_home_service?: boolean;
  home_service_schedule?: string;
  payment_method?: string;
  note?: string;
  services: OrderServiceItem[];
}

// Enhanced order request for flexible API - New Structured Format (Recommended)
export interface CreateOrderFlexibleRequest {
  services: {
    title: string;
    detail: string;
    price: number;
  }[];
  vehicle_id?: number;
  is_home_service?: boolean;
  home_service_schedule?: string;
  payment_method?: string;
  note?: string;
}

// Legacy format for backward compatibility
export interface CreateOrderFlexibleRequestLegacy {
  title: string[];
  detail: string[];
  price: number[];
  vehicle_id?: number;
  is_home_service?: boolean;
  home_service_schedule?: string;
  payment_method?: string;
  note?: string;
}

// Order Service Creation API - New Structured Format
export interface CreateOrderServiceRequest {
  mitra_id?: string; // Required for user self-orders, ignored for mitra-created orders
  services: {
    title: string;
    detail?: string;
    price: number;
  }[];
}

// Order Service Creation API - Legacy Format (Backward Compatibility)
export interface CreateOrderServiceRequestLegacy {
  mitra_id?: string; // Required for user self-orders, ignored for mitra-created orders
  title: string[];
  detail?: string[];
  price: number[];
}

// Order Service Creation Response
export interface OrderServiceCreationResponse {
  pesanan_id: string;
  user_id: string;
  bengkel_id: string;
  bengkel_name: string;
  total_price: number;
  admin_fee: number;
  status: number;
  created_by: {
    type: 'user' | 'mitra';
    id: string;
    name: string;
  };
  order_context: {
    is_self_order: boolean;
    is_mitra_created: boolean;
  };
}

// New V2 Order Types
export interface CreateOrderV2Request {
  bengkel_id: string;
  vehicle_id: string;
  address_id: string;
  service_type: 'home_service' | 'store_service';
  services: string[];
  description?: string;
  scheduled_date: string;
  scheduled_time: string;
}

export interface UpdateOrderV2Request {
  service_fee?: number;
  estimated_completion?: string;
  notes?: string;
}

export interface UpdateOrderStatusRequest {
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  completion_notes?: string;
}

// Enhanced Order Status Update Request
export interface UpdateOrderStatusEnhancedRequest {
  status: 0 | 1 | 2 | 3 | 4; // 0=pending, 1=confirmed, 2=in_progress, 3=completed, 4=cancelled
  reason?: 'no_show' | 'service_unavailable' | 'payment_failed' | 'default'; // Required when status = 4
}

// Order Status Response with cancellation tracking
export interface OrderStatusUpdateResponse {
  id: string;
  user_id: string;
  bengkel_id: string;
  vehicle_id: number;
  status: number;
  is_home_service: boolean;
  total_price: number;
  admin_fee: number;
  home_service_fee: number;
  confirmed_at?: string;
  paid_at?: string;
  finished_at?: string;
  cancelled_at?: string;
  cancelled_by?: string;
  cancelled_reason?: string;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
  };
  bengkel?: {
    id: string;
    bengkel_name: string;
  };
  vehicle?: {
    id: number;
    vehicle_type: string;
    vehicle_color: string;
    vehicle_number: string;
  };
  order_services?: OrderService[];
}

export interface OrderServiceItem {
  title: string;
  detail: string;
  price: number;
}

export interface UpdateOrderRequest {
  is_home_service?: boolean;
  home_service_schedule?: string;
  payment_method?: string;
  note?: string;
}

export interface CreateTestimonialRequest {
  testimoni: string;
  rating: number;
  pesananId: string;
}

export interface CreateTestimonialV2Request {
  testimoni: string;
  rating: number;
}

// Chat System Types - Updated to match API spec
export interface ChatRoom {
  id: string;
  user_id: string;
  bengkel_id: string;
  room_name: string;
  is_active: boolean;
  last_message?: string;
  last_message_at?: string;
  unread_count: number;
  created_at: string;
  updated_at: string;
  bengkel?: {
    id: string;
    bengkel_name: string;
    avatar_url?: string;
  };
  user?: {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url?: string;
  };
}

export interface ChatMessage {
  id: string;
  room_id: string;
  sender_id: string;
  sender_type: 'user' | 'mitra';
  message_type: 'text' | 'file';
  content: string;
  file_url?: string;
  file_name?: string;
  file_size?: number;
  is_read: boolean;
  read_at?: string;
  is_edited: boolean;
  edited_at?: string;
  reply_to_id?: string;
  created_at: string;
  updated_at: string;
  sender: {
    id: string;
    name: string;
    avatar_url?: string;
    type: 'user' | 'mitra';
  };
  reply_to?: ChatMessage;
}

export interface ChatRoomsResponse {
  rooms: ChatRoom[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export interface MessagesResponse {
  messages: ChatMessage[];
  pagination: {
    page?: number; // Legacy support
    limit: number;
    total?: number; // Legacy support
    total_pages?: number; // Legacy support
    // New cursor-based pagination
    has_more: boolean;
    next_cursor?: string;
    prev_cursor?: string;
  };
}

export interface MessageReadReceipt {
  room_id: string;
  message_id: string;
  reader_id: string;
  reader_type: 'user' | 'mitra';
  read_at: string;
}

export interface CreateChatRoomRequest {
  bengkel_id: string;
}

export interface SendMessageRequest {
  room_id: string;
  message_type: 'text' | 'file';
  content: string;
  reply_to_id?: string;
}

export interface SendFileMessageRequest {
  room_id: string;
  file: File;
  reply_to_id?: string;
}

export interface EditMessageRequest {
  content: string;
}

export interface MarkReadRequest {
  message_ids: string[];
}

export interface TypingIndicatorRequest {
  room_id: string;
  is_typing: boolean;
}

// WebSocket Message Types
export interface WebSocketMessage {
  type: 'success' | 'send_message' | 'typing' | 'mark_read' | 'join_room' | 'leave_room' | 'get_messages' | 'new_message' | 'typing_update' | 'message_read' | 'presence_update' | 'room_update' | 'error';
  room_id?: string;
  data?: any;
  success?: boolean;
  message?: string;
  error?: string;
  timestamp: string;
}

export interface WebSocketConnectionSuccess {
  user_id: string;
  user_type: 'user' | 'mitra';
  socket_id: string;
  connected_at: string;
}

export interface WebSocketTypingUpdate {
  room_id: string;
  user_id: string;
  user_type: 'user' | 'mitra';
  user_name: string;
  is_typing: boolean;
  timestamp: string;
}

export interface WebSocketPresenceUpdate {
  user_id: string;
  user_type: 'user' | 'mitra';
  user_name: string;
  is_online: boolean;
  last_seen: string;
}

// Health Check Types
export interface HealthStatus {
  status: string;
  timestamp: string;
  version: string;
  environment: string;
  uptime: string;
  checks: {
    database: CheckResult;
    redis: CheckResult;
    system: CheckResult;
  };
}

export interface CheckResult {
  status: string;
  message?: string;
  duration: string;
  timestamp: string;
}