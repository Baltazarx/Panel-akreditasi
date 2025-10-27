// src/hooks/useAuth.js

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { apiFetch } from "../lib/api";

export function useAuth() {
  const [authUser, setAuthUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  // Cek cookie user_session di awal
  useEffect(() => {
    const userCookie = Cookies.get("user_session");
    if (userCookie) {
      try {
        const userData = JSON.parse(userCookie);
        console.log("User dari cookie:", userData);
        setAuthUser(userData);
      } catch (e) {
        console.error("Gagal membaca cookie:", e);
        Cookies.remove("user_session");
      }
    }
    setIsLoading(false);
  }, []);

  // Login
  const login = async (username, password) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiFetch("/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });

      console.log("Respons dari API login:", response);

      if (!response?.user) {
        throw new Error("Respons API tidak valid.");
      }

      const userData = {
        id: response.user.id_user,
        username: response.user.username,
        name: response.user.username,
        role: response.user.role,
        unit: response.user.id_unit, // Sesuaikan dengan field dari backend
        token: response.token, // kalau mau simpan token juga
      };

      setAuthUser(userData);
      Cookies.set("user_session", JSON.stringify(userData), {
        expires: 1,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      return userData;
    } catch (err) {
      const errorMessage = err.message || "Login gagal.";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    try {
      await apiFetch("/logout", { method: "POST" });
    } catch (err) {
      console.error("Gagal logout di server:", err.message);
    } finally {
      setAuthUser(null);
      Cookies.remove("user_session");
      router.push("/login");
    }
  };

  return { authUser, isLoading, error, login, logout };
}
