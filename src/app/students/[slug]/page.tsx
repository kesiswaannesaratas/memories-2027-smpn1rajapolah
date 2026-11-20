import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight, 
  Quote as QuoteIcon, 
  Sparkles, 
  Heart, 
  GraduationCap, 
  Compass, 
  Printer, 
  Share2,
  Calendar,
  School,
  Camera,
  MessageSquare
} from 'lucide-react';
import prisma from '@/lib/prisma';
import LightboxWrapper from './LightboxWrapper';

export const dynamic = 'force-dynamic';

export default async function StudentProfilePage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;

  // Fetch student by slug
  const student = await prisma.student.findFirst({
    where: {
      OR: [{ slug }, { id: slug }],
    },
    include: {
      class: {
        include: {
          homeroomTeacher: true,
        },
      },
      photos: {
        where: { approvalStatus: 'APPROVED' },
        orderBy: { sortOrder: 'asc' },
      },
      quotes: true,
    },
  });

  if (!student) {
    notFound();
  }

  // Find previous and next student in directory for smooth pagination
  const [prevStudent, nextStudent] = await Promise.all([
    prisma.student.findFirst({
      where: {
        isPublished: true,
        profileStatus: 'APPROVED',
        fullName: { lt: student.fullName },
      },
      orderBy: { fullName: 'desc' },
      select: { slug: true, fullName: true, nickname: true },
    }),
    prisma.student.findFirst({
      where: {
        isPublished: true,
        profileStatus: 'APPROVED',
        fullName: { gt: student.fullName },
      },
      orderBy: { fullName: 'asc' },
      select: { slug: true, fullName: true, nickname: true },
    }),
  ]);

  // Parse social media
  let socialMedia: any = {};
  try {
    if (student.socialMedia) {
      socialMedia = JSON.parse(student.socialMedia);
    }
  } catch (e) {}

  return (
    <div className="min-h-screen bg-cream py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Top Navigation & Action Bar */}
        <div className="flex items-center justify-between mb-8 no-print">
          <Link
            href={`/classes/${student.class?.classSlug || ''}`}
            className="inline-flex items-center space-x-2 text-sm font-semibold text-navy hover:text-gold transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Kelas {student.class?.className}</span>
          </Link>

          <div className="flex items-center space-x-3">
            <LightboxWrapper
              studentName={student.fullName}
              photos={student.photos}
            />
          </div>
        </div>

        {/* =========================================================================
            EDITORIAL MAGAZINE / SCRAPBOOK YEARBOOK CARD
           ========================================================================= */}
        <article className="bg-white rounded-3xl shadow-xl border border-navy-100 overflow-hidden relative">
          
          {/* Top Banner Accent */}
          <div className="h-3 bg-gradient-to-r from-navy via-gold to-navy-950" />

          <div className="p-6 sm:p-10 lg:p-12">
            
            {/* Header: Class Badge & Academic Year */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-navy-100 pb-6 mb-8">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-gold-dark">
                  SMPN 1 Rajapolah • Angkatan 2026/2027
                </span>
                <h1 className="font-serif text-3xl sm:text-5xl font-bold text-navy-950 mt-1">
                  {student.fullName}
                </h1>
                <p className="text-base text-dusty-blue font-serif italic mt-0.5">
                  Panggilan akrab: <strong className="text-navy font-semibold not-italic">“{student.nickname}”</strong>
                </p>
              </div>

              <div className="text-right">
                <span className="inline-block px-4 py-1.5 rounded-2xl bg-navy text-gold font-serif font-bold text-lg shadow-sm border border-gold/30">
                  Kelas {student.class?.className}
                </span>
                {student.class?.homeroomTeacher && (
                  <p className="text-[11px] text-charcoal-light mt-1">
                    Wali Kelas: {student.class.homeroomTeacher.fullName}
                  </p>
                )}
              </div>
            </div>

            {/* Main Editorial Layout: Photo Left, Core Profile Right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12">
              
              {/* Large Portrait Photo */}
              <div className="lg:col-span-5">
                <div className="relative rounded-3xl overflow-hidden shadow-xl aspect-[4/5] bg-navy-950 border-4 border-cream-100">
                  <img
                    src={student.profilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80'}
                    alt={student.fullName}
                    className="w-full h-full object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-950/70 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <p className="font-serif text-xs italic text-gold">“{student.motto || 'Maju terus pantang menyerah'}”</p>
                  </div>
                </div>

                {/* Social media badge if available */}
                {socialMedia.instagram && (
                  <div className="mt-4 p-3 rounded-2xl bg-cream-50 border border-navy-100 flex items-center justify-between text-xs">
                    <span className="text-charcoal-light">Instagram:</span>
                    <span className="font-semibold text-navy">{socialMedia.instagram}</span>
                  </div>
                )}
              </div>

              {/* Core Information & Fun Facts */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* 3 Words Badges */}
                {student.describeThreeWords && (
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-charcoal-light block mb-2">
                      Tiga Kata yang Menggambarkan Saya:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {student.describeThreeWords.split(',').map((w: string, idx: number) => (
                        <span
                          key={idx}
                          className="px-3.5 py-1 rounded-full bg-gold/15 text-navy-950 border border-gold/30 text-xs font-semibold"
                        >
                          ✨ {w.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Motto Box */}
                {student.motto && (
                  <div className="p-5 rounded-2xl bg-navy-50/70 border-l-4 border-gold">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gold-dark block mb-1">
                      Motto Hidup
                    </span>
                    <p className="font-serif text-lg italic text-navy-950 leading-relaxed">
                      “{student.motto}”
                    </p>
                  </div>
                )}

                {/* About Me Grid (Favorites & Fun Q&A) */}
                <div>
                  <h3 className="font-serif text-lg font-bold text-navy-950 border-b border-navy-100 pb-2 mb-3">
                    Hal-Hal Favorit & Kepribadian
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {student.favoriteSubject && (
                      <div className="p-2.5 rounded-xl bg-cream-50 border border-navy-100/60">
                        <span className="text-charcoal-light block">Mapel Favorit:</span>
                        <strong className="text-navy">{student.favoriteSubject}</strong>
                      </div>
                    )}
                    {student.favoriteFood && (
                      <div className="p-2.5 rounded-xl bg-cream-50 border border-navy-100/60">
                        <span className="text-charcoal-light block">Makanan Favorit:</span>
                        <strong className="text-navy">{student.favoriteFood}</strong>
                      </div>
                    )}
                    {student.favoriteSong && (
                      <div className="p-2.5 rounded-xl bg-cream-50 border border-navy-100/60">
                        <span className="text-charcoal-light block">Lagu Favorit:</span>
                        <strong className="text-navy">{student.favoriteSong}</strong>
                      </div>
                    )}
                    {student.favoriteMovie && (
                      <div className="p-2.5 rounded-xl bg-cream-50 border border-navy-100/60">
                        <span className="text-charcoal-light block">Film Favorit:</span>
                        <strong className="text-navy">{student.favoriteMovie}</strong>
                      </div>
                    )}
                    {student.favoritePlace && (
                      <div className="p-2.5 rounded-xl bg-cream-50 border border-navy-100/60">
                        <span className="text-charcoal-light block">Tempat Favorit di Sekolah:</span>
                        <strong className="text-navy">{student.favoritePlace}</strong>
                      </div>
                    )}
                    {student.hobbies && (
                      <div className="p-2.5 rounded-xl bg-cream-50 border border-navy-100/60">
                        <span className="text-charcoal-light block">Hobi:</span>
                        <strong className="text-navy">{student.hobbies}</strong>
                      </div>
                    )}
                  </div>
                </div>

                {/* Future Dream */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-navy to-navy-950 text-white shadow-md">
                  <div className="flex items-center space-x-2 text-gold text-xs font-bold uppercase tracking-wider mb-1">
                    <GraduationCap className="w-4 h-4" />
                    <span>Cita-Cita & Masa Depan</span>
                  </div>
                  <h4 className="font-serif text-xl font-bold text-warm-white">
                    {student.dream || 'Mewujudkan Impian Terbaik'}
                  </h4>
                  {student.futureSchool && (
                    <p className="text-xs text-cream-200 mt-1">
                      Sekolah Lanjutan Tujuan: <strong className="text-gold">{student.futureSchool}</strong>
                    </p>
                  )}
                  {student.futureMessage && (
                    <p className="text-xs text-dusty-blue italic mt-2 pt-2 border-t border-navy-800">
                      “{student.futureMessage}”
                    </p>
                  )}
                </div>

              </div>
            </div>

            {/* School Memories Stories */}
            {(student.schoolStory || student.unforgettableMemory || student.funniestMoment) && (
              <div className="mb-12 border-t border-navy-100 pt-8">
                <h3 className="font-serif text-2xl font-bold text-navy-950 mb-6 flex items-center space-x-2">
                  <School className="w-5 h-5 text-gold-dark" />
                  <span>Kilas Balik Kenangan di SMPN 1 Rajapolah</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {student.schoolStory && (
                    <div className="p-6 rounded-2xl bg-cream-50 border border-navy-100">
                      <h4 className="font-semibold text-sm text-navy mb-2">
                        Cerita Paling Berkesan Selama SMP
                      </h4>
                      <p className="text-xs sm:text-sm text-charcoal leading-relaxed whitespace-pre-line">
                        {student.schoolStory}
                      </p>
                    </div>
                  )}

                  {student.unforgettableMemory && (
                    <div className="p-6 rounded-2xl bg-cream-50 border border-navy-100">
                      <h4 className="font-semibold text-sm text-navy mb-2">
                        Momen yang Tidak Pernah Terlupakan
                      </h4>
                      <p className="text-xs sm:text-sm text-charcoal leading-relaxed whitespace-pre-line">
                        {student.unforgettableMemory}
                      </p>
                    </div>
                  )}

                  {student.funniestMoment && (
                    <div className="p-6 rounded-2xl bg-cream-50 border border-navy-100 md:col-span-2">
                      <h4 className="font-semibold text-sm text-navy mb-2">
                        Momen Paling Lucu / Konyol
                      </h4>
                      <p className="text-xs sm:text-sm text-charcoal leading-relaxed whitespace-pre-line">
                        {student.funniestMoment}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Personal Memory Photos Gallery */}
            {student.photos && student.photos.length > 0 && (
              <div className="mb-12 border-t border-navy-100 pt-8">
                <h3 className="font-serif text-2xl font-bold text-navy-950 mb-6 flex items-center space-x-2">
                  <Camera className="w-5 h-5 text-gold-dark" />
                  <span>Galeri Kenangan Pribadi</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {student.photos.map((p) => (
                    <div
                      key={p.id}
                      className="rounded-2xl overflow-hidden bg-navy-950 aspect-[4/3] shadow-md group relative"
                    >
                      <img
                        src={p.imageUrl}
                        alt={p.caption || 'Foto Kenangan'}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                      {p.caption && (
                        <div className="absolute inset-0 bg-gradient-to-t from-navy-950/90 via-transparent to-transparent flex items-end p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <p className="text-xs text-white line-clamp-2">{p.caption}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Farewell Message to Cohort */}
            {student.favoriteQuote && (
              <div className="border-t border-navy-100 pt-8 text-center max-w-2xl mx-auto">
                <QuoteIcon className="w-8 h-8 text-gold mx-auto mb-2 opacity-60" />
                <p className="font-serif italic text-lg sm:text-xl text-navy-950 leading-relaxed mb-2">
                  “{student.favoriteQuote}”
                </p>
                <p className="text-xs text-dusty-blue uppercase tracking-wider">
                  — Pesan Terakhir untuk Teman Seangkatan 2027
                </p>
              </div>
            )}

          </div>

          {/* Footer Bar inside Yearbook Page */}
          <div className="bg-navy-950 text-cream-200 p-4 sm:p-6 flex flex-wrap items-center justify-between text-xs border-t border-navy-800">
            <div>
              <span className="font-serif font-bold text-white text-sm">MEMORIES 2027</span>
              <span className="mx-2">•</span>
              <span>SMPN 1 Rajapolah</span>
            </div>
            <div className="text-dusty-blue">
              Halaman Buku Kenangan Resmi Digital
            </div>
          </div>
        </article>

        {/* Prev & Next Student Navigation */}
        <div className="flex items-center justify-between mt-8 no-print">
          {prevStudent ? (
            <Link
              href={`/students/${prevStudent.slug}`}
              className="flex items-center space-x-2 text-sm font-semibold text-navy hover:text-gold transition p-3 rounded-2xl bg-white border border-navy-100 shadow-sm"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Siswa Sebelumnya ({prevStudent.nickname})</span>
            </Link>
          ) : (
            <div />
          )}

          {nextStudent && (
            <Link
              href={`/students/${nextStudent.slug}`}
              className="flex items-center space-x-2 text-sm font-semibold text-navy hover:text-gold transition p-3 rounded-2xl bg-white border border-navy-100 shadow-sm"
            >
              <span>Siswa Selanjutnya ({nextStudent.nickname})</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </div>

      </div>
    </div>
  );
}
