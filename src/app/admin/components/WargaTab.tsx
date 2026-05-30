"use client";

import React, { useState, useEffect } from "react";
import { Pencil, Plus, XCircle, PlusCircle, User, Home, Filter, Trash2 } from "lucide-react";

interface FamilyMember {
  nik: string;
  nama: string;
  hubungan: string;
  pekerjaan: string;
  status: string;
}

interface WargaTabProps {
  residents: any[];
  editId: number | null;
  submitting: boolean;
  onStartEdit: (res: any) => void;
  onCancelEdit: () => void;
  onTriggerDelete: (id: number, name: string) => void;
  onSubmitForm: (data: any) => void;
  searchQuery: string;
}

export default function WargaTab({
  residents, editId, submitting, onStartEdit, onCancelEdit, onTriggerDelete, onSubmitForm, searchQuery
}: WargaTabProps) {
  const [jenisData, setJenisData] = useState<"Perorangan" | "Keluarga">("Perorangan");
  const [nik, setNik] = useState("");
  const [nama, setNama] = useState("");
  const [dusun, setDusun] = useState("Kebonalas");
  const [statusEkonomi, setStatusEkonomi] = useState("Mampu");
  const [filterDusun, setFilterDusun] = useState("Semua");
  const [filterEkonomi, setFilterEkonomi] = useState("Semua");
  const [anggotaList, setAnggotaList] = useState<FamilyMember[]>([
    { nik: "", nama: "", hubungan: "Kepala Keluarga", pekerjaan: "", status: "Belum Kawin" }
  ]);

  // Mengisi form otomatis saat tombol edit eksternal di-trigger
  useEffect(() => {
    if (editId) {
      const target = residents.find(r => r.id === editId);
      if (target) {
        setJenisData(target.jenisData as any || "Perorangan"); 
        setNik(target.nik); 
        setNama(target.nama);
        setDusun(target.dusun); 
        setStatusEkonomi(target.statusEkonomi);
        
        if (target.jenisData === "Keluarga" && target.anggota && target.anggota.length > 0) {
          setAnggotaList(target.anggota);
        } else {
          setAnggotaList([{ nik: "", nama: "", hubungan: "Kepala Keluarga", pekerjaan: "", status: "Belum Kawin" }]);
        }
      }
    }
  }, [editId, residents]);

  const handleLocalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let finalAnggota = [...anggotaList];
    if (jenisData === "Keluarga") {
      finalAnggota[0].nama = nama;
      finalAnggota[0].hubungan = "Kepala Keluarga";
    }
    onSubmitForm({ 
      jenisData, 
      nik, 
      nama, 
      dusun, 
      statusEkonomi, 
      anggota: jenisData === "Keluarga" ? finalAnggota : [] 
    });
    
    // Reset form jika bukan mode edit
    if (!editId) {
      setNik("");
      setNama("");
      setDusun("Kebonalas");
      setStatusEkonomi("Mampu");
      setAnggotaList([{ nik: "", nama: "", hubungan: "Kepala Keluarga", pekerjaan: "", status: "Belum Kawin" }]);
    }
  };

  const handleLocalCancel = () => {
    onCancelEdit();
    setNik("");
    setNama("");
    setDusun("Kebonalas");
    setStatusEkonomi("Mampu");
    setJenisData("Perorangan");
    setAnggotaList([{ nik: "", nama: "", hubungan: "Kepala Keluarga", pekerjaan: "", status: "Belum Kawin" }]);
  };

  const handleMemberChange = (index: number, field: keyof FamilyMember, value: string) => {
    const list = [...anggotaList];
    list[index][field] = value;
    setAnggotaList(list);
  };

  // Penapisan data multi-filter (Live Search + Dropdown Dusun + Dropdown Ekonomi)
  const filteredResidents = residents.filter((r) => {
    const matchQuery = 
      r.nama.toLowerCase().includes(searchQuery.toLowerCase()) || 
      r.nik.includes(searchQuery) ||
      (r.anggota && r.anggota.some((m: any) => m.nama.toLowerCase().includes(searchQuery.toLowerCase())));

    const matchDusun = filterDusun === "Semua" || r.dusun.toLowerCase() === filterDusun.toLowerCase();
    const matchEkonomi = filterEkonomi === "Semua" || r.statusEkonomi.toLowerCase() === filterEkonomi.toLowerCase();
    
    return matchQuery && matchDusun && matchEkonomi;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      {/* SEKTOR KIRI: FORM REGISTRASI & EDIT */}
      <div className="lg:col-span-5 bg-white p-6 rounded-2xl border shadow-sm">
        <div className="flex justify-between items-center mb-4 border-b pb-2">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            {editId ? <Pencil className="w-4 h-4 text-amber-500" /> : <Plus className="w-4 h-4 text-indigo-600" />}
            {editId ? "Edit Data Penduduk" : "Registrasi Penduduk"}
          </h2>
          {editId && (
            <button type="button" onClick={handleLocalCancel} className="text-xs font-bold text-rose-500 flex items-center gap-1 hover:text-rose-600 transition-all">
              <XCircle className="w-3.5 h-3.5" /> Batal Edit
            </button>
          )}
        </div>

        <form onSubmit={handleLocalSubmit} className="space-y-4">
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
            <input type="text" required value={nama} onChange={(e) => setNama(e.target.value)} placeholder="Masukkan nama lengkap" className="w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm outline-none focus:border-indigo-500" />
          </div>

          {/* INPUT FORM DINAMIS UNTUK ANGGOTA KELUARGA */}
          {jenisData === "Keluarga" && (
            <div className="space-y-3 bg-slate-50 border p-3 rounded-xl">
              <div className="flex items-center justify-between border-b pb-1.5">
                <span className="text-xs font-bold text-slate-700">Susunan Anggota Keluarga</span>
                <button type="button" onClick={() => setAnggotaList([...anggotaList, { nik: "", nama: "", hubungan: "Anak", pekerjaan: "", status: "Belum Kawin" }])} className="text-xs font-bold text-indigo-600 flex items-center gap-1"><PlusCircle className="w-3.5 h-3.5" /> Tambah</button>
              </div>
              <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-0.5">
                {anggotaList.map((member, idx) => (
                  <div key={idx} className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-2">
                    <div className="flex gap-2">
                      <input type="text" required value={member.nik} onChange={(e) => handleMemberChange(idx, "nik", e.target.value)} placeholder={idx === 0 ? "NIK Kepala Keluarga" : "NIK Anggota"} className="w-1/2 px-2.5 py-1.5 bg-slate-50 border rounded-lg text-xs outline-none focus:border-indigo-500 focus:bg-white" />
                      <input type="text" required value={idx === 0 ? (nama || member.nama) : member.nama} onChange={(e) => { if (idx === 0) setNama(e.target.value); handleMemberChange(idx, "nama", e.target.value); }} placeholder={idx === 0 ? "Nama Kepala Keluarga" : "Nama Anggota"} className="w-1/2 px-2.5 py-1.5 bg-slate-50 border rounded-lg text-xs outline-none focus:border-indigo-500 focus:bg-white" />
                    </div>
                    <div className="flex gap-2 items-center">
                      <select value={member.hubungan} disabled={idx === 0} onChange={(e) => handleMemberChange(idx, "hubungan", e.target.value)} className="w-5/12 px-2 py-1.5 bg-slate-50 border rounded-lg text-xs outline-none disabled:bg-slate-100">
                        <option value="Kepala Keluarga">Kepala Keluarga</option>
                        <option value="Istri">Istri</option>
                        <option value="Anak">Anak</option>
                        <option value="Orang Tua">Orang Tua</option>
                      </select>
                      <input type="text" value={member.pekerjaan} onChange={(e) => handleMemberChange(idx, "pekerjaan", e.target.value)} placeholder="Pekerjaan" className="w-1/3 px-2 py-1.5 bg-slate-50 border rounded-lg text-xs outline-none focus:border-indigo-500" />
                      <select value={member.status} onChange={(e) => handleMemberChange(idx, "status", e.target.value)} className="w-1/4 px-2 py-1.5 bg-slate-50 border rounded-lg text-xs outline-none focus:border-indigo-500">
                        <option value="Belum Kawin">Belum Kawin</option>
                        <option value="Kawin">Kawin</option>
                        <option value="Cerai Hidup">Cerai Hidup</option>
                        <option value="Cerai Mati">Cerai Mati</option>
                      </select>
                      {idx > 0 && <button type="button" onClick={() => { const l = [...anggotaList]; l.splice(idx, 1); setAnggotaList(l); }} className="text-rose-500 hover:text-rose-600 pl-1"><XCircle className="w-4 h-4" /></button>}
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
          <button type="submit" disabled={submitting} className={`w-full py-3 text-white text-sm font-bold rounded-xl shadow-md transition-all ${editId ? "bg-amber-500 hover:bg-amber-600" : "bg-[#4F46E5] hover:bg-[#4338CA]"}`}>
            {submitting ? "Memproses..." : editId ? "Simpan Perubahan" : "Simpan Data"}
          </button>
        </form>
      </div>

      {/* SEKTOR KANAN: TABEL DATABASE UTAMA */}
      <div className="lg:col-span-7 bg-white p-6 rounded-2xl border shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 border-b pb-3">
          <h2 className="text-base font-bold text-slate-900">Database Terdaftar ({filteredResidents.length})</h2>
          
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select value={filterDusun} onChange={(e) => setFilterDusun(e.target.value)} className="bg-slate-50 border rounded-lg px-2 py-1 outline-none">
              <option value="Semua">Semua Dusun</option>
              <option value="Segunung">Segunung</option>
              <option value="Ploso">Ploso</option>
              <option value="Sumberingin">Sumberingin</option>
              <option value="Kebonalas">Kebonalas</option>
              <option value="Ngrayung">Ngrayung</option>
              <option value="Jani">Jani</option>
            </select>
            <select value={filterEkonomi} onChange={(e) => setFilterEkonomi(e.target.value)} className="bg-slate-50 border rounded-lg px-2 py-1 outline-none">
              <option value="Semua">Semua Ekonomi</option>
              <option value="Mampu">Mampu</option>
              <option value="Prasejahtera">Prasejahtera</option>
              <option value="Sangat Mampu">Sangat Mampu</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] font-bold text-slate-400 border-b uppercase tracking-wider">
                <th className="pb-3 pl-2">Klasifikasi</th>
                <th className="pb-3">Identitas & Struktur Lengkap Anggota</th>
                <th className="pb-3">Wilayah</th>
                <th className="pb-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y">
              {filteredResidents.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-xs text-slate-400 font-medium">Data warga tidak ditemukan atau tidak cocok dengan parameter filter.</td>
                </tr>
              ) : (
                filteredResidents.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="py-4 pl-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${r.jenisData === "Keluarga" ? "bg-blue-50 text-blue-700 border-blue-100" : "bg-purple-50 text-purple-700 border-purple-100"}`}>
                        {r.jenisData}
                      </span>
                    </td>
                    <td className="py-4 pr-3">
                      <div className="font-bold text-slate-900">{r.nama}</div>
                      <div className="text-xs text-slate-400 font-mono mb-1">{r.jenisData === "Keluarga" ? `No.KK: ${r.nik}` : `NIK: ${r.nik}`}</div>
                      
                      {/* SUB-LIST DETIL ANGGOTA KELUARGA DALAM TABEL */}
                      {r.jenisData === "Keluarga" && r.anggota && r.anggota.length > 0 && (
                        <div className="bg-slate-50 p-2.5 rounded-xl border text-[11px] text-slate-600 mt-2 space-y-1.5 max-w-xl">
                          {r.anggota.map((m: any, mIdx: number) => (
                            <div key={mIdx} className="flex flex-wrap justify-between items-center border-b border-slate-200/50 pb-1 last:border-0 last:pb-0">
                              <span className="font-bold text-slate-700">{m.nama} <span className="font-mono text-[10px] text-slate-400 font-normal">({m.nik || "Tanpa NIK"})</span></span>
                              <div className="flex gap-1 text-[9px] font-bold">
                                <span className="bg-blue-50 text-blue-700 px-1.5 py-0.2 rounded">{m.hubungan}</span>
                                {m.pekerjaan && <span className="bg-amber-50 text-amber-700 px-1.5 py-0.2 rounded">{m.pekerjaan}</span>}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="py-4">
                      <div className="font-medium text-slate-600">{r.dusun}</div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">{r.statusEkonomi}</div>
                    </td>
                    <td className="py-4 text-center">
                      <div className="flex justify-center gap-1">
                        <button onClick={() => onStartEdit(r)} className="p-2 text-slate-400 hover:text-amber-500 rounded-lg hover:bg-amber-50 transition-colors"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => onTriggerDelete(r.id, r.nama)} className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}