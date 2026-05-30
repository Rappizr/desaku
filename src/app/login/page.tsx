"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  
  // Form States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  // UI Status States
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        // Jika login sukses, arahkan ke halaman dashboard admin
        router.push("/admin"); 
      } else {
        setErrorMessage(data.message || "Email atau password salah.");
      }
    } catch (error) {
      setErrorMessage("Terjadi kesalahan jaringan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F4F9] flex items-center justify-center p-4 font-sans antialiased text-slate-800">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-xl border border-slate-100 overflow-hidden p-8 relative">
        
        {/* Dekorasi Aksen Warna Atas (Senada dengan Dashboard Indigo) */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-[#4F46E5]" />

        {/* Header/Logo Section */}
        <div className="flex flex-col items-center text-center mt-4 mb-8">
          <div className="w-16 h-16 overflow-hidden rounded-2xl shadow-md border border-slate-100 bg-white flex items-center justify-center mb-4">
            <img src="/logoDesa.png" alt="Logo Desa" className="w-full h-full object-cover" />
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Segunung Admin Portal</h2>
          <p className="text-xs text-slate-400 font-medium mt-1">Silakan masuk untuk mengelola pangkalan data desa</p>
        </div>

        {/* Notifikasi Error Kustom */}
        {errorMessage && (
          <div className="mb-5 p-3.5 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-xs font-semibold flex items-center gap-2 animate-pulse">
            <span>⚠️ {errorMessage}</span>
          </div>
        )}

        {/* Form Login */}
        <form onSubmit={handleLogin} className="space-y-5">
          
          {/* Input Email */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Akses Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@segunung.desa.id" 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm outline-none focus:border-[#4F46E5] focus:bg-white transition-all font-medium"
              />
            </div>
          </div>

          {/* Input Password */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Kata Sandi</label>
              <a href="#" className="text-[10px] font-bold text-[#4F46E5] hover:underline">Lupa Sandi?</a>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input 
                type={showPassword ? "text" : "password"} 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-11 py-3 text-sm outline-none focus:border-[#4F46E5] focus:bg-white transition-all font-mono tracking-widest"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Opsi Ingat Saya */}
          <div className="flex items-center gap-2 pt-1">
            <input 
              type="checkbox" 
              id="remember" 
              className="w-4 h-4 rounded text-[#4F46E5] focus:ring-[#4F46E5] border-slate-300 accent-[#4F46E5]"
            />
            <label htmlFor="remember" className="text-xs font-semibold text-slate-500 select-none cursor-pointer">Ingat sesi perangkat ini</label>
          </div>

          {/* Tombol Sign In */}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3.5 bg-[#4F46E5] hover:bg-[#4338CA] disabled:bg-slate-300 text-white text-sm font-bold rounded-xl shadow-md shadow-indigo-100 hover:shadow-lg transition-all flex items-center justify-center gap-2 group mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Memverifikasi Akses...</span>
              </>
            ) : (
              <>
                <span>Masuk ke Dashboard</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>

        </form>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-slate-100 text-center text-[10px] font-medium text-slate-400">
          Sistem Informasi Kependudukan &copy; 2026
        </div>

      </div>
    </div>
  );
}