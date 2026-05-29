import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// 1. GET: Mengambil seluruh data
export async function GET() {
  try {
    const residents = await (prisma as any).resident.findMany({
      include: { anggota: true },
      orderBy: { id: "desc" },
    });
    return NextResponse.json(residents, { status: 200 });
  } catch (error) {
    console.error("GET Residents Error:", error);
    return NextResponse.json({ message: "Gagal mengambil data" }, { status: 500 });
  }
}

// 2. POST: Menyimpan data baru
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nik, nama, dusun, statusEkonomi, jenisData, anggota } = body;

    if (!nik || !nama) {
      return NextResponse.json({ message: "Nomor identitas (NIK/KK) dan Nama wajib diisi!" }, { status: 400 });
    }

    const existingResident = await (prisma as any).resident.findUnique({ where: { nik } });
    if (existingResident) {
      return NextResponse.json({ message: "Nomor NIK/KK utama tersebut sudah terdaftar!" }, { status: 400 });
    }

    const newResident = await (prisma as any).resident.create({
      data: {
        nik,
        nama,
        dusun,
        statusEkonomi,
        jenisData,
        anggota: jenisData === "Keluarga" && Array.isArray(anggota) ? {
          create: anggota.map((member: any, idx: number) => {
            const finalNik = idx === 0 ? (member.nik || nik) : (member.nik || "");
            const finalNama = idx === 0 ? (member.nama || nama) : member.nama;
            return {
              nik: finalNik,
              nama: finalNama,
              hubungan: member.hubungan,
              pekerjaan: member.pekerjaan || "",
              status: member.status || "Belum Kawin",
            };
          })
        } : undefined
      },
      include: { anggota: true }
    });

    return NextResponse.json(newResident, { status: 201 });
  } catch (error) {
    console.error("POST Resident Error:", error);
    return NextResponse.json({ message: "Gagal menyimpan data" }, { status: 500 });
  }
}

// 3. PUT: Memperbarui data (Fitur Edit)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, nik, nama, dusun, statusEkonomi, jenisData, anggota } = body;

    if (!id) return NextResponse.json({ message: "ID data diperlukan untuk pembaruan" }, { status: 400 });

    // Hapus data relasi anggota lama terlebih dahulu untuk menghindari penumpukan/id ganda
    await (prisma as any).familyMember.deleteMany({ where: { residentId: id } });

    // Update data induk sekaligus masukkan susunan anggota yang baru
    const updatedResident = await (prisma as any).resident.update({
      where: { id: parseInt(id) },
      data: {
        nik,
        nama,
        dusun,
        statusEkonomi,
        jenisData,
        anggota: jenisData === "Keluarga" && Array.isArray(anggota) ? {
          create: anggota.map((member: any, idx: number) => {
            const finalNik = idx === 0 ? (member.nik || nik) : (member.nik || "");
            const finalNama = idx === 0 ? (member.nama || nama) : member.nama;
            return {
              nik: finalNik,
              nama: finalNama,
              hubungan: member.hubungan,
              pekerjaan: member.pekerjaan || "",
              status: member.status || "Belum Kawin",
            };
          })
        } : undefined
      },
      include: { anggota: true }
    });

    return NextResponse.json(updatedResident, { status: 200 });
  } catch (error) {
    console.error("PUT Resident Error:", error);
    return NextResponse.json({ message: "Gagal memperbarui data database" }, { status: 500 });
  }
}

// 4. DELETE: Menghapus data
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const idStr = searchParams.get("id");

    if (!idStr) return NextResponse.json({ message: "ID diperlukan" }, { status: 400 });

    const id = parseInt(idStr);
    await (prisma as any).resident.delete({ where: { id } });
    return NextResponse.json({ message: "Data berhasil dihapus" }, { status: 200 });
  } catch (error) {
    console.error("DELETE Resident Error:", error);
    return NextResponse.json({ message: "Gagal menghapus data" }, { status: 500 });
  }
}