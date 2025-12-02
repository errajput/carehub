import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/src/context/AuthContext";
import { Navbar } from "@/src/components/layout/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CareHub - Healthcare Appointment System",
  description:
    "Book appointments with doctors easily and manage your healthcare journey",
  keywords: ["healthcare", "appointments", "doctors", "medical", "booking"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="carehub">
      <body className={inter.className}>
        <AuthProvider>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1 bg-base-200">{children}</main>
            <footer className="footer footer-center p-4 bg-base-300 text-base-content">
              <aside>
                <p>Copyright © 2024 - CareHub Healthcare Management System</p>
              </aside>
            </footer>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
