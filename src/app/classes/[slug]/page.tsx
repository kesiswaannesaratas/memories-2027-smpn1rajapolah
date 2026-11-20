import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, School, Users, GraduationCap, Camera, ChevronRight } from 'lucide-react';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function ClassDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;

  const classData = await prisma.class.findFirst({
    where: {
      OR: [{ classSlug: slug.toLowerCase() }, { id: slug }],
    },
    include: {
      homeroomTeacher: true,
      students: {
        where: { profileStatus: 'APPROVED', isPublished: true },
        orderBy: { fullName: 'asc' },
      },
      memories: {
        where: { approvalStatus: 'APPROVED' },
        take: 6,
      },
    },
  });

  if (!classData) {
    notFound();
  }

  return (
    <div className="min-h-screen pb-20">
      
      {/* Hero Class Banner */}
      <section className="relative bg-navy-950 text-white py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{
            backgroundImage: `url('${classData.classPhoto || 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1600&auto=format&fit=crop&q=80'}')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/80 to-navy-950/50" />

        <div className="relative z-10 max-w-7xl mx-auto">
          <Link
            href="/classes"
            className="inline-flex items-center space-x-2 text-xs font-semibold text-gold hover:text-white transition mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Seluruh Kelas</span>
          </Link>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center space-x-4">
                <span className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gold text-navy-950 font-serif font-black text-3xl sm:text-4xl flex items-center justify-center shadow-xl">
                  {classData.className}
                </span>
                <div>
                  <h1 className="font-serif text-3xl sm:text-5xl font-bold text-warm-white">
                    Kelas {classData.className}
                  </h1>
                  <p className="text-xs sm:text-sm text-dusty-blue uppercase tracking-wider mt-1">
                    SMPN 1 Rajapolah • Angkatan 2026/2027
                  </p>
                </div>
              </div>

              {classData.classMotto && (
                <p className="font-serif text-lg sm:text-xl italic text-cream-200 mt-6 max-w-2xl">
                  “{classData.classMotto}”
                </p>
              )}
            </div>

            {/* Homeroom Teacher Badge */}
            {classData.homeroomTeacher && (
              <div className="p-4 rounded-2xl bg-navy-900/90 border border-navy-800 flex items-center space-x-4 max-w-sm">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gold shrink-0">
                  <img
                    src={classData.homeroomTeacher.photo || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&auto=format&fit=crop&q=80'}
                    alt={classData.homeroomTeacher.fullName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-dusty-blue uppercase tracking-wider block">Wali Kelas</span>
                  <h4 className="font-serif text-sm font-bold text-white">{classData.homeroomTeacher.fullName}</h4>
                  <p className="text-[11px] text-gold">{classData.homeroomTeacher.subject}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        
        {/* Class Description */}
        {classData.classDescription && (
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-navy-100 shadow-sm mb-12">
            <h3 className="font-serif text-xl font-bold text-navy-950 mb-2">Tentang Kelas {classData.className}</h3>
            <p className="text-sm sm:text-base text-charcoal leading-relaxed">
              {classData.classDescription}
            </p>
          </div>
        )}

        {/* Student Roster Grid */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-navy-950">
                Daftar Siswa Kelas {classData.className}
              </h2>
              <p className="text-xs text-charcoal-light mt-1">
                Total {classData.students.length} siswa terdaftar
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {classData.students.map((st) => (
              <Link
                key={st.id}
                href={`/students/${st.slug}`}
                className="group rounded-3xl overflow-hidden bg-white border border-navy-100 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 block"
              >
                <div className="aspect-[4/5] overflow-hidden bg-navy-900 relative">
                  <img
                    src={st.profilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80'}
                    alt={st.fullName}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-950/90 via-navy-950/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                    <span className="text-xs text-gold uppercase tracking-wider font-semibold">
                      {st.nickname}
                    </span>
                    <h3 className="font-serif text-lg font-bold text-white group-hover:text-gold transition">
                      {st.fullName}
                    </h3>
                    {st.motto && (
                      <p className="text-[11px] text-cream-300 italic font-serif mt-1 line-clamp-2">
                        “{st.motto}”
                      </p>
                    )}
                  </div>
                </div>

                <div className="p-3 bg-cream-50 flex items-center justify-between text-xs text-charcoal">
                  <span className="truncate max-w-[150px] text-dusty-blue">
                    Cita-cita: <strong className="text-navy">{st.dream || 'Sukses'}</strong>
                  </span>
                  <span className="text-gold font-bold">&rarr;</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Class Memories Preview */}
        {classData.memories && classData.memories.length > 0 && (
          <div className="border-t border-navy-100 pt-12">
            <h2 className="font-serif text-2xl font-bold text-navy-950 mb-6 flex items-center space-x-2">
              <Camera className="w-5 h-5 text-gold-dark" />
              <span>Foto Kenangan Kelas {classData.className}</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {classData.memories.map((m) => (
                <div key={m.id} className="rounded-2xl overflow-hidden bg-white shadow-sm border border-navy-100">
                  <div className="aspect-[4/3] overflow-hidden bg-navy-900">
                    <img src={m.imageUrl} alt={m.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-4">
                    <h4 className="font-serif font-bold text-navy-900 text-sm">{m.title}</h4>
                    {m.caption && <p className="text-xs text-charcoal-light mt-1 line-clamp-2">{m.caption}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
