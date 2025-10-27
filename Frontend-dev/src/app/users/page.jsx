'use client';

import { useAuth } from "../../hooks/useAuth";
import UserManagementPage from "../../components/UserManagementPage";

export default function UsersPage() {
  const { authUser } = useAuth();

  // Guarding role
  if (!authUser || !["WAKET1", "WAKET2"].includes(authUser.role)) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-red-600">403 Forbidden</h1>
        <p className="text-slate-600 mt-2">
          Kamu tidak punya akses ke halaman ini.
        </p>
      </div>
    );
  }

  return <UserManagementPage />;
}
