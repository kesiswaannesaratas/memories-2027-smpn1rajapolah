'use client';

import React, { useState, useEffect } from 'react';
import { MessageSquare, Trash2, CheckCircle2 } from 'lucide-react';
import AdminSidebar from '@/components/AdminSidebar';
import { useToast } from '@/components/Toast';

export default function AdminMessagesPage() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = () => {
    fetch('/api/messages')
      .then((r) => r.json())
      .then((d) => {
        if (d.messages) setMessages(d.messages);
      });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus pesan ini?')) return;
    try {
      await fetch(`/api/messages/${id}`, { method: 'DELETE' });
      toast('Pesan berhasil dihapus', 'success');
      loadMessages();
    } catch (e) {}
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-cream">
      <AdminSidebar />

      <main className="flex-1 p-6 sm:p-10 lg:p-12 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-gold-dark">Admin Portal</span>
            <h1 className="font-serif text-3xl font-bold text-navy-950 mt-1">Manajemen Pesan Perpisahan</h1>
            <p className="text-xs text-charcoal-light mt-0.5">Pantau dan kelola surat terbuka siswa pada Wall of Messages.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {messages.map((msg) => (
              <div key={msg.id} className="p-6 rounded-3xl bg-white border border-navy-100 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-gold-dark uppercase">{msg.recipientType}</span>
                    <span className="text-xs text-gray-400">{new Date(msg.createdAt).toLocaleDateString('id-ID')}</span>
                  </div>
                  <h4 className="font-serif font-bold text-navy-950 text-base mb-1">{msg.title}</h4>
                  <p className="text-xs text-charcoal leading-relaxed whitespace-pre-line">“{msg.messageContent}”</p>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                  <div>
                    <strong className="text-navy">{msg.senderName}</strong>
                    {msg.senderClass && <span className="text-dusty-blue ml-1">({msg.senderClass})</span>}
                  </div>
                  <button onClick={() => handleDelete(msg.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
