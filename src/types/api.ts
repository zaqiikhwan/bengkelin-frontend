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

// API Response Types
export interface APIResponse<T = any> {
  success: boolean;
  message: string;
  errors?: any;
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
  jam_buka: string; // Opening hours (e.g., "08:00 - 17:00")
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
}

export interface BengkelPhoto {
  id: number;
  photo_url: string;
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
    page: number;
    limit: number;
    total: number;
    total_pages: number;
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
  type: 'success' | 'new_message' | 'typing_update' | 'message_read' | 'presence_update' | 'room_update' | 'error';
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