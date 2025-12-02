import type {
  AuthResponse,
  LoginCredentials,
  RegisterData,
  User,
  DoctorProfile,
  DoctorListResponse,
  DoctorDetailResponse,
  Appointment,
  BookAppointmentData,
  Review,
  CreateReviewData,
  AvailabilitySlot,
  UpdateProfileData,
  ChangePasswordData,
  DoctorSearchParams,
  AppointmentDateParams,
} from "@/src/types";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000/api";

class ApiService {
  private getHeaders(): HeadersInit {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options.headers,
        },
      });

      // Handle 401 - Unauthorized
      if (response.status === 401 && typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Request failed");
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("An unexpected error occurred");
    }
  }

  //AUTH ENDPOINTS

  async register(data: RegisterData): Promise<AuthResponse> {
    return this.request("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  }

  async logout(refreshToken: string): Promise<{ ok: boolean }> {
    return this.request("/auth/logout", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    });
  }

  async updateProfile(
    data: UpdateProfileData
  ): Promise<{ message: string; user: User }> {
    return this.request("/auth/update", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async changePassword(data: ChangePasswordData): Promise<{ message: string }> {
    return this.request("/auth/change-password", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async refreshToken(refreshToken: string): Promise<{ token: string }> {
    return this.request("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    });
  }

  async getAllUsers(): Promise<{ count: number; users: User[] }> {
    return this.request("/auth");
  }

  //  DOCTOR ENDPOINTS

  async getDoctors(params?: DoctorSearchParams): Promise<DoctorListResponse> {
    const queryParams = new URLSearchParams();

    if (params?.specialization)
      queryParams.append("specialization", params.specialization);
    if (params?.q) queryParams.append("q", params.q);
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());

    const query = queryParams.toString();
    return this.request(`/doctors${query ? `?${query}` : ""}`);
  }

  async getDoctor(id: string): Promise<DoctorDetailResponse> {
    return this.request(`/doctors/${id}`);
  }

  async createDoctor(data: unknown): Promise<DoctorDetailResponse> {
    return this.request("/doctors", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateDoctor(id: string, data: unknown): Promise<DoctorDetailResponse> {
    return this.request(`/doctors/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async deleteDoctor(
    id: string
  ): Promise<{ success: boolean; message: string }> {
    return this.request(`/doctors/${id}`, {
      method: "DELETE",
    });
  }

  // APPOINTMENT ENDPOINTS

  async bookAppointment(data: BookAppointmentData): Promise<Appointment> {
    return this.request("/appointments", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getAppointmentsByPatient(patientId: string): Promise<Appointment[]> {
    return this.request(`/appointments/patient/${patientId}`);
  }

  async getAppointmentsByDoctor(
    doctorId: string,
    params?: AppointmentDateParams
  ): Promise<Appointment[]> {
    const queryParams = new URLSearchParams();

    if (params?.from) queryParams.append("from", params.from);
    if (params?.to) queryParams.append("to", params.to);

    const query = queryParams.toString();
    return this.request(
      `/appointments/doctor/${doctorId}${query ? `?${query}` : ""}`
    );
  }

  async cancelAppointment(id: string): Promise<{ ok: boolean }> {
    return this.request(`/appointments/${id}/cancel`, {
      method: "PATCH",
    });
  }

  async rescheduleAppointment(
    id: string,
    newStart: string,
    newEnd: string
  ): Promise<Appointment> {
    return this.request(`/appointments/${id}/reschedule`, {
      method: "PATCH",
      body: JSON.stringify({ newStart, newEnd }),
    });
  }

  async setAppointmentStatus(
    id: string,
    status: "pending" | "confirmed" | "cancelled" | "completed"
  ): Promise<Appointment> {
    return this.request(`/appointments/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  }

  //  REVIEW ENDPOINTS

  async createReview(data: CreateReviewData): Promise<Review> {
    return this.request("/reviews", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getReviewsForDoctor(doctorId: string): Promise<Review[]> {
    return this.request(`/reviews/${doctorId}`);
  }

  //  AVAILABILITY ENDPOINTS

  async getAvailability(
    doctorId: string,
    params?: { from?: string; to?: string; recurring?: string }
  ): Promise<AvailabilitySlot[]> {
    const queryParams = new URLSearchParams();

    if (params?.from) queryParams.append("from", params.from);
    if (params?.to) queryParams.append("to", params.to);
    if (params?.recurring) queryParams.append("recurring", params.recurring);

    const query = queryParams.toString();
    return this.request(
      `/availability/doctor/${doctorId}${query ? `?${query}` : ""}`
    );
  }

  async createAvailability(data: {
    doctor: string;
    start: string;
    end: string;
    recurring?: string;
  }): Promise<AvailabilitySlot> {
    return this.request("/availability", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateAvailability(
    id: string,
    data: Partial<AvailabilitySlot>
  ): Promise<AvailabilitySlot> {
    return this.request(`/availability/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async deleteAvailability(id: string): Promise<{ message: string }> {
    return this.request(`/availability/${id}`, {
      method: "DELETE",
    });
  }
}

export const api = new ApiService();
