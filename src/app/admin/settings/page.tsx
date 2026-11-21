'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Save, CheckCircle2 } from 'lucide-react';
import AdminSidebar from '@/components/AdminSidebar';
import { useToast } from '@/components/Toast';

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<any>({
    app_name: 'MEMORIES 2027',
    school_name: 'SMPN 1 RAJAPOLAH',
    academic_year: '2026/2027',
    tagline: 'One School, Many Stories, A Thousand Memories.',
    submission_deadline: '2027-05-30',
    hero_title: 'THE BEST YEARS.\nTHE BEAUTIFUL MEMORIES.',
    hero_subtitle: 'Selamat datang di ruang kenangan angkatan 2026/2027 SMPN 1 Rajapolah.',
    footer_text: '© 2027 Digital Yearbook SMPN 1 Rajapolah. Made with memories, made with love.',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((d) => {
        if (d.settings) setSettings((prev: any) => ({ ...prev, ...d.settings }));
      });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSettings((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error('Gagal');
      toast('Pengaturan website berhasil disimpan!', 'success');
    } catch (e: any) {
      toast(e.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-cream">
      <AdminSidebar />

      <main className="flex-1 p-6 sm:p-10 lg:p-12 overflow-y-auto">
        <div className="max-w-3xl mx-auto space-y-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-gold-dark">Admin Portal</span>
            <h1 className="font-serif text-3xl font-bold text-navy-950 mt-1">Pengaturan Website Buku Kenangan</h1>
            <p className="text-xs text-charcoal-light mt-0.5">Konfigurasi identitas sekolah, deadline pengisian profil, teks hero, dan footer.</p>
          </div>

          <form onSubmit={handleSave} className="bg-white p-8 rounded-3xl border border-navy-100 shadow-sm space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-navy uppercase mb-1">Nama Aplikasi</label>
                <input
                  type="text"
                  name="app_name"
                  value={settings.app_name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-xl text-sm outline-none focus:border-gold"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-navy uppercase mb-1">Tahun Pelajaran</label>
                <input
                  type="text"
                  name="academic_year"
                  value={settings.academic_year}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-xl text-sm outline-none focus:border-gold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-navy uppercase mb-1">Nama Resmi Sekolah</label>
              <input
                type="text"
                name="school_name"
                value={settings.school_name}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-xl text-sm outline-none focus:border-gold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-navy uppercase mb-1">Tagline Utama</label>
              <input
                type="text"
                name="tagline"
                value={settings.tagline}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-xl text-sm outline-none focus:border-gold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-navy uppercase mb-1">Batas Akhir Pengisian Profil Siswa (Deadline)</label>
              <input
                type="date"
                name="submission_deadline"
                value={settings.submission_deadline}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-xl text-sm outline-none focus:border-gold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-navy uppercase mb-1">Judul Besar Hero Landing Page</label>
              <textarea
                rows={2}
                name="hero_title"
                value={settings.hero_title}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-xl text-sm outline-none focus:border-gold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-navy uppercase mb-1">Subjudul Hero Landing Page</label>
              <textarea
                rows={2}
                name="hero_subtitle"
                value={settings.hero_subtitle}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-xl text-sm outline-none focus:border-gold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-navy uppercase mb-1">Teks Footer Hak Cipta</label>
              <input
                type="text"
                name="footer_text"
                value={settings.footer_text}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-xl text-sm outline-none focus:border-gold"
              />
            </div>

            <div className="pt-4 border-t flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-gold hover:bg-gold-light text-navy-950 font-bold text-xs shadow-md transition"
              >
                {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
