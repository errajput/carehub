"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  Star,
  Activity,
} from "lucide-react";
import { useAuth } from "@/src/context/AuthContext";
import { api } from "@/src/lib/api";
import type { Appointment, DoctorProfile, Review } from "@/src/types";

export default function DoctorDashboardPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctorProfile, setDoctorProfile] = useState<DoctorProfile | null>(
    null
  );
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (user?.role !== "doctor") {
      router.push("/dashboard");
      return;
    }

    loadDashboardData();
  }, [isAuthenticated, router, user]);

  const loadDashboardData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Find doctor profile for current user
      const doctorsResponse = await api.getDoctors({ limit: 100 });
      const myProfile = doctorsResponse.data.find(
        (doc) => doc.user._id === user.id
      );

      if (!myProfile) {
        setError("Doctor profile not found");
        setLoading(false);
        return;
      }

      setDoctorProfile(myProfile);

      // Load appointments for this doctor
      const appointmentsData = await api.getAppointmentsByDoctor(myProfile._id);
      setAppointments(appointmentsData);

      // Load reviews
      try {
        const reviewsData = await api.getReviewsForDoctor(myProfile._id);
        setReviews(reviewsData);
      } catch (err) {
        console.error("Failed to load reviews:", err);
      }
    } catch (err) {
      setError("Failed to load dashboard data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (
    appointmentId: string,
    newStatus: "confirmed" | "cancelled" | "completed"
  ) => {
    setUpdatingStatus(appointmentId);
    try {
      await api.setAppointmentStatus(appointmentId, newStatus);

      // Update local state
      setAppointments(
        appointments.map((apt) =>
          apt._id === appointmentId ? { ...apt, status: newStatus } : apt
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status");
      setTimeout(() => setError(""), 3000);
    } finally {
      setUpdatingStatus(null);
    }
  };

  // Calculate statistics
  const todayAppointments = appointments.filter((apt) => {
    const aptDate = new Date(apt.start);
    const today = new Date();
    return (
      aptDate.getDate() === today.getDate() &&
      aptDate.getMonth() === today.getMonth() &&
      aptDate.getFullYear() === today.getFullYear() &&
      apt.status !== "cancelled"
    );
  });

  const upcomingAppointments = appointments.filter(
    (apt) => apt.status !== "cancelled" && new Date(apt.start) > new Date()
  );

  const pendingAppointments = appointments.filter(
    (apt) => apt.status === "pending" && new Date(apt.start) > new Date()
  );

  const completedAppointments = appointments.filter(
    (apt) => apt.status === "completed"
  );

  const totalPatients = new Set(
    appointments.map((apt) =>
      typeof apt.patient === "object" ? apt.patient.id : apt.patient
    )
  ).size;

  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, review) => sum + review.rating, 0) /
          reviews.length
        ).toFixed(1)
      : "0.0";

  const stats = [
    {
      title: "Today's Appointments",
      value: todayAppointments.length,
      icon: Calendar,
      desc: "Scheduled for today",
      color: "bg-primary text-primary-content",
    },
    {
      title: "Pending Requests",
      value: pendingAppointments.length,
      icon: Clock,
      desc: "Awaiting confirmation",
      color: "bg-warning text-warning-content",
    },
    {
      title: "Total Patients",
      value: totalPatients,
      icon: Users,
      desc: "Unique patients",
      color: "bg-secondary text-secondary-content",
    },
    {
      title: "Average Rating",
      value: averageRating,
      icon: Star,
      desc: `${reviews.length} reviews`,
      color: "bg-accent text-accent-content",
    },
  ];

  const getStatusBadge = (status: string) => {
    const badges = {
      confirmed: "badge-success",
      pending: "badge-warning",
      cancelled: "badge-error",
      completed: "badge-info",
    };
    return badges[status as keyof typeof badges] || "badge-ghost";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="w-4 h-4" />;
      case "cancelled":
        return <XCircle className="w-4 h-4" />;
      case "pending":
        return <AlertCircle className="w-4 h-4" />;
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (error && !doctorProfile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="alert alert-error">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">
          Welcome, Dr. {user?.name}! 👨‍⚕️
        </h1>
        <p className="text-base-content/70 text-lg">
          Here is your practice overview for today.
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="alert alert-error mb-6">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.title} className={`card ${stat.color} shadow-xl`}>
            <div className="card-body">
              <div className="flex items-center justify-between">
                <stat.icon className="w-8 h-8" />
                <div className="text-right">
                  <p className="text-3xl font-bold">{stat.value}</p>
                  <p className="text-sm opacity-80">{stat.title}</p>
                </div>
              </div>
              <p className="text-sm opacity-70 mt-2">{stat.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="stats shadow">
          <div className="stat">
            <div className="stat-figure text-success">
              <CheckCircle className="w-8 h-8" />
            </div>
            <div className="stat-title">Completed</div>
            <div className="stat-value text-success">
              {completedAppointments.length}
            </div>
            <div className="stat-desc">All time consultations</div>
          </div>
        </div>

        <div className="stats shadow">
          <div className="stat">
            <div className="stat-figure text-info">
              <TrendingUp className="w-8 h-8" />
            </div>
            <div className="stat-title">Upcoming</div>
            <div className="stat-value text-info">
              {upcomingAppointments.length}
            </div>
            <div className="stat-desc">Scheduled appointments</div>
          </div>
        </div>

        <div className="stats shadow">
          <div className="stat">
            <div className="stat-figure text-warning">
              <Activity className="w-8 h-8" />
            </div>
            <div className="stat-title">This Month</div>
            <div className="stat-value text-warning">
              {
                appointments.filter((apt) => {
                  const aptDate = new Date(apt.start);
                  const now = new Date();
                  return (
                    aptDate.getMonth() === now.getMonth() &&
                    aptDate.getFullYear() === now.getFullYear()
                  );
                }).length
              }
            </div>
            <div className="stat-desc">Appointments this month</div>
          </div>
        </div>
      </div>

      {/* Pending Appointments Section */}
      {pendingAppointments.length > 0 && (
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
            <Clock className="w-8 h-8 text-warning" />
            Pending Appointments ({pendingAppointments.length})
          </h2>
          <div className="space-y-4">
            {pendingAppointments.slice(0, 5).map((appointment) => (
              <div
                key={appointment._id}
                className="card bg-base-100 shadow-xl border-l-4 border-warning"
              >
                <div className="card-body">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    {/* Patient Info */}
                    <div className="flex items-start gap-4 flex-1">
                      <div className="avatar placeholder">
                        <div className="bg-warning text-warning-content rounded-lg w-16 h-16">
                          <span className="text-2xl">
                            {typeof appointment.patient === "object"
                              ? appointment.patient.name.charAt(0)
                              : "P"}
                          </span>
                        </div>
                      </div>

                      <div className="flex-1">
                        <h3 className="text-xl font-bold">
                          {typeof appointment.patient === "object"
                            ? appointment.patient.name
                            : "Patient"}
                        </h3>
                        {typeof appointment.patient === "object" && (
                          <p className="text-sm text-base-content/70">
                            {appointment.patient.email}
                          </p>
                        )}

                        <div className="flex flex-wrap gap-4 mt-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4 text-primary" />
                            <span>
                              {new Date(appointment.start).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="w-4 h-4 text-primary" />
                            <span>
                              {new Date(appointment.start).toLocaleTimeString(
                                [],
                                { hour: "2-digit", minute: "2-digit" }
                              )}
                            </span>
                          </div>
                        </div>

                        {appointment.reason && (
                          <p className="text-sm text-base-content/70 mt-2">
                            <span className="font-semibold">Reason:</span>{" "}
                            {appointment.reason}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-row lg:flex-col gap-2">
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() =>
                          handleStatusUpdate(appointment._id, "confirmed")
                        }
                        disabled={updatingStatus === appointment._id}
                      >
                        {updatingStatus === appointment._id ? (
                          <span className="loading loading-spinner loading-xs"></span>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            Confirm
                          </>
                        )}
                      </button>
                      <button
                        className="btn btn-error btn-sm"
                        onClick={() =>
                          handleStatusUpdate(appointment._id, "cancelled")
                        }
                        disabled={updatingStatus === appointment._id}
                      >
                        {updatingStatus === appointment._id ? (
                          <span className="loading loading-spinner loading-xs"></span>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4" />
                            Decline
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Today's Appointments */}
      {todayAppointments.length > 0 && (
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
            <Calendar className="w-8 h-8 text-primary" />
            Today Schedule ({todayAppointments.length})
          </h2>
          <div className="space-y-4">
            {todayAppointments.map((appointment) => (
              <div
                key={appointment._id}
                className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow"
              >
                <div className="card-body">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    {/* Patient Info */}
                    <div className="flex items-start gap-4 flex-1">
                      <div className="avatar placeholder">
                        <div className="bg-primary text-primary-content rounded-lg w-16 h-16">
                          <span className="text-2xl">
                            {typeof appointment.patient === "object"
                              ? appointment.patient.name.charAt(0)
                              : "P"}
                          </span>
                        </div>
                      </div>

                      <div className="flex-1">
                        <h3 className="text-xl font-bold">
                          {typeof appointment.patient === "object"
                            ? appointment.patient.name
                            : "Patient"}
                        </h3>
                        {typeof appointment.patient === "object" && (
                          <p className="text-sm text-base-content/70">
                            {appointment.patient.email}
                          </p>
                        )}

                        <div className="flex flex-wrap gap-4 mt-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="w-4 h-4 text-primary" />
                            <span className="font-semibold">
                              {new Date(appointment.start).toLocaleTimeString(
                                [],
                                { hour: "2-digit", minute: "2-digit" }
                              )}
                            </span>
                          </div>
                          <div
                            className={`badge ${getStatusBadge(
                              appointment.status
                            )} gap-2`}
                          >
                            {getStatusIcon(appointment.status)}
                            {appointment.status.toUpperCase()}
                          </div>
                        </div>

                        {appointment.reason && (
                          <p className="text-sm text-base-content/70 mt-2">
                            <span className="font-semibold">Reason:</span>{" "}
                            {appointment.reason}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    {appointment.status === "confirmed" && (
                      <div className="flex flex-row lg:flex-col gap-2">
                        <button
                          className="btn btn-info btn-sm"
                          onClick={() =>
                            handleStatusUpdate(appointment._id, "completed")
                          }
                          disabled={updatingStatus === appointment._id}
                        >
                          {updatingStatus === appointment._id ? (
                            <span className="loading loading-spinner loading-xs"></span>
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4" />
                              Complete
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Appointments */}
      {upcomingAppointments.length > 0 && (
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
            <TrendingUp className="w-8 h-8 text-info" />
            Upcoming Appointments
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingAppointments
              .filter((apt) => !todayAppointments.includes(apt))
              .slice(0, 6)
              .map((appointment) => (
                <div
                  key={appointment._id}
                  className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow"
                >
                  <div className="card-body">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="avatar placeholder">
                        <div className="bg-info text-info-content rounded-full w-12">
                          <span className="text-xl">
                            {typeof appointment.patient === "object"
                              ? appointment.patient.name.charAt(0)
                              : "P"}
                          </span>
                        </div>
                      </div>
                      <div>
                        <h3 className="font-bold">
                          {typeof appointment.patient === "object"
                            ? appointment.patient.name
                            : "Patient"}
                        </h3>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span>
                          {new Date(appointment.start).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-primary" />
                        <span>
                          {new Date(appointment.start).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="card-actions justify-between items-center mt-4">
                      <div
                        className={`badge ${getStatusBadge(
                          appointment.status
                        )}`}
                      >
                        {appointment.status}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Recent Reviews */}
      {reviews.length > 0 && (
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
            <Star className="w-8 h-8 text-warning" />
            Recent Reviews
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.slice(0, 3).map((review) => (
              <div key={review._id} className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="avatar placeholder">
                      <div className="bg-accent text-accent-content rounded-full w-12">
                        <span className="text-xl">
                          {review.patient.name.charAt(0)}
                        </span>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-bold">{review.patient.name}</h4>
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < review.rating
                                ? "fill-warning text-warning"
                                : "text-base-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  {review.comment && (
                    <p className="text-sm text-base-content/70">
                      {review.comment}
                    </p>
                  )}
                  <p className="text-xs text-base-content/50 mt-2">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {appointments.length === 0 && (
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body items-center text-center py-16">
            <Calendar className="w-24 h-24 text-base-content/20 mb-4" />
            <h3 className="text-2xl font-bold mb-2">No Appointments Yet</h3>
            <p className="text-base-content/70 mb-6">
              Patients will be able to book appointments with you soon
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
