"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { DoctorProfile, Review, Appointment } from "@/src/types";
import Image from "next/image";
import {
  Star,
  Calendar,
  DollarSign,
  Briefcase,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  Send,
} from "lucide-react";
import { useAuth } from "@/src/context/AuthContext";
import { api } from "@/src/lib/api";

export default function DoctorDetailPage() {
  const { id } = useParams();
  const [doctor, setDoctor] = useState<DoctorProfile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  // Review form state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [reviewData, setReviewData] = useState({
    rating: 5,
    comment: "",
  });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState("");

  const fetchReviews = async () => {
    try {
      setReviewsLoading(true);
      const reviewsData = await api.getReviewsForDoctor(id as string);
      setReviews(reviewsData);

      // Check if current user has already reviewed
      if (user) {
        const userReview = reviewsData.find((r) => r.patient._id === user.id);
        setHasReviewed(!!userReview);
      }
    } catch (err) {
      console.error("Failed to fetch reviews:", err);
    } finally {
      setReviewsLoading(false);
    }
  };

  const checkReviewEligibility = async () => {
    try {
      if (!user) return;

      // Fetch user's appointments
      const appointments = await api.getAppointmentsByPatient(user.id);

      // Check if user has a completed appointment with this doctor
      const hasCompletedAppointment = appointments.some(
        (apt: Appointment) =>
          apt.status === "completed" &&
          (typeof apt.doctor === "object"
            ? apt.doctor._id === id
            : apt.doctor === id)
      );

      setCanReview(hasCompletedAppointment && !hasReviewed);
    } catch (err) {
      console.error("Failed to check review eligibility:", err);
    }
  };

  useEffect(() => {
    if (!id) return;

    async function fetchData() {
      try {
        // Fetch doctor details
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE}/doctors/${id}`
        );
        const data = await res.json();

        if (!res.ok) {
          setError(data.message || "Something went wrong");
          return;
        }

        setDoctor(data.data);

        // Fetch reviews
        await fetchReviews();

        // Check if user can review (has completed appointment)
        if (isAuthenticated && user) {
          await checkReviewEligibility();
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        setError("Failed to fetch doctor details");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isAuthenticated, user]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewError("");
    setReviewSuccess("");
    setReviewSubmitting(true);

    try {
      await api.createReview({
        doctorId: id as string,
        rating: reviewData.rating,
        comment: reviewData.comment,
      });

      setReviewSuccess("Review submitted successfully!");
      setReviewData({ rating: 5, comment: "" });
      setShowReviewForm(false);
      setHasReviewed(true);
      setCanReview(false);

      // Refresh reviews
      await fetchReviews();

      setTimeout(() => setReviewSuccess(""), 3000);
    } catch (err) {
      setReviewError(
        err instanceof Error ? err.message : "Failed to submit review"
      );
    } finally {
      setReviewSubmitting(false);
    }
  };

  const renderStars = (
    rating: number,
    interactive = false,
    size = "w-5 h-5"
  ) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${size} ${
              star <= rating ? "fill-warning text-warning" : "text-base-300"
            } ${
              interactive
                ? "cursor-pointer hover:scale-110 transition-transform"
                : ""
            }`}
            onClick={
              interactive
                ? () => setReviewData({ ...reviewData, rating: star })
                : undefined
            }
          />
        ))}
      </div>
    );
  };

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((review) => {
      distribution[review.rating as keyof typeof distribution]++;
    });
    return distribution;
  };

  function goToBooking() {
    router.push(`/appointments/book?doctorId=${doctor?._id}`);
  }

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );

  if (error)
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="alert alert-error">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      </div>
    );

  if (!doctor) return null;

  const avgRating = calculateAverageRating();
  const ratingDist = getRatingDistribution();

  return (
    <div className="container mx-auto px-4 py-10 max-w-6xl">
      {/* Success Alert */}
      {reviewSuccess && (
        <div className="alert alert-success mb-6">
          <CheckCircle className="w-5 h-5" />
          <span>{reviewSuccess}</span>
        </div>
      )}

      {/* Doctor Profile Card */}
      <div className="card bg-base-100 shadow-xl mb-8">
        <div className="card-body">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Doctor Image */}
            <div className="shrink-0">
              <div className="avatar placeholder">
                <div className="bg-linear-to-br from-primary to-secondary text-primary-content rounded-xl w-32 h-32">
                  {doctor.img ? (
                    <Image
                      src={doctor.img}
                      alt={doctor.user.name}
                      width={128}
                      height={128}
                      className="rounded-xl"
                    />
                  ) : (
                    <span className="text-5xl">
                      {doctor.user.name.charAt(0)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Doctor Info */}
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-2">
                Dr. {doctor.user.name}
              </h1>
              <p className="text-base-content/70 mb-3">{doctor.user.email}</p>

              {doctor.specialization && (
                <div className="badge badge-primary badge-lg mb-4">
                  <Briefcase className="w-4 h-4 mr-2" />
                  {doctor.specialization}
                </div>
              )}

              {/* Rating Summary */}
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  {renderStars(Math.round(parseFloat(avgRating.toString())))}
                  <span className="text-2xl font-bold">{avgRating}</span>
                  <span className="text-base-content/60">
                    ({reviews.length}{" "}
                    {reviews.length === 1 ? "review" : "reviews"})
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                {doctor.fees !== undefined && (
                  <div className="flex items-center gap-2">
                    {/*  <DollarSign className="w-5 h-5 text-success" /> */}
                    <span className="font-semibold">Consultation Fee:</span>
                    <span>₹ {doctor.fees}</span>
                  </div>
                )}

                {doctor.experience !== undefined && (
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-info" />
                    <span className="font-semibold">Experience:</span>
                    <span>{doctor.experience} years</span>
                  </div>
                )}
              </div>

              {doctor.bio && (
                <div className="mb-4">
                  <h3 className="font-semibold mb-2">About Doctor:</h3>
                  <p className="text-base-content/80">{doctor.bio}</p>
                </div>
              )}

              <div className="flex items-center gap-2">
                <span className="font-semibold">Status:</span>
                <span
                  className={`badge ${
                    doctor.active ? "badge-success" : "badge-error"
                  }`}
                >
                  {doctor.active ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>

          {/* Book Appointment Button */}
          <div className="card-actions justify-end mt-6">
            <button onClick={goToBooking} className="btn btn-primary btn-lg">
              <Calendar className="w-5 h-5" />
              Book Appointment
            </button>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Rating Overview */}
        <div className="lg:col-span-1">
          <div className="card bg-base-100 shadow-xl sticky top-24">
            <div className="card-body">
              <h2 className="card-title text-2xl mb-4">Rating Overview</h2>

              <div className="text-center mb-6">
                <div className="text-5xl font-bold mb-2">{avgRating}</div>
                <div className="flex justify-center mb-2">
                  {renderStars(
                    Math.round(parseFloat(avgRating.toString())),
                    false,
                    "w-6 h-6"
                  )}
                </div>
                <p className="text-base-content/60">
                  Based on {reviews.length} reviews
                </p>
              </div>

              {/* Rating Distribution */}
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((star) => (
                  <div key={star} className="flex items-center gap-2">
                    <span className="text-sm w-8">{star} ★</span>
                    <progress
                      className="progress progress-warning w-full"
                      value={ratingDist[star as keyof typeof ratingDist]}
                      max={reviews.length || 1}
                    ></progress>
                    <span className="text-sm w-8 text-right">
                      {ratingDist[star as keyof typeof ratingDist]}
                    </span>
                  </div>
                ))}
              </div>

              {/* Write Review Button */}
              {isAuthenticated && canReview && !showReviewForm && (
                <button
                  className="btn btn-primary btn-block mt-6"
                  onClick={() => setShowReviewForm(true)}
                >
                  <MessageSquare className="w-5 h-5" />
                  Write a Review
                </button>
              )}

              {!isAuthenticated && (
                <div className="alert alert-info mt-6">
                  <AlertCircle className="w-5 h-5" />
                  <span className="text-sm">Login to write a review</span>
                </div>
              )}

              {isAuthenticated && !canReview && hasReviewed && (
                <div className="alert alert-success mt-6">
                  <CheckCircle className="w-5 h-5" />
                  <span className="text-sm">You have already reviewed</span>
                </div>
              )}

              {isAuthenticated && !canReview && !hasReviewed && (
                <div className="alert alert-warning mt-6">
                  <AlertCircle className="w-5 h-5" />
                  <span className="text-sm">
                    Complete an appointment to review
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Reviews List */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-3xl font-bold">Patient Reviews</h2>

          {/* Review Form */}
          {showReviewForm && (
            <div className="card bg-base-100 shadow-xl border-2 border-primary">
              <div className="card-body">
                <h3 className="card-title text-xl mb-4">Write Your Review</h3>

                {reviewError && (
                  <div className="alert alert-error mb-4">
                    <AlertCircle className="w-5 h-5" />
                    <span>{reviewError}</span>
                  </div>
                )}

                <form onSubmit={handleSubmitReview} className="space-y-4">
                  {/* Rating */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">
                        Your Rating
                      </span>
                    </label>
                    {renderStars(reviewData.rating, true, "w-8 h-8")}
                  </div>

                  {/* Comment */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">
                        Your Review (Optional)
                      </span>
                    </label>
                    <textarea
                      className="textarea textarea-bordered h-24"
                      placeholder="Share your experience with this doctor..."
                      value={reviewData.comment}
                      onChange={(e) =>
                        setReviewData({
                          ...reviewData,
                          comment: e.target.value,
                        })
                      }
                    />
                  </div>

                  {/* Buttons */}
                  <div className="card-actions justify-end">
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() => {
                        setShowReviewForm(false);
                        setReviewData({ rating: 5, comment: "" });
                        setReviewError("");
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className={`btn btn-primary ${
                        reviewSubmitting ? "loading" : ""
                      }`}
                      disabled={reviewSubmitting}
                    >
                      {!reviewSubmitting && <Send className="w-5 h-5" />}
                      {reviewSubmitting ? "Submitting..." : "Submit Review"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Reviews List */}
          {reviewsLoading ? (
            <div className="flex justify-center py-10">
              <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
          ) : reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review._id} className="card bg-base-100 shadow-xl">
                  <div className="card-body">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="avatar placeholder">
                          <div className="bg-primary text-primary-content rounded-full w-12">
                            <span className="text-xl">
                              {review.patient.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-bold">{review.patient.name}</h4>
                          <p className="text-sm text-base-content/60">
                            {new Date(review.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )}
                          </p>
                        </div>
                      </div>
                      {renderStars(review.rating)}
                    </div>

                    {review.comment && (
                      <p className="mt-3 text-base-content/80">
                        {review.comment}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body items-center text-center py-16">
                <MessageSquare className="w-16 h-16 text-base-content/20 mb-4" />
                <h3 className="text-2xl font-bold mb-2">No Reviews Yet</h3>
                <p className="text-base-content/70 mb-6">
                  Be the first to review this doctor
                </p>
                {isAuthenticated && canReview && (
                  <button
                    className="btn btn-primary"
                    onClick={() => setShowReviewForm(true)}
                  >
                    Write First Review
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
