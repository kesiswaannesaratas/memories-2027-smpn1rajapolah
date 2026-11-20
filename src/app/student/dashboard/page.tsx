'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  User, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Eye, 
  Edit3, 
  Camera, 
  MessageSquare, 
  School, 
  Sparkles,
  Calendar,
  ArrowRight
} from 'lucide-react';
import StudentSidebar from '@/components/StudentSidebar';

export default function StudentDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (!data.user) {
          router.push('/login');
        } else if (data.user.role === 'ADMIN') {
          router.push('/admin/dashboard');
        } else {
          setUser(data.user);
        }
      })
      .catch(() => router.push('/login'))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="w-8 h-8 border-4 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const student = user?.student || {};

  // Calculate profile completion percentage
  const fields = [
    student.fullName,
    student.nickname,
    student.profilePhoto,
    student.hobbies,
    student.motto,
    student.favoriteSubject,
    student.favoriteFood,
    student.favoriteSong,
    student.favoritePlace,
    student.describeThreeWords,
    student.funniestMoment,
    student.unforgettableMemory,
    student.schoolStory,
    student.dream,
    student.futureSchool,
    student.favoriteQuote,
  ];
  const filledCount = fields.filter(Boolean).length;
  const progressPercent = Math.round((filledCount / fields.length) * 100);

  return (
    <div className="min-h-screen flex bg-cream">
      {/* Student Sidebar */}
      <StudentSidebar
        studentName={student.fullName || user.username}
        studentClass={user.className || 'IX'}
        studentSlug={student.slug}
        profileStatus={student.profileStatus || 'DRAFT'}
      />

      {/* Main Content Area */}
      <main className="flex-1 p-6 sm:p-10 lg:p-12 overflow-y-auto">
        <div className="max-w-5xl mx-auto space-y-8">
          
          {/* Welcome Banner */}
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-navy-950 via-navy to-navy-900 text-white p-8 sm:p-10 shadow-xl border border-navy-800">
            <div className="relative z-10 max-w-2xl">
              <span className="text-xs px-3 py-1 rounded-full bg-gold/20 text-gold border border-gold/30 font-semibold uppercase tracking-wider inline-block mb-3">
                Portal Siswa Kelas IX • 2026/2027
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-warm-white leading-tight">
                Hi, {student.nickname || student.fullName || user.username}! <br />
                Let’s make your memories unforgettable.
              </h1>
              <p className="text-xs sm:text-sm text-cream-200 mt-3 font-light leading-relaxed">
                Ini adalah lembar kenangan pribadimu. Lengkapi biodata, ceritakan momen paling berkesan, dan unggah foto-foto terbaikmu sebelum batas waktu pengisian berakhir.
              </p>

              <div className="flex flex-wrap items-center gap-3 mt-6">
                <Link
                  href="/student/profile/edit"
                  className="px-6 py-2.5 rounded-full bg-gold hover:bg-gold-light text-navy-950 font-bold text-xs sm:text-sm transition shadow-md flex items-center space-x-2"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>{progressPercent === 100 ? 'Edit Profil Kenangan' : 'Lengkapi Profil Sekarang'}</span>
                </Link>

                {student.slug && (
                  <Link
                    href={`/students/${student.slug}`}
                    target="_blank"
                    className="px-6 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs sm:text-sm font-semibold transition flex items-center space-x-2"
                  >
                    <Eye className="w-4 h-4 text-gold" />
                    <span>Lihat Tampilan Yearbook</span>
                  </Link>
                )}
              </div>
            </div>

            {/* Ambient decorative circle */}
            <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-gold/10 rounded-full blur-2xl pointer-events-none" />
          </div>

          {/* Status & Deadline Banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Profile Progress Card */}
            <div className="p-6 rounded-3xl bg-white border border-navy-100 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold text-charcoal-light uppercase tracking-wider block mb-1">
                  Kelengkapan Profil
                </span>
                <div className="flex items-end justify-between mb-3">
                  <span className="font-serif text-3xl font-bold text-navy-950">{progressPercent}%</span>
                  <span className="text-xs text-dusty-blue font-medium">{filledCount} dari {fields.length} data</span>
                </div>
                {/* Progress bar */}
                <div className="w-full bg-cream-200 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gold h-full rounded-full transition-all duration-700"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              <p className="text-[11px] text-charcoal-light mt-4">
                {progressPercent === 100
                  ? '✨ Profilmu sudah lengkap dan siap diajukan untuk verifikasi.'
                  : 'Lengkapi seluruh data agar profil yearbook-mu tampil memukau.'}
              </p>
            </div>

            {/* Status Approval Card */}
            <div className="p-6 rounded-3xl bg-white border border-navy-100 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold text-charcoal-light uppercase tracking-wider block mb-1">
                  Status Publikasi
                </span>
                <div className="flex items-center space-x-3 my-2">
                  <span
                    className={`font-semibold text-sm px-3.5 py-1.5 rounded-full border ${
                      student.profileStatus === 'APPROVED'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                        : student.profileStatus === 'SUBMITTED'
                        ? 'bg-amber-50 text-amber-700 border-amber-300'
                        : student.profileStatus === 'REJECTED'
                        ? 'bg-rose-50 text-rose-700 border-rose-300'
                        : 'bg-gray-100 text-gray-700 border-gray-300'
                    }`}
                  >
                    {student.profileStatus === 'APPROVED' && 'Telah Disetujui (Approved)'}
                    {student.profileStatus === 'SUBMITTED' && 'Menunggu Verifikasi Admin'}
                    {student.profileStatus === 'REJECTED' && 'Perlu Revisi (Rejected)'}
                    {student.profileStatus === 'DRAFT' && 'Draft (Belum Diajukan)'}
                  </span>
                </div>
              </div>

              {student.rejectionReason && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                  <strong>Catatan Admin:</strong> {student.rejectionReason}
                </div>
              )}

              <p className="text-[11px] text-charcoal-light mt-2">
                Hanya profil berstatus APPROVED yang akan ditampilkan pada buku kenangan publik.
              </p>
            </div>

            {/* Deadline Card */}
            <div className="p-6 rounded-3xl bg-white border border-navy-100 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-2 text-xs font-semibold text-gold-dark uppercase tracking-wider mb-1">
                  <Calendar className="w-4 h-4" />
                  <span>Batas Akhir Pengisian</span>
                </div>
                <div className="font-serif text-2xl font-bold text-navy-950 mt-1">
                  30 Mei 2027
                </div>
                <p className="text-xs text-charcoal-light mt-1">
                  Setelah batas waktu, profil akan dikunci oleh admin untuk proses pencetakan dan publikasi final.
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-cream-200 text-[11px] text-dusty-blue">
                Tahun Pelajaran 2026/2027
              </div>
            </div>

          </div>

          {/* Quick Shortcuts Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <Link
              href="/student/profile/edit"
              className="p-6 rounded-3xl bg-white border border-navy-100 hover:border-gold shadow-sm hover:shadow-lg transition-all group"
            >
              <div className="w-12 h-12 rounded-2xl bg-gold/15 text-gold-dark flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Edit3 className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-lg font-bold text-navy-950 group-hover:text-gold-dark transition">
                Formulir 7 Langkah
              </h3>
              <p className="text-xs text-charcoal-light mt-1">
                Isi identitas, Q&A seru, kenangan masa SMP, cita-cita, foto, dan pesan perpisahan.
              </p>
            </Link>

            <Link
              href="/student/my-class"
              className="p-6 rounded-3xl bg-white border border-navy-100 hover:border-gold shadow-sm hover:shadow-lg transition-all group"
            >
              <div className="w-12 h-12 rounded-2xl bg-dusty-blue/20 text-navy flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <School className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-lg font-bold text-navy-950 group-hover:text-gold-dark transition">
                Keluarga Kelas {user.className || 'IX'}
              </h3>
              <p className="text-xs text-charcoal-light mt-1">
                Lihat daftar teman sekelas, wali kelas, dan foto bersama di kelasmu.
              </p>
            </Link>

            <Link
              href="/student/my-messages"
              className="p-6 rounded-3xl bg-white border border-navy-100 hover:border-gold shadow-sm hover:shadow-lg transition-all group"
            >
              <div className="w-12 h-12 rounded-2xl bg-sage/20 text-navy flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-lg font-bold text-navy-950 group-hover:text-gold-dark transition">
                Pesan & Surat Terbuka
              </h3>
              <p className="text-xs text-charcoal-light mt-1">
                Tuliskan surat kenangan untuk teman, guru, dan almamater SMPN 1 Rajapolah.
              </p>
            </Link>
          </div>

        </div>
      </main>
    </div>
  );
}
