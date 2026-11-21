'use client';

import React, { useState, useEffect } from 'react';
import { Quote, Plus, Trash2, Star, X } from 'lucide-react';
import AdminSidebar from '@/components/AdminSidebar';
import { useToast } from '@/components/Toast';

export default function AdminQuotesPage() {
  const { toast } = useToast();
  const [quotes, setQuotes] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [authorName, setAuthorName] = useState('');
  const [authorClass, setAuthorClass] = useState('9A');
  const [quoteText, setQuoteText] = useState('');
  const [category, setCategory] = useState('Life');

  useEffect(() => {
    loadQuotes();
  }, []);

  const loadQuotes = () => {
    fetch('/api/quotes')
      .then((r) => r.json())
      .then((d) => {
        if (d.quotes) setQuotes(d.quotes);
      });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authorName, authorClass, quoteText, category, isFeatured: true }),
      });
      if (!res.ok) throw new Error('Gagal');
      toast('Quote berhasil ditambahkan!', 'success');
      setModalOpen(false);
      setQuoteText('');
      loadQuotes();
    } catch (e: any) {
      toast(e.message, 'error');
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-cream">
      <AdminSidebar />

      <main className="flex-1 p-6 sm:p-10 lg:p-12 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-gold-dark">Admin Portal</span>
              <h1 className="font-serif text-3xl font-bold text-navy-950 mt-1">Quote Wall & Kata-Kata Mutiara</h1>
              <p className="text-xs text-charcoal-light mt-0.5">Kelola kutipan terbaik siswa untuk ditampilkan di beranda.</p>
            </div>

            <button
              onClick={() => setModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-gold hover:bg-gold-light text-navy-950 text-xs font-bold transition shadow-sm flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Quote Baru</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quotes.map((q) => (
              <div key={q.id} className="p-6 rounded-3xl bg-white border border-navy-100 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Quote className="w-6 h-6 text-gold/60" />
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cream-200 text-navy-950">
                      {q.category}
                    </span>
                  </div>
                  <p className="font-serif italic text-sm text-navy-950 mb-4">“{q.quoteText}”</p>
                </div>
                <div className="pt-3 border-t border-gray-100 text-xs text-navy font-semibold">
                  — {q.authorName} (Kelas {q.authorClass})
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/70 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-navy-100">
            <div className="flex items-center justify-between mb-4 pb-2 border-b">
              <h3 className="font-serif text-lg font-bold text-navy-950">Tambah Quote Baru</h3>
              <button onClick={() => setModalOpen(false)}><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-navy uppercase mb-1">Nama Penulis</label>
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  required
                  placeholder="Nama Siswa"
                  className="w-full px-4 py-2 border rounded-xl text-sm outline-none focus:border-gold"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-navy uppercase mb-1">Kelas</label>
                  <input
                    type="text"
                    value={authorClass}
                    onChange={(e) => setAuthorClass(e.target.value)}
                    placeholder="9A"
                    className="w-full px-4 py-2 border rounded-xl text-sm outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-navy uppercase mb-1">Kategori</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2 border rounded-xl text-sm outline-none bg-white focus:border-gold"
                  >
                    <option value="Friendship">Friendship</option>
                    <option value="Dreams">Dreams</option>
                    <option value="Life">Life</option>
                    <option value="School">School</option>
                    <option value="Graduation">Graduation</option>
                    <option value="Funny Quotes">Funny Quotes</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-navy uppercase mb-1">Teks Quote</label>
                <textarea
                  rows={3}
                  value={quoteText}
                  onChange={(e) => setQuoteText(e.target.value)}
                  required
                  placeholder="Kata-kata bijak / motivasi..."
                  className="w-full px-4 py-2 border rounded-xl text-sm outline-none focus:border-gold"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2 border-t">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-xs font-semibold">Batal</button>
                <button type="submit" className="px-5 py-2 bg-gold text-navy-950 font-bold text-xs rounded-xl">Simpan Quote</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
