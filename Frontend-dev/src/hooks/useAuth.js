// src/hooks/useAuth.js

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { apiFetch } from "../lib/api";

// Helper function untuk decode JWT token (tanpa verifikasi, hanya untuk ambil payload)
function decodeJWT(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export function useAuth() {
  const [authUser, setAuthUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  // Helper untuk mendapatkan id_unit_prodi dari berbagai sumber
  const getUnitFromUser = (userData, token) => {
    // Prioritas 1: Dari userData langsung
    if (userData?.id_unit_prodi) return userData.id_unit_prodi;
    if (userData?.unit) return userData.unit;
    
    // Prioritas 2: Decode dari JWT token jika ada
    if (token) {
      const decoded = decodeJWT(token);
      if (decoded?.id_unit_prodi) return decoded.id_unit_prodi;
    }
    
    return null;
  };

  // Cek cookie user_session di awal
  useEffect(() => {
    const userCookie = Cookies.get("user_session");
    if (userCookie) {
      try {
        const userData = JSON.parse(userCookie);
        console.log("User dari cookie:", userData);
        
        // Coba ambil unit dari cookie atau token
        const unitFromCookie = getUnitFromUser(userData, userData?.token);
        
        // Jika tidak ada unit di cookie, coba fetch dari /me
        if (!unitFromCookie && !userData.unit && !userData.id_unit_prodi) {
          (async () => {
            try {
              const me = await apiFetch("/me");
              // Backend /me mungkin bug, jadi coba semua kemungkinan field
              const unitFromMe = me.id_unit_prodi || me.id_unit || me.unit;
              if (unitFromMe) {
                userData.unit = unitFromMe;
                userData.id_unit_prodi = unitFromMe;
                setAuthUser(userData);
                Cookies.set("user_session", JSON.stringify(userData), {
                  expires: 1,
                  secure: process.env.NODE_ENV === "production",
                  sameSite: "strict",
                });
              } else {
                // Jika /me juga tidak punya, coba decode dari token di cookie
                if (userData?.token) {
                  const decoded = decodeJWT(userData.token);
                  if (decoded?.id_unit_prodi) {
                    userData.unit = decoded.id_unit_prodi;
                    userData.id_unit_prodi = decoded.id_unit_prodi;
                    setAuthUser(userData);
                    Cookies.set("user_session", JSON.stringify(userData), {
                      expires: 1,
                      secure: process.env.NODE_ENV === "production",
                      sameSite: "strict",
                    });
                    return;
                  }
                }
                setAuthUser(userData); // Tetap set meskipun tanpa unit
              }
            } catch (e) {
              console.error("Gagal fetch /me:", e);
              // Fallback: coba decode dari token di cookie
              if (userData?.token) {
                const decoded = decodeJWT(userData.token);
                if (decoded?.id_unit_prodi) {
                  userData.unit = decoded.id_unit_prodi;
                  userData.id_unit_prodi = decoded.id_unit_prodi;
                  setAuthUser(userData);
                  Cookies.set("user_session", JSON.stringify(userData), {
                    expires: 1,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "strict",
                  });
                  return;
                }
              }
              setAuthUser(userData); // Tetap set meskipun tanpa unit
            }
          })();
        } else {
          // Sudah punya unit di cookie, langsung set
          if (unitFromCookie && (!userData.unit || !userData.id_unit_prodi)) {
            userData.unit = unitFromCookie;
            userData.id_unit_prodi = unitFromCookie;
          }
          setAuthUser(userData);
        }
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
        // Cek apakah ada error message di response
        const errorMsg = response?.error || response?.message || "Respons API tidak valid.";
        throw new Error(errorMsg);
      }

      // Backend mengembalikan id_unit_prodi di response.user
      // Tapi juga decode dari token untuk memastikan
      let idUnitProdi = response.user.id_unit_prodi;
      if (!idUnitProdi && response.token) {
        const decoded = decodeJWT(response.token);
        idUnitProdi = decoded?.id_unit_prodi;
      }

      const userData = {
        id: response.user.id_user,
        username: response.user.username,
        name: response.user.username,
        role: response.user.role,
        unit: idUnitProdi || response.user.id_unit || null,
        id_unit_prodi: idUnitProdi || response.user.id_unit || null,
        token: response.token,
      };

      setAuthUser(userData);
      Cookies.set("user_session", JSON.stringify(userData), {
        expires: 1,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      return userData;
    } catch (err) {
      // Extract error message dari berbagai sumber
      let errorMessage = "Login gagal.";
      
      if (err.response) {
        // Error dari API response
        errorMessage = err.response.error || err.response.message || err.message || errorMessage;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      // Jika error message adalah JSON string, parse dulu
      if (typeof errorMessage === 'string' && errorMessage.startsWith('{')) {
        try {
          const parsed = JSON.parse(errorMessage);
          errorMessage = parsed.error || parsed.message || errorMessage;
        } catch (e) {
          // Tetap gunakan errorMessage asli jika parsing gagal
        }
      }
      
      console.error("Login error:", err);
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
