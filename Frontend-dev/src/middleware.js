import { NextResponse } from 'next/server';

export function middleware(request) {
  const path = request.nextUrl.pathname;
  const isPublicPath = path === '/login';
  const userSession = request.cookies.get('user_session')?.value || '';

  // Jika mencoba akses halaman terproteksi TANPA user_session (termasuk saat refresh)
  if (!isPublicPath && !userSession) {
    // Arahkan kembali ke halaman login
    return NextResponse.redirect(new URL('/login', request.nextUrl));
  }

  // Jika sudah login dan mencoba akses halaman login lagi
  if (isPublicPath && userSession) {
    return NextResponse.redirect(new URL('/', request.nextUrl));
  }

  return NextResponse.next();
}

// Tentukan halaman mana saja yang ingin diproteksi
export const config = {
  matcher: [
    '/',
    '/login',
    '/pegawai',
    '/dosen',
    '/home',
    '/Tabel1A1',
    // Tambahkan halaman lain jika ada
  ],
};