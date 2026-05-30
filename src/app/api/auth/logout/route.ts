import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ message: "Logout berhasil" });
  // Hapus cookie dengan mengatur masa berlakunya ke masa lalu (expired)
  response.cookies.set("admin_session", "", { path: "/", maxAge: 0 });
  return response;
}