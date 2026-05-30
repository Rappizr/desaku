"use client";

import React, { useState, useEffect } from "react";
import {
  Compass,
  MapPin,
  Users,
  Award,
  Trees,
  Menu,
  X,
  Calendar,
  Home,
  Building2,
  CheckCircle2,
  ChevronRight,
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
  jenisData: string; 
  anggota?: FamilyMember[]; 
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

  useEffect(() => {
    const loadDynamicData = async () => {
      try {
        const resArticles = await fetch("/api/articles");
        if (resArticles.ok) setArticles(await resArticles.json());

        const resResidents = await fetch("/api/residents");
        if (resResidents.ok) {
          const residentsData: Resident[] = await resResidents.json();

          const keluargaCount = residentsData.filter(
            (r) => r.jenisData === "Keluarga",
          ).length;

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
      const scrollPosition = window.pageYOffset || document.documentElement.scrollTop || 0;
      setIsScrolled(scrollPosition > 50);
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
    <div className="relative min-h-screen bg-[#FAFAFA] text-slate-800 font-sans antialiased overflow-x-hidden">
      
      {/* NAVBAR */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 w-full ${
          isScrolled || isMobileMenuOpen
            ? "bg-white shadow-lg border-b border-slate-100"
            : "bg-transparent"
        }`}
      >
        <div className="w-[92%] max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            
            {/* Logo Group */}
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-10 h-10 md:w-12 md:h-12 overflow-hidden rounded-xl shadow-sm bg-white flex items-center justify-center flex-shrink-0">
                <img
                  src="/logoDesa.png"
                  alt="Logo Desa"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <span className={`font-black text-sm md:text-base tracking-tight block transition-colors ${isScrolled || isMobileMenuOpen ? "text-slate-900" : "text-white"}`}>
                  Desa Segunung
                </span>
                <span className={`text-[9px] md:text-[11px] font-bold tracking-wider uppercase block transition-colors ${isScrolled || isMobileMenuOpen ? "text-emerald-600" : "text-emerald-300"}`}>
                  Smart & Eco Tani Village
                </span>
              </div>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-6 lg:gap-8">
              {["Beranda", "Potensi Tani", "Statistik", "Keunggulan", "Berita", "Lokasi"].map((item, idx) => {
                const href = ["#hero", "#potensi", "#statistik", "#keunggulan", "#berita", "#lokasi"][idx];
                return (
                  <a
                    key={item}
                    href={href}
                    onClick={(e) => handleAnchorClick(e, href)}
                    className={`font-semibold text-xs lg:text-sm transition-all relative py-1 after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-emerald-500 after:transition-all hover:after:w-full ${isScrolled ? "text-slate-700 hover:text-emerald-600" : "text-white/90 hover:text-white"}`}
                  >
                    {item}
                  </a>
                );
              })}
            </div>

            {/* Mobile Toggle Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`p-2 rounded-xl transition-colors md:hidden focus:outline-none ${isScrolled || isMobileMenuOpen ? "text-slate-900 bg-slate-50" : "text-white bg-white/10 backdrop-blur-sm"}`}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* MOBILE DRAWER MENU */}
        <div
          className={`absolute top-16 left-0 right-0 bg-white border-b border-slate-100 shadow-xl transition-all duration-300 md:hidden overflow-hidden ${
            isMobileMenuOpen ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0 pointer-events-none"
          }`}
        >
          <div className="w-[90%] mx-auto py-4 flex flex-col gap-1">
            {["Beranda", "Potensi Tani", "Statistik", "Keunggulan", "Berita", "Lokasi"].map((item, idx) => {
              const href = ["#hero", "#potensi", "#statistik", "#keunggulan", "#berita", "#lokasi"][idx];
              return (
                <a
                  key={item}
                  href={href}
                  onClick={(e) => handleAnchorClick(e, href)}
                  className="w-full text-left font-bold text-sm text-slate-700 hover:text-emerald-600 hover:bg-emerald-50/50 px-4 py-3 rounded-xl transition-all flex items-center justify-between group"
                >
                  <span>{item}</span>
                  <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              );
            })}
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
              className="w-full h-full object-cover opacity-45 scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-950/30 to-[#FAFAFA]" />
          </div>
        ))}
        
        {/* Content Box (Responsif Persentase) */}
        <div className="relative z-10 w-[90%] max-w-4xl mx-auto text-center text-white pt-24 pb-12 flex flex-col items-center">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-emerald-300 text-[10px] md:text-xs font-bold tracking-wide uppercase mb-6 border border-white/20 shadow-inner">
            <Trees className="w-3.5 h-3.5" /> Desa Agraris Segunung
          </div>
          <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-4 sm:mb-6 leading-tight">
            <span className="text-xs sm:text-sm md:text-base text-emerald-300 font-bold tracking-widest block mb-2 uppercase">
              Selamat Datang di
            </span>
            <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent block">
              {slides[activeSlide].title}
            </span>
            <span className="block mt-1 text-xl sm:text-3xl md:text-4xl font-extrabold text-white/95">{slides[activeSlide].subtitle}</span>
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-slate-200 w-[95%] sm:w-[85%] mx-auto mb-8 sm:mb-10 leading-relaxed min-h-[4.5rem] font-medium">
            {slides[activeSlide].desc}
          </p>
          
          {/* Indicators Bar */}
          <div className="flex gap-2 mt-4">
            {slides.map((_, idx) => (
              <button 
                key={idx} 
                onClick={() => setActiveSlide(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${activeSlide === idx ? "w-6 bg-emerald-500" : "w-2 bg-white/30"}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* POTENSI PERTANIAN */}
      <section id="potensi" className="py-16 md:py-24 bg-white relative z-20">
        <div className="w-[90%] max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
            <h2 className="text-[10px] md:text-xs font-bold tracking-widest text-emerald-600 uppercase mb-2">
              Sektor Utama
            </h2>
            <p className="text-2xl md:text-4xl font-black text-slate-900 leading-tight">
              Pilar Utama Agrikultur Desa Segunung
            </p>
            <div className="w-10 h-1 bg-emerald-500 mx-auto mt-3 rounded-full" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
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
                className="group bg-[#FAFAFA] p-6 sm:p-8 rounded-3xl border border-slate-100 hover:bg-white hover:shadow-xl transition-all duration-300 w-full"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm group-hover:bg-gradient-to-r group-hover:from-emerald-500 group-hover:to-teal-600 group-hover:text-white transition-all">
                  <item.icon className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 mt-5 mb-2.5">
                  {item.title}
                </h3>
                <p className="text-slate-500 text-xs sm:text-sm leading-relaxed font-medium">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATISTIK PERTANIAN */}
      <section
        id="statistik"
        className="py-12 md:py-16 bg-gradient-to-br from-slate-100 to-slate-50 relative z-20 border-y border-slate-200/50 w-full"
      >
        <div className="w-[90%] max-w-7xl mx-auto">
          {/* Grid responsif: 2 kolom di mobile, 4 kolom di tablet/PC */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
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
                className="text-center md:text-left transition-all duration-300 bg-white/40 md:bg-transparent p-4 md:p-0 rounded-2xl border border-slate-200/40 md:border-0"
              >
                <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-emerald-600 shadow-sm mb-3 mx-auto md:mx-0 border border-slate-200/60">
                  <item.icon className="w-4 h-4" />
                </div>
                <span className="block text-xl sm:text-2xl md:text-4xl font-black text-slate-950 tracking-tight">
                  {item.value}
                </span>
                <span className="text-[9px] md:text-xs font-bold text-slate-400 tracking-wider uppercase mt-1 block">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* KEUNGGULAN DESA */}
      <section id="keunggulan" className="py-16 md:py-24 bg-white relative z-20">
        <div className="w-[90%] max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
            <h2 className="text-[10px] md:text-xs font-bold tracking-widest text-emerald-600 uppercase mb-2">
              Kelebihan
            </h2>
            <p className="text-2xl md:text-4xl font-black text-slate-900 leading-tight">
              Mengapa Sektor Pertanian Segunung Unggul?
            </p>
            <div className="w-10 h-1 bg-emerald-500 mx-auto mt-3 rounded-full" />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-4xl mx-auto w-full">
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
                className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-emerald-50/70 transition-all duration-300 hover:scale-[1.01]"
              >
                <CheckCircle2 className="w-4 h-4 sm:w-5 h-5 text-emerald-500 flex-shrink-0" />
                <span className="text-slate-700 font-bold text-xs sm:text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION BERITA */}
      {articles.length > 0 && (
        <section
          id="berita"
          className="py-16 md:py-24 bg-slate-50 relative z-20 border-t border-slate-200/60"
        >
          <div className="w-[90%] max-w-7xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
              <h2 className="text-[10px] md:text-xs font-bold tracking-widest text-emerald-600 uppercase mb-2">
                Kabar Desa
              </h2>
              <p className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                Berita & Kegiatan Kebonalas Segunung
              </p>
              <div className="w-10 h-1 bg-emerald-500 mx-auto mt-3 rounded-full" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto w-full">
              {articles.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-200 flex flex-col justify-between group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 w-full"
                >
                  <div>
                    <div className="h-48 sm:h-52 w-full bg-slate-100 overflow-hidden relative">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-5 sm:p-6">
                      <h3 className="font-black text-lg sm:text-xl text-slate-900 leading-tight mb-2.5 capitalize group-hover:text-emerald-600 transition-colors line-clamp-2">
                        {item.title}
                      </h3>
                      <p className="text-slate-500 text-xs sm:text-sm leading-relaxed line-clamp-3 mb-4 font-medium">
                        {item.content}
                      </p>
                      <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-xs sm:text-sm hover:gap-2 transition-all cursor-pointer">
                        Read More <ChevronRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                  <div className="px-5 sm:p-6 py-3.5 border-t border-slate-100 bg-slate-50/50 flex items-center gap-2 text-[10px] sm:text-xs text-slate-400 font-bold">
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
        className="py-16 md:py-24 bg-gradient-to-b from-white to-slate-50 relative z-20 border-t border-slate-100"
      >
        <div className="w-[90%] max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h2 className="text-[10px] md:text-xs font-bold tracking-widest text-emerald-600 uppercase mb-2">
              Lokasi Geografis
            </h2>
            <p className="text-2xl md:text-4xl font-black text-slate-900">
              Peta Wilayah Desa Segunung
            </p>
            <div className="w-10 h-1 bg-emerald-500 mx-auto mt-3 rounded-full" />
            <p className="text-slate-500 text-xs sm:text-sm font-semibold mt-4 leading-relaxed">
              Kecamatan Dlanggu, Kabupaten Mojokerto, Jawa Timur, Indonesia
            </p>
          </div>
          
          {/* Iframe Box Menggunakan Persentase Kontainer Penting */}
          <div className="w-full h-[280px] sm:h-[400px] md:h-[500px] rounded-3xl overflow-hidden shadow-xl border-4 border-white bg-white relative">
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
      <footer className="bg-emerald-800 text-white py-10 sm:py-12 relative z-20 border-t border-emerald-900">
        <div className="w-[90%] max-w-7xl mx-auto text-center flex flex-col items-center">
          <div className="flex items-center gap-2.5 mb-5 text-left">
            <div className="w-10 h-10 overflow-hidden rounded-xl bg-white flex items-center justify-center flex-shrink-0 shadow-md">
              <img
                src="/logoDesa.png"
                alt="Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <span className="font-black text-base tracking-tight block">Desa Segunung</span>
              <span className="text-[10px] font-bold uppercase block text-emerald-200 tracking-wider">
                Smart & Eco Tani Village
              </span>
            </div>
          </div>
          <p className="text-emerald-200/70 text-[11px] sm:text-xs font-medium border-t border-emerald-700/60 pt-4 w-full max-w-md">
            &copy; 2026 Desa Segunung. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}