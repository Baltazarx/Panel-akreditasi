"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function WelcomePage() {
  const router = useRouter();

  useEffect(() => {
    // Atur timer untuk redirect ke halaman utama setelah beberapa detik
    const timer = setTimeout(() => {
      router.push("/"); // Ganti dengan route halaman utama Anda
    }, 4000); // Redirect setelah 4 detik

    // Membersihkan timer saat komponen di-unmount
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-blue-900 via-sky-400 to-yellow-300">
      {/* Container untuk animasi fade-in keseluruhan */}
      <motion.div
        className="flex flex-col items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* SPINNER YANG BERPUTAR */}
        <motion.div
          className="w-20 h-20 border-8 border-dashed border-white rounded-full border-t-transparent"
          animate={{ rotate: 360 }}
          transition={{
            duration: 1.5,      // Durasi satu putaran penuh
            repeat: Infinity,   // Mengulang animasi tanpa henti
            ease: "linear",     // Kecepatan putaran konstan
          }}
        />

        {/* Teks di bawah spinner */}
        <motion.p
          className="mt-6 text-lg text-white/90"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
        >
          Mempersiapkan aplikasi...
        </motion.p>
      </motion.div>
    </div>
  );
}