// src/app/profile/page.jsx

"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useRouter } from "next/navigation";
import { Toaster, toast } from "react-hot-toast";

// An icon for the upload button for a better UX
const CameraIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="mr-2"
  >
    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
    <circle cx="12" cy="13" r="3" />
  </svg>
);

export default function ProfilePage() {
  const { authUser, isLoading } = useAuth();
  const router = useRouter();

  // State for photo update (no change)
  const [profilePic, setProfilePic] = useState(null);
  // State for password change (no change)
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Logic for redirection and setting initial profile picture (no change)
  useEffect(() => {
    if (!isLoading && !authUser) {
      router.push("/login");
    }
    if (authUser?.avatar) {
      setProfilePic(authUser.avatar);
    }
  }, [authUser, isLoading, router]);

  // Avatar berbasis role (default otomatis jika belum ada foto)
  const roleAvatarUrl = authUser?.role
    ? `https://ui-avatars.com/api/?name=${encodeURIComponent(authUser.role)}&background=0384d6&color=fff&bold=true&rounded=true&size=128`
    : null;

  // Photo upload handler (no change)
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setProfilePic(url);
      toast.success("Profile picture updated!");
      // TODO: Send to backend (API for photo upload)
    }
  };

  // Password change handler (no change)
  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("New password and confirmation do not match!");
      return;
    }
    toast.success("Password updated successfully!");
    // TODO: Call password change API
  };

  // Improved loading state
  if (isLoading || !authUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex items-center space-x-3">
          <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-slate-600 font-medium">Loading Profile...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Toaster position="top-center" reverseOrder={false} />

      <main className="max-w-4xl mx-auto p-4 md:p-8">
        {/* -- Redesigned Page Header -- */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Account Settings</h1>
          <p className="text-slate-500 mt-1">Manage your profile and password.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* -- Left Column: User Info & Photo -- */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-4">
                  <img
                    src={profilePic || roleAvatarUrl || "https://via.placeholder.com/150"}
                    alt={authUser?.role ? `Avatar ${authUser.role}` : "Profile"}
                    className="w-24 h-24 rounded-full object-cover ring-4 ring-blue-50"
                  />
                </div>
                <h2 className="text-xl font-semibold text-slate-800">
                  {authUser.name}
                </h2>
                <p className="text-slate-500 text-sm mt-1">{authUser.email}</p>
                <span className="mt-3 text-xs font-medium text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                  {authUser.role}
                </span>

                <label className="mt-6 cursor-pointer w-full flex items-center justify-center px-4 py-2 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-200 transition-colors">
                  <CameraIcon />
                  Change Photo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* -- Right Column: Change Password Form -- */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-xl shadow-sm">
              <form onSubmit={handlePasswordChange}>
                <div className="p-6 border-b border-slate-200">
                  <h3 className="text-lg font-semibold text-slate-800">
                    Change Password
                  </h3>
                </div>
                <div className="p-6 space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg p-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg p-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1.5">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg p-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                      required
                    />
                  </div>
                </div>
                <div className="p-6 bg-slate-50 rounded-b-xl flex justify-end">
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Update Password
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}