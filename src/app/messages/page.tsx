'use client';

import React, { useState, useEffect } from 'react';
import { MessageSquare, Heart, Plus, Send, X, Filter } from 'lucide-react';
import EmptyState from '@/components/EmptyState';
import { useToast } from '@/components/Toast';

export default function MessagesPage() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecipient, setSelectedRecipient] = useState('ALL');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [senderName, setSenderName] = useState('');
  const [senderClass, setSenderClass] = useState('9A');
  const [recipientType, setRecipientType] = useState('FRIENDS');
  const [title, setTitle] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const recipientTabs = [
    { key: 'ALL', label: 'Semua Pesan' },
    { key: 'FRIENDS', label: 'Sahabat' },
    { key: 'TEACHERS', label: 'Guru' },
    { key: 'SCHOOL', label: 'Sekolah' },
    { key: 'FUTURE_SELF', label: 'Masa Depan' },
    { key: 'GRADUATION', label: 'Wisuda' },
  ];

  useEffect(() => {
    loadMessages();
  }, [selectedRecipient]);

  const loadMessages = () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set('public', 'true');
    if (selectedRecipient && selectedRecipient !== 'ALL') {
      params.set('recipientType', selectedRecipient);
    }

    fetch(`/api/messages?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.messages) setMessages(data.messages);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  const handleLike = async (id: string) => {
    try {
      const res = await fetch(`/api/messages/${id}/like`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setMessages((prev) =>
          prev.map((m) => (m.id === id ? { ...m, likesCount: data.likesCount } : m))
        );
      }
    } catch (err) {}
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageContent) {
      toast('Isi pesan wajib diisi', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderName: isAnonymous ? 'Anonim' : senderName,
          senderClass: isAnonymous ? '' : senderClass,
          recipientType,
          title: title || 'Pesan Perpisahan',
          messageContent,
          isAnonymous,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gagal mengirim pesan');

      toast('Pesan perpisahan berhasil dikirim!', 'success');
      setModalOpen(false);
      setMessageContent('');
      setTitle('');
      loadMessages();
    } catch (err: any) {
      toast(err.message || 'Gagal mengirim pesan', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <div className="inline-flex items-center space-x-2 text-gold-dark text-xs font-bold uppercase tracking-widest mb-2">
            <MessageSquare className="w-4 h-4" />
            <span>Wall of Messages & Surat Perpisahan</span>
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-navy-950">
            Ungkapan Hati & Kenangan
          </h1>
          <p className="text-sm sm:text-base text-charcoal font-light mt-2 max-w-2xl">
            Surat terbuka, curahan hati, canda tawa, dan doa tulus untuk sahabat, guru, sekolah, dan masa depan kita.
          </p>
        </div>

        {/* Write message button */}
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center space-x-2 px-6 py-3 rounded-full bg-gold hover:bg-gold-light text-navy-950 font-bold text-sm transition shadow-md hover:shadow-lg self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tulis Pesan Perpisahan</span>
        </button>
      </div>

      {/* Recipient Filter Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
        {recipientTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setSelectedRecipient(tab.key)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-semibold transition ${
              selectedRecipient === tab.key
                ? 'bg-navy text-gold shadow-md'
                : 'bg-white text-charcoal hover:bg-navy-50 border border-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Scrapbook Cards Masonry Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-48 rounded-3xl bg-gray-200 animate-pulse" />
          ))}
        </div>
      ) : messages.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className="p-6 rounded-3xl bg-white border border-navy-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between relative overflow-hidden"
            >
              {/* Top Category Badge */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-cream-200/80 text-navy-900">
                  {msg.recipientType}
                </span>
                <span className="text-[11px] text-gray-400">
                  {new Date(msg.createdAt).toLocaleDateString('id-ID')}
                </span>
              </div>

              {/* Message Content */}
              <div className="flex-1 mb-6">
                {msg.title && (
                  <h3 className="font-serif text-lg font-bold text-navy-950 mb-2">
                    {msg.title}
                  </h3>
                )}
                <p className="text-xs sm:text-sm text-charcoal leading-relaxed whitespace-pre-line font-light">
                  “{msg.messageContent}”
                </p>
              </div>

              {/* Author & Like Action */}
              <div className="pt-4 border-t border-cream-200 flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-semibold text-navy">
                    {msg.isAnonymous ? 'Anonim (Dirahasiakan)' : msg.senderName}
                  </h4>
                  {!msg.isAnonymous && msg.senderClass && (
                    <span className="text-dusty-blue text-[11px]">Kelas {msg.senderClass}</span>
                  )}
                </div>

                <button
                  onClick={() => handleLike(msg.id)}
                  className="flex items-center space-x-1 text-gold-dark hover:scale-110 transition-transform p-1.5 rounded-lg hover:bg-gold/10"
                  title="Sukai pesan ini"
                >
                  <Heart className="w-4 h-4 fill-gold-dark" />
                  <span className="font-semibold">{msg.likesCount}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="Belum Ada Pesan untuk Kategori Ini"
          description="Tuliskan ungkapan pertamamu untuk teman, guru, atau almamater tercinta!"
          actionText="Tulis Pesan Sekarang"
          onAction={() => setModalOpen(true)}
        />
      )}

      {/* Write Message Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/70 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-navy-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
              <div className="flex items-center space-x-2 text-navy-950">
                <Send className="w-5 h-5 text-gold-dark" />
                <h3 className="font-serif text-xl font-bold">Tulis Pesan Perpisahan</h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-navy-900 uppercase tracking-wider mb-1">
                    Nama Kamu
                  </label>
                  <input
                    type="text"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="Nama Lengkap / Panggilan"
                    disabled={isAnonymous}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-gold focus:ring-2 focus:ring-gold/20 text-sm outline-none disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-navy-900 uppercase tracking-wider mb-1">
                    Kelas
                  </label>
                  <select
                    value={senderClass}
                    onChange={(e) => setSenderClass(e.target.value)}
                    disabled={isAnonymous}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-gold focus:ring-2 focus:ring-gold/20 text-sm outline-none bg-white disabled:bg-gray-100"
                  >
                    {['9A', '9B', '9C', '9D', '9E', '9F', '9G', '9H', '9I', '9J', '9K'].map((c) => (
                      <option key={c} value={c}>Kelas {c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="flex items-center space-x-2 text-xs text-charcoal cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="rounded text-gold focus:ring-gold"
                  />
                  <span>Kirim sebagai Anonim (Tanpa Nama)</span>
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy-900 uppercase tracking-wider mb-1">
                  Ditujukan Kepada
                </label>
                <select
                  value={recipientType}
                  onChange={(e) => setRecipientType(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-gold focus:ring-2 focus:ring-gold/20 text-sm outline-none bg-white"
                >
                  <option value="FRIENDS">Sahabat & Kawan Seangkatan</option>
                  <option value="TEACHERS">Bapak & Ibu Guru</option>
                  <option value="SCHOOL">Almamater SMPN 1 Rajapolah</option>
                  <option value="FUTURE_SELF">Diriku di Masa Depan</option>
                  <option value="GRADUATION">Ucapan Selamat Wisuda</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy-900 uppercase tracking-wider mb-1">
                  Judul Pesan (Opsional)
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Terima Kasih Sahabat Terbaikku"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-gold focus:ring-2 focus:ring-gold/20 text-sm outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy-900 uppercase tracking-wider mb-1">
                  Isi Pesan / Ungkapan *
                </label>
                <textarea
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  rows={4}
                  required
                  placeholder="Tuliskan kata-kata tulusmu di sini..."
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-gold focus:ring-2 focus:ring-gold/20 text-sm outline-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-charcoal hover:bg-gray-100 rounded-xl transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-gold hover:bg-gold-light text-navy-950 font-bold text-xs transition shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? 'Mengirim...' : 'Kirim Pesan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
