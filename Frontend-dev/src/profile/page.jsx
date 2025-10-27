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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <Toaster position="top-center" reverseOrder={false} />

      <main className="max-w-6xl mx-auto p-6 lg:p-8">
        {/* Modern Page Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 bg-clip-text text-transparent">
            Profile Settings
          </h1>
          <p className="text-gray-600 mt-3 text-lg">Manage your account and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Profile Card */}
          <div className="order-2 lg:order-1">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white">
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-6">
                    <img
                      src={profilePic || "https://via.placeholder.com/150"}
                      alt="Profile"
                      className="w-32 h-32 rounded-full object-cover ring-4 ring-white/20 shadow-2xl"
                    />
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white shadow-lg"></div>
                  </div>
                  <h2 className="text-2xl font-bold text-white">
                    {authUser.username || authUser.name}
                  </h2>
                  <p className="text-blue-100 text-sm mt-1">{authUser.email}</p>
                  <span className="mt-4 text-sm font-semibold text-blue-100 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                    {authUser.role?.toUpperCase()}
                  </span>
                </div>
              </div>
              
              <div className="p-8">
                <div className="space-y-6">
                  <div className="flex items-center justify-between py-4 border-b border-gray-100">
                    <div>
                      <h3 className="font-semibold text-gray-900">Account Status</h3>
                      <p className="text-sm text-gray-500">Active since registration</p>
                    </div>
                    <span className="flex items-center px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      Active
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between py-4 border-b border-gray-100">
                    <div>
                      <h3 className="font-semibold text-gray-900">Email Verified</h3>
                      <p className="text-sm text-gray-500">Your email is verified</p>
                    </div>
                    <span className="flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Verified
                    </span>
                  </div>

                  <label className="block cursor-pointer">
                    <div className="flex items-center justify-center w-full px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-dashed border-blue-200 rounded-xl hover:from-blue-100 hover:to-indigo-100 hover:border-blue-300 transition-all duration-200 group">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                          <CameraIcon />
                        </div>
                        <div className="text-left">
                          <p className="font-medium text-gray-900">Change Profile Photo</p>
                          <p className="text-sm text-gray-500">Click to upload a new image</p>
                        </div>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Password Change Form */}
          <div className="order-1 lg:order-2">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-8">
                <h3 className="text-2xl font-bold text-white">Security Settings</h3>
                <p className="text-gray-300 mt-2">Update your password to keep your account secure</p>
              </div>
              
              <form onSubmit={handlePasswordChange} className="p-8">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50/50"
                      placeholder="Enter your current password"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50/50"
                      placeholder="Enter your new password"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50/50"
                      placeholder="Confirm your new password"
                      required
                    />
                  </div>
                </div>
                
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-lg hover:shadow-xl"
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