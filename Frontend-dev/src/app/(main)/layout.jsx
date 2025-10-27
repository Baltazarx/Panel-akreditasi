

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext'; // Menggunakan context, bukan hook langsung
import Header from '../../components/layout/Header'; 
import Footer from '../../components/layout/footer';

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const { authUser, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return; // Tunggu sampai verifikasi selesai
    if (!authUser) {
      router.replace('/login'); // Jika tidak ada user, redirect ke login
    }
  }, [authUser, isLoading, router]);

  // Tampilkan loading screen selama verifikasi atau jika user belum ada
  // if (isLoading || !authUser) {
  //   return (
  //     <div className="flex items-center justify-center h-screen">
  //       <p className="text-lg text-slate-500">Memverifikasi sesi...</p>
  //     </div>
  //   );
  // } 

  // Jika user ada, tampilkan layout dashboard
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main>
        <div>
            {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}