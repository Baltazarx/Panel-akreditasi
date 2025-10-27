// src/context/AuthContext.js

"use client";

import React, { createContext, useContext } from 'react';
import { useAuth as useAuthLogic } from '../hooks/useAuth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const auth = useAuthLogic();
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error("useAuth harus digunakan di dalam AuthProvider");
  }
  return context;
}