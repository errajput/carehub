"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";
import {
  ApiError,
  AvailabilitySlot,
  BookAppointmentData,
  DoctorProfile,
} from "@/src/types";

export default function BookAppointmentPage() {
  const router = useRouter();

  const [doctors, setDoctors] = useState<DoctorProfile[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);

  const [selectedDoctor, setSelectedDoctor] = useState<string>("");
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(
    null
  );
  const [reason, setReason] = useState("");

  const [booking, setBooking] = useState(false);
  const [error, setError] = useState<string>("");

  // =====================  FETCH DOCTORS  =====================
  useEffect(() => {
    async function fetchDoctors() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/doctors`);
        const data = await res.json();
        setDoctors(data.data || []);
      } catch (err) {
        console.error("Failed to fetch doctors", err);
      }
      setLoadingDoctors(false);
    }
    fetchDoctors();
  }, []);

  // =====================  FETCH SLOTS  =====================
  useEffect(() => {
    if (!selectedDoctor) return;

    async function fetchSlots() {
      setLoadingSlots(true);
      setSlots([]);
      setSelectedSlot(null);

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE}/availability/doctor/${selectedDoctor}`
        );

        const data = await res.json();
        setSlots(data.data || []);
      } catch (err) {
        console.error("Failed to fetch slots", err);
      }
      setLoadingSlots(false);
    }

    fetchSlots();
  }, [selectedDoctor]);

  // =====================  BOOK APPOINTMENT  =====================
  async function handleSubmit() {
    if (!selectedDoctor || !selectedSlot) {
      setError("Please select a doctor and a time slot.");
      return;
    }

    setBooking(true);
    setError("");

    const payload: BookAppointmentData = {
      doctorId: selectedDoctor,
      start: selectedSlot.start,
      end: selectedSlot.end,
      reason,
    };

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE}/appointments/book`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const errorData: ApiError = await res.json();
        setError(errorData.message || "Booking failed.");
        setBooking(false);
        return;
      }

      router.push("/appointments?status=success");
    } catch (err) {
      setError("Something went wrong.");
      console.error(err);
    }

    setBooking(false);
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-4">Book Appointment</h1>

      {/* Doctor selection */}
      <div className="form-control w-full">
        <label className="label">
          <span className="font-medium">Select Doctor</span>
        </label>

        {loadingDoctors ? (
          <div className="loading loading-spinner"></div>
        ) : (
          <select
            className="select select-bordered"
            value={selectedDoctor}
            onChange={(e) => setSelectedDoctor(e.target.value)}
          >
            <option value="">Choose a doctor</option>

            {doctors.map((doc) => (
              <option key={doc._id} value={doc._id}>
                {doc.user.name} — {doc.specialization || "General"}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Time slots */}
      {selectedDoctor && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Available Slots</h2>

          {loadingSlots ? (
            <div className="loading loading-spinner"></div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {slots.length === 0 && (
                <p className="text-gray-500 col-span-full">
                  No available slots.
                </p>
              )}

              {slots.map((slot) => (
                <button
                  key={slot._id}
                  onClick={() => setSelectedSlot(slot)}
                  className={`btn btn-sm ${
                    selectedSlot?._id === slot._id
                      ? "btn-primary"
                      : "btn-outline"
                  }`}
                >
                  {new Date(slot.start).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  —
                  {new Date(slot.end).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Reason */}
      <div className="form-control">
        <label className="label">
          <span className="font-medium">Reason (Optional)</span>
        </label>
        <textarea
          className="textarea textarea-bordered"
          rows={3}
          placeholder="Describe your symptoms or reason..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </div>

      {/* Error */}
      {error && <p className="text-red-500">{error}</p>}

      {/* Submit */}
      <button
        onClick={handleSubmit}
        className="btn btn-primary btn-block"
        disabled={booking}
      >
        {booking ? (
          <span className="loading loading-spinner"></span>
        ) : (
          "Book Appointment"
        )}
      </button>
    </div>
  );
}
