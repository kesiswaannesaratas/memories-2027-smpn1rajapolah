import React from 'react';
import Link from 'next/link';
import { 
  BookOpen, 
  Users, 
  School, 
  Image as ImageIcon, 
  MessageSquare, 
  Sparkles, 
  ArrowRight, 
  Quote as QuoteIcon, 
  GraduationCap, 
  Heart,
  ChevronRight,
  Camera,
  Compass
} from 'lucide-react';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  // Fetch real statistics & preview data from database
  const [
    totalStudents,
    totalClasses,
    totalMemories,
    totalMessages,
    featuredStudents,
    featuredMemories,
    classesList,
    featuredQuotes,
    teachersList,
  ] = await Promise.all([
    prisma.student.count({ where: { profileStatus: 'APPROVED' } }),
    prisma.class.count(),
    prisma.memory.count({ where: { approvalStatus: 'APPROVED' } }),
    prisma.message.count({ where: { approvalStatus: 'APPROVED' } }),
    prisma.student.findMany({
      where: { profileStatus: 'APPROVED', isPublished: true },
      take: 6,
      include: { class: true },
      orderBy: { fullName: 'asc' },
    }),
    prisma.memory.findMany({
      where: { approvalStatus: 'APPROVED' },
      take: 6,
      orderBy: { createdAt: 'desc' },
      include: { class: true },
    }),
    prisma.class.findMany({
      orderBy: { className: 'asc' },
      include: {
        homeroomTeacher: true,
        _count: { select: { students: true } },
      },
    }),
    prisma.quote.findMany({
      where: { approvalStatus: 'APPROVED', isFeatured: true },
      take: 4,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.teacher.findMany({
      where: { isPublished: true },
      take: 4,
      orderBy: { createdAt: 'asc' },
    }),
  ]);

  return (
    <div className="min-h-screen">
      
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden bg-navy-950 text-white">
        {/* Cinematic Background Image with Gradient Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30 transform scale-105 transition-transform duration-1000"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1920&auto=format&fit=crop&q=80')`,
          }}
        />
        
        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/70 to-navy-950/40" />
        <div className="absolute inset-0 bg-radial-vignette opacity-80" />

        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-dusty-blue/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20">
          
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-gold/15 border border-gold/40 text-gold text-xs sm:text-sm font-medium mb-8 backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-gold" />
            <span>Digital Yearbook SMPN 1 Rajapolah • Angkatan 2026/2027</span>
          </div>

          {/* Big Editorial Heading */}
          <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-warm-white leading-[1.08] mb-6">
            THE BEST YEARS. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold via-cream-100 to-gold">
              THE BEAUTIFUL MEMORIES.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="max-w-2xl mx-auto text-base sm:text-lg md:text-xl text-cream-200 font-light leading-relaxed mb-10">
            Selamat datang di ruang kenangan angkatan 2026/2027 SMPN 1 Rajapolah. Tempat semua cerita, persahabatan, tawa, perjuangan, dan mimpi menjadi satu.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/memories"
              className="px-8 py-3.5 rounded-full bg-gold hover:bg-gold-light text-navy-950 font-bold text-sm sm:text-base transition-all duration-300 shadow-lg hover:shadow-gold/20 transform hover:-translate-y-0.5 flex items-center space-x-2"
            >
              <Compass className="w-4 h-4" />
              <span>Explore Our Memories</span>
            </Link>

            <Link
              href="/students"
              className="px-8 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold text-sm sm:text-base transition-all duration-300 backdrop-blur-md flex items-center space-x-2"
            >
              <Users className="w-4 h-4 text-gold" />
              <span>Meet The Students</span>
            </Link>

            <Link
              href="/classes"
              className="px-8 py-3.5 rounded-full bg-navy-800/80 hover:bg-navy-700 text-cream-100 border border-gold/30 font-semibold text-sm sm:text-base transition-all duration-300 flex items-center space-x-2"
            >
              <BookOpen className="w-4 h-4 text-gold" />
              <span>Enter Yearbook</span>
            </Link>
          </div>

          {/* Tagline footer quote */}
          <p className="mt-12 text-xs sm:text-sm text-dusty-blue font-serif italic tracking-wide">
            “One School, Many Stories, A Thousand Memories.”
          </p>
        </div>
      </section>

      {/* 2. DYNAMIC STATS SECTION */}
      <section className="bg-navy-900 border-y border-navy-800 py-12 text-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-navy-800">
            
            <div className="pt-4 md:pt-0">
              <div className="font-serif text-4xl sm:text-5xl font-bold text-gold mb-1">
                {totalStudents || 28}+
              </div>
              <div className="text-xs sm:text-sm text-cream-300 uppercase tracking-wider font-medium">
                Profil Siswa Terdaftar
              </div>
            </div>

            <div className="pt-4 md:pt-0">
              <div className="font-serif text-4xl sm:text-5xl font-bold text-warm-white mb-1">
                {totalClasses || 11}
              </div>
              <div className="text-xs sm:text-sm text-cream-300 uppercase tracking-wider font-medium">
                Kelas Angkatan (9A — 9K)
              </div>
            </div>

            <div className="pt-4 md:pt-0">
              <div className="font-serif text-4xl sm:text-5xl font-bold text-gold mb-1">
                {totalMemories || 12}+
              </div>
              <div className="text-xs sm:text-sm text-cream-300 uppercase tracking-wider font-medium">
                Dokumentasi Foto
              </div>
            </div>

            <div className="pt-4 md:pt-0">
              <div className="font-serif text-4xl sm:text-5xl font-bold text-warm-white mb-1">
                {totalMessages || 10}+
              </div>
              <div className="text-xs sm:text-sm text-cream-300 uppercase tracking-wider font-medium">
                Pesan & Kisah Kenangan
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. WELCOME & ABOUT OUR JOURNEY */}
      <section className="py-24 bg-cream relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Narrative */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center space-x-2 text-gold-dark text-xs font-bold uppercase tracking-widest">
                <School className="w-4 h-4" />
                <span>Tentang Perjalanan Tiga Tahun</span>
              </div>

              <h2 className="font-serif text-3xl sm:text-5xl font-bold text-navy-950 leading-tight">
                Dari Hari Pertama Hingga Hari Kelulusan, Setiap Detik Adalah Emas.
              </h2>

              <p className="text-charcoal leading-relaxed text-base sm:text-lg">
                Tahun 2024 kita pertama kali melangkah melewati gerbang SMPN 1 Rajapolah. Mengenakan seragam putih biru dengan rasa canggung, saling berkenalan, dan mencari tempat duduk pertama di kelas.
              </p>

              <p className="text-charcoal-light leading-relaxed text-sm sm:text-base">
                Tiga tahun berselang, koridor sekolah ini telah menjadi saksi bisu ribuan tawa saat jam istirahat, perjuangan menghadapi ulangan dan ujian, riuhnya sorakan suporter class meeting, aroma kantin Bu Yeti, hingga pelukan hangat saat pelepasan. Memories 2027 adalah persembahan abadi agar setiap memori manis ini tidak lekang oleh waktu.
              </p>

              {/* Journey Milestones Mini Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                <div className="p-4 rounded-2xl bg-white border border-navy-100 shadow-sm">
                  <div className="text-xs font-bold text-gold uppercase tracking-wider mb-1">Tahun ke-1</div>
                  <h4 className="font-serif text-base font-bold text-navy-900">Awal Pertemuan</h4>
                  <p className="text-xs text-charcoal-light mt-1">MPLS, teman baru, dan petualangan pertama di Rajapolah.</p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-navy-100 shadow-sm">
                  <div className="text-xs font-bold text-gold uppercase tracking-wider mb-1">Tahun ke-2</div>
                  <h4 className="font-serif text-base font-bold text-navy-900">Eksplorasi & Bakat</h4>
                  <p className="text-xs text-charcoal-light mt-1">Ekskul, lomba antar sekolah, dan solidaritas yang mengakar.</p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-navy-100 shadow-sm">
                  <div className="text-xs font-bold text-gold uppercase tracking-wider mb-1">Tahun ke-3</div>
                  <h4 className="font-serif text-base font-bold text-navy-900">Puncak Kenangan</h4>
                  <p className="text-xs text-charcoal-light mt-1">Ujian akhir, study tour, dan perpisahan menuju mimpi besar.</p>
                </div>
              </div>
            </div>

            {/* Right Visual Collage */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white aspect-[4/5]">
                <img
                  src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=900&auto=format&fit=crop&q=80"
                  alt="Kebersamaan Siswa SMPN 1 Rajapolah"
                  className="w-full h-full object-cover transform hover:scale-105 transition duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-transparent to-transparent flex items-end p-6">
                  <div className="text-white">
                    <p className="font-serif italic text-sm text-gold">“Kawan sejati adalah yang selalu ada dalam setiap lembar cerita kita.”</p>
                    <p className="text-xs text-cream-300 mt-1">— Angkatan IX 2026/2027</p>
                  </div>
                </div>
              </div>

              {/* Overlapping Badge */}
              <div className="absolute -bottom-6 -left-6 p-4 rounded-2xl bg-navy text-white shadow-xl border border-gold/30 hidden sm:block max-w-[200px]">
                <div className="flex items-center space-x-2 text-gold mb-1">
                  <Heart className="w-4 h-4 fill-gold" />
                  <span className="text-xs font-bold uppercase">Abadi</span>
                </div>
                <p className="text-xs text-cream-200">
                  Tersimpan aman selamanya di buku kenangan digital ini.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. FEATURED STUDENTS SECTION */}
      <section className="py-24 bg-white border-t border-navy-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <div className="inline-flex items-center space-x-2 text-gold-dark text-xs font-bold uppercase tracking-widest mb-2">
                <Users className="w-4 h-4" />
                <span>Profil Angkatan 2026/2027</span>
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-navy-950">
                Wajah & Cerita Siswa Kelas IX
              </h2>
            </div>
            <Link
              href="/students"
              className="mt-4 md:mt-0 inline-flex items-center space-x-2 text-sm font-semibold text-navy hover:text-gold transition"
            >
              <span>Lihat Semua Siswa ({totalStudents})</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Student Editorial Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredStudents.map((st) => (
              <Link
                key={st.id}
                href={`/students/${st.slug}`}
                className="group block bg-cream-50 rounded-3xl overflow-hidden border border-navy-100/80 hover:border-gold/50 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                {/* Portrait Photo Container */}
                <div className="relative aspect-[4/5] overflow-hidden bg-navy-900">
                  <img
                    src={st.profilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80'}
                    alt={st.fullName}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />
                  
                  {/* Class Badge */}
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 rounded-full bg-navy-950/80 backdrop-blur-md text-gold text-xs font-bold border border-gold/30">
                      Kelas {st.class?.className || 'IX'}
                    </span>
                  </div>

                  {/* Gradient Shadow */}
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-950/90 via-navy-950/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                  {/* Info Overlay at Bottom */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <p className="text-xs text-gold uppercase tracking-wider font-semibold mb-0.5">
                      {st.nickname}
                    </p>
                    <h3 className="font-serif text-xl sm:text-2xl font-bold text-white group-hover:text-gold transition">
                      {st.fullName}
                    </h3>
                    {st.motto && (
                      <p className="text-xs text-cream-300 italic font-serif mt-2 line-clamp-2">
                        “{st.motto}”
                      </p>
                    )}
                  </div>
                </div>

                {/* Additional Details Snippet */}
                <div className="p-4 bg-white flex items-center justify-between text-xs text-charcoal">
                  <span className="text-dusty-blue truncate max-w-[180px]">
                    Cita-cita: <strong className="text-navy">{st.dream || 'Generasi Sukses'}</strong>
                  </span>
                  <span className="text-gold group-hover:translate-x-1 transition-transform">
                    Buka Profil &rarr;
                  </span>
                </div>
              </Link>
            ))}
          </div>

        </div>
      </section>

      {/* 5. CLASS DIRECTORY PREVIEW */}
      <section className="py-24 bg-navy-950 text-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center space-x-2 text-gold text-xs font-bold uppercase tracking-widest mb-2">
              <School className="w-4 h-4" />
              <span>Direktori Kelas Angkatan</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-warm-white">
              Sebelas Ruang, Ribuan Cerita Emas
            </h2>
            <p className="text-dusty-blue text-sm sm:text-base mt-4 font-light">
              Dari 9A hingga 9K. Setiap kelas memiliki warna keunikan, tradisi, dan kenangan tak terlupakan.
            </p>
          </div>

          {/* Classes Cards Carousel / Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {classesList.map((cls) => (
              <Link
                key={cls.id}
                href={`/classes/${cls.classSlug}`}
                className="group relative rounded-3xl overflow-hidden bg-navy-900 border border-navy-800 hover:border-gold transition-all duration-300 shadow-lg hover:shadow-2xl flex flex-col justify-between"
              >
                {/* Class Photo */}
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img
                    src={cls.classPhoto || 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&auto=format&fit=crop&q=80'}
                    alt={cls.className}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-70 group-hover:opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-900 via-transparent to-transparent" />
                  <div className="absolute top-4 left-4">
                    <span className="w-12 h-12 rounded-2xl bg-gold text-navy-950 font-serif font-black text-xl flex items-center justify-center shadow-lg">
                      {cls.className}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-serif text-xl font-bold text-white group-hover:text-gold transition">
                      Kelas {cls.className}
                    </h3>
                    {cls.homeroomTeacher && (
                      <p className="text-xs text-dusty-blue mt-1">
                        Wali Kelas: <span className="text-cream-200">{cls.homeroomTeacher.fullName}</span>
                      </p>
                    )}
                    {cls.classMotto && (
                      <p className="text-xs text-cream-300 italic font-serif mt-3 line-clamp-2">
                        “{cls.classMotto}”
                      </p>
                    )}
                  </div>

                  <div className="mt-5 pt-4 border-t border-navy-800 flex items-center justify-between text-xs">
                    <span className="text-dusty-blue">
                      {cls._count.students} Siswa
                    </span>
                    <span className="text-gold font-semibold flex items-center space-x-1 group-hover:translate-x-1 transition-transform">
                      <span>Lihat Album</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/classes"
              className="inline-flex items-center space-x-2 px-6 py-3 rounded-full bg-navy-900 hover:bg-navy-800 text-cream-200 border border-navy-700 text-sm font-medium transition"
            >
              <span>Jelajahi Seluruh Galeri Kelas &rarr;</span>
            </Link>
          </div>

        </div>
      </section>

      {/* 6. MEMORY GALLERY PREVIEW */}
      <section className="py-24 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <div className="inline-flex items-center space-x-2 text-gold-dark text-xs font-bold uppercase tracking-widest mb-2">
                <Camera className="w-4 h-4" />
                <span>Memory Wall Preview</span>
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-navy-950">
                Album Kilas Balik Masa SMP
              </h2>
            </div>
            <Link
              href="/memories"
              className="mt-4 md:mt-0 inline-flex items-center space-x-2 text-sm font-semibold text-navy hover:text-gold transition"
            >
              <span>Buka Seluruh Galeri Foto ({totalMemories})</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Masonry / Grid Photo Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredMemories.map((m) => (
              <div
                key={m.id}
                className="group relative rounded-3xl overflow-hidden bg-white shadow-sm hover:shadow-xl transition-all duration-300 border border-navy-100"
              >
                <div className="aspect-[4/3] overflow-hidden bg-navy-900 relative">
                  <img
                    src={m.imageUrl}
                    alt={m.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="text-[11px] px-3 py-1 rounded-full bg-navy-950/80 backdrop-blur-md text-gold font-medium border border-gold/30">
                      {m.category}
                    </span>
                  </div>
                  {m.eventDate && (
                    <div className="absolute bottom-4 right-4 text-[10px] px-2 py-0.5 rounded bg-black/60 text-white backdrop-blur-sm">
                      {m.eventDate}
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <h3 className="font-serif text-lg font-bold text-navy-950 mb-1 group-hover:text-gold-dark transition">
                    {m.title}
                  </h3>
                  {m.caption && (
                    <p className="text-xs text-charcoal-light leading-relaxed line-clamp-2">
                      {m.caption}
                    </p>
                  )}
                  <div className="mt-4 pt-3 border-t border-cream-200 flex items-center justify-between text-[11px] text-dusty-blue">
                    <span>Oleh: <strong className="text-charcoal">{m.uploadedBy || 'Siswa'}</strong></span>
                    <span className="flex items-center space-x-1 text-gold-dark">
                      <Heart className="w-3.5 h-3.5 fill-gold-dark" />
                      <span>{m.likesCount} suka</span>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 7. QUOTES SHOWCASE */}
      <section className="py-24 bg-gradient-to-b from-navy-950 to-navy-900 text-white relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <QuoteIcon className="w-12 h-12 text-gold mx-auto mb-4 opacity-70" />
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-warm-white">
              Kata-Kata Emas Siswa
            </h2>
            <p className="text-dusty-blue text-sm sm:text-base mt-3 font-light">
              Pesan, renungan, dan kutipan inspiratif yang menjadi pegangan kami melangkah ke masa depan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {featuredQuotes.map((q) => (
              <div
                key={q.id}
                className="p-8 rounded-3xl bg-navy-900/80 border border-navy-800 hover:border-gold/40 transition shadow-xl relative"
              >
                <p className="font-serif italic text-lg sm:text-xl text-cream-100 leading-relaxed mb-6">
                  “{q.quoteText}”
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-navy-800 text-xs">
                  <div>
                    <h4 className="font-semibold text-gold text-sm">{q.authorName}</h4>
                    <span className="text-dusty-blue">Kelas {q.authorClass}</span>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-navy-800 text-cream-300 text-[11px] border border-navy-700">
                    {q.category}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/quotes"
              className="inline-flex items-center space-x-2 text-sm text-gold hover:underline font-semibold"
            >
              <span>Lihat Seluruh Wall of Quotes &rarr;</span>
            </Link>
          </div>

        </div>
      </section>

      {/* 8. TEACHERS APPRECIATION PREVIEW */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center space-x-2 text-gold-dark text-xs font-bold uppercase tracking-widest mb-2">
              <GraduationCap className="w-4 h-4" />
              <span>Pahlawan Tanpa Tanda Jasa</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-navy-950">
              Guru & Staf Penuh Inspirasi
            </h2>
            <p className="text-charcoal-light text-sm sm:text-base mt-2">
              Terima kasih tak terhingga atas ilmu, kesabaran, dan bimbingan yang telah membentuk karakter kami.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {teachersList.map((t) => (
              <div
                key={t.id}
                className="group rounded-3xl overflow-hidden bg-cream-50 border border-navy-100 shadow-sm hover:shadow-lg transition text-center p-6"
              >
                <div className="w-28 h-28 mx-auto rounded-full overflow-hidden mb-4 border-2 border-gold/40 shadow-md">
                  <img
                    src={t.photo || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&auto=format&fit=crop&q=80'}
                    alt={t.fullName}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                </div>
                <h3 className="font-serif text-lg font-bold text-navy-950">
                  {t.fullName}
                </h3>
                <p className="text-xs font-semibold text-gold-dark mt-0.5">
                  {t.subject}
                </p>
                {t.position && (
                  <p className="text-[11px] text-dusty-blue mt-0.5">
                    {t.position}
                  </p>
                )}
                {t.quote && (
                  <p className="text-xs text-charcoal italic font-serif mt-3 pt-3 border-t border-cream-200 line-clamp-2">
                    “{t.quote}”
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/teachers"
              className="inline-flex items-center space-x-2 text-sm text-navy hover:text-gold-dark font-semibold transition"
            >
              <span>Lihat Seluruh Dewan Guru SMPN 1 Rajapolah &rarr;</span>
            </Link>
          </div>

        </div>
      </section>

      {/* 9. CALL TO ACTION / ENTER YEARBOOK */}
      <section className="py-20 bg-navy text-white text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <span className="text-xs font-bold uppercase tracking-widest text-gold px-3 py-1 rounded-full bg-gold/15 border border-gold/30">
            SMPN 1 Rajapolah • Angkatan 2026/2027
          </span>

          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-warm-white mt-6 mb-4">
            Buka Lembaran Kenanganmu Sekarang
          </h2>

          <p className="text-cream-200 text-sm sm:text-base max-w-2xl mx-auto mb-10 leading-relaxed font-light">
            Apakah kamu siswa kelas IX? Masuk ke akunmu untuk melengkapi biodata, mengunggah foto terbaik, dan menuliskan pesan perpisahanmu sebelum tanggal kelulusan tiba!
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/login"
              className="px-8 py-3.5 rounded-full bg-gold hover:bg-gold-light text-navy-950 font-bold text-sm sm:text-base transition shadow-xl"
            >
              Masuk Akun Siswa & Admin
            </Link>
            <Link
              href="/students"
              className="px-8 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold text-sm sm:text-base transition"
            >
              Jelajahi Sebagai Tamu
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
