'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Camera, Plus } from 'lucide-react';
import StudentSidebar from '@/components/StudentSidebar';

export default function StudentMyMemoriesPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [memories, setMemories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (!data.user) {
          router.push('/login');
          return;
        }
        setUser(data.user);
        // Load memories
        fetch('/api/memories')
          .then((r) => r.json())
          .then((m) => {
            if (m.memories) {
              setMemories(m.memories.filter((item: any) => item.uploadedBy === (data.user.fullName || data.user.username)));
            }
          });
      })
      .catch(() => router.push('/login'))
      .finally(() => setLoading(false));
  }, [router]);

  return (
    <div className="min-h-screen flex bg-cream">
      <StudentSidebar
        studentName={user?.student?.fullName || user?.username}
        studentClass={user?.className || 'IX'}
        studentSlug={user?.student?.slug}
        profileStatus={user?.student?.profileStatus || 'DRAFT'}
      />

      <main className="flex-1 p-6 sm:p-10 lg:p-12 overflow-y-auto">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-gold-dark">Galeri Kenangan</span>
              <h1 className="font-serif text-3xl font-bold text-navy-950 mt-1">Kenangan yang Saya Unggah</h1>
            </div>
            <Link
              href="/memories"
              className="px-5 py-2.5 rounded-full bg-gold hover:bg-gold-light text-navy-950 font-bold text-xs transition"
            >
              + Unggah Foto Baru
            </Link>
          </div>

          {memories.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {memories.map((m) => (
                <div key={m.id} className="rounded-2xl overflow-hidden bg-white border border-navy-100 shadow-sm">
                  <div className="aspect-[4/3] overflow-hidden bg-navy-900">
                    <img src={m.imageUrl} alt={m.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-4">
                    <h4 className="font-serif font-bold text-navy-900 text-sm">{m.title}</h4>
                    <p className="text-xs text-charcoal-light mt-1">{m.caption}</p>
                    <div className="mt-3 pt-2 border-t border-cream-200 flex items-center justify-between text-[11px] text-dusty-blue">
                      <span>Status: {m.approvalStatus}</span>
                      <span>{m.likesCount} Suka</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 bg-white rounded-3xl border border-navy-100 text-center">
              <Camera className="w-12 h-12 text-gold mx-auto mb-3" />
              <h3 className="font-serif text-lg font-bold text-navy-950 mb-1">Belum Ada Foto</h3>
              <p className="text-xs text-charcoal-light mb-4">Ayo bagikan momen serumu ke galeri sekolah!</p>
              <Link href="/memories" className="px-5 py-2 rounded-full bg-gold text-navy-950 text-xs font-bold">
                Unggah Foto Sekarang
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
