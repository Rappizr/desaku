"use client";

import React, { useState, useEffect } from "react";
import { 
  Users, Plus, Trash2, Pencil, ShieldCheck, Loader2, Newspaper, 
  Calendar, FileText, User, Home, PlusCircle, XCircle, 
  LayoutDashboard, Award, Search, Bell, Mail, BarChart3,
  CheckCircle2, AlertTriangle, HelpCircle
} from "lucide-react";

// Interface Data Struktur
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
  anggota: FamilyMember[];
}

interface Article {
  id: number;
  title: string;
  content: string;
  imageUrl: string;
  date: string;
}

// Interface untuk State Toast Notifikasi Custom
interface ToastState {
  show: boolean;
  type: "success" | "error";
  message: string;
}

// Interface untuk State Modal Konfirmasi Custom
interface ConfirmModalState {
  show: boolean;
  type: "edit" | "delete" | null;
  title: string;
  message: string;
  onConfirm: () => void;
}

export default function AdminDashboard() {
  const [activeMenu, setActiveMenu] = useState<"overview" | "warga" | "berita">("overview");
  
  const [residents, setResidents] = useState<Resident[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // State Pelacak Mode Edit
  const [editId, setEditId] = useState<number | null>(null);

  // Sistem UI Toast & Modal Konfirmasi Pengganti Alert Browser
  const [toast, setToast] = useState<ToastState>({ show: false, type: "success", message: "" });
  const [confirmModal, setConfirmModal] = useState<ConfirmModalState>({
    show: false,
    type: null,
    title: "",
    message: "",
    onConfirm: () => {}
  });

  // Form States Penduduk Utama
  const [jenisData, setJenisData] = useState<"Perorangan" | "Keluarga">("Perorangan");
  const [nik, setNik] = useState("");
  const [nama, setNama] = useState("");
  const [dusun, setDusun] = useState("Kebonalas");
  const [statusEkonomi, setStatusEkonomi] = useState("Mampu");
  
  // Default State Sub-Form Anggota Keluarga
  const [anggotaList, setAnggotaList] = useState<FamilyMember[]>([
    { nik: "", nama: "", hubungan: "Kepala Keluarga", pekerjaan: "", status: "Belum Kawin" }
  ]);

  // Form States Berita
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [newsDate, setNewsDate] = useState("");
  const [newsImage, setNewsImage] = useState<File | null>(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [resWarga, resBerita] = await Promise.all([
        fetch("/api/residents"),
        fetch("/api/articles")
      ]);
      if (resWarga.ok) setResidents(await resWarga.json());
      if (resBerita.ok) setArticles(await resBerita.json());
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  // Trigger Toast helper dengan auto-hide dalam 4 detik
  const showToast = (type: "success" | "error", message: string) => {
    setToast({ show: true, type, message });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 4000);
  };

  // Fungsi memicu pengisian form ulang saat tombol Edit ditekan
  const startEdit = (res: Resident) => {
    setEditId(res.id);
    setJenisData(res.jenisData as any || "Perorangan");
    setNik(res.nik);
    setNama(res.nama);
    setDusun(res.dusun);
    setStatusEkonomi(res.statusEkonomi);
    
    if (res.jenisData === "Keluarga" && res.anggota && res.anggota.length > 0) {
      setAnggotaList(res.anggota);
    } else {
      setAnggotaList([{ nik: "", nama: "", hubungan: "Kepala Keluarga", pekerjaan: "", status: "Belum Kawin" }]);
    }
    setActiveMenu("warga");
  };

  const cancelEdit = () => {
    setEditId(null);
    setNik("");
    setNama("");
    setDusun("Kebonalas");
    setStatusEkonomi("Mampu");
    setJenisData("Perorangan");
    setAnggotaList([{ nik: "", nama: "", hubungan: "Kepala Keluarga", pekerjaan: "", status: "Belum Kawin" }]);
  };

  const addFamilyMember = () => { 
    setAnggotaList([...anggotaList, { nik: "", nama: "", hubungan: "Anak", pekerjaan: "", status: "Belum Kawin" }]); 
  };
  
  const removeFamilyMember = (index: number) => {
    const list = [...anggotaList];
    list.splice(index, 1);
    setAnggotaList(list);
  };
  
  const handleMemberChange = (index: number, field: keyof FamilyMember, value: string) => {
    const list = [...anggotaList];
    list[index][field] = value;
    setAnggotaList(list);
  };

  // Interseptor Validasi Submit untuk membedakan Mode Edit atau Tambah Baru
  const onSubmitResidentForm = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editId !== null) {
      setConfirmModal({
        show: true,
        type: "edit",
        title: "Konfirmasi Perubahan Data",
        message: `Apakah Anda yakin ingin memperbarui data kependudukan atas nama "${nama}"? Tindakan ini akan memperbarui arsip pangkalan data utama desa.`,
        onConfirm: () => executeResidentSubmit()
      });
    } else {
      executeResidentSubmit();
    }
  };

  // Eksekusi core submit kependudukan ke API backend (POST / PUT)
  const executeResidentSubmit = async () => {
    setConfirmModal((prev) => ({ ...prev, show: false }));
    setSubmitting(true);
    
    let finalAnggota = [...anggotaList];
    if (jenisData === "Keluarga") {
      finalAnggota[0].nama = nama;
      finalAnggota[0].hubungan = "Kepala Keluarga";
    }

    const isEditMode = editId !== null;

    try {
      const res = await fetch("/api/residents", {
        method: isEditMode ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          id: editId,
          nik, 
          nama, 
          dusun, 
          statusEkonomi, 
          jenisData, 
          anggota: jenisData === "Keluarga" ? finalAnggota : [] 
        }),
      });

      if (res.ok) {
        cancelEdit();
        loadData();
        showToast("success", isEditMode ? "Data kependudukan berhasil diperbarui ke server!" : "Data penduduk baru berhasil disimpan ke database!");
      } else {
        const err = await res.json();
        showToast("error", `Gagal memproses data: ${err.message}`);
      }
    } catch (error) { 
      showToast("error", "Terjadi kesalahan koneksi jaringan pangkalan data."); 
    } finally { 
      setSubmitting(false); 
    }
  };

  const handleArticleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsImage) return showToast("error", "Format berkas salah! Harap sertakan gambar sampul banner berita.");
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);
      formData.append("date", newsDate);
      formData.append("image", newsImage);

      const res = await fetch("/api/articles", { method: "POST", body: formData });
      if (res.ok) {
        setTitle(""); setContent(""); setNewsDate(""); setNewsImage(null);
        loadData();
        showToast("success", "Artikel berita desa berhasil diterbitkan ke portal utama!");
      } else {
        showToast("error", "Gagal mengunggah konten artikel berita.");
      }
    } catch (error) { showToast("error", "Gagal menyambungkan dokumen ke server berita."); }
    finally { setSubmitting(false); }
  };

  // Interseptor Hapus Data menggunakan Custom Modal Dialog
  const triggerDeleteResident = (id: number, targetName: string) => {
    setConfirmModal({
      show: true,
      type: "delete",
      title: "Hapus Arsip Kependudukan",
      message: `Apakah Anda benar-benar yakin ingin menghapus data "${targetName}"? Seluruh arsip anggota keluarga yang terikat dalam KK ini juga akan terhapus secara permanen dari sistem.`,
      onConfirm: () => executeDelete(id, "warga")
    });
  };

  const executeDelete = async (id: number, type: "warga" | "berita") => {
    setConfirmModal((prev) => ({ ...prev, show: false }));
    try {
      const res = await fetch(type === "warga" ? `/api/residents?id=${id}` : `/api/articles?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        loadData();
        showToast("success", type === "warga" ? "Arsip penduduk berhasil dihapus dari sistem desa." : "Artikel berita berhasil diturunkan.");
      } else {
        showToast("error", "Gagal mengeksekusi perintah penghapusan berkas database.");
      }
    } catch (error) {
      showToast("error", "Gagal menghubungi server database.");
    }
  };

  const keluargaCount = residents.filter(r => r.jenisData === "Keluarga").length;

  const jiwaCount = residents.reduce((total, r) => {
    if (r.jenisData === "Perorangan" || !r.jenisData) {
      return total + 1;
    } else if (r.jenisData === "Keluarga" && r.anggota) {
      return total + r.anggota.length;
    }
    return total;
  }, 0);

  // Pembantu menghitung statistik 6 dusun secara riil untuk Bar Chart
  const getJiwaPerDusun = (namaDusun: string) => {
    return residents.reduce((total, r) => {
      if (r.dusun.toLowerCase() === namaDusun.toLowerCase()) {
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

  return (
    <div className="min-h-screen bg-[#F0F4F9] text-slate-800 flex font-sans antialiased relative">
      
      {/* MODAL NOTIFIKASI TOAST CUSTOM */}
      {toast.show && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-xl border backdrop-blur-md animate-bounce bg-white/95 border-slate-200">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${toast.type === "success" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>
            {toast.type === "success" ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">{toast.type === "success" ? "Operasi Berhasil" : "Operasi Gagal"}</div>
            <div className="text-[11px] text-slate-500 font-medium mt-0.5">{toast.message}</div>
          </div>
        </div>
      )}

      {/* CUSTOM DIALOG MODAL KONFIRMASI */}
      {confirmModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="bg-white max-w-md w-full rounded-2xl p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 border ${confirmModal.type === "edit" ? "bg-amber-50 text-amber-600 border-amber-100" : "bg-rose-50 text-rose-600 border-rose-100"}`}>
                {confirmModal.type === "edit" ? <HelpCircle className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-900 text-base leading-tight">{confirmModal.title}</h3>
                <p className="text-slate-500 text-xs mt-2 leading-relaxed font-medium">{confirmModal.message}</p>
              </div>
            </div>
            <div className="flex justify-end items-center gap-2 mt-6 pt-4 border-t border-slate-100">
              <button type="button" onClick={() => setConfirmModal((prev) => ({ ...prev, show: false }))} className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-50 rounded-xl transition-all">Batal</button>
              <button type="button" onClick={confirmModal.onConfirm} className={`px-4 py-2 text-xs font-bold text-white rounded-xl shadow-md transition-all ${confirmModal.type === "edit" ? "bg-amber-500 hover:bg-amber-600" : "bg-rose-500 hover:bg-rose-600"}`}>Konfirmasi</button>
            </div>
          </div>
        </div>
      )}

      {/* SIDEBAR NAVIGATION WITH CUSTOM LOGO */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col fixed inset-y-0 left-0 z-40">
        <div className="h-20 px-6 flex items-center gap-3 border-b border-slate-100">
          <div className="w-10 h-10 overflow-hidden rounded-xl shadow-md border border-slate-100 bg-white flex items-center justify-center flex-shrink-0">
            <img src="/logoDesa.png" alt="Logo Desa Segunung" className="w-full h-full object-cover" />
          </div>
          <span className="font-bold text-base text-[#1E293B] tracking-tight">Segunung Admin</span>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1.5">
          <button onClick={() => { cancelEdit(); setActiveMenu("overview"); }} className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all ${activeMenu === "overview" ? "bg-[#E0E7FF] text-[#4F46E5]" : "text-slate-500 hover:bg-slate-50"}`}><LayoutDashboard className="w-5 h-5" /> Dashboard</button>
          <button onClick={() => setActiveMenu("warga")} className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all ${activeMenu === "warga" ? "bg-[#E0E7FF] text-[#4F46E5]" : "text-slate-500 hover:bg-slate-50"}`}><Users className="w-5 h-5" /> Data Penduduk</button>
          <button onClick={() => { cancelEdit(); setActiveMenu("berita"); }} className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all ${activeMenu === "berita" ? "bg-[#E0E7FF] text-[#4F46E5]" : "text-slate-500 hover:bg-slate-50"}`}><Newspaper className="w-5 h-5" /> Berita Desa</button>
        </nav>
        <div className="p-4 border-t border-slate-100 text-xs text-slate-400 text-center">v2.0.26</div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 pl-64 flex flex-col min-h-screen">
        <div className="bg-[#4F46E5] h-52 w-full pt-4 px-8 relative">
          <header className="flex items-center justify-between h-14 w-full">
            <div className="relative w-80">
              <Search className="w-4 h-4 text-white/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input type="text" placeholder="Search here..." className="w-full bg-white/15 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-white/50 outline-none" />
            </div>
            <div className="flex items-center gap-4 text-white">
              <button className="p-2 hover:bg-white/10 rounded-xl relative"><Bell className="w-5 h-5" /><span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-400 rounded-full"></span></button>
              <button className="p-2 hover:bg-white/10 rounded-xl"><Mail className="w-5 h-5" /></button>
              <div className="flex items-center gap-3 pl-2 border-l border-white/20">
                <img src="/logoDesa.png" alt="Admin" className="w-9 h-9 rounded-full bg-white object-cover border-2 border-white/20" />
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-bold leading-tight">Mukhlas Admin</div>
                  <div className="text-[10px] text-white/70">Administrator</div>
                </div>
              </div>
            </div>
          </header>
        </div>

        <div className="px-8 -mt-24 pb-12 flex-1 z-10">
          {/* STATS TOP CARDS */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-2xl border shadow-sm flex flex-col justify-between"><main><span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Penduduk</span><span className="text-2xl font-black text-slate-900 mt-2 block">{jiwaCount} Jiwa</span></main><div className="w-full bg-slate-100 h-1.5 rounded-full mt-4 overflow-hidden"><div className="bg-blue-500 h-full w-[85%]"></div></div></div>
            <div className="bg-white p-6 rounded-2xl border shadow-sm flex flex-col justify-between"><main><span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Keluarga</span><span className="text-2xl font-black text-slate-900 mt-2 block">{keluargaCount} KK</span></main><div className="w-full bg-slate-100 h-1.5 rounded-full mt-4 overflow-hidden"><div className="bg-amber-500 h-full w-[65%]"></div></div></div>
            <div className="bg-white p-6 rounded-2xl border shadow-sm flex flex-col justify-between"><main><span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Kelompok Tani</span><span className="text-2xl font-black text-slate-900 mt-2 block">8 Poktan</span></main><div className="w-full bg-slate-100 h-1.5 rounded-full mt-4 overflow-hidden"><div className="bg-emerald-500 h-full w-[75%]"></div></div></div>
            <div className="bg-white p-6 rounded-2xl border shadow-sm flex flex-col justify-between"><main><span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Berita Live</span><span className="text-2xl font-black text-slate-900 mt-2 block">{articles.length} Post</span></main><div className="w-full bg-slate-100 h-1.5 rounded-full mt-4 overflow-hidden"><div className="bg-purple-500 h-full w-[90%]"></div></div></div>
          </section>

          {loading ? (
            <div className="bg-white p-20 rounded-2xl border shadow-sm flex flex-col items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>
          ) : activeMenu === "overview" ? (
            /* TAB 1: OVERVIEW COMPONENT WITH DYNAMIC 6 DUSUN BAR CHART */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              <div className="lg:col-span-2 bg-white p-6 rounded-2xl border shadow-sm">
                <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-indigo-600" /> Analitik Wilayah Dusun</h3>
                <p className="text-xs text-slate-400 mb-6">Grafik proporsi sebaran domisili kependudukan terdaftar</p>
                
                <div className="h-60 flex items-end justify-between gap-2 pt-4 px-2 border-b border-l">
                  {/* 1. Segunung */}
                  <div className="w-full flex flex-col items-center gap-2 group relative">
                    <div className="absolute -top-6 bg-slate-800 text-white text-[10px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity z-20 shadow">{jiwaSegunung} Jiwa</div>
                    <div className="w-full bg-indigo-500 rounded-t-lg transition-all duration-500 ease-out hover:bg-indigo-600 cursor-pointer" style={{ height: `${(jiwaSegunung / maxJiwa) * 80 + 10}%` }}></div>
                    <span className="text-[10px] md:text-xs font-semibold text-slate-600 truncate max-w-full">Segunung</span>
                  </div>
                  {/* 2. Ploso */}
                  <div className="w-full flex flex-col items-center gap-2 group relative">
                    <div className="absolute -top-6 bg-slate-800 text-white text-[10px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity z-20 shadow">{jiwaPloso} Jiwa</div>
                    <div className="w-full bg-emerald-500 rounded-t-lg transition-all duration-500 ease-out hover:bg-emerald-600 cursor-pointer" style={{ height: `${(jiwaPloso / maxJiwa) * 80 + 10}%` }}></div>
                    <span className="text-[10px] md:text-xs font-semibold text-slate-600 truncate max-w-full">Ploso</span>
                  </div>
                  {/* 3. Sumberingin */}
                  <div className="w-full flex flex-col items-center gap-2 group relative">
                    <div className="absolute -top-6 bg-slate-800 text-white text-[10px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity z-20 shadow">{jiwaSumberingin} Jiwa</div>
                    <div className="w-full bg-amber-500 rounded-t-lg transition-all duration-500 ease-out hover:bg-amber-600 cursor-pointer" style={{ height: `${(jiwaSumberingin / maxJiwa) * 80 + 10}%` }}></div>
                    <span className="text-[10px] md:text-xs font-semibold text-slate-600 truncate max-w-full">Sumberingin</span>
                  </div>
                  {/* 4. Kebonalas */}
                  <div className="w-full flex flex-col items-center gap-2 group relative">
                    <div className="absolute -top-6 bg-slate-800 text-white text-[10px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity z-20 shadow">{jiwaKebonalas} Jiwa</div>
                    <div className="w-full bg-rose-500 rounded-t-lg transition-all duration-500 ease-out hover:bg-rose-600 cursor-pointer" style={{ height: `${(jiwaKebonalas / maxJiwa) * 80 + 10}%` }}></div>
                    <span className="text-[10px] md:text-xs font-semibold text-slate-600 truncate max-w-full">Kebonalas</span>
                  </div>
                  {/* 5. Ngrayung */}
                  <div className="w-full flex flex-col items-center gap-2 group relative">
                    <div className="absolute -top-6 bg-slate-800 text-white text-[10px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity z-20 shadow">{jiwaNgrayung} Jiwa</div>
                    <div className="w-full bg-sky-500 rounded-t-lg transition-all duration-500 ease-out hover:bg-sky-600 cursor-pointer" style={{ height: `${(jiwaNgrayung / maxJiwa) * 80 + 10}%` }}></div>
                    <span className="text-[10px] md:text-xs font-semibold text-slate-600 truncate max-w-full">Ngrayung</span>
                  </div>
                  {/* 6. Jani */}
                  <div className="w-full flex flex-col items-center gap-2 group relative">
                    <div className="absolute -top-6 bg-slate-800 text-white text-[10px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity z-20 shadow">{jiwaJani} Jiwa</div>
                    <div className="w-full bg-purple-500 rounded-t-lg transition-all duration-500 ease-out hover:bg-purple-600 cursor-pointer" style={{ height: `${(jiwaJani / maxJiwa) * 80 + 10}%` }}></div>
                    <span className="text-[10px] md:text-xs font-semibold text-slate-600 truncate max-w-full">Jani</span>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl border shadow-sm text-center"><h3 className="font-bold text-slate-900 text-lg">Swasembada Tani</h3><p className="text-xs text-slate-400 mt-1">Status Panel Desa Segunung Aktif</p></div>
            </div>
          ) : activeMenu === "warga" ? (
            /* TAB 2: DATA PENDUDUK */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Form Sektor Registrasi */}
              <div className="lg:col-span-5 bg-white p-6 rounded-2xl border shadow-sm">
                <div className="flex justify-between items-center mb-4 border-b pb-2">
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    {editId ? <Pencil className="w-4 h-4 text-amber-500" /> : <Plus className="w-4 h-4 text-indigo-600" />}
                    {editId ? "Edit Data Penduduk" : "Registrasi Penduduk"}
                  </h2>
                  {editId && (
                    <button type="button" onClick={cancelEdit} className="text-xs font-bold text-rose-500 flex items-center gap-1 hover:text-rose-600 transition-all"><XCircle className="w-3.5 h-3.5" /> Batal Edit</button>
                  )}
                </div>

                <form onSubmit={onSubmitResidentForm} className="space-y-4">
                  <div className="grid grid-cols-2 gap-2 p-1 bg-slate-50 border rounded-xl">
                    <button type="button" disabled={editId !== null} onClick={() => setJenisData("Perorangan")} className={`py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-2 ${jenisData === "Perorangan" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-500 disabled:opacity-50"}`}><User className="w-3.5 h-3.5" /> Perorangan</button>
                    <button type="button" disabled={editId !== null} onClick={() => setJenisData("Keluarga")} className={`py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-2 ${jenisData === "Keluarga" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-500 disabled:opacity-50"}`}><Home className="w-3.5 h-3.5" /> Keluarga (KK)</button>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{jenisData === "Perorangan" ? "NIK" : "Nomor Kartu Keluarga (KK)"}</label>
                    <input type="text" required value={nik} onChange={(e) => setNik(e.target.value)} placeholder={jenisData === "Perorangan" ? "16 digit angka NIK" : "16 digit nomor KK"} className="w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm outline-none focus:border-indigo-500" />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{jenisData === "Perorangan" ? "Nama Lengkap" : "Nama Kepala Keluarga"}</label>
                    <input type="text" required value={nama} onChange={(e) => setNama(e.target.value)} placeholder="Masukkan nama" className="w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm outline-none focus:border-indigo-500" />
                  </div>

                  {/* SUB FORM ANGGOTA KK DINAMIS */}
                  {jenisData === "Keluarga" && (
                    <div className="space-y-3 bg-slate-50 border p-3 rounded-xl">
                      <div className="flex items-center justify-between border-b pb-1.5">
                        <span className="text-xs font-bold text-slate-700">Anggota Keluarga</span>
                        <button type="button" onClick={addFamilyMember} className="text-xs font-bold text-indigo-600 flex items-center gap-1"><PlusCircle className="w-3.5 h-3.5" /> Tambah</button>
                      </div>
                      
                      <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-0.5">
                        {anggotaList.map((member, idx) => (
                          <div key={idx} className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-2">
                            
                            <div className="flex gap-2">
                              <input 
                                type="text" 
                                required
                                value={member.nik}
                                onChange={(e) => handleMemberChange(idx, "nik", e.target.value)} 
                                placeholder={idx === 0 ? "NIK Kepala Keluarga" : "NIK Anggota"} 
                                className="w-1/2 px-2.5 py-1.5 bg-slate-50 border rounded-lg text-xs outline-none focus:border-indigo-500 focus:bg-white" 
                              />
                              <input 
                                type="text" 
                                required 
                                value={idx === 0 ? (nama || member.nama) : member.nama} 
                                onChange={(e) => {
                                  if (idx === 0) setNama(e.target.value);
                                  handleMemberChange(idx, "nama", e.target.value);
                                }}
                                placeholder={idx === 0 ? "Nama Kepala Keluarga" : "Nama Anggota"} 
                                className="w-1/2 px-2.5 py-1.5 bg-slate-50 border rounded-lg text-xs outline-none focus:border-indigo-500 focus:bg-white" 
                              />
                            </div>

                            <div className="flex gap-2 items-center">
                              <select 
                                value={member.hubungan} 
                                disabled={idx === 0} 
                                onChange={(e) => handleMemberChange(idx, "hubungan", e.target.value)} 
                                className="w-5/12 px-2 py-1.5 bg-slate-50 border rounded-lg text-xs outline-none disabled:bg-slate-100 disabled:opacity-75"
                              >
                                <option value="Kepala Keluarga">Kepala Keluarga</option>
                                <option value="Istri">Istri</option>
                                <option value="Anak">Anak</option>
                                <option value="Orang Tua">Orang Tua</option>
                              </select>

                              <input 
                                type="text" 
                                value={member.pekerjaan} 
                                onChange={(e) => handleMemberChange(idx, "pekerjaan", e.target.value)} 
                                placeholder="Pekerjaan" 
                                className="w-1/3 px-2 py-1.5 bg-slate-50 border rounded-lg text-xs outline-none focus:border-indigo-500 focus:bg-white" 
                              />

                              <select
                                value={member.status}
                                onChange={(e) => handleMemberChange(idx, "status", e.target.value)}
                                className="w-1/4 px-2 py-1.5 bg-slate-50 border rounded-lg text-xs outline-none focus:border-indigo-500"
                              >
                                <option value="Belum Kawin">Belum Kawin</option>
                                <option value="Kawin">Kawin</option>
                                <option value="Cerai Hidup">Cerai Hidup</option>
                                <option value="Cerai Mati">Cerai Mati</option>
                              </select>

                              {idx > 0 && (
                                <button type="button" onClick={() => removeFamilyMember(idx)} className="text-rose-500 hover:text-rose-600 transition-colors pl-1"><XCircle className="w-4 h-4" /></button>
                              )}
                            </div>

                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Dusun</label>
                      <select value={dusun} onChange={(e) => setDusun(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-sm outline-none">
                        <option value="Segunung">Segunung</option>
                        <option value="Ploso">Ploso</option>
                        <option value="Sumberingin">Sumberingin</option>
                        <option value="Kebonalas">Kebonalas</option>
                        <option value="Ngrayung">Ngrayung</option>
                        <option value="Jani">Jani</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Ekonomi</label>
                      <select value={statusEkonomi} onChange={(e) => setStatusEkonomi(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-sm outline-none">
                        <option value="Mampu">Mampu</option>
                        <option value="Prasejahtera">Prasejahtera</option>
                        <option value="Sangat Mampu">Sangat Mampu</option>
                      </select>
                    </div>
                  </div>

                  <button type="submit" disabled={submitting} className={`w-full py-3 text-white text-sm font-bold rounded-xl shadow-md transition-all ${editId !== null ? "bg-amber-500 hover:bg-amber-600" : "bg-[#4F46E5] hover:bg-[#4338CA]"}`}>
                    {submitting ? "Memproses..." : editId !== null ? "Simpan Perubahan" : "Simpan Data"}
                  </button>
                </form>
              </div>

              {/* Tabel Database Tampilan Terdaftar */}
              <div className="lg:col-span-7 bg-white p-6 rounded-2xl border shadow-sm">
                <h2 className="text-base font-bold text-slate-900 mb-4 border-b pb-2">Database Terdaftar ({residents.length})</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="text-[10px] font-bold text-slate-400 border-b uppercase tracking-wider"><th className="pb-3 pl-2">Klasifikasi</th><th className="pb-3">Identitas & Susunan Komplit Anggota</th><th className="pb-3">Wilayah</th><th className="pb-3 text-center">Aksi</th></tr>
                    </thead>
                    <tbody className="text-sm divide-y">
                      {residents.map((r) => (
                        <tr key={r.id} className="hover:bg-slate-50/50">
                          <td className="py-4 pl-2"><span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${r.jenisData === "Keluarga" ? "bg-blue-50 text-blue-700 border-blue-100" : "bg-purple-50 text-purple-700 border-purple-100"}`}>{r.jenisData}</span></td>
                          <td className="py-4">
                            <div className="font-bold text-slate-900">{r.nama}</div>
                            <div className="text-xs text-slate-400 font-mono mb-2">{r.jenisData === "Keluarga" ? `No.KK: ${r.nik}` : `NIK: ${r.nik}`}</div>
                            
                            {r.jenisData === "Keluarga" && r.anggota && r.anggota.length > 0 && (
                              <div className="bg-slate-50 p-2.5 rounded-xl border text-[11px] text-slate-600 mt-2 space-y-1.5 max-w-xl">
                                {r.anggota.map((m: any, mIdx: number) => (
                                  <div key={mIdx} className="flex flex-wrap justify-between items-center border-b border-slate-200/50 pb-1 last:border-0 last:pb-0">
                                    <span className="font-bold text-slate-700">{m.nama} <span className="font-mono text-[10px] text-slate-400 font-normal">({m.nik || "Tanpa NIK"})</span></span>
                                    <div className="flex gap-1.5 text-[10px]">
                                      <span className="bg-blue-50 text-blue-700 px-1.5 py-0.2 rounded font-semibold">{m.hubungan}</span>
                                      {m.pekerjaan && <span className="bg-amber-50 text-amber-700 px-1.5 py-0.2 rounded font-semibold">{m.pekerjaan}</span>}
                                      {m.status && <span className="bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-semibold">{m.status}</span>}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </td>
                          <td className="py-4 font-medium text-slate-600">{r.dusun}</td>
                          <td className="py-4 text-center">
                            <div className="flex justify-center gap-1">
                              <button onClick={() => startEdit(r)} className="p-2 text-slate-400 hover:text-amber-500 rounded-lg hover:bg-amber-50 transition-colors" title="Edit Data"><Pencil className="w-4 h-4" /></button>
                              <button onClick={() => triggerDeleteResident(r.id, r.nama)} className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors" title="Hapus Data"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            /* ================= TAB 3: MANAJEMEN BERITA ================= */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-2xl border shadow-sm h-fit">
                <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2 border-b pb-2"><FileText className="w-4 h-4 text-indigo-600" /> Tulis Berita Baru</h2>
                <form onSubmit={handleArticleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Judul Berita</label>
                    <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Contoh: Splicing Activity" className="w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Tanggal Publikasi</label>
                    <input type="text" value={newsDate} onChange={(e) => setNewsDate(e.target.value)} placeholder="Contoh: April 25, 2026" className="w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Isi / Deskripsi</label>
                    <textarea required rows={4} value={content} onChange={(e) => setContent(e.target.value)} placeholder="Tulis deskripsi ringkas berita..." className="w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm outline-none resize-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Gambar Banner</label>
                    <input type="file" accept="image/*" required onChange={(e) => e.target.files && setNewsImage(e.target.files[0])} className="w-full text-xs text-slate-500 file:py-2 file:px-4 file:bg-indigo-50 file:text-indigo-700 file:border-0" />
                  </div>
                  <button type="submit" disabled={submitting} className="w-full py-2.5 bg-[#4F46E5] text-white text-sm font-bold rounded-xl shadow-md">{submitting ? "Menerbitkan..." : "Terbitkan Berita"}</button>
                </form>
              </div>

              <div className="lg:col-span-2 space-y-6">
                <h2 className="text-base font-bold text-slate-900 border-b pb-2">Daftar Berita Aktif ({articles.length})</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {articles.map((item) => (
                    <div key={item.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border flex flex-col justify-between relative group">
                      <div>
                        <div className="h-44 w-full bg-slate-100 relative overflow-hidden">
                          <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                          <button onClick={() => executeDelete(item.id, "berita")} className="absolute top-3 right-3 p-2 bg-white/80 rounded-xl text-rose-600 shadow-sm"><Trash2 className="w-4 h-4" /></button>
                        </div>
                        <div className="p-5">
                          <h3 className="font-bold text-base text-slate-900 leading-tight mb-2">{item.title}</h3>
                          <p className="text-slate-500 text-xs line-clamp-3 mb-4">{item.content}</p>
                        </div>
                      </div>
                      <div className="px-5 py-3 border-t bg-slate-50/50 flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                        <Calendar className="w-3.5 h-3.5" /><span>{item.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}