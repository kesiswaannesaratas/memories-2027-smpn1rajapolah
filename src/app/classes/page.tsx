import React from 'react';
import Link from 'next/link';
import { School, Users, ChevronRight } from 'lucide-react';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function ClassesPage() {
  const classes = await prisma.class.findMany({
    orderBy: { className: 'asc' },
    include: {
      homeroomTeacher: true,
      _count: {
        select: { students: true },
      },
    },
  });

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-14">
        <div className="inline-flex items-center space-x-2 text-gold-dark text-xs font-bold uppercase tracking-widest mb-3">
          <School className="w-4 h-4" />
          <span>Direktori Kelas Angkatan IX</span>
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-navy-950 mb-4">
          Sebelas Keluarga, Satu Almamater
        </h1>
        <p className="text-sm sm:text-base text-charcoal font-light leading-relaxed">
          Setiap kelas di angkatan 2026/2027 memiliki keunikan cerita, persaudaraan, dan kenangan indah tersendiri. Jelajahi halaman kenangan masing-masing kelas di bawah ini.
        </p>
      </div>

      {/* Grid of Class Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {classes.map((cls) => (
          <Link
            key={cls.id}
            href={`/classes/${cls.classSlug}`}
            className="group rounded-3xl overflow-hidden bg-white border border-navy-100 shadow-sm hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-between"
          >
            {/* Class Photo */}
            <div className="relative aspect-[16/10] overflow-hidden bg-navy-900">
              <img
                src={cls.classPhoto || 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80'}
                alt={cls.className}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500 opacity-80 group-hover:opacity-100"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-transparent to-transparent" />
              
              <div className="absolute top-4 left-4">
                <span className="w-14 h-14 rounded-2xl bg-gold text-navy-950 font-serif font-black text-2xl flex items-center justify-center shadow-lg border border-gold-light">
                  {cls.className}
                </span>
              </div>
            </div>

            {/* Info */}
            <div className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-serif text-2xl font-bold text-navy-950 group-hover:text-gold-dark transition">
                  Kelas {cls.className}
                </h3>
                {cls.homeroomTeacher && (
                  <p className="text-xs text-dusty-blue font-medium mt-1">
                    Wali Kelas: <span className="text-navy font-semibold">{cls.homeroomTeacher.fullName}</span>
                  </p>
                )}
                {cls.classMotto && (
                  <p className="text-xs text-charcoal italic font-serif mt-3 line-clamp-2">
                    “{cls.classMotto}”
                  </p>
                )}
                {cls.classDescription && (
                  <p className="text-xs text-charcoal-light mt-2 line-clamp-2 leading-relaxed">
                    {cls.classDescription}
                  </p>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-cream-200 flex items-center justify-between text-xs">
                <span className="flex items-center space-x-1.5 text-charcoal">
                  <Users className="w-3.5 h-3.5 text-gold-dark" />
                  <span><strong>{cls._count.students}</strong> Siswa Terdaftar</span>
                </span>
                <span className="text-gold-dark font-semibold flex items-center space-x-1 group-hover:translate-x-1 transition-transform">
                  <span>Buka Halaman</span>
                  <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

    </div>
  );
}
