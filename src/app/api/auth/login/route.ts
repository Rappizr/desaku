import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // 1. Cari user berdasarkan email di database
    const user = await prisma.user.findUnique({
      where: { email: email },
    });

    // 2. Jika user tidak ditemukan
    if (!user) {
      return NextResponse.json(
        { message: "Email atau password salah." },
        { status: 401 }
      );
    }

    // 3. Cocokkan password plain teks dengan hash di database
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Email atau password salah." },
        { status: 401 }
      );
    }

    // 4. Jika sukses login, buat response dan pasang cookie session
    const response = NextResponse.json(
      { 
        message: "Login berhasil!",
        user: { id: user.id, email: user.email, nama: user.nama }
      },
      { status: 200 }
    );

    // Menyimpan status login di cookies browser selama 24 jam
    response.cookies.set("admin_session", "true", {
      httpOnly: true, // Proteksi ekstra dari pencurian token via script client (XSS)
      secure: process.env.NODE_ENV === "production", // Wajib HTTPS saat sudah online di Vercel
      sameSite: "strict", // Mencegah serangan CSRF cross-site
      maxAge: 60 * 60 * 24, // Masa aktif cookie (1 hari)
      path: "/", // Berlaku untuk seluruh rute URL aplikasi
    });

    return response;

  } catch (error) {
    console.error("Login API Error:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan pada server internal." },
      { status: 500 }
    );
  }
}