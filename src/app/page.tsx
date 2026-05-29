"use client";

import React, { useState, useEffect } from "react";
import {
  Compass,
  MapPin,
  Users,
  Award,
  Milestone,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Building2,
  Trees,
  Menu,
  X,
  Calendar,
  Home,
} from "lucide-react";

interface FamilyMember {
  nik: string;
  nama: string;
  hubungan: string;
  pekerjaan: string;
  status: string;
}

interface Resident {
  id: number;
  nik: string;
  nama: string;
  dusun: string;
  statusEkonomi: string;
  jenisData: string; // "Perorangan" atau "Keluarga"
  anggota?: FamilyMember[]; // Tambahkan array anggota di interface agar tidak error saat reduce
}

interface Article {
  id: number;
  title: string;
  content: string;
  imageUrl: string;
  date: string;
}

export default function DesaSegunungProfile() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);

  // State Manajemen Data Dinamis
  const [articles, setArticles] = useState<Article[]>([]);
  const [totalJiwa, setTotalJiwa] = useState(0);
  const [totalKeluarga, setTotalKeluarga] = useState(0);

  const slides = [
    {
      image: "/sawah.png",
      title: "Desa Agraris",
      subtitle: "Hamparan Bumi Subur",
      desc: "Menghidupi tradisi leluhur sebagai masyarakat agraris, di mana mayoritas warga Desa Segunung mengolah tanah subur lereng gunung menjadi sumber pangan berkualitas tinggi.",
    },
    {
      image: "/petani.png",
      title: "Petani Nusantara",
      subtitle: "Dedikasi & Ketahanan Pangan",
      desc: "Melihat lebih dekat keseharian para petani lokal yang tangguh dalam mengelola sawah irigasi teknis, menanam padi unggulan, dan merawat ekosistem alam Dlanggu.",
    },
    {
      image: "/panen.jpeg",
      title: "Potensi Agrowisata",
      subtitle: "Dari Ladang ke Kehidupan",
      desc: "Merasakan langsung pengalaman memanen hasil bumi, berinteraksi dengan kelompok tani, serta menikmati keasrian desa komoditas hortikultura dan palawija.",
    },
  ];

  // Fetch semua data saat halaman pertama kali dimuat
  useEffect(() => {
    const loadDynamicData = async () => {
      try {
        // 1. Fetch Berita Desa
        const resArticles = await fetch("/api/articles");
        if (resArticles.ok) setArticles(await resArticles.json());

        // 2. Fetch Data Penduduk & Hitung Jumlah Jiwa Riil Akumulatif
        const resResidents = await fetch("/api/residents");
        if (resResidents.ok) {
          const residentsData: Resident[] = await resResidents.json();

          // Hitung total KK dari baris berlabel "Keluarga"
          const keluargaCount = residentsData.filter(
            (r) => r.jenisData === "Keluarga",
          ).length;

          // REVISI KALKULASI: Menghitung total perorangan + isi seluruh anggota di dalam KK
          const jiwaCount = residentsData.reduce((total, r) => {
            if (r.jenisData === "Perorangan" || !r.jenisData) {
              return total + 1;
            } else if (r.jenisData === "Keluarga" && r.anggota) {
              return total + r.anggota.length;
            }
            return total;
          }, 0);

          setTotalJiwa(jiwaCount);
          setTotalKeluarga(keluargaCount);
        }
      } catch (error) {
        console.error("Gagal memuat sinkronisasi data halaman utama:", error);
      }
    };
    loadDynamicData();
  }, []);

  useEffect(() => {
    const checkScroll = () => {
      const scrollPosition =
        window.pageYOffset ||
        document.documentElement.scrollTop ||
        document.body.scrollTop ||
        0;

      if (scrollPosition > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", checkScroll);
    checkScroll();

    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000);

    return () => {
      window.removeEventListener("scroll", checkScroll);
      clearInterval(timer);
    };
  }, [slides.length]);

  const handleAnchorClick = (
    e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>,
    targetId: string,
  ) => {
    e.preventDefault();
    const targetElement = document.querySelector(targetId);
    if (targetElement) {
      targetElement.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="relative min-h-screen bg-[#FAFAFA] text-slate-800 font-sans antialiased">
      {/* NAVBAR */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? "bg-white shadow-lg border-b border-slate-100"
            : "bg-transparent"
        }`}
        style={{ backgroundColor: isScrolled ? "#ffffff" : "transparent" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 md:w-14 md:h-14 overflow-hidden rounded-xl shadow-md bg-white flex items-center justify-center">
                <img
                  src="/logoDesa.png"
                  alt="Logo Desa"
                  className="w-full h-full object-cover"
                  style={{ mixBlendMode: "multiply" }}
                />
              </div>
              <div>
                <span
                  className={`font-bold text-base md:text-lg tracking-tight block transition-colors ${isScrolled ? "text-slate-900" : "text-white"}`}
                >
                  Desa Segunung
                </span>
                <span
                  className={`text-[10px] md:text-xs font-bold tracking-wider uppercase block transition-colors ${isScrolled ? "text-emerald-600" : "text-emerald-300"}`}
                >
                  Smart & Eco Tani Village
                </span>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-8">
              {[
                "Beranda",
                "Potensi Tani",
                "Statistik",
                "Keunggulan",
                "Berita",
                "Lokasi",
              ].map((item, idx) => {
                const href = [
                  "#hero",
                  "#potensi",
                  "#statistik",
                  "#keunggulan",
                  "#berita",
                  "#lokasi",
                ][idx];
                return (
                  <a
                    key={item}
                    href={href}
                    onClick={(e) => handleAnchorClick(e, href)}
                    className={`font-semibold text-sm transition-all relative py-1 after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-emerald-500 after:transition-all hover:after:w-full ${isScrolled ? "text-slate-700 hover:text-emerald-600" : "text-white/90 hover:text-white"}`}
                  >
                    {item}
                  </a>
                );
              })}
            </div>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`p-2 rounded-lg transition-colors md:hidden ${isScrolled ? "text-slate-900" : "text-white"}`}
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section
        id="hero"
        className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-slate-950"
      >
        {slides.map((slide, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 z-0 transition-opacity duration-1000 ease-in-out ${activeSlide === idx ? "opacity-100" : "opacity-0"}`}
          >
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover opacity-50"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 via-slate-950/20 to-[#FAFAFA]" />
          </div>
        ))}
        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full text-center text-white py-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md text-emerald-300 text-xs font-bold tracking-wide uppercase mb-6 border border-white/20">
            <Trees className="w-3.5 h-3.5" /> Desa Agraris Segunung
          </div>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tight mb-6">
            <span className="text-base md:text-lg text-emerald-300 block mb-2">
              Selamat Datang di
            </span>
            <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
              {slides[activeSlide].title}
            </span>
            <span className="block mt-2">{slides[activeSlide].subtitle}</span>
          </h1>
          <p className="text-base md:text-lg text-slate-200 max-w-3xl mx-auto mb-10 leading-relaxed min-h-[3rem]">
            {slides[activeSlide].desc}
          </p>
        </div>
      </section>

      {/* POTENSI PERTANIAN */}
      <section id="potensi" className="py-24 bg-white relative z-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold tracking-widest text-emerald-600 uppercase mb-3">
              Sektor Utama
            </h2>
            <p className="text-2xl md:text-4xl font-black text-slate-900">
              Pilar Utama Agrikultur Desa Segunung
            </p>
            <div className="w-12 h-1 bg-emerald-500 mx-auto mt-4 rounded-full" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Trees,
                title: "Pertanian Padi Berkelanjutan",
                desc: "Sistem pengairan subak lokal menghasilkan beras lokal premium berkualitas tinggi.",
              },
              {
                icon: MapPin,
                title: "Budidaya Hortikultura",
                desc: "Kawasan budidaya sayur-mayur segar yang dirawat intensif menggunakan pupuk organik.",
              },
              {
                icon: Compass,
                title: "Pengembangan Agribisnis",
                desc: "Hilirisasi hasil pertanian guna mengolah gabah menjadi komoditas bernilai jual tinggi.",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="group bg-[#FAFAFA] p-8 rounded-3xl border border-slate-100 hover:bg-white hover:shadow-xl transition-all duration-300"
              >
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm group-hover:bg-gradient-to-r group-hover:from-emerald-500 group-hover:to-teal-600 group-hover:text-white transition-all">
                  <item.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mt-6 mb-3">
                  {item.title}
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATISTIK PERTANIAN (SUDAH FIX DINAMIS AKUMULATIF) */}
      <section
        id="statistik"
        className="py-16 bg-gradient-to-br from-slate-100 to-slate-50 relative z-20 border-y border-slate-200/50"
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              {
                icon: Users,
                value: `${totalJiwa} Jiwa`,
                label: "Jumlah Penduduk",
              },
              {
                icon: Home,
                value: `${totalKeluarga} KK`,
                label: "Jumlah Keluarga",
              },
              { icon: Building2, value: "8", label: "Kelompok Tani Aktif" },
              { icon: Award, value: "Swasembada", label: "Status Ketahanan" },
            ].map((item, idx) => (
              <div
                key={idx}
                className="text-center md:text-left transition-all duration-300 hover:scale-105"
              >
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-emerald-600 shadow-sm mb-4 mx-auto md:mx-0 border border-slate-200/60">
                  <item.icon className="w-5 h-5" />
                </div>
                <span className="block text-2xl md:text-4xl font-black text-slate-950 tracking-tight">
                  {item.value}
                </span>
                <span className="text-[10px] md:text-xs font-bold text-slate-400 tracking-wider uppercase mt-1 block">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* KEUNGGULAN DESA */}
      <section id="keunggulan" className="py-24 bg-white relative z-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold tracking-widest text-emerald-600 uppercase mb-3">
              Kelebihan
            </h2>
            <p className="text-2xl md:text-4xl font-black text-slate-900">
              Mengapa Sektor Pertanian Segunung Unggul?
            </p>
            <div className="w-12 h-1 bg-emerald-500 mx-auto mt-4 rounded-full" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              "Tanah Vulkanis yang Sangat Subur",
              "Sistem Pengairan Sawah Terjaga Sepanjang Tahun",
              "Penggunaan Pupuk Organik Yang Ramah Lingkungan",
              "Solidaritas Kelompok Tani Tinggi",
              "Akses Distribusi Logistik Strategis",
              "Kombinasi Metode Tradisional & Modern",
            ].map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 hover:bg-emerald-50 transition-all duration-300 hover:scale-[1.02]"
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <span className="text-slate-700 font-medium">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION BERITA */}
      {articles.length > 0 && (
        <section
          id="berita"
          className="py-24 bg-slate-50 relative z-20 border-t border-slate-200/60"
        >
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-xs font-bold tracking-widest text-emerald-600 uppercase mb-3">
                Kabar Desa
              </h2>
              <p className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight">
                Berita & Kegiatan Kebonalas Segunung
              </p>
              <div className="w-12 h-1 bg-emerald-500 mx-auto mt-4 rounded-full" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {articles.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-3xl overflow-hidden shadow-md border border-slate-200 flex flex-col justify-between group hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div>
                    <div className="h-52 w-full bg-slate-100 overflow-hidden relative">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-6">
                      <h3 className="font-black text-xl text-slate-900 leading-tight mb-3 capitalize group-hover:text-emerald-600 transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-slate-500 text-sm leading-relaxed line-clamp-3 mb-4">
                        {item.content}
                      </p>
                      <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-sm hover:gap-2 transition-all cursor-pointer">
                        Read More <ChevronRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                  <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center gap-2 text-xs text-slate-400 font-semibold">
                    <Calendar className="w-4 h-4 text-emerald-600" />
                    <span>{item.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* MAPS SECTION */}
      <section
        id="lokasi"
        className="py-24 bg-gradient-to-b from-white to-slate-50 relative z-20 border-t border-slate-100"
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-6">
            <h2 className="text-xs font-bold tracking-widest text-emerald-600 uppercase mb-3">
              Lokasi Geografis
            </h2>
            <p className="text-2xl md:text-4xl font-black text-slate-900">
              Peta Wilayah Desa Segunung
            </p>
            <div className="w-12 h-1 bg-emerald-500 mx-auto mt-4 rounded-full" />
            <p className="text-slate-500 text-sm mt-4">
              Kecamatan Dlanggu, Kabupaten Mojokerto, Jawa Timur, Indonesia
            </p>
          </div>
          <div className="max-w-7xl mx-auto w-full h-[400px] md:h-[500px] rounded-3xl overflow-hidden shadow-xl border-4 border-white bg-white relative">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15814.770281224673!2d112.4716766465495!3d-7.553956793655106!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e78e9fa07f3521d%3A0x6b4a3c1f016335ab!2sSegunung%2C%20Kec.%20Dlanggu%2C%20Kabupaten%20Mojokerto%2C%20Jawa%20Timur!5e0!3m2!1sid!2sid!4v1710000000000!5m2!1sid!2sid&maptype=hybrid"
              className="absolute inset-0 w-full h-full border-0"
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Peta Desa Segunung"
            />
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-emerald-700 text-white py-12 relative z-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-12 overflow-hidden rounded-xl bg-white flex items-center justify-center">
              <img
                src="/logoDesa.png"
                alt="Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-left">
              <span className="font-bold text-lg block">Desa Segunung</span>
              <span className="text-xs font-bold uppercase block text-emerald-200">
                Smart & Eco Tani Village
              </span>
            </div>
          </div>
          <p className="text-emerald-200 text-sm">
            © 2026 Desa Segunung. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}