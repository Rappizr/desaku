"use client";

import React from "react";
import { BarChart3 } from "lucide-react";

interface OverviewTabProps {
  residents: any[];
}

export default function OverviewTab({ residents }: OverviewTabProps) {
  // 1. Fungsi kalkulasi jumlah jiwa per dusun secara riil (Gunakan kebal fallback huruf kapital)
  const getJiwaPerDusun = (namaDusun: string) => {
    return residents.reduce((total, r) => {
      const lokasiDusun = r.dusun || r.Dusun || "";
      if (lokasiDusun.toString().trim().toLowerCase() === namaDusun.trim().toLowerCase()) {
        if (r.jenisData === "Perorangan" || !r.jenisData) return total + 1;
        if (r.jenisData === "Keluarga" && r.anggota) return total + r.anggota.length;
      }
      return total;
    }, 0);
  };

  const jiwaSegunung = getJiwaPerDusun("Segunung");
  const jiwaPloso = getJiwaPerDusun("Ploso");
  const jiwaSumberingin = getJiwaPerDusun("Sumberingin");
  const jiwaKebonalas = getJiwaPerDusun("Kebonalas");
  const jiwaNgrayung = getJiwaPerDusun("Ngrayung");
  const jiwaJani = getJiwaPerDusun("Jani");
  
  const maxJiwa = Math.max(jiwaSegunung, jiwaPloso, jiwaSumberingin, jiwaKebonalas, jiwaNgrayung, jiwaJani, 1);

  // 2. Kode HEX Warna murni pemicu render instan browser
  const daftarDusun = [
    { label: "Segunung", value: jiwaSegunung, hexColor: "#6366f1" },     // Indigo
    { label: "Ploso", value: jiwaPloso, hexColor: "#10b981" },         // Emerald
    { label: "Sumberingin", value: jiwaSumberingin, hexColor: "#f59e0b" }, // Amber
    { label: "Kebonalas", value: jiwaKebonalas, hexColor: "#f43f5e" },     // Rose
    { label: "Ngrayung", value: jiwaNgrayung, hexColor: "#0ea5e9" },       // Sky
    { label: "Jani", value: jiwaJani, hexColor: "#a855f7" },           // Purple
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      <div className="lg:col-span-2 bg-white p-6 rounded-2xl border shadow-sm">
        <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-indigo-600" /> Analitik Wilayah Dusun
        </h3>
        <p className="text-xs text-slate-400 mb-6">Grafik proporsi sebaran domisili kependudukan terdaftar</p>
        
        {/* Sumbu Utama Grafik */}
        <div className="h-64 flex items-end justify-between gap-3 pt-6 px-4 border-b border-l border-slate-200">
          {daftarDusun.map((dusun, idx) => {
            // Jika data 0, beri tinggi 6% sebagai indikator batas bawah balok lantai yang estetik
            const tinggiGrafik = dusun.value > 0 ? (dusun.value / maxJiwa) * 85 : 6;

            return (
              /* PERBAIKAN: Menambahkan utilitas h-full dan justify-end agar struktur sumbu sinkron vertikal */
              <div key={idx} className="w-full h-full flex flex-col items-center justify-end gap-2 group relative">
                
                {/* Pop-up Angka Indikator Jiwa */}
                <div className="absolute -top-1 bg-slate-800 text-white text-[10px] font-black px-2 py-0.5 rounded shadow opacity-0 group-hover:opacity-100 transition-all duration-200 z-20 pointer-events-none">
                  {dusun.value} Jiwa
                </div>

                {/* Balok Grafik Batang Utama */}
                <div 
                  className="w-full rounded-t-xl transition-all duration-500 ease-out cursor-pointer shadow-sm hover:opacity-85" 
                  style={{ 
                    height: `${tinggiGrafik}%`,
                    backgroundColor: dusun.hexColor
                  }}
                />

                {/* Label Dusun */}
                <span className="text-[10px] md:text-xs font-bold text-slate-500 truncate max-w-full pt-1 block">
                  {dusun.label}
                </span>

              </div>
            );
          })}
        </div>
      </div>

      {/* Panel Status Samping */}
      <div className="bg-white p-6 rounded-2xl border shadow-sm text-center">
        <h3 className="font-bold text-slate-900 text-lg">Swasembada Tani</h3>
        <p className="text-xs text-slate-400 mt-1">Status Panel Desa Segunung Aktif</p>
      </div>
    </div>
  );
}