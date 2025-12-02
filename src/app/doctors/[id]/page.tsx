"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { DoctorProfile } from "@/src/types";
import Image from "next/image";

export default function DoctorDetailPage() {
  const { id } = useParams();
  const [doctor, setDoctor] = useState<DoctorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (!id) return;

    async function fetchDoctor() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE}/doctors/${id}`
        );
        const data = await res.json();

        if (!res.ok) {
          setError(data.message || "Something went wrong");
          return;
        }

        setDoctor(data.data);
      } catch (err) {
        setError("Failed to fetch doctor details");
      } finally {
        setLoading(false);
      }
    }

    fetchDoctor();
  }, [id]);

  function goToBooking() {
    router.push(`/appointments/book?doctorId=${doctor?._id}`);
  }

  if (loading)
    return <div className="flex justify-center py-10">Loading...</div>;

  if (error)
    return (
      <div className="alert alert-error mt-5 w-fit mx-auto">
        <span>{error}</span>
      </div>
    );

  if (!doctor) return null;

  return (
    <div className="max-w-3xl mx-auto py-10">
      <div className="card bg-base-100 shadow-xl p-6">
        <div className="flex gap-6">
          <figure className="px-4 pt-4">
            <div className="avatar placeholder">
              <div className="bg-linear-to-br from-primary to-secondary text-primary-content rounded-xl w-22 h-22">
                {doctor.img ? (
                  <Image
                    src={doctor.img}
                    alt={doctor.user.name}
                    className="rounded-xl"
                  />
                ) : (
                  <span className="text-5xl">{doctor.user.name.charAt(0)}</span>
                )}
              </div>
            </div>
          </figure>

          <div>
            <h2 className="text-2xl font-bold">{doctor.user.name}</h2>
            <p className="text-sm opacity-80">{doctor.user.email}</p>

            {doctor.specialization && (
              <p className="badge badge-primary mt-2">
                {doctor.specialization}
              </p>
            )}
          </div>
        </div>

        <div className="divider"></div>

        <div className="space-y-3">
          {doctor.fees !== undefined && (
            <p>
              <span className="font-semibold">Consultation Fee:</span> ₹
              {doctor.fees}
            </p>
          )}

          {doctor.experience !== undefined && (
            <p>
              <span className="font-semibold">Experience:</span>{" "}
              {doctor.experience} yrs
            </p>
          )}

          {doctor.bio && (
            <p>
              <span className="font-semibold">About Doctor:</span> {doctor.bio}
            </p>
          )}

          <p>
            <span className="font-semibold">Status:</span>{" "}
            <span className={doctor.active ? "text-green-600" : "text-red-600"}>
              {doctor.active ? "Active" : "Inactive"}
            </span>
          </p>

          <p className="text-xs opacity-70">
            Joined: {new Date(doctor.createdAt).toLocaleDateString()}
          </p>
        </div>

        <div className="mt-6">
          <button onClick={goToBooking} className="btn btn-primary w-full">
            Book Appointment
          </button>
        </div>
      </div>
    </div>
  );
}
