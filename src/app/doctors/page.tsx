"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Star,
  DollarSign,
  Briefcase,
  User,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { api } from "@/src/lib/api";
import type { DoctorProfile } from "@/src/types";
import Image from "next/image";

export default function DoctorsPage() {
  const router = useRouter();
  const [doctors, setDoctors] = useState<DoctorProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadDoctors();
  }, [currentPage, specialization]);

  const loadDoctors = async () => {
    setLoading(true);
    setError("");

    try {
      const params = {
        page: currentPage,
        limit: 12,
        q: "",
        specialization: "",
      };

      if (searchQuery) params.q = searchQuery;
      if (specialization) params.specialization = specialization;

      const response = await api.getDoctors(params);
      setDoctors(response.data);
      setTotalPages(
        Math.ceil(response.pagination.total / response.pagination.limit)
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load doctors");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadDoctors();
  };

  const specializations = [
    "Cardiology",
    "Dermatology",
    "Neurology",
    "Pediatrics",
    "Orthopedics",
    "Psychiatry",
    "General Practice",
    "Gynecology",
    "Ophthalmology",
    "ENT",
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-5xl font-bold mb-2">Find Doctors</h1>
        <p className="text-xl text-base-content/70">
          Browse and book appointments with qualified healthcare professionals
        </p>
      </div>

      {/* Search and Filters */}
      <div className="card bg-base-100 shadow-xl mb-8">
        <div className="card-body">
          <form onSubmit={handleSearch}>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Search Input */}
              <div className="md:col-span-6">
                <label className="input input-bordered flex items-center gap-2">
                  <Search className="w-5 h-5 opacity-70" />
                  <input
                    type="text"
                    className="grow"
                    placeholder="Search doctors by name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </label>
              </div>

              {/* Specialization Select */}
              <div className="md:col-span-4">
                <select
                  className="select select-bordered w-full"
                  value={specialization}
                  onChange={(e) => {
                    setSpecialization(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="">All Specializations</option>
                  {specializations.map((spec) => (
                    <option key={spec} value={spec}>
                      {spec}
                    </option>
                  ))}
                </select>
              </div>

              {/* Search Button */}
              <div className="md:col-span-2">
                <button
                  type="submit"
                  className={`btn btn-primary w-full ${
                    loading ? "loading" : ""
                  }`}
                  disabled={loading}
                >
                  {!loading && <Search className="w-5 h-5" />}
                  Search
                </button>
              </div>
            </div>

            {/* Clear Filters */}
            {(searchQuery || specialization) && (
              <div className="mt-4">
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => {
                    setSearchQuery("");
                    setSpecialization("");
                    setCurrentPage(1);
                  }}
                >
                  Clear Filters
                </button>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Error Alert */}
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

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-20">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      )}

      {/* Doctors Grid */}
      {!loading && doctors.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {doctors.map((doctor) => (
              <div
                key={doctor._id}
                className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all cursor-pointer"
                onClick={() => router.push(`/doctors/${doctor._id}`)}
              >
                <figure className="px-6 pt-6">
                  <div className="avatar placeholder">
                    <div className="bg-linear-to-br from-primary to-secondary text-primary-content rounded-xl w-32 h-32">
                      {doctor.img ? (
                        <Image
                          src={doctor.img}
                          alt={doctor.user.name}
                          className="rounded-xl"
                        />
                      ) : (
                        <span className="text-5xl">
                          {doctor.user.name.charAt(0)}
                        </span>
                      )}
                    </div>
                  </div>
                </figure>

                <div className="card-body">
                  <h2 className="card-title justify-center text-2xl">
                    Dr. {doctor.user.name}
                  </h2>

                  {doctor.specialization && (
                    <div className="badge badge-primary badge-outline w-full py-3">
                      <Briefcase className="w-4 h-4 mr-2" />
                      {doctor.specialization}
                    </div>
                  )}

                  <div className="space-y-2 my-2">
                    {doctor.experience !== undefined && (
                      <div className="flex items-center gap-2 text-sm">
                        <Star className="w-4 h-4 text-warning" />
                        <span>{doctor.experience} years experience</span>
                      </div>
                    )}

                    {doctor.fees !== undefined && (
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="w-4 h-4 text-success" />
                        <span>${doctor.fees} per visit</span>
                      </div>
                    )}
                  </div>

                  {doctor.bio && (
                    <p className="text-sm text-base-content/70 line-clamp-2">
                      {doctor.bio}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center">
              <div className="join">
                <button
                  className="join-item btn"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button className="join-item btn">
                  Page {currentPage} of {totalPages}
                </button>
                <button
                  className="join-item btn"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* No Results */}
      {!loading && doctors.length === 0 && (
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body items-center text-center py-20">
            <User className="w-24 h-24 text-base-content/20 mb-4" />
            <h3 className="text-3xl font-bold mb-2">No doctors found</h3>
            <p className="text-base-content/70 text-lg mb-6">
              Try adjusting your search criteria or browse all doctors
            </p>
            <button
              className="btn btn-primary"
              onClick={() => {
                setSearchQuery("");
                setSpecialization("");
                setCurrentPage(1);
                loadDoctors();
              }}
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
