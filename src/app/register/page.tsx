"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Calendar, Mail, Lock, User as UserIcon } from "lucide-react";
import { useAuth } from "@/src/context/AuthContext";
import type { RegisterData } from "@/src/types";

export default function RegisterPage() {
  const { register } = useAuth();
  const [formData, setFormData] = useState<RegisterData>({
    name: "",
    email: "",
    password: "",
    role: "patient",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await register(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen hero bg-linear-to-br from-secondary/10 to-accent/10">
      <div className="hero-content flex-col lg:flex-row w-full max-w-6xl gap-12">
        {/* Left Side - Info */}
        <div className="text-center lg:text-left">
          <h1 className="text-5xl font-bold mb-6">Join CareHub Today</h1>
          <p className="text-xl mb-8 text-base-content/80">
            Create your account and start managing your healthcare appointments
            with ease.
          </p>
          <div className="stats stats-vertical shadow">
            <div className="stat">
              <div className="stat-title">Active Users</div>
              <div className="stat-value text-primary">8.5K+</div>
              <div className="stat-desc">Happy patients worldwide</div>
            </div>

            <div className="stat">
              <div className="stat-title">Doctors</div>
              <div className="stat-value text-secondary">500+</div>
              <div className="stat-desc">Specialized professionals</div>
            </div>

            <div className="stat">
              <div className="stat-title">Appointments</div>
              <div className="stat-value text-accent">10K+</div>
              <div className="stat-desc">Successfully completed</div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="card shrink-0 w-full max-w-md shadow-2xl bg-base-100">
          <div className="card-body">
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center">
                <Calendar className="w-10 h-10 text-secondary-content" />
              </div>
            </div>

            <h2 className="text-3xl font-bold text-center mb-2">
              Create Account
            </h2>
            <p className="text-center text-base-content/60 mb-6">
              Get started with CareHub
            </p>

            {/* Error Alert */}
            {error && (
              <div className="alert alert-error mb-4">
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

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Full Name</span>
                </label>
                <label className="input input-bordered flex items-center gap-2">
                  <UserIcon className="w-4 h-4 opacity-70" />
                  <input
                    type="text"
                    name="name"
                    className="grow"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </label>
              </div>

              {/* Email */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Email</span>
                </label>
                <label className="input input-bordered flex items-center gap-2">
                  <Mail className="w-4 h-4 opacity-70" />
                  <input
                    type="email"
                    name="email"
                    className="grow"
                    placeholder="your.email@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </label>
              </div>

              {/* Password */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Password</span>
                </label>
                <label className="input input-bordered flex items-center gap-2">
                  <Lock className="w-4 h-4 opacity-70" />
                  <input
                    type="password"
                    name="password"
                    className="grow"
                    placeholder="At least 6 characters"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                  />
                </label>
              </div>

              {/* Role */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Register as</span>
                </label>
                <select
                  name="role"
                  className="select select-bordered w-full"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="patient">Patient</option>
                  <option value="doctor">Doctor</option>
                </select>
              </div>

              {/* Terms */}
              <div className="form-control">
                <label className="label cursor-pointer justify-start gap-2">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-primary"
                    required
                  />
                  <span className="label-text">
                    I agree to the{" "}
                    <a href="#" className="link link-primary">
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a href="#" className="link link-primary">
                      Privacy Policy
                    </a>
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <div className="form-control mt-6">
                <button
                  type="submit"
                  className={`btn btn-secondary ${loading ? "loading" : ""}`}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="loading loading-spinner"></span>
                      Creating account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </button>
              </div>
            </form>

            {/* Login Link */}
            <div className="divider">OR</div>
            <p className="text-center text-sm">
              Already have an account?{" "}
              <Link href="/login" className="link link-secondary font-semibold">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
