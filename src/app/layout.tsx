import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Navbar } from "@/components/layout/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CareHub - Healthcare Appointment System",
  description: "Book appointments with doctors easily",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return { children };
}
