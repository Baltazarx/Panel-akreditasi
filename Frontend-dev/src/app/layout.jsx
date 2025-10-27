// src/app/layout.jsx

import { AuthProvider } from '@/context/AuthContext'; // 1. Impor AuthProvider
import './globals.css';

export const metadata = {
  title: 'Panel Akreditasi',
  description: 'Aplikasi untuk manajemen data akreditasi.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body suppressHydrationWarning={true}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}