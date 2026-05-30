"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Users, Newspaper, LayoutDashboard, Search, Bell, Mail, 
  CheckCircle2, AlertTriangle, HelpCircle, LogOut, Loader2 
} from "lucide-react";

import OverviewTab from "./components/OverviewTab";
import WargaTab from "./components/WargaTab";
import BeritaTab from "./components/BeritaTab";

interface Resident { id: number; nik: string; nama: string; dusun: string; statusEkonomi: string; jenisData: string; anggota: any[]; }
interface Article { id: number; title: string; content: string; imageUrl: string; date: string; }
interface AdminProfile { id: number; nama: string; email: string; }

export default function AdminDashboard() {
  const router = useRouter();
  const [activeMenu, setActiveMenu] = useState<"overview" | "warga" | "berita">("overview");
  const [residents, setResidents] = useState<Resident[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [admin, setAdmin] = useState<AdminProfile>({ id: 0, nama: "Loading...", email: "" });

  const [editId, setEditId] = useState<number | null>(null);
  const [editArticleId, setEditArticleId] = useState<number | null>(null);
  const [toast, setToast] = useState({ show: false, type: "success" as "success" | "error", message: "" });
  const [confirmModal, setConfirmModal] = useState<any>({ show: false, type: null, title: "", message: "", onConfirm: () => {} });

  useEffect(() => { loadData(); loadAdminProfile(); }, []);

  const loadAdminProfile = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) setAdmin(await res.json());
      else setAdmin({ id: 0, nama: "Administrator", email: "admin@segunung.desa.id" });
    } catch { setAdmin({ id: 0, nama: "Admin Desa", email: "" }); }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [resWarga, resBerita] = await Promise.all([fetch("/api/residents"), fetch("/api/articles")]);
      if (resWarga.ok) setResidents(await resWarga.json());
      if (resBerita.ok) setArticles(await resBerita.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ show: true, type, message });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 4000);
  };

  // Trigger Modal Keluar Aplikasi
  const triggerLogout = () => {
    setConfirmModal({
      show: true,
      type: "logout",
      title: "Konfirmasi Keluar Sesi",
      message: "Apakah Anda yakin ingin keluar dari portal administrator? Sesi pangkalan data Anda akan ditutup demi keamanan.",
      onConfirm: async () => {
        setConfirmModal({ show: false });
        try {
          const res = await fetch("/api/auth/logout", { method: "POST" });
          if (res.ok) {
            router.push("/login");
          } else {
            showToast("error", "Gagal membersihkan cookie sesi jaringan.");
          }
        } catch {
          showToast("error", "Terjadi kesalahan koneksi pemutusan sesi.");
        }
      }
    });
  };

  // Handler Kirim Form Kependudukan (POST/PUT dengan return status)
  const handleResidentSubmit = async (formData: any) => {
    setConfirmModal({ show: false });
    setSubmitting(true);
    const isEdit = editId !== null;
    try {
      const res = await fetch("/api/residents", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editId, ...formData }),
      });
      if (res.ok) {
        setEditId(null);
        await loadData();
        showToast("success", isEdit ? "Data kependudukan berhasil diperbarui!" : "Data penduduk disimpan!");
        return true;
      } else { 
        showToast("error", "Gagal memproses data."); 
        return false;
      }
    } catch { 
      showToast("error", "Terjadi kesalahan koneksi database."); 
      return false;
    } finally { 
      setSubmitting(false); 
    }
  };

  // Handler Kirim Form Berita (POST/PUT via FormData dengan return status)
  const handleArticleSubmit = async (formDataPayload: any) => {
    setConfirmModal({ show: false });
    setSubmitting(true);
    const isEdit = editArticleId !== null;
    try {
      const bodyData = new FormData();
      bodyData.append("title", formDataPayload.title);
      bodyData.append("content", formDataPayload.content);
      bodyData.append("date", formDataPayload.date);
      if (formDataPayload.image) bodyData.append("image", formDataPayload.image);
      if (isEdit) bodyData.append("id", editArticleId!.toString());

      const res = await fetch("/api/articles", { method: isEdit ? "PUT" : "POST", body: bodyData });
      if (res.ok) {
        setEditArticleId(null);
        await loadData();
        showToast("success", isEdit ? "Berita berhasil diubah!" : "Berita berhasil terbit!");
        return true;
      } else { 
        showToast("error", "Gagal memproses berita."); 
        return false;
      }
    } catch { 
      showToast("error", "Gagal menyambungkan ke server."); 
      return false;
    } finally { 
      setSubmitting(false); 
    }
  };

  const triggerDelete = (id: number, type: "warga" | "berita", name: string) => {
    setConfirmModal({
      show: true, 
      type: "delete", 
      title: type === "warga" ? "Hapus Arsip Kependudukan" : "Hapus Berita Desa",
      message: `Apakah Anda yakin ingin menghapus "${name}" secara permanen dari sistem? Tindakan ini tidak dapat dibatalkan.`,
      onConfirm: async () => {
        setConfirmModal({ show: false });
        const res = await fetch(type === "warga" ? `/api/residents?id=${id}` : `/api/articles?id=${id}`, { method: "DELETE" });
        if (res.ok) { loadData(); showToast("success", "Arsip berhasil dihapus."); }
        else { showToast("error", "Gagal menghapus berkas."); }
      }
    });
  };

  const keluargaCount = residents.filter(r => r.jenisData === "Keluarga").length;
  
  // SINKRONISASI LOGIKA HITUNG JIWA RIIL (SAMA DENGAN OVERVIEW TAB)
  const jiwaCount = residents.reduce((total, r) => {
    if (r.jenisData === "Perorangan" || !r.jenisData) {
      return total + 1;
    } else if (r.jenisData === "Keluarga" && r.anggota) {
      return total + r.anggota.length;
    }
    return total;
  }, 0);

  return (
    <div className="min-h-screen bg-[#F0F4F9] text-slate-800 flex font-sans antialiased relative">
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r flex flex-col fixed inset-y-0 left-0 z-40">
        <div className="h-20 px-6 flex items-center gap-3 border-b">
          <div className="w-10 h-10 overflow-hidden rounded-xl bg-white flex items-center justify-center shadow-inner"><img src="/logoDesa.png" alt="Logo" className="w-full h-full object-cover" /></div>
          <span className="font-bold text-base text-[#1E293B]">Segunung Admin</span>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1.5">
          <button onClick={() => { setEditId(null); setEditArticleId(null); setActiveMenu("overview"); }} className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all ${activeMenu === "overview" ? "bg-[#E0E7FF] text-[#4F46E5]" : "text-slate-500 hover:bg-slate-50"}`}><LayoutDashboard className="w-5 h-5" /> Dashboard</button>
          <button onClick={() => { setEditArticleId(null); setActiveMenu("warga"); }} className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all ${activeMenu === "warga" ? "bg-[#E0E7FF] text-[#4F46E5]" : "text-slate-500 hover:bg-slate-50"}`}><Users className="w-5 h-5" /> Data Penduduk</button>
          <button onClick={() => { setEditId(null); setActiveMenu("berita"); }} className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all ${activeMenu === "berita" ? "bg-[#E0E7FF] text-[#4F46E5]" : "text-slate-500 hover:bg-slate-50"}`}><Newspaper className="w-5 h-5" /> Berita Desa</button>
        </nav>
        <div className="p-4 border-t">
          <button onClick={triggerLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-rose-500 hover:bg-rose-50 rounded-xl transition-all">
            <LogOut className="w-4 h-4" /> Keluar Sesi
          </button>
        </div>
      </aside>

      {/* BODY ARSIP CONTENT */}
      <div className="flex-1 pl-64 flex flex-col min-h-screen">
        <div className="bg-[#4F46E5] h-52 w-full pt-4 px-8">
          <header className="flex items-center justify-between h-14">
            <div className="relative w-80">
              <Search className="w-4 h-4 text-white/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input type="text" placeholder="Cari data global..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-white/15 border rounded-xl pl-10 pr-4 py-2 text-sm text-white outline-none focus:bg-white/20" />
            </div>
            <div className="flex items-center gap-4 text-white">
              <div className="flex items-center gap-3 border-l pl-2 border-white/20">
                <img src="/logoDesa.png" className="w-9 h-9 rounded-full bg-white object-cover" />
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-bold">{admin.nama}</div><div className="text-[10px] text-white/70 truncate max-w-[140px]">{admin.email}</div>
                </div>
              </div>
            </div>
          </header>
        </div>

        {/* CONTAINER SUB TAB DYNAMIC SPLITTING */}
        <div className="px-8 -mt-24 pb-12 flex-1 z-10">
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-5 rounded-2xl border shadow-sm"><span className="text-xs font-bold text-slate-400 block uppercase">Total Penduduk</span><span className="text-2xl font-black text-slate-900 block mt-1">{jiwaCount} Jiwa</span></div>
            <div className="bg-white p-5 rounded-2xl border shadow-sm"><span className="text-xs font-bold text-slate-400 block uppercase">Total Keluarga</span><span className="text-2xl font-black text-slate-900 block mt-1">{keluargaCount} KK</span></div>
            <div className="bg-white p-5 rounded-2xl border shadow-sm"><span className="text-xs font-bold text-slate-400 block uppercase">Kelompok Tani</span><span className="text-2xl font-black text-slate-900 block mt-1">8 Poktan</span></div>
            <div className="bg-white p-5 rounded-2xl border shadow-sm"><span className="text-xs font-bold text-slate-400 block uppercase">Berita Terbit</span><span className="text-2xl font-black text-slate-900 block mt-1">{articles.length} Post</span></div>
          </section>

          {loading ? (
            <div className="bg-white p-20 rounded-2xl border shadow-sm flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>
          ) : activeMenu === "overview" ? (
            <OverviewTab residents={residents} />
          ) : activeMenu === "warga" ? (
            <WargaTab residents={residents} editId={editId} submitting={submitting} onStartEdit={(res) => setEditId(res.id)} onCancelEdit={() => setEditId(null)} onTriggerDelete={(id, name) => triggerDelete(id, "warga", name)} onSubmitForm={handleResidentSubmit} searchQuery={searchQuery} />
          ) : (
            <BeritaTab articles={articles} editArticleId={editArticleId} submitting={submitting} onStartEditArticle={(art) => setEditArticleId(art.id)} onCancelEditArticle={() => setEditArticleId(null)} onTriggerDeleteArticle={(id, title) => triggerDelete(id, "berita", title)} onSubmitArticle={handleArticleSubmit} />
          )}
        </div>
      </div>

      {/* CONFIRMATION DIALOG MODAL */}
      {confirmModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="bg-white max-w-md w-full rounded-2xl p-6 shadow-2xl border animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center border flex-shrink-0 ${confirmModal.type === "delete" ? "bg-rose-50 text-rose-600 border-rose-100" : "bg-blue-50 text-blue-600 border-blue-100"}`}>
                {confirmModal.type === "delete" ? <AlertTriangle className="w-5 h-5" /> : <HelpCircle className="w-5 h-5" />}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-900 text-base leading-tight">{confirmModal.title}</h3>
                <p className="text-slate-500 text-xs mt-1.5 leading-relaxed font-medium">{confirmModal.message}</p>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-slate-100">
              <button type="button" onClick={() => setConfirmModal({ show: false })} className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-50 rounded-xl transition-all">Batal</button>
              <button type="button" onClick={confirmModal.onConfirm} className={`px-4 py-2 text-xs font-bold text-white rounded-xl shadow-md transition-all ${confirmModal.type === "delete" ? "bg-rose-500 hover:bg-rose-600" : "bg-blue-600 hover:bg-blue-700"}`}>Konfirmasi</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}