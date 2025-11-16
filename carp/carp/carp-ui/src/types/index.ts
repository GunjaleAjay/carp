// User types
export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  status: string;
  created_at: string;
  updated_at?: string;
}

// Vehicle types
export interface Vehicle {
  id: number;
  user_id: number;
  make: string;
  model: string;
  year: number;
  vehicle_type: string;
  fuel_type: string;
  is_default: boolean;
  co2_per_km: number;
  created_at: string;
  updated_at?: string;
}

// Trip/Route types
export interface Trip {
  id: number;
  user_id: number;
  vehicle_id?: number;
  origin: string;
  destination: string;
  distance_km: number;
  duration_minutes: number;
  co2_emissions: number;
  route_data?: any;
  created_at: string;
}

// Route planning types
export interface RouteOption {
  id: number;
  name: string;
  distance: string;
  duration: string;
  co2: string;
  ecoRating: number;
  description: string;
  instructions: string[];
  highlights: string[];
  mode: string;
}

// Analytics types
export interface DashboardStats {
  totalTrips: number;
  totalDistance: number;
  totalCo2: number;
  co2Saved: number;
  ecoTrips: number;
  averageEcoRating: number;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiError {
  error: string;
  details?: any;
}

// Form types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

export interface VehicleFormData {
  make: string;
  model: string;
  year: number;
  vehicle_type: string;
  fuel_type: string;
  is_default: boolean;
}

// Emission factor types
export interface EmissionFactor {
  id: number;
  vehicle_type: string;
  fuel_type: string;
  emission_factor: number;
  unit: string;
  created_at: string;
  updated_at?: string;
}

// Admin types
export interface AdminStats {
  totalUsers: number;
  totalVehicles: number;
  totalTrips: number;
  totalCo2Saved: number;
  activeUsers: number;
  newUsersToday: number;
}