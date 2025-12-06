"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  User as UserIcon,
  Mail,
  Lock,
  Save,
  Shield,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { useAuth } from "@/src/context/AuthContext";
import { api } from "@/src/lib/api";
import Image from "next/image";

export default function ProfilePage() {
  const { user, isAuthenticated, updateUser } = useAuth();
  const router = useRouter();

  // Profile Update State
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");

  // Password Change State
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  // Delete Account State
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);

  React.useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  // Handle Profile Update
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError("");
    setProfileSuccess("");
    setProfileLoading(true);

    try {
      const response = await api.updateProfile({
        name: profileData.name,
      });

      // Update user in context and localStorage
      const updatedUser = response.user;
      updateUser(updatedUser);

      setProfileSuccess(response.message || "Profile updated successfully!");
      setTimeout(() => setProfileSuccess(""), 3000);
    } catch (err) {
      setProfileError(
        err instanceof Error ? err.message : "Failed to update profile"
      );
    } finally {
      setProfileLoading(false);
    }
  };

  // Handle Password Change
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    // Validation
    if (passwordData.newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    setPasswordLoading(true);

    try {
      const response = await api.changePassword({
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword,
      });

      setPasswordSuccess(response.message || "Password changed successfully!");
      setPasswordData({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setTimeout(() => setPasswordSuccess(""), 3000);
    } catch (err) {
      setPasswordError(
        err instanceof Error ? err.message : "Failed to change password"
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  // Handle Delete Account
  const handleDeleteAccount = () => {
    const modal = document.getElementById(
      "delete_account_modal"
    ) as HTMLDialogElement;
    modal?.showModal();
  };

  const confirmDeleteAccount = async () => {
    if (deleteConfirmation.toLowerCase() !== "delete") {
      return;
    }

    setDeleteLoading(true);

    try {
      // Close modal first
      const modal = document.getElementById(
        "delete_account_modal"
      ) as HTMLDialogElement;
      modal?.close();

      // In a real implementation, you would call an API endpoint
      // await api.deleteAccount();

      // For now, we'll just logout and show a message
      alert(
        "Account deletion requested. This feature requires backend implementation."
      );

      // Logout user after a delay
      setTimeout(() => {
        // Clear all data
        localStorage.clear();
        router.push("/");
      }, 1500);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete account");
    } finally {
      setDeleteLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-5xl font-bold mb-2">Profile Settings</h1>
        <p className="text-xl text-base-content/70">
          Manage your account information and security
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar - User Info */}
        <div className="lg:col-span-1">
          <div className="card bg-base-100 shadow-xl sticky top-24">
            <div className="card-body items-center text-center">
              <div className="avatar placeholder mb-4">
                <div className="bg-primary text-primary-content rounded-full w-24">
                  <span className="text-4xl">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <h2 className="card-title text-2xl">{user.name}</h2>
              <p className="text-base-content/70">{user.email}</p>
              <div className="badge badge-primary badge-lg mt-2 capitalize">
                {user.role}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Update Profile Section */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="flex items-center gap-3 mb-4">
                <UserIcon className="w-6 h-6 text-primary" />
                <h2 className="card-title text-2xl">Profile Information</h2>
              </div>

              {/* Success Alert */}
              {profileSuccess && (
                <div className="alert alert-success mb-4">
                  <CheckCircle className="w-5 h-5" />
                  <span>{profileSuccess}</span>
                </div>
              )}

              {/* Error Alert */}
              {profileError && (
                <div className="alert alert-error mb-4">
                  <AlertCircle className="w-5 h-5" />
                  <span>{profileError}</span>
                </div>
              )}

              <form onSubmit={handleProfileUpdate} className="space-y-4">
                {/* Name */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Full Name</span>
                  </label>
                  <label className="input input-bordered flex items-center gap-2">
                    <UserIcon className="w-4 h-4 opacity-70" />
                    <input
                      type="text"
                      className="grow"
                      placeholder="Your name"
                      value={profileData.name}
                      onChange={(e) =>
                        setProfileData({ ...profileData, name: e.target.value })
                      }
                      required
                      minLength={3}
                    />
                  </label>
                </div>

                {/* Email (Read-only) */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">
                      Email Address
                    </span>
                  </label>
                  <label className="input input-bordered flex items-center gap-2 input-disabled">
                    <Mail className="w-4 h-4 opacity-70" />
                    <input
                      type="email"
                      className="grow"
                      value={user.email}
                      disabled
                    />
                  </label>
                  <label className="label">
                    <span className="label-text-alt text-base-content/60">
                      Email cannot be changed
                    </span>
                  </label>
                </div>

                {/* Role (Read-only) */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Account Type</span>
                  </label>
                  <label className="input input-bordered flex items-center gap-2 input-disabled">
                    <Shield className="w-4 h-4 opacity-70" />
                    <input
                      type="text"
                      className="grow capitalize"
                      value={user.role}
                      disabled
                    />
                  </label>
                </div>

                {/* Submit Button */}
                <div className="card-actions justify-end pt-4">
                  <button
                    type="submit"
                    className={`btn btn-primary ${
                      profileLoading ? "loading" : ""
                    }`}
                    disabled={profileLoading}
                  >
                    {!profileLoading && <Save className="w-5 h-5" />}
                    {profileLoading ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Change Password Section */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="flex items-center gap-3 mb-4">
                <Lock className="w-6 h-6 text-primary" />
                <h2 className="card-title text-2xl">Change Password</h2>
              </div>

              {/* Success Alert */}
              {passwordSuccess && (
                <div className="alert alert-success mb-4">
                  <CheckCircle className="w-5 h-5" />
                  <span>{passwordSuccess}</span>
                </div>
              )}

              {/* Error Alert */}
              {passwordError && (
                <div className="alert alert-error mb-4">
                  <AlertCircle className="w-5 h-5" />
                  <span>{passwordError}</span>
                </div>
              )}

              <form onSubmit={handlePasswordChange} className="space-y-4">
                {/* Old Password */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">
                      Current Password
                    </span>
                  </label>
                  <label className="input input-bordered flex items-center gap-2">
                    <Lock className="w-4 h-4 opacity-70" />
                    <input
                      type="password"
                      className="grow"
                      placeholder="Enter current password"
                      value={passwordData.oldPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          oldPassword: e.target.value,
                        })
                      }
                      required
                      minLength={6}
                    />
                  </label>
                </div>

                {/* New Password */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">New Password</span>
                  </label>
                  <label className="input input-bordered flex items-center gap-2">
                    <Lock className="w-4 h-4 opacity-70" />
                    <input
                      type="password"
                      className="grow"
                      placeholder="Enter new password"
                      value={passwordData.newPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          newPassword: e.target.value,
                        })
                      }
                      required
                      minLength={6}
                    />
                  </label>
                  <label className="label">
                    <span className="label-text-alt text-base-content/60">
                      Must be at least 6 characters
                    </span>
                  </label>
                </div>

                {/* Confirm New Password */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">
                      Confirm New Password
                    </span>
                  </label>
                  <label className="input input-bordered flex items-center gap-2">
                    <Lock className="w-4 h-4 opacity-70" />
                    <input
                      type="password"
                      className="grow"
                      placeholder="Confirm new password"
                      value={passwordData.confirmPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          confirmPassword: e.target.value,
                        })
                      }
                      required
                      minLength={6}
                    />
                  </label>
                </div>

                {/* Submit Button */}
                <div className="card-actions justify-end pt-4">
                  <button
                    type="submit"
                    className={`btn btn-primary ${
                      passwordLoading ? "loading" : ""
                    }`}
                    disabled={passwordLoading}
                  >
                    {!passwordLoading && <Lock className="w-5 h-5" />}
                    {passwordLoading ? "Changing..." : "Change Password"}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Account Information */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title text-2xl mb-4">Account Information</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-base-300">
                  <span className="text-base-content/70">Account Type</span>
                  <span className="badge badge-primary capitalize">
                    {user.role}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-base-300">
                  <span className="text-base-content/70">Account Status</span>
                  <span className="badge badge-success">Active</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-base-content/70">Member Since</span>
                  <span className="font-medium">
                    {new Date().toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="card bg-error/10 border border-error/20 shadow-xl">
            <div className="card-body">
              <h2 className="card-title text-2xl text-error mb-2">
                Danger Zone
              </h2>
              <p className="text-base-content/70 mb-4">
                Irreversible and destructive actions
              </p>
              <button
                className="btn btn-error btn-outline"
                onClick={handleDeleteAccount}
                disabled={deleteLoading}
              >
                {deleteLoading ? (
                  <>
                    <span className="loading loading-spinner"></span>
                    Deleting...
                  </>
                ) : (
                  "Delete Account"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      <dialog id="delete_account_modal" className="modal">
        <div className="modal-box max-w-md">
          <h3 className="font-bold text-2xl text-error mb-4">Delete Account</h3>

          <div className="alert alert-error mb-4">
            <AlertCircle className="w-5 h-5" />
            <div>
              <p className="font-bold">Warning: This action is permanent!</p>
              <p className="text-sm">
                All your data will be permanently deleted.
              </p>
            </div>
          </div>

          <p className="py-4 text-base-content/80">
            This will permanently delete your account and remove all your data
            from our servers. This action <strong>cannot be undone</strong>.
          </p>

          <div className="space-y-4">
            <div>
              <p className="mb-2 font-semibold">
                To confirm, type <span className="text-error">DELETE</span> in
                the box below:
              </p>
              <input
                type="text"
                className="input input-bordered w-full"
                placeholder="Type DELETE to confirm"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
              />
            </div>

            <div className="bg-base-200 p-4 rounded-lg">
              <p className="font-semibold mb-2">What will be deleted:</p>
              <ul className="list-disc list-inside space-y-1 text-sm text-base-content/70">
                <li>Your profile information</li>
                <li>All appointment history</li>
                <li>Reviews and ratings</li>
                <li>Account preferences</li>
              </ul>
            </div>
          </div>

          <div className="modal-action">
            <form method="dialog">
              <button
                className="btn btn-ghost mr-2"
                onClick={() => setDeleteConfirmation("")}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-error"
                onClick={confirmDeleteAccount}
                disabled={
                  deleteConfirmation.toLowerCase() !== "delete" || deleteLoading
                }
              >
                {deleteLoading ? (
                  <>
                    <span className="loading loading-spinner"></span>
                    Deleting...
                  </>
                ) : (
                  "Yes, Delete My Account"
                )}
              </button>
            </form>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button onClick={() => setDeleteConfirmation("")}>close</button>
        </form>
      </dialog>
    </div>
  );
}
