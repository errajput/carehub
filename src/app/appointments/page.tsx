"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  XCircle,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "@/src/context/AuthContext";
import { api } from "@/src/lib/api";
import type { Appointment } from "@/src/types";

type Filter = "all" | "upcoming" | "past" | "cancelled";

export default function AppointmentsPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    loadAppointments();
  }, [isAuthenticated, router, user]);

  const loadAppointments = async () => {
    if (!user) return;

    setLoading(true);
    setError("");

    try {
      const data = await api.getAppointmentsByPatient(user.id);
      setAppointments(
        data.sort(
          (a, b) => new Date(b.start).getTime() - new Date(a.start).getTime()
        )
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load appointments"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (id: string) => {
    const modal = document.getElementById("cancel_modal") as HTMLDialogElement;
    modal?.showModal();

    const confirmBtn = document.getElementById("confirm_cancel");
    if (confirmBtn) {
      confirmBtn.onclick = async () => {
        try {
          await api.cancelAppointment(id);
          setSuccess("Appointment cancelled successfully");
          setTimeout(() => setSuccess(""), 3000);
          loadAppointments();
          modal?.close();
        } catch (err) {
          setError(
            err instanceof Error ? err.message : "Failed to cancel appointment"
          );
          setTimeout(() => setError(""), 3000);
        }
      };
    }
  };

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
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const filterAppointments = (appointments: Appointment[]) => {
    const now = new Date();

    switch (filter) {
      case "upcoming":
        return appointments.filter(
          (apt) => apt.status !== "cancelled" && new Date(apt.start) > now
        );
      case "past":
        return appointments.filter(
          (apt) => apt.status !== "cancelled" && new Date(apt.start) <= now
        );
      case "cancelled":
        return appointments.filter((apt) => apt.status === "cancelled");
      default:
        return appointments;
    }
  };

  const filteredAppointments = filterAppointments(appointments);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-5xl font-bold mb-2">My Appointments</h1>
          <p className="text-xl text-base-content/70">
            View and manage your medical appointments
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => router.push("/doctors")}
        >
          <Calendar className="w-5 h-5" />
          Book New Appointment
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="alert alert-error mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="stroke-current shrink-0 h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="alert alert-success mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="stroke-current shrink-0 h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{success}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="tabs tabs-boxed mb-6 bg-base-100 shadow-md">
        {[
          { key: "all", label: "All", count: appointments.length },
          {
            key: "upcoming",
            label: "Upcoming",
            count: filterAppointments(appointments).length,
          },
          {
            key: "past",
            label: "Past",
            count: appointments.filter(
              (a) => new Date(a.start) <= new Date() && a.status !== "cancelled"
            ).length,
          },
          {
            key: "cancelled",
            label: "Cancelled",
            count: appointments.filter((a) => a.status === "cancelled").length,
          },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key as Filter)}
            className={`tab ${filter === tab.key ? "tab-active" : ""}`}
          >
            {tab.label}
            <div className="badge badge-sm ml-2">{tab.count}</div>
          </button>
        ))}
      </div>

      {/* Appointments List */}
      {filteredAppointments.length > 0 ? (
        <div className="space-y-4">
          {filteredAppointments.map((appointment) => (
            <div
              key={appointment._id}
              className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow"
            >
              <div className="card-body">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  {/* Doctor Info */}
                  <div className="flex items-start gap-4 flex-1">
                    <div className="avatar placeholder">
                      <div className="bg-primary text-primary-content rounded-lg w-20 h-20">
                        <span className="text-3xl">
                          {typeof appointment.doctor === "object"
                            ? appointment.doctor.user.name.charAt(0)
                            : "D"}
                        </span>
                      </div>
                    </div>

                    <div className="flex-1">
                      <h3 className="text-2xl font-bold">
                        {typeof appointment.doctor === "object"
                          ? `Dr. ${appointment.doctor.user.name}`
                          : "Doctor"}
                      </h3>

                      {typeof appointment.doctor === "object" &&
                        appointment.doctor.specialization && (
                          <div className="badge badge-primary badge-outline mt-1">
                            {appointment.doctor.specialization}
                          </div>
                        )}

                      <div className="flex flex-wrap gap-4 mt-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-5 h-5 text-primary" />
                          <span className="font-medium">
                            {new Date(appointment.start).toLocaleDateString(
                              "en-US",
                              {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-5 h-5 text-primary" />
                          <span className="font-medium">
                            {new Date(appointment.start).toLocaleTimeString(
                              [],
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
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

                      <div className="mt-3">
                        <div
                          className={`badge ${getStatusBadge(
                            appointment.status
                          )} gap-2`}
                        >
                          {getStatusIcon(appointment.status)}
                          {appointment.status.toUpperCase()}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 lg:items-end">
                    {appointment.status !== "cancelled" &&
                      appointment.status !== "completed" && (
                        <button
                          className="btn btn-error btn-sm"
                          onClick={() =>
                            handleCancelAppointment(appointment._id)
                          }
                        >
                          <XCircle className="w-4 h-4" />
                          Cancel
                        </button>
                      )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body items-center text-center py-20">
            <Calendar className="w-32 h-32 text-base-content/20 mb-4" />
            <h3 className="text-3xl font-bold mb-2">No appointments found</h3>
            <p className="text-xl text-base-content/70 mb-6">
              {filter === "all"
                ? "You haven't booked any appointments yet"
                : `You don't have any ${filter} appointments`}
            </p>
            <button
              className="btn btn-primary btn-wide"
              onClick={() => router.push("/doctors")}
            >
              Book Your First Appointment
            </button>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      <dialog id="cancel_modal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Cancel Appointment</h3>
          <p className="py-4">
            Are you sure you want to cancel this appointment? This action cannot
            be undone.
          </p>
          <div className="modal-action">
            <form method="dialog">
              <button className="btn btn-ghost mr-2">No, Keep It</button>
              <button id="confirm_cancel" className="btn btn-error">
                Yes, Cancel It
              </button>
            </form>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </div>
  );
}
