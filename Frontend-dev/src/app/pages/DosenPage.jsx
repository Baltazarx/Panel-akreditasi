"use client";

import React from "react";
import { useAuth } from "../../context/AuthContext";
import TabelDosen from "../(main)/tables/c1/TabelDosen";

export default function DosenPage() {
  const { authUser } = useAuth();
  const role = authUser?.role;
  return (
    <div className="px-4 py-6">
      <TabelDosen role={role} />
    </div>
  );
}


