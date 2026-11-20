'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Users, ArrowRight, Filter, Sparkles, BookOpen } from 'lucide-react';
import EmptyState from '@/components/EmptyState';

export default function StudentsDirectoryPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState('ALL');
  const [classes, setClasses] = useState<any[]>([]);

  useEffect(() => {
    // Load classes
    fetch('/api/classes')
      .then((res) => res.json())
      .then((data) => {
        if (data.classes) setClasses(data.classes);
      })
      .catch(() => {});

    loadStudents();
  }, [selectedClass]);

  const loadStudents = (searchTerm = search) => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set('public', 'true');
    if (searchTerm) params.set('search', searchTerm);
    if (selectedClass && selectedClass !== 'ALL') params.set('classId', selectedClass);

    fetch(`/api/students?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.students) setStudents(data.students);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadStudents(search);
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center space-x-2 text-gold-dark text-xs font-bold uppercase tracking-widest mb-3">
          <Users className="w-4 h-4" />
          <span>Direktori Lengkap Siswa</span>
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-navy-950 mb-4">
          Wajah Angkatan 2026/2027
        </h1>
        <p className="text-sm sm:text-base text-charcoal font-light leading-relaxed">
          Temukan sahabat, teman sebangku, dan seluruh keluarga besar siswa kelas IX SMP Negeri 1 Rajapolah. Klik foto siswa untuk melihat profil majalah dan kenangan lengkap.
        </p>
      </div>

      {/* Search Bar & Class Filters */}
      <div className="mb-10 space-y-4">
        
        {/* Search Input Form */}
        <form onSubmit={handleSearchSubmit} className="max-w-xl mx-auto">
          <div className="relative flex items-center shadow-sm">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari berdasarkan nama lengkap, nama panggilan, motto, atau cita-cita..."
              className="w-full pl-11 pr-24 py-3.5 rounded-full border border-navy-200/80 focus:border-gold focus:ring-2 focus:ring-gold/20 text-sm outline-none bg-white transition"
            />
            <div className="absolute left-4 text-gray-400">
              <Search className="w-4 h-4" />
            </div>
            <button
              type="submit"
              className="absolute right-2 px-5 py-2 rounded-full bg-gold hover:bg-gold-light text-navy-950 text-xs font-bold transition"
            >
              Cari
            </button>
          </div>
        </form>

        {/* Class Filter Tabs */}
        <div className="flex items-center justify-center flex-wrap gap-2 pt-2">
          <button
            onClick={() => setSelectedClass('ALL')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition ${
              selectedClass === 'ALL'
                ? 'bg-navy text-gold shadow-sm'
                : 'bg-white text-charcoal hover:bg-navy-50 border border-gray-200'
            }`}
          >
            Semua Kelas
          </button>
          {classes.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedClass(c.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition ${
                selectedClass === c.id
                  ? 'bg-navy text-gold shadow-sm'
                  : 'bg-white text-charcoal hover:bg-navy-50 border border-gray-200'
              }`}
            >
              Kelas {c.className}
            </button>
          ))}
        </div>

      </div>

      {/* Students Count Badge */}
      <div className="flex items-center justify-between text-xs text-charcoal-light mb-6 border-b border-navy-100 pb-3">
        <span>
          Menampilkan <strong>{students.length}</strong> siswa
        </span>
        <span className="text-gold-dark font-medium">
          SMPN 1 Rajapolah • Angkatan 2026/2027
        </span>
      </div>

      {/* Grid of Student Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="rounded-3xl bg-white p-4 shadow-sm border border-gray-100 animate-pulse">
              <div className="aspect-[4/5] rounded-2xl bg-gray-200 mb-4" />
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : students.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {students.map((st) => (
            <Link
              key={st.id}
              href={`/students/${st.slug}`}
              className="group block rounded-3xl overflow-hidden bg-white border border-navy-100 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-between"
            >
              {/* Photo Area */}
              <div className="relative aspect-[4/5] overflow-hidden bg-navy-900">
                <img
                  src={st.profilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80'}
                  alt={st.fullName}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />

                {/* Class Badge */}
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 rounded-full bg-navy-950/80 backdrop-blur-md text-gold text-xs font-bold border border-gold/30">
                    {st.class?.className || 'IX'}
                  </span>
                </div>

                {/* Overlay vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950/90 via-navy-950/20 to-transparent opacity-85 group-hover:opacity-95 transition-opacity" />

                {/* Bottom Overlay Text */}
                <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                  <span className="text-xs text-gold uppercase tracking-wider font-semibold">
                    {st.nickname}
                  </span>
                  <h3 className="font-serif text-lg sm:text-xl font-bold text-white group-hover:text-gold transition leading-tight mt-0.5">
                    {st.fullName}
                  </h3>
                  {st.motto && (
                    <p className="text-[11px] text-cream-300 italic font-serif mt-1.5 line-clamp-2">
                      “{st.motto}”
                    </p>
                  )}
                </div>
              </div>

              {/* Bottom Quick Snippet */}
              <div className="p-3.5 bg-cream-50 flex items-center justify-between text-xs border-t border-navy-100/60">
                <span className="text-dusty-blue text-[11px] truncate max-w-[150px]">
                  Cita-cita: <strong className="text-navy">{st.dream || 'Masa Depan Cerah'}</strong>
                </span>
                <span className="text-gold font-semibold group-hover:translate-x-1 transition-transform">
                  &rarr;
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          title="Tidak Ada Siswa yang Cocok"
          description="Coba ubah kata kunci pencarian atau pilih filter kelas lain."
          actionText="Tampilkan Semua Siswa"
          onAction={() => {
            setSearch('');
            setSelectedClass('ALL');
          }}
        />
      )}

    </div>
  );
}
