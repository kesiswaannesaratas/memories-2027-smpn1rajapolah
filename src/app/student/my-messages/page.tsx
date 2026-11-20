'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MessageSquare, Plus } from 'lucide-react';
import StudentSidebar from '@/components/StudentSidebar';

export default function StudentMyMessagesPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (!data.user) {
          router.push('/login');
          return;
        }
        setUser(data.user);
        fetch('/api/messages')
          .then((r) => r.json())
          .then((m) => {
            if (m.messages) {
              setMessages(m.messages.filter((msg: any) => msg.senderName === (data.user.fullName || data.user.username)));
            }
          });
      })
      .catch(() => router.push('/login'));
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
              <span className="text-xs font-bold uppercase tracking-widest text-gold-dark">Pesan Saya</span>
              <h1 className="font-serif text-3xl font-bold text-navy-950 mt-1">Surat Perpisahan yang Saya Tulis</h1>
            </div>
            <Link
              href="/messages"
              className="px-5 py-2.5 rounded-full bg-gold hover:bg-gold-light text-navy-950 font-bold text-xs transition"
            >
              + Tulis Pesan Baru
            </Link>
          </div>

          {messages.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {messages.map((m) => (
                <div key={m.id} className="p-6 rounded-3xl bg-white border border-navy-100 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-gold-dark uppercase">{m.recipientType}</span>
                    <span className="text-xs text-gray-400">{new Date(m.createdAt).toLocaleDateString('id-ID')}</span>
                  </div>
                  <h4 className="font-serif font-bold text-navy-950 text-base mb-2">{m.title}</h4>
                  <p className="text-xs text-charcoal leading-relaxed whitespace-pre-line">“{m.messageContent}”</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 bg-white rounded-3xl border border-navy-100 text-center">
              <MessageSquare className="w-12 h-12 text-gold mx-auto mb-3" />
              <h3 className="font-serif text-lg font-bold text-navy-950 mb-1">Belum Ada Pesan</h3>
              <p className="text-xs text-charcoal-light mb-4">Tuliskan pesan perpisahanmu untuk guru, teman, atau almamater!</p>
              <Link href="/messages" className="px-5 py-2 rounded-full bg-gold text-navy-950 text-xs font-bold">
                Tulis Pesan Sekarang
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
