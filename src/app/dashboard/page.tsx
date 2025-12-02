"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  User,
  Star,
  Activity,
  ArrowRight,
  Clock,
} from "lucide-react";
import { useAuth } from "@/src/context/AuthContext";
import { api } from "@/src/lib/api";
import type { Appointment } from "@/src/types";

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    loadAppointments();
  }, [isAuthenticated, router, user]);

  const loadAppointments = async () => {
    if (!user) return;

    try {
      const data = await api.getAppointmentsByPatient(user.id);
      setAppointments(data);
    } catch (error) {
      console.error("Failed to load appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  const upcomingAppointments = appointments.filter(
    (apt) => apt.status !== "cancelled" && new Date(apt.start) > new Date()
  );

  const stats = [
    {
      title: "Total Appointments",
      value: appointments.length,
      icon: Calendar,
      desc: "All time bookings",
      color: "bg-primary text-primary-content",
    },
    {
      title: "Upcoming",
      value: upcomingAppointments.length,
      icon: Activity,
      desc: "Scheduled visits",
      color: "bg-secondary text-secondary-content",
    },
    {
      title: "Completed",
      value: appointments.filter((a) => a.status === "completed").length,
      icon: Star,
      desc: "Successful consultations",
      color: "bg-accent text-accent-content",
    },
    {
      title: "Pending",
      value: appointments.filter((a) => a.status === "pending").length,
      icon: Clock,
      desc: "Awaiting confirmation",
      color: "bg-warning text-warning-content",
    },
  ];

  const quickActions = [
    {
      title: "Find Doctors",
      description: "Browse and book appointments with doctors",
      icon: User,
      href: "/doctors",
      color: "btn-primary",
    },
    {
      title: "My Appointments",
      description: "View and manage your bookings",
      icon: Calendar,
      href: "/appointments",
      color: "btn-secondary",
    },
    {
      title: "Profile Settings",
      description: "Update your personal information",
      icon: User,
      href: "/profile",
      color: "btn-accent",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">
          Welcome back, {user?.name}! 👋
        </h1>
        <p className="text-base-content/70 text-lg">
          Here&apos;s what&apos;s happening with your health journey today.
        </p>
      </div>

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

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickActions.map((action) => (
            <div
              key={action.title}
              className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow"
            >
              <div className="card-body">
                <div
                  className={`badge badge-lg ${action.color.replace(
                    "btn-",
                    "badge-"
                  )} p-4`}
                >
                  <action.icon className="w-6 h-6" />
                </div>
                <h3 className="card-title text-xl mt-2">{action.title}</h3>
                <p className="text-base-content/70">{action.description}</p>
                <div className="card-actions justify-end mt-4">
                  <button
                    onClick={() => router.push(action.href)}
                    className={`btn ${action.color} btn-sm`}
                  >
                    Go <ArrowRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Appointments */}
      {upcomingAppointments.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold">Upcoming Appointments</h2>
            <button
              onClick={() => router.push("/appointments")}
              className="btn btn-ghost btn-sm"
            >
              View All <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingAppointments.slice(0, 3).map((appointment) => (
              <div
                key={appointment._id}
                className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow cursor-pointer"
                onClick={() => router.push("/appointments")}
              >
                <div className="card-body">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="avatar placeholder">
                      <div className="bg-primary text-primary-content rounded-full w-12">
                        <span className="text-xl">
                          {typeof appointment.doctor === "object"
                            ? appointment.doctor.user.name.charAt(0)
                            : "D"}
                        </span>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-bold">
                        {typeof appointment.doctor === "object"
                          ? `Dr. ${appointment.doctor.user.name}`
                          : "Doctor"}
                      </h3>
                      {typeof appointment.doctor === "object" &&
                        appointment.doctor.specialization && (
                          <p className="text-sm text-base-content/60">
                            {appointment.doctor.specialization}
                          </p>
                        )}
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
                      className={`badge ${
                        appointment.status === "confirmed"
                          ? "badge-success"
                          : appointment.status === "pending"
                          ? "badge-warning"
                          : "badge-ghost"
                      }`}
                    >
                      {appointment.status}
                    </div>
                    <button className="btn btn-primary btn-xs">
                      View Details
                    </button>
                  </div>
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
              Start your healthcare journey by booking your first appointment
            </p>
            <button
              onClick={() => router.push("/doctors")}
              className="btn btn-primary"
            >
              Find Doctors
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
