'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BookOpen, User, Lock, Eye, EyeOff, LogIn, Sparkles, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/Toast';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!identifier || !password) {
      setErrorMsg('Harap isi username/email dan password.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.message || 'Login gagal.');
        toast(data.message || 'Login gagal.', 'error');
        setLoading(false);
        return;
      }

      toast(`Selamat datang, ${data.user.fullName || data.user.username}!`, 'success');

      // Redirect based on role
      if (data.user.role === 'ADMIN') {
        router.push('/admin/dashboard');
      } else {
        router.push('/student/dashboard');
      }
      router.refresh();
    } catch (err: any) {
      setErrorMsg('Terjadi kesalahan jaringan.');
      setLoading(false);
    }
  };

  // Quick Demo Login Fillers
  const fillAdmin = () => {
    setIdentifier('admin');
    setPassword('admin123');
    setErrorMsg('');
  };

  const fillStudent = () => {
    setIdentifier('siswa9a1');
    setPassword('siswa123');
    setErrorMsg('');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative bg-cream">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-1/4 left-1/3 w-80 h-80 bg-gold/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-navy/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full relative z-10">
        
        {/* Card Header & Brand */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-3 mb-3 group">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center text-navy font-bold shadow-lg transform group-hover:scale-105 transition">
              <BookOpen className="w-6 h-6 text-navy-950" />
            </div>
          </Link>
          <h2 className="font-serif text-3xl font-bold text-navy-950">
            MEMORIES 2027
          </h2>
          <p className="text-xs text-charcoal-light mt-1 uppercase tracking-wider">
            Digital Yearbook SMPN 1 Rajapolah
          </p>
          <p className="text-sm text-charcoal mt-2">
            Silakan masuk untuk mengelola atau melengkapi buku kenangan.
          </p>
        </div>

        {/* Login Box */}
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-navy-100/80">
          
          {errorMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-start space-x-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Username / Email */}
            <div>
              <label className="block text-xs font-semibold text-navy-900 uppercase tracking-wider mb-1.5">
                Username atau Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Contoh: admin atau siswa9a1"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-gold focus:ring-2 focus:ring-gold/20 text-sm outline-none transition"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-navy-900 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password akun"
                  required
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 focus:border-gold focus:ring-2 focus:ring-gold/20 text-sm outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-navy transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center space-x-2 text-charcoal cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded text-gold focus:ring-gold"
                />
                <span>Ingat saya</span>
              </label>
              <button
                type="button"
                onClick={() => toast('Hubungi Admin atau Wali Kelas Anda untuk reset password.', 'info')}
                className="text-gold-dark hover:underline font-medium"
              >
                Lupa Password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-navy hover:bg-navy-800 text-white font-semibold text-sm transition shadow-md hover:shadow-lg flex items-center justify-center space-x-2 disabled:opacity-70"
            >
              <LogIn className="w-4 h-4 text-gold" />
              <span>{loading ? 'Memverifikasi...' : 'Masuk Sekarang'}</span>
            </button>
          </form>

          {/* Quick Demo Credentials Assistant */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <div className="flex items-center justify-between text-xs text-charcoal-light mb-3">
              <span className="font-semibold uppercase tracking-wider">Akses Cepat Uji Coba:</span>
              <Sparkles className="w-3.5 h-3.5 text-gold" />
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={fillAdmin}
                className="py-2 px-3 rounded-lg bg-navy-50 hover:bg-navy-100 text-navy-900 border border-navy-200 text-xs font-medium transition text-center"
              >
                Akun Admin
                <span className="block text-[10px] text-gray-500 font-normal">admin / admin123</span>
              </button>
              <button
                type="button"
                onClick={fillStudent}
                className="py-2 px-3 rounded-lg bg-cream-100 hover:bg-cream-200 text-navy-900 border border-gold/40 text-xs font-medium transition text-center"
              >
                Akun Siswa 9A
                <span className="block text-[10px] text-gray-500 font-normal">siswa9a1 / siswa123</span>
              </button>
            </div>
          </div>

        </div>

        {/* Note */}
        <p className="text-center text-xs text-dusty-blue mt-6">
          Aplikasi Buku Kenangan Resmi SMPN 1 Rajapolah • Tahun Pelajaran 2026/2027
        </p>

      </div>
    </div>
  );
}
