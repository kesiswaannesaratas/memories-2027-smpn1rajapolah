'use client';

import React, { useState, useEffect } from 'react';
import { Camera, Trash2, CheckCircle2, Star } from 'lucide-react';
import AdminSidebar from '@/components/AdminSidebar';
import { useToast } from '@/components/Toast';

export default function AdminMemoriesPage() {
  const { toast } = useToast();
  const [memories, setMemories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMemories();
  }, []);

  const loadMemories = () => {
    fetch('/api/memories')
      .then((r) => r.json())
      .then((d) => {
        if (d.memories) setMemories(d.memories);
        setLoading(false);
      });
  };

  const handleToggleStatus = async (m: any) => {
    const newStatus = m.approvalStatus === 'APPROVED' ? 'PENDING' : 'APPROVED';
    try {
      await fetch(`/api/memories/${m.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approvalStatus: newStatus }),
      });
      toast(`Status foto diubah menjadi: ${newStatus}`, 'success');
      loadMemories();
    } catch (e) {}
  };

  const handleToggleFeatured = async (m: any) => {
    try {
      await fetch(`/api/memories/${m.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFeatured: !m.isFeatured }),
      });
      toast(`Foto ${!m.isFeatured ? 'dijadikan unggulan di homepage' : 'dihapus dari unggulan'}`, 'success');
      loadMemories();
    } catch (e) {}
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus foto kenangan ini?')) return;
    try {
      await fetch(`/api/memories/${id}`, { method: 'DELETE' });
      toast('Foto berhasil dihapus', 'success');
      loadMemories();
    } catch (e) {}
  };

  return (
    <div className="min-h-screen flex bg-cream">
      <AdminSidebar />

      <main className="flex-1 p-6 sm:p-10 lg:p-12 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-gold-dark">Admin Portal</span>
            <h1 className="font-serif text-3xl font-bold text-navy-950 mt-1">Manajemen Foto Kenangan</h1>
            <p className="text-xs text-charcoal-light mt-0.5">Kelola foto galeri, jadikan unggulan di homepage, atau hapus foto yang tidak pantas.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {memories.map((m) => (
              <div key={m.id} className="p-4 rounded-3xl bg-white border border-navy-100 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-navy-900 mb-3">
                    <img src={m.imageUrl} alt={m.title} className="w-full h-full object-cover" />
                    <span className="absolute top-2 left-2 text-[10px] px-2 py-0.5 rounded bg-black/60 text-gold font-bold">
                      {m.category}
                    </span>
                  </div>
                  <h4 className="font-serif font-bold text-navy-950 text-sm mb-1">{m.title}</h4>
                  <p className="text-xs text-charcoal-light line-clamp-2">{m.caption}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                  <button
                    onClick={() => handleToggleFeatured(m)}
                    className={`flex items-center space-x-1 p-1 rounded ${m.isFeatured ? 'text-amber-500 font-bold' : 'text-gray-400'}`}
                    title="Jadikan Foto Unggulan"
                  >
                    <Star className={`w-4 h-4 ${m.isFeatured ? 'fill-amber-500' : ''}`} />
                    <span>{m.isFeatured ? 'Unggulan' : 'Biasa'}</span>
                  </button>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleToggleStatus(m)}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${m.approvalStatus === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}
                    >
                      {m.approvalStatus}
                    </button>
                    <button
                      onClick={() => handleDelete(m.id)}
                      className="p-1 text-red-500 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
