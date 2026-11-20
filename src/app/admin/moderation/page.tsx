'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShieldCheck, CheckCircle2, XCircle, Eye, AlertCircle, RefreshCw } from 'lucide-react';
import AdminSidebar from '@/components/AdminSidebar';
import { useToast } from '@/components/Toast';

export default function AdminModerationPage() {
  const { toast } = useToast();
  const [data, setData] = useState<any>({ students: [], memories: [], messages: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'STUDENTS' | 'MEMORIES' | 'MESSAGES'>('STUDENTS');

  // Rejection modal
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [itemToReject, setItemToReject] = useState<{ type: string; id: string } | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    loadModeration();
  }, []);

  const loadModeration = () => {
    setLoading(true);
    fetch('/api/moderation')
      .then((r) => r.json())
      .then((d) => {
        if (d.pending) setData(d.pending);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  const handleApprove = async (type: string, id: string) => {
    try {
      const res = await fetch('/api/moderation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, id, action: 'APPROVE' }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.message);
      toast('Item berhasil disetujui (Approved)!', 'success');
      loadModeration();
    } catch (err: any) {
      toast(err.message || 'Gagal menyetujui', 'error');
    }
  };

  const handleOpenReject = (type: string, id: string) => {
    setItemToReject({ type, id });
    setRejectionReason('Mohon perbaiki kelengkapan foto atau tulisan Anda.');
    setRejectModalOpen(true);
  };

  const handleConfirmReject = async () => {
    if (!itemToReject) return;
    try {
      const res = await fetch('/api/moderation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: itemToReject.type,
          id: itemToReject.id,
          action: 'REJECT',
          rejectionReason,
        }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.message);
      toast('Item berhasil ditolak (Rejected) dengan catatan revisi.', 'info');
      setRejectModalOpen(false);
      loadModeration();
    } catch (err: any) {
      toast(err.message || 'Gagal menolak', 'error');
    }
  };

  return (
    <div className="min-h-screen flex bg-cream">
      <AdminSidebar />

      <main className="flex-1 p-6 sm:p-10 lg:p-12 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-8">
          
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-gold-dark">
                Admin Control
              </span>
              <h1 className="font-serif text-3xl font-bold text-navy-950 mt-1">
                Moderasi Konten Buku Kenangan
              </h1>
              <p className="text-xs text-charcoal-light mt-0.5">
                Pastikan seluruh foto dan pesan siswa sopan, positif, dan sesuai standar sebelum diterbitkan secara publik.
              </p>
            </div>

            <button
              onClick={loadModeration}
              className="p-2.5 rounded-xl bg-white border border-navy-200 text-navy hover:bg-navy-50 transition shadow-sm"
              title="Refresh Antrean"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center space-x-2 border-b border-navy-100 pb-2">
            <button
              onClick={() => setActiveTab('STUDENTS')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'STUDENTS'
                  ? 'bg-navy text-gold shadow-sm'
                  : 'text-charcoal hover:bg-white'
              }`}
            >
              Profil Siswa ({data.students?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('MEMORIES')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'MEMORIES'
                  ? 'bg-navy text-gold shadow-sm'
                  : 'text-charcoal hover:bg-white'
              }`}
            >
              Foto Kenangan ({data.memories?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('MESSAGES')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'MESSAGES'
                  ? 'bg-navy text-gold shadow-sm'
                  : 'text-charcoal hover:bg-white'
              }`}
            >
              Pesan Siswa ({data.messages?.length || 0})
            </button>
          </div>

          {/* Tab Content: Students */}
          {activeTab === 'STUDENTS' && (
            <div className="space-y-4">
              {data.students && data.students.length > 0 ? (
                data.students.map((st: any) => (
                  <div
                    key={st.id}
                    className="p-6 rounded-3xl bg-white border border-navy-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6"
                  >
                    <div className="flex items-start space-x-5">
                      <img
                        src={st.profilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                        alt={st.fullName}
                        className="w-16 h-16 rounded-2xl object-cover border-2 border-gold shrink-0"
                      />
                      <div>
                        <h4 className="font-serif font-bold text-lg text-navy-950">{st.fullName}</h4>
                        <p className="text-xs text-dusty-blue font-semibold">Kelas {st.class?.className || 'IX'} • “{st.nickname}”</p>
                        <p className="text-xs text-charcoal italic mt-1 font-serif line-clamp-1">“{st.motto}”</p>
                        <p className="text-xs text-charcoal-light mt-1">Cita-Cita: <strong className="text-navy">{st.dream || '-'}</strong></p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 self-end md:self-auto">
                      <Link
                        href={`/students/${st.slug}`}
                        target="_blank"
                        className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-navy text-xs font-semibold transition"
                      >
                        Pratinjau
                      </Link>
                      <button
                        onClick={() => handleOpenReject('STUDENT', st.id)}
                        className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold transition"
                      >
                        Tolak & Revisi
                      </button>
                      <button
                        onClick={() => handleApprove('STUDENT', st.id)}
                        className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm"
                      >
                        Setujui (Approve)
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 bg-white rounded-3xl text-center text-xs text-charcoal-light border border-navy-100">
                  Semua profil siswa yang diajukan sudah disetujui.
                </div>
              )}
            </div>
          )}

          {/* Tab Content: Memories */}
          {activeTab === 'MEMORIES' && (
            <div className="space-y-4">
              {data.memories && data.memories.length > 0 ? (
                data.memories.map((m: any) => (
                  <div
                    key={m.id}
                    className="p-6 rounded-3xl bg-white border border-navy-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6"
                  >
                    <div className="flex items-start space-x-5">
                      <img src={m.imageUrl} alt={m.title} className="w-20 h-16 rounded-xl object-cover shrink-0" />
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gold-dark">{m.category}</span>
                        <h4 className="font-serif font-bold text-base text-navy-950">{m.title}</h4>
                        <p className="text-xs text-charcoal-light mt-0.5">{m.caption}</p>
                        <p className="text-[11px] text-dusty-blue mt-1">Oleh: {m.uploadedBy}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 self-end md:self-auto">
                      <button
                        onClick={() => handleOpenReject('MEMORY', m.id)}
                        className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold transition"
                      >
                        Tolak Foto
                      </button>
                      <button
                        onClick={() => handleApprove('MEMORY', m.id)}
                        className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm"
                      >
                        Setujui Foto
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 bg-white rounded-3xl text-center text-xs text-charcoal-light border border-navy-100">
                  Tidak ada foto kenangan yang menunggu persetujuan.
                </div>
              )}
            </div>
          )}

          {/* Tab Content: Messages */}
          {activeTab === 'MESSAGES' && (
            <div className="space-y-4">
              {data.messages && data.messages.length > 0 ? (
                data.messages.map((msg: any) => (
                  <div
                    key={msg.id}
                    className="p-6 rounded-3xl bg-white border border-navy-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6"
                  >
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gold-dark">{msg.recipientType}</span>
                      <h4 className="font-serif font-bold text-base text-navy-950">{msg.title}</h4>
                      <p className="text-xs text-charcoal mt-1">“{msg.messageContent}”</p>
                      <p className="text-[11px] text-dusty-blue mt-2">Dari: {msg.senderName} ({msg.senderClass || 'IX'})</p>
                    </div>

                    <div className="flex items-center space-x-2 self-end md:self-auto">
                      <button
                        onClick={() => handleOpenReject('MESSAGE', msg.id)}
                        className="px-4 py-2 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold"
                      >
                        Tolak
                      </button>
                      <button
                        onClick={() => handleApprove('MESSAGE', msg.id)}
                        className="px-5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-sm"
                      >
                        Setujui
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 bg-white rounded-3xl text-center text-xs text-charcoal-light border border-navy-100">
                  Tidak ada pesan yang menunggu persetujuan.
                </div>
              )}
            </div>
          )}

        </div>
      </main>

      {/* Reject Modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/70 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-navy-100">
            <h3 className="font-serif text-lg font-bold text-navy-950 mb-2">Berikan Alasan Penolakan / Revisi</h3>
            <p className="text-xs text-charcoal-light mb-4">Siswa akan melihat catatan ini di dashboard mereka untuk diperbaiki.</p>

            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full px-3 py-2 border rounded-xl text-xs outline-none focus:border-gold mb-4"
              placeholder="Tuliskan catatan revisi..."
            />

            <div className="flex items-center justify-end space-x-2">
              <button onClick={() => setRejectModalOpen(false)} className="px-4 py-2 text-xs font-semibold text-charcoal">
                Batal
              </button>
              <button onClick={handleConfirmReject} className="px-5 py-2 bg-rose-600 text-white text-xs font-bold rounded-xl shadow-sm">
                Kirim Revisi & Tolak
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
