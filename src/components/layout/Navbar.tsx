"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, LogOut, Menu } from "lucide-react";
import { useAuth } from "@/src/context/AuthContext";

export const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  const navLinks = isAuthenticated
    ? [
        { href: "/dashboard", label: "Dashboard" },
        { href: "/doctors", label: "Doctors" },
        { href: "/appointments", label: "Appointments" },
      ]
    : [
        { href: "/", label: "Home" },
        { href: "/doctors", label: "Find Doctors" },
      ];

  return (
    <div className="navbar bg-base-100 shadow-lg sticky top-0 z-50">
      <div className="navbar-start">
        {/* Mobile Dropdown */}
        <div className="dropdown">
          <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
            <Menu className="w-5 h-5" />
          </div>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content mt-3 z-1 p-2 shadow bg-base-100 rounded-box w-52"
          >
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={isActive(link.href) ? "active" : ""}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            {isAuthenticated && (
              <li>
                <button onClick={logout} className="text-error">
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </li>
            )}
          </ul>
        </div>

        {/* Logo */}
        <Link href="/" className="btn btn-ghost text-xl">
          <Calendar className="w-6 h-6 text-primary" />
          <span className="font-bold">CareHub</span>
        </Link>
      </div>

      {/* Desktop Menu */}
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={isActive(link.href) ? "active" : ""}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="navbar-end gap-2">
        {isAuthenticated ? (
          <>
            {/* User Dropdown */}
            <div className="dropdown dropdown-end">
              <div
                tabIndex={0}
                role="button"
                className="btn btn-ghost btn-circle avatar"
              >
                <div className="w-10 rounded-full bg-primary text-primary-content flex items-center justify-center">
                  <span className="text-lg font-bold">
                    {user?.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <ul
                tabIndex={0}
                className="mt-3 z-1 p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52"
              >
                <li className="menu-title">
                  <span>{user?.name}</span>
                  <span className="text-xs opacity-60 capitalize">
                    {user?.role}
                  </span>
                </li>
                <li>
                  <Link href="/profile">Profile</Link>
                </li>
                <li>
                  <Link href="/appointments">My Appointments</Link>
                </li>
                <li>
                  <button onClick={logout} className="text-error">
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </li>
              </ul>
            </div>
          </>
        ) : (
          <>
            <Link href="/login" className="btn btn-ghost btn-sm">
              Login
            </Link>
            <Link href="/register" className="btn btn-primary btn-sm">
              Register
            </Link>
          </>
        )}
      </div>
    </div>
  );
};
