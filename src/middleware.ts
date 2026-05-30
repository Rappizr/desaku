import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // 1. Ambil cookie session yang kita buat saat login sukses
  const isAuthenticated = request.cookies.get("admin_session")?.value;
  
  const { pathname } = request.nextUrl;

  // 2. JIKA user mencoba masuk ke /admin tapi BELUM login
  if (pathname.startsWith("/admin") && !isAuthenticated) {
    // Alihkan paksa ke halaman login
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 3. JIKA user SUDAH login tapi malah iseng buka halaman /login lagi
  if (pathname.startsWith("/login") && isAuthenticated) {
    // Langsung lempar ke dalam dashboard
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}

// 4. Daftarkan rute mana saja yang ingin diawasi oleh Middleware ini
export const config = {
  matcher: ["/admin/:path*", "/login"],
};