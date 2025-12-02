"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/src/context/AuthContext";
import { Calendar, Users, Star, Clock, Shield, Heart } from "lucide-react";

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  const features = [
    {
      icon: Calendar,
      title: "Easy Booking",
      description: "Schedule appointments with just a few clicks",
      color: "text-primary",
    },
    {
      icon: Users,
      title: "Find Doctors",
      description: "Browse and search for specialized doctors",
      color: "text-secondary",
    },
    {
      icon: Star,
      title: "Reviews & Ratings",
      description: "Read reviews from other patients",
      color: "text-accent",
    },
    {
      icon: Clock,
      title: "Real-time Updates",
      description: "Get instant confirmation and reminders",
      color: "text-info",
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your health data is safe with us",
      color: "text-success",
    },
    {
      icon: Heart,
      title: "24/7 Support",
      description: "We are here to help anytime",
      color: "text-error",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="hero min-h-[80vh] bg-linear-to-br from-primary to-secondary">
        <div className="hero-content text-center text-neutral-content">
          <div className="max-w-4xl">
            <Calendar className="w-24 h-24 mx-auto mb-6 opacity-90" />
            <h1 className="mb-5 text-6xl font-bold">
              Your Health, Our Priority
            </h1>
            <p className="mb-8 text-xl opacity-90">
              Book appointments with top doctors in your area. Manage your
              healthcare journey with ease.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href="/register" className="btn btn-wide btn-accent btn-lg">
                Get Started
              </Link>
              <Link
                href="/doctors"
                className="btn btn-wide btn-outline btn-lg text-white border-white hover:bg-white hover:text-primary"
              >
                Find Doctors
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-base-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-4">Why Choose CareHub?</h2>
            <p className="text-xl text-base-content/70">
              We provide the best healthcare appointment management experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="card bg-base-200 shadow-xl hover:shadow-2xl transition-shadow"
              >
                <div className="card-body items-center text-center">
                  <div
                    className={`p-4 rounded-full bg-base-100 ${feature.color}`}
                  >
                    <feature.icon className="w-12 h-12" />
                  </div>
                  <h3 className="card-title text-2xl">{feature.title}</h3>
                  <p className="text-base-content/70">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="stats stats-vertical lg:stats-horizontal shadow w-full bg-primary text-primary-content">
        <div className="stat place-items-center">
          <div className="stat-title text-primary-content/80">
            Total Doctors
          </div>
          <div className="stat-value">500+</div>
          <div className="stat-desc text-primary-content/70">
            Specialized healthcare professionals
          </div>
        </div>

        <div className="stat place-items-center">
          <div className="stat-title text-primary-content/80">
            Appointments Booked
          </div>
          <div className="stat-value text-secondary">10,000+</div>
          <div className="stat-desc text-primary-content/70">
            Successful consultations
          </div>
        </div>

        <div className="stat place-items-center">
          <div className="stat-title text-primary-content/80">
            Happy Patients
          </div>
          <div className="stat-value">8,500+</div>
          <div className="stat-desc text-primary-content/70">
            5-star ratings
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="hero min-h-[40vh] bg-linear-to-r from-secondary to-accent">
        <div className="hero-content text-center">
          <div className="max-w-2xl">
            <h2 className="text-5xl font-bold text-white mb-6">
              Ready to get started?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Join thousands of satisfied patients today and take control of
              your healthcare
            </p>
            <Link href="/register" className="btn btn-wide btn-lg btn-accent">
              Create Your Account
            </Link>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="py-20 bg-base-100">
        <div className="container mx-auto px-4">
          <h2 className="text-5xl font-bold text-center mb-16">
            What Our Patients Say
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Johnson",
                role: "Patient",
                comment:
                  "CareHub made it so easy to find a great doctor and book an appointment. Highly recommend!",
                rating: 5,
              },
              {
                name: "Michael Chen",
                role: "Patient",
                comment:
                  "The platform is intuitive and the doctors are professional. Best healthcare app I have used.",
                rating: 5,
              },
              {
                name: "Emily Davis",
                role: "Patient",
                comment:
                  "I love how I can see reviews and book appointments instantly. Very convenient!",
                rating: 5,
              },
            ].map((testimonial) => (
              <div
                key={testimonial.name}
                className="card bg-base-200 shadow-xl"
              >
                <div className="card-body">
                  <div className="rating rating-sm">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 fill-warning text-warning"
                      />
                    ))}
                  </div>
                  <p className="text-base-content/80 italic">
                    &quot;{testimonial.comment}&quot;
                  </p>
                  <div className="card-actions justify-start mt-4">
                    <div>
                      <p className="font-bold">{testimonial.name}</p>
                      <p className="text-sm text-base-content/60">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
