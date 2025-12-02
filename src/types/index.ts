export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "doctor" | "patient";
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: "patient" | "doctor" | "admin";
}

export interface DoctorProfile {
  _id: string;
  img?: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  specialization?: string;
  fees?: number;
  experience?: number;
  bio?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DoctorListResponse {
  success: boolean;
  data: DoctorProfile[];
  pagination: {
    total: number;
    page: number;
    limit: number;
  };
}

export interface DoctorDetailResponse {
  success: boolean;
  data: DoctorProfile;
}

export interface Appointment {
  _id: string;
  doctor: DoctorProfile | string;
  patient: User | string;
  start: string;
  end: string;
  reason?: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  createdAt: string;
  updatedAt: string;
}

export interface BookAppointmentData {
  doctorId: string;
  start: string;
  end: string;
  reason: string;
}

export interface Review {
  _id: string;
  doctor: string;
  patient: {
    _id: string;
    name: string;
  };
  rating: number;
  comment?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReviewData {
  doctorId: string;
  rating: number;
  comment?: string;
}

export interface AvailabilitySlot {
  _id: string;
  doctor: string;
  start: string;
  end: string;
  recurring?: "DAILY" | "WEEKLY" | "MONTHLY" | null;
  createdAt: string;
  updatedAt: string;
}

export interface FieldError {
  field: string;
  message: string;
}

export interface ApiError {
  message: string;
  errors?: FieldError[];
}

export interface UpdateProfileData {
  name: string;
}

export interface ChangePasswordData {
  oldPassword: string;
  newPassword: string;
}

export interface DoctorSearchParams {
  specialization?: string;
  q?: string;
  page?: number;
  limit?: number;
}

export interface AppointmentDateParams {
  from?: string;
  to?: string;
}
