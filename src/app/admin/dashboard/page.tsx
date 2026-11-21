'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  School, 
  GraduationCap, 
  Camera, 
  MessageSquare, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Download,
  Settings,
  Sparkles
} from 'lucide-react';
import AdminSidebar from '@/components/AdminSidebar';
import { useToast } from '@/components/Toast';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [stats, setStats] = useState<any>({});
  const [pendingItems, setPendingItems] = useState<any>({ students: [], memories: [], messages: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (!data.user) router.push('/login');
        else if (data.user.role !== 'ADMIN') router.push('/student/dashboard');
        else loadData();
      })
      .catch(() => router.push('/login'));
  }, [router]);

  const loadData = async () => {
    try {
      const [statsRes, modRes] = await Promise.all([
        fetch('/api/stats').then((r) => r.json()),
        fetch('/api/moderation').then((r) => r.json()),
      ]);

      if (statsRes.stats) setStats(statsRes.stats);
      if (modRes.pending) setPendingItems(modRes.pending);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickApprove = async (type: string, id: string) => {
    try {
      const res = await fetch('/api/moderation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, id, action: 'APPROVE' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast('Berhasil disetujui!', 'success');
      loadData();
    } catch (err: any) {
      toast(err.message || 'Gagal memproses', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="w-8 h-8 border-4 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const statCards = [
    { label: 'Total Siswa', val: stats.totalStudents || 0, icon: Users, color: 'text-navy', bg: 'bg-navy-50', link: '/admin/students' },
    { label: 'Profil Disetujui', val: stats.approvedStudents || 0, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', link: '/admin/students?status=APPROVED' },
    { label: 'Kelas (9A - 9G)', val: stats.totalClasses || 7, icon: School, color: 'text-gold-dark', bg: 'bg-gold/15', link: '/admin/classes' },
    { label: 'Menunggu Review', val: (pendingItems.students?.length || 0) + (pendingItems.memories?.length || 0) + (pendingItems.messages?.length || 0), icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', link: '/admin/moderation' },
    { label: 'Foto Kenangan', val: stats.totalMemories || 0, icon: Camera, color: 'text-dusty-blue', bg: 'bg-dusty-blue/20', link: '/admin/memories' },
    { label: 'Pesan & Surat', val: stats.totalMessages || 0, icon: MessageSquare, color: 'text-purple-600', bg: 'bg-purple-50', link: '/admin/messages' },
  ];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-cream">
      <AdminSidebar />

      <main className="flex-1 p-6 sm:p-10 lg:p-12 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-gold-dark">
                Admin Control Center
              </span>
              <h1 className="font-serif text-3xl font-bold text-navy-950 mt-1">
                Dashboard Overview
              </h1>
              <p className="text-xs sm:text-sm text-charcoal-light mt-0.5">
                Pengelolaan Buku Kenangan Digital SMPN 1 Rajapolah • Tahun Pelajaran 2026/2027
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <Link
                href="/admin/export"
                className="px-4 py-2 rounded-xl bg-white border border-navy-200 text-xs font-semibold text-navy hover:bg-navy-50 transition shadow-sm flex items-center space-x-1.5"
              >
                <Download className="w-3.5 h-3.5 text-gold-dark" />
                <span>Export Data</span>
              </Link>
              <Link
                href="/"
                target="_blank"
                className="px-4 py-2 rounded-xl bg-gold hover:bg-gold-light text-navy-950 text-xs font-bold transition shadow-sm"
              >
                Website Publik &rarr;
              </Link>
            </div>
          </div>

          {/* Key Stat Cards Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {statCards.map((c, idx) => {
              const Icon = c.icon;
              return (
                <Link
                  key={idx}
                  href={c.link}
                  className="p-5 rounded-3xl bg-white border border-navy-100 shadow-sm hover:shadow-md transition flex flex-col justify-between group"
                >
                  <div className={`w-10 h-10 rounded-2xl ${c.bg} ${c.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-serif text-2xl font-bold text-navy-950">{c.val}</span>
                    <p className="text-[11px] text-charcoal-light mt-0.5 leading-tight">{c.label}</p>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Pending Approval Center */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-navy-100 shadow-sm">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-gold-dark" />
                <h3 className="font-serif text-xl font-bold text-navy-950">
                  Antrean Moderasi Konten (Pending Review)
                </h3>
              </div>
              <Link
                href="/admin/moderation"
                className="text-xs font-semibold text-gold-dark hover:underline flex items-center space-x-1"
              >
                <span>Lihat Semua Moderasi</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {pendingItems.students && pendingItems.students.length > 0 ? (
              <div className="space-y-3">
                <p className="text-xs text-charcoal-light mb-2">Profil Siswa yang Mengajukan Persetujuan:</p>
                {pendingItems.students.map((st: any) => (
                  <div
                    key={st.id}
                    className="p-4 rounded-2xl bg-cream-50 border border-navy-100/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center space-x-4">
                      <img
                        src={st.profilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                        alt={st.fullName}
                        className="w-11 h-11 rounded-full object-cover border border-gold"
                      />
                      <div>
                        <h4 className="font-serif font-bold text-sm text-navy-950">{st.fullName}</h4>
                        <p className="text-[11px] text-dusty-blue">Kelas {st.class?.className || 'IX'} • “{st.nickname}”</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 self-end sm:self-auto">
                      <Link
                        href={`/students/${st.slug}`}
                        target="_blank"
                        className="px-3.5 py-1.5 rounded-xl bg-white border border-gray-200 text-xs font-semibold text-navy hover:bg-gray-50 transition"
                      >
                        Pratinjau
                      </Link>
                      <button
                        onClick={() => handleQuickApprove('STUDENT', st.id)}
                        className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm"
                      >
                        Setujui (Approve)
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-xs text-charcoal-light">
                ✨ Tidak ada profil siswa atau foto yang sedang menunggu persetujuan. Semua telah dimoderasi!
              </div>
            )}
          </div>

          {/* Quick Shortcuts */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <Link
              href="/admin/students"
              className="p-6 rounded-3xl bg-white border border-navy-100 hover:border-gold shadow-sm hover:shadow-lg transition group"
            >
              <h4 className="font-serif text-lg font-bold text-navy-950 group-hover:text-gold-dark transition mb-1">
                Kelola Data Siswa
              </h4>
              <p className="text-xs text-charcoal-light leading-relaxed">
                Tambah siswa baru, edit biodata, reset password, dan pantau status kelengkapan profil.
              </p>
            </Link>

            <Link
              href="/admin/classes"
              className="p-6 rounded-3xl bg-white border border-navy-100 hover:border-gold shadow-sm hover:shadow-lg transition group"
            >
              <h4 className="font-serif text-lg font-bold text-navy-950 group-hover:text-gold-dark transition mb-1">
                Kelola Kelas 9A — 9G
              </h4>
              <p className="text-xs text-charcoal-light leading-relaxed">
                Atur wali kelas, unggah foto kenangan kelas, tentukan motto, dan deskripsi kelas.
              </p>
            </Link>

            <Link
              href="/admin/settings"
              className="p-6 rounded-3xl bg-white border border-navy-100 hover:border-gold shadow-sm hover:shadow-lg transition group"
            >
              <h4 className="font-serif text-lg font-bold text-navy-950 group-hover:text-gold-dark transition mb-1">
                Pengaturan Buku Kenangan
              </h4>
              <p className="text-xs text-charcoal-light leading-relaxed">
                Ubah batas waktu pengisian, nama angkatan, tagline sekolah, dan kontrol akses publik.
              </p>
            </Link>
          </div>

        </div>
      </main>
    </div>
  );
}
