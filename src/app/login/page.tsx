"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Calendar, Mail, Lock } from "lucide-react";
import { useAuth } from "@/src/context/AuthContext";
import type { LoginCredentials } from "@/src/types";

export default function LoginPage() {
  const { login } = useAuth();
  const [formData, setFormData] = useState<LoginCredentials>({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen hero bg-linear-to-br from-primary/10 to-secondary/10">
      <div className="hero-content flex-col lg:flex-row-reverse w-full max-w-6xl gap-12">
        {/* Right Side - Form */}
        <div className="card shrink-0 w-full max-w-md shadow-2xl bg-base-100">
          <div className="card-body">
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center">
                <Calendar className="w-10 h-10 text-primary-content" />
              </div>
            </div>

            <h2 className="text-3xl font-bold text-center mb-2">
              Welcome Back!
            </h2>
            <p className="text-center text-base-content/60 mb-6">
              Sign in to your CareHub account
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

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
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
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </label>
                <label className="label">
                  <a href="#" className="label-text-alt link link-hover">
                    Forgot password?
                  </a>
                </label>
              </div>

              {/* Submit Button */}
              <div className="form-control mt-6">
                <button
                  type="submit"
                  className={`btn btn-primary ${loading ? "loading" : ""}`}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="loading loading-spinner"></span>
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </button>
              </div>
            </form>

            {/* Register Link */}
            <div className="divider">OR</div>
            <p className="text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="link link-primary font-semibold"
              >
                Register here
              </Link>
            </p>

            {/* Demo Credentials */}
            <div className="alert alert-info mt-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="stroke-current shrink-0 w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              <div className="text-xs">
                <p className="font-bold">Demo Credentials:</p>
                <p>Patient: patient@test.com / password123</p>
                <p>Doctor: doctor@test.com / password123</p>
              </div>
            </div>
          </div>
        </div>

        {/* Left Side - Info */}
        <div className="text-center lg:text-left">
          <h1 className="text-5xl font-bold mb-6">Sign in to CareHub</h1>
          <p className="text-xl mb-8 text-base-content/80">
            Access your healthcare dashboard, manage appointments, and connect
            with top doctors.
          </p>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="badge badge-primary badge-lg p-4">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Easy Scheduling</h3>
                <p className="text-base-content/70">
                  Book appointments in seconds
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="badge badge-secondary badge-lg p-4">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Secure & Private</h3>
                <p className="text-base-content/70">Your data is protected</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
