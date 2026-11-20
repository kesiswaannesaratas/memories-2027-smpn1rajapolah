import React from 'react';
import Link from 'next/link';
import { GraduationCap, Heart, Quote } from 'lucide-react';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function TeachersPage() {
  const teachers = await prisma.teacher.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: 'asc' },
  });

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center space-x-2 text-gold-dark text-xs font-bold uppercase tracking-widest mb-3">
          <GraduationCap className="w-4 h-4" />
          <span>Apresiasi Guru & Staf SMPN 1 Rajapolah</span>
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-navy-950 mb-4">
          Pahlawan Tanpa Tanda Jasa
        </h1>
        <p className="text-sm sm:text-base text-charcoal font-light leading-relaxed">
          Untaian terima kasih tulus dari angkatan 2026/2027 kepada seluruh Bapak dan Ibu Guru yang telah mengalirkan ilmu, membimbing akhlak, dan menyalakan harapan di hati kami.
        </p>
      </div>

      {/* Teachers Editorial Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {teachers.map((t) => (
          <div
            key={t.id}
            className="group rounded-3xl overflow-hidden bg-white border border-navy-100 shadow-sm hover:shadow-xl transition-all duration-300 p-8 flex flex-col justify-between"
          >
            <div>
              {/* Photo Frame */}
              <div className="w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-cream-100 shadow-lg mb-6 group-hover:scale-105 transition-transform duration-500">
                <img
                  src={t.photo || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80'}
                  alt={t.fullName}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="text-center">
                <h3 className="font-serif text-xl font-bold text-navy-950">
                  {t.fullName}
                </h3>
                <p className="text-xs font-bold text-gold-dark uppercase tracking-wider mt-1">
                  {t.subject}
                </p>
                {t.position && (
                  <p className="text-xs text-dusty-blue mt-0.5">
                    {t.position}
                  </p>
                )}
              </div>

              {t.description && (
                <p className="text-xs text-charcoal-light leading-relaxed mt-4 text-center">
                  {t.description}
                </p>
              )}
            </div>

            {/* Quote Message from Teacher */}
            {t.quote && (
              <div className="mt-6 pt-5 border-t border-cream-200 bg-cream-50/60 p-4 rounded-2xl relative">
                <Quote className="w-5 h-5 text-gold/40 mb-1" />
                <p className="font-serif italic text-xs sm:text-sm text-navy-950 leading-relaxed">
                  “{t.quote}”
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Student Message of Gratitude */}
      <div className="mt-16 p-8 rounded-3xl bg-navy text-white text-center max-w-4xl mx-auto shadow-xl">
        <Heart className="w-10 h-10 text-red-400 fill-red-400 mx-auto mb-3" />
        <h3 className="font-serif text-2xl font-bold text-warm-white mb-2">
          Doa Kami untuk Guru-Guru Tercinta
        </h3>
        <p className="text-sm text-cream-200 leading-relaxed max-w-2xl mx-auto font-light">
          Semoga setiap huruf yang Bapak dan Ibu ajarkan, setiap senyuman ketabahan, dan setiap nasihat bijak menjadi ladang amal jariyah yang tak pernah terputus. Salam takzim dari kami, angkatan 2026/2027.
        </p>
      </div>

    </div>
  );
}
