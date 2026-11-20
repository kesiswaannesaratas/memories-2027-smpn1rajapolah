'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { School, Users } from 'lucide-react';
import StudentSidebar from '@/components/StudentSidebar';

export default function StudentMyClassPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [classData, setClassData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then(async (data) => {
        if (!data.user) {
          router.push('/login');
          return;
        }
        setUser(data.user);
        if (data.user.classId) {
          const cRes = await fetch(`/api/classes/${data.user.classId}`);
          const cData = await cRes.json();
          if (cData.class) setClassData(cData.class);
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

  return (
    <div className="min-h-screen flex bg-cream">
      <StudentSidebar
        studentName={user?.student?.fullName || user.username}
        studentClass={user.className || 'IX'}
        studentSlug={user?.student?.slug}
        profileStatus={user?.student?.profileStatus || 'DRAFT'}
      />

      <main className="flex-1 p-6 sm:p-10 lg:p-12 overflow-y-auto">
        <div className="max-w-5xl mx-auto space-y-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-gold-dark">
              Keluarga Besar Kelas
            </span>
            <h1 className="font-serif text-3xl font-bold text-navy-950 mt-1">
              Kelas {classData?.className || user.className}
            </h1>
            {classData?.classMotto && (
              <p className="font-serif italic text-sm text-charcoal mt-2">
                “{classData.classMotto}”
              </p>
            )}
          </div>

          {/* Homeroom teacher */}
          {classData?.homeroomTeacher && (
            <div className="p-6 rounded-3xl bg-white border border-navy-100 shadow-sm flex items-center space-x-6">
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gold shrink-0">
                <img
                  src={classData.homeroomTeacher.photo || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&auto=format&fit=crop&q=80'}
                  alt={classData.homeroomTeacher.fullName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <span className="text-xs text-dusty-blue uppercase font-bold tracking-wider">Wali Kelas</span>
                <h3 className="font-serif text-lg font-bold text-navy-950">{classData.homeroomTeacher.fullName}</h3>
                <p className="text-xs text-gold-dark font-medium">{classData.homeroomTeacher.subject}</p>
              </div>
            </div>
          )}

          {/* Classmates */}
          <div>
            <h3 className="font-serif text-xl font-bold text-navy-950 mb-4 flex items-center space-x-2">
              <Users className="w-5 h-5 text-gold-dark" />
              <span>Teman-Teman Sekelas ({classData?.students?.length || 0})</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {classData?.students?.map((st: any) => (
                <Link
                  key={st.id}
                  href={`/students/${st.slug}`}
                  className="p-4 rounded-2xl bg-white border border-navy-100 shadow-sm hover:shadow-md transition flex items-center space-x-3"
                >
                  <img
                    src={st.profilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
                    alt={st.fullName}
                    className="w-12 h-12 rounded-full object-cover border border-gold/40"
                  />
                  <div className="overflow-hidden">
                    <h4 className="font-serif font-bold text-sm text-navy truncate">{st.fullName}</h4>
                    <p className="text-xs text-dusty-blue">“{st.nickname}”</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
