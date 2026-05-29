import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const prisma = new PrismaClient();

// 1. GET: Mengambil seluruh berita desa
export async function GET() {
  try {
    // Menggunakan (prisma as any) untuk membypass jika cache TypeScript VS Code kamu masih nge-stuck
    const articles = await (prisma as any).article.findMany({ 
      orderBy: { id: "desc" } 
    });
    return NextResponse.json(articles, { status: 200 });
  } catch (error) {
    console.error("GET Articles Error:", error);
    return NextResponse.json({ message: "Gagal memuat berita" }, { status: 500 });
  }
}

// 2. POST: Membuat berita baru beserta upload file banner
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const date = formData.get("date") as string;
    const imageFile = formData.get("image") as File | null;

    if (!title || !content || !imageFile) {
      return NextResponse.json({ message: "Data berita belum lengkap" }, { status: 400 });
    }

    // Mengonversi file gambar menjadi Buffer biner
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Membuat nama file unik agar tidak saling menimpa di folder public
    const filename = `news_${Date.now()}_${imageFile.name.replace(/\s+/g, "_")}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    
    // Membuat folder public/uploads jika belum tersedia
    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, filename), buffer);

    // Menyimpan data ke dalam tabel Article PostgreSQL
    const newArticle = await (prisma as any).article.create({
      data: {
        title,
        content,
        // Jika form tanggal kosong, otomatis isi dengan tanggal hari ini menggunakan format lokal Indonesia
        date: date || new Date().toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" }),
        imageUrl: `/uploads/${filename}`,
      },
    });

    return NextResponse.json(newArticle, { status: 201 });
  } catch (error) {
    console.error("POST Article Error:", error);
    return NextResponse.json({ message: "Gagal menyimpan berita" }, { status: 500 });
  }
}

// 3. DELETE: Menghapus berita desa berdasarkan ID parameter (?id=x)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const idStr = searchParams.get("id");
    
    if (!idStr) return NextResponse.json({ message: "ID diperlukan" }, { status: 400 });
    
    const id = parseInt(idStr);
    if (isNaN(id)) return NextResponse.json({ message: "ID harus berupa angka" }, { status: 400 });

    // Eksekusi penghapusan data di PostgreSQL
    await (prisma as any).article.delete({ 
      where: { id } 
    });
    
    return NextResponse.json({ message: "Berita berhasil dihapus" }, { status: 200 });
  } catch (error) {
    console.error("DELETE Article Error:", error);
    return NextResponse.json({ message: "Gagal menghapus berita" }, { status: 500 });
  }
}