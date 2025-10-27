import React from 'react';
import { usePathname } from 'next/navigation';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white">
        <div className="container mx-auto py-16 px-8">
            <div className="grid md:grid-cols-3 gap-12">
                <div>
                    <h3 className="font-bold text-2xl">TPM STIKOM</h3>
                    <p className="mt-4 text-gray-400 text-sm">
                        Portal Internal Tim Penjaminan Mutu. <br/>
                        STIKOM PGRI Banyuwangi.
                    </p>
                </div>
                <div>
                    <h4 className="font-semibold tracking-wider uppercase text-gray-300">Tautan Penting</h4>
                    <ul className="mt-4 space-y-2 text-gray-400">
                        <li><a href="#" className="hover:text-white transition-colors">Website Utama STIKOM</a></li>
                        <li><a href="#" className="hover:text-white transition-colors">Sistem Informasi Akademik</a></li>
                        <li><a href="#" className="hover:text-white transition-colors">Perpustakaan Digital</a></li>
                        <li><a href="#" className="hover:text-white transition-colors">Jurnal Online</a></li>
                    </ul>
                </div>
                 <div>
                    <h4 className="font-semibold tracking-wider uppercase text-gray-300">Hubungi Kami</h4>
                    <ul className="mt-4 space-y-2 text-gray-400">
                        <li>Jl. Jenderal Ahmad Yani No. 80, Banyuwangi</li>
                        <li>(0333) 421295</li>
                        <li>tpm@stikombanyuwangi.ac.id</li>
                    </ul>
                </div>
            </div>
            <div className="mt-16 pt-8 border-t border-gray-700 text-center text-gray-500 text-sm">
                <p>&copy; {new Date().getFullYear()} Tim Penjaminan Mutu STIKOM. All rights reserved.</p>
            </div>
        </div>
    </footer>
  );
};

export default Footer;