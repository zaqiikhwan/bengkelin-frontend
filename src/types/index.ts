// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'customer' | 'mechanic' | 'admin';
  createdAt: string;
  updatedAt: string;
}

// Workshop/Service Types
export interface Workshop {
  id: string;
  name: string;
  address: string;
  phone: string;
  email?: string;
  description?: string;
  rating: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number; // in minutes
  category: string;
  workshopId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Booking Types
export interface Booking {
  id: string;
  customerId: string;
  workshopId: string;
  serviceId: string;
  mechanicId?: string;
  scheduledDate: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
  
  // Relations
  customer?: User;
  workshop?: Workshop;
  service?: Service;
  mechanic?: User;
}

// Vehicle Types
export interface Vehicle {
  id: string;
  customerId: string;
  brand: string;
  model: string;
  year: number;
  licensePlate: string;
  color?: string;
  engineType?: string;
  createdAt: string;
  updatedAt: string;
}

// Form Types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface BookingForm {
  workshopId: string;
  serviceId: string;
  vehicleId: string;
  scheduledDate: string;
  notes?: string;
}