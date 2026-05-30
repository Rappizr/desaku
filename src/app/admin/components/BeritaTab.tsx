"use client";

import React, { useState, useEffect } from "react";
import { Pencil, FileText, XCircle, Trash2, Calendar } from "lucide-react";

interface BeritaTabProps {
  articles: any[];
  editArticleId: number | null;
  submitting: boolean;
  onStartEditArticle: (art: any) => void;
  onCancelEditArticle: () => void;
  onTriggerDeleteArticle: (id: number, title: string) => void;
  onSubmitArticle: (data: any) => void;
}

export default function BeritaTab({
  articles,
  editArticleId,
  submitting,
  onStartEditArticle,
  onCancelEditArticle,
  onTriggerDeleteArticle,
  onSubmitArticle,
}: BeritaTabProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [newsDate, setNewsDate] = useState("");
  const [newsImage, setNewsImage] = useState<File | null>(null);

  // Efek Sinkronisasi Mengisi Form saat Mode Edit Aktif
  useEffect(() => {
    if (editArticleId) {
      const target = articles.find((a) => a.id === editArticleId);
      if (target) {
        setTitle(target.title);
        setContent(target.content);
        setNewsDate(target.date);
      }
    }
  }, [editArticleId, articles]);

  // Handler Kirim Form Lokal
  const handleLocalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Kirim payload data form ke fungsi penampung di file induk (page.tsx)
    onSubmitArticle({ title, content, date: newsDate, image: newsImage });
    
    // Jika bukan mode edit (tambah berita baru), langsung bersihkan form lokal
    if (!editArticleId) {
      setTitle("");
      setContent("");
      setNewsDate("");
      setNewsImage(null);
    }
  };

  // Handler Reset Aksi saat Tombol Batal Diklik
  const handleCancel = () => {
    onCancelEditArticle();
    setTitle("");
    setContent("");
    setNewsDate("");
    setNewsImage(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* Panel Form Berita */}
      <div className="bg-white p-6 rounded-2xl border shadow-sm h-fit">
        <div className="flex justify-between items-center mb-4 border-b pb-2">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            {editArticleId ? <Pencil className="w-4 h-4 text-amber-500" /> : <FileText className="w-4 h-4 text-indigo-600" />}
            {editArticleId ? "Modifikasi Artikel" : "Tulis Berita Baru"}
          </h2>
          {editArticleId && (
            <button
              type="button"
              onClick={handleCancel}
              className="text-xs font-bold text-rose-500 flex items-center gap-1 hover:text-rose-600 transition-all"
            >
              <XCircle className="w-3.5 h-3.5" /> Batal
            </button>
          )}
        </div>

        <form onSubmit={handleLocalSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              required
              placeholder="Judul Berita"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm outline-none focus:border-indigo-500 transition-all"
            />
          </div>
          <div>
            <input
              type="text"
              placeholder="Tanggal (Contoh: April 25, 2026)"
              value={newsDate}
              onChange={(e) => setNewsDate(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm outline-none focus:border-indigo-500 transition-all"
            />
          </div>
          <div>
            <textarea
              required
              rows={5}
              placeholder="Deskripsi ringkas Berita..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm outline-none resize-none focus:border-indigo-500 transition-all"
            />
          </div>
          <div>
            <input
              type="file"
              accept="image/*"
              required={editArticleId === null}
              onChange={(e) => e.target.files && setNewsImage(e.target.files[0])}
              className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-all cursor-pointer"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className={`w-full py-3 text-white text-sm font-bold rounded-xl shadow-md transition-all ${
              editArticleId ? "bg-amber-500 hover:bg-amber-600" : "bg-[#4F46E5] hover:bg-[#4338CA]"
            }`}
          >
            {submitting ? "Memproses..." : editArticleId ? "Simpan Perubahan" : "Terbitkan Berita"}
          </button>
        </form>
      </div>

      {/* Daftar Berita Aktif */}
      <div className="lg:col-span-2 space-y-6">
        <h2 className="text-base font-bold text-slate-900 border-b pb-2">
          Daftar Berita Aktif ({articles.length})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {articles.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl overflow-hidden border flex flex-col justify-between shadow-sm hover:shadow-md transition-all"
            >
              <div className="h-44 bg-slate-100 relative overflow-hidden">
                <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                <div className="absolute top-3 right-3 flex gap-1.5">
                  <button
                    onClick={() => onStartEditArticle(item)}
                    className="p-1.5 bg-white/90 backdrop-blur-sm rounded-lg text-slate-600 hover:text-amber-500 shadow-sm transition-colors"
                    title="Edit Berita"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onTriggerDeleteArticle(item.id, item.title)}
                    className="p-1.5 bg-white/90 backdrop-blur-sm rounded-lg text-rose-600 hover:bg-rose-50 shadow-sm transition-colors"
                    title="Hapus Berita"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="p-5 flex-1">
                <h3 className="font-bold text-slate-900 mb-2 truncate">{item.title}</h3>
                <p className="text-slate-500 text-xs line-clamp-3 leading-relaxed font-medium">
                  {item.content}
                </p>
              </div>
              <div className="px-5 py-3 border-t bg-slate-50/50 flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
                <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                <span>{item.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}