'use client';

import React, { useState, useEffect } from 'react';
import { Camera, Search, Filter, Heart, Upload, Sparkles, X, Plus } from 'lucide-react';
import Lightbox from '@/components/Lightbox';
import EmptyState from '@/components/EmptyState';
import { useToast } from '@/components/Toast';
import { compressImage } from '@/lib/imageCompression';

export default function MemoriesPage() {
  const { toast } = useToast();
  const [memories, setMemories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [search, setSearch] = useState('');
  
  // Lightbox State
  const [activePhoto, setActivePhoto] = useState<any | null>(null);
  const [activeIndex, setActiveIndex] = useState<number>(0);

  // Upload Modal State
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCaption, setUploadCaption] = useState('');
  const [uploadCategory, setUploadCategory] = useState('Classroom Moments');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    'All',
    'First Day of School',
    'Classroom Moments',
    'School Events',
    'Sports Day',
    'Competitions',
    'Study Tour',
    'Graduation',
    'Behind the Scenes',
    'Friendship',
    'Random Memories',
  ];

  useEffect(() => {
    loadMemories();
  }, [selectedCategory]);

  const loadMemories = () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set('public', 'true');
    if (selectedCategory && selectedCategory !== 'All') {
      params.set('category', selectedCategory);
    }
    if (search) {
      params.set('search', search);
    }

    fetch(`/api/memories?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.memories) setMemories(data.memories);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  const handleLike = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/memories/${id}/like`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setMemories((prev) =>
          prev.map((m) => (m.id === id ? { ...m, likesCount: data.likesCount } : m))
        );
      }
    } catch (err) {}
  };

  const openLightbox = (m: any, index: number) => {
    setActivePhoto(m);
    setActiveIndex(index);
  };

  const nextPhoto = () => {
    if (memories.length === 0) return;
    const nextIdx = (activeIndex + 1) % memories.length;
    setActiveIndex(nextIdx);
    setActivePhoto(memories[nextIdx]);
  };

  const prevPhoto = () => {
    if (memories.length === 0) return;
    const prevIdx = (activeIndex - 1 + memories.length) % memories.length;
    setActiveIndex(prevIdx);
    setActivePhoto(memories[prevIdx]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setUploadFile(f);
      setUploadPreview(URL.createObjectURL(f));
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle || (!uploadFile && !uploadPreview)) {
      toast('Judul dan foto wajib diisi.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      let finalUrl = uploadPreview;

      // Upload file to server
      if (uploadFile) {
        const compressed = await compressImage(uploadFile, 1600, 1600, 0.85);
        const formData = new FormData();
        formData.append('file', compressed);
        const upRes = await fetch('/api/upload', { method: 'POST', body: formData });
        const upData = await upRes.json();
        if (!upRes.ok) throw new Error(upData.message || 'Gagal upload file');
        finalUrl = upData.url;
      }

      // Save memory record
      const res = await fetch('/api/memories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: uploadTitle,
          imageUrl: finalUrl,
          caption: uploadCaption,
          category: uploadCategory,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gagal menyimpan kenangan');

      toast(data.message || 'Foto kenangan berhasil ditambahkan!', 'success');
      setUploadModalOpen(false);
      setUploadTitle('');
      setUploadCaption('');
      setUploadFile(null);
      setUploadPreview('');
      loadMemories();
    } catch (err: any) {
      toast(err.message || 'Gagal mengunggah foto', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <div className="inline-flex items-center space-x-2 text-gold-dark text-xs font-bold uppercase tracking-widest mb-2">
            <Camera className="w-4 h-4" />
            <span>Digital Scrapbook & Album Kenangan</span>
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-navy-950">
            Memory Wall Angkatan 2027
          </h1>
          <p className="text-sm sm:text-base text-charcoal font-light mt-2 max-w-2xl">
            Kumpulan potret momen berharga selama 3 tahun di SMPN 1 Rajapolah. Klik salah satu foto untuk melihat tampilan layar penuh dan detail kisahnya.
          </p>
        </div>

        {/* Upload Memory Button */}
        <button
          onClick={() => setUploadModalOpen(true)}
          className="inline-flex items-center space-x-2 px-6 py-3 rounded-full bg-gold hover:bg-gold-light text-navy-950 font-bold text-sm transition shadow-md hover:shadow-lg self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Foto Kenangan</span>
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-semibold transition ${
              selectedCategory === cat
                ? 'bg-navy text-gold shadow-md'
                : 'bg-white text-charcoal hover:bg-navy-50 border border-gray-200'
            }`}
          >
            {cat === 'All' ? 'Semua Momen' : cat}
          </button>
        ))}
      </div>

      {/* Gallery Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="aspect-[4/3] rounded-3xl bg-gray-200 animate-pulse" />
          ))}
        </div>
      ) : memories.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {memories.map((m, idx) => (
            <div
              key={m.id}
              onClick={() => openLightbox(m, idx)}
              className="group cursor-pointer rounded-3xl overflow-hidden bg-white border border-navy-100 shadow-sm hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-navy-900">
                <img
                  src={m.imageUrl}
                  alt={m.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3">
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-navy-950/80 backdrop-blur-md text-gold font-medium border border-gold/30">
                    {m.category}
                  </span>
                </div>
                {m.eventDate && (
                  <div className="absolute bottom-3 right-3 text-[10px] px-2 py-0.5 rounded bg-black/60 text-white backdrop-blur-sm">
                    {m.eventDate}
                  </div>
                )}
              </div>

              <div className="p-4">
                <h3 className="font-serif text-base font-bold text-navy-950 group-hover:text-gold-dark transition line-clamp-1">
                  {m.title}
                </h3>
                {m.caption && (
                  <p className="text-xs text-charcoal-light mt-1 line-clamp-2">
                    {m.caption}
                  </p>
                )}
                
                <div className="mt-4 pt-3 border-t border-cream-200 flex items-center justify-between text-[11px] text-dusty-blue">
                  <span className="truncate max-w-[140px]">
                    Oleh: <strong className="text-charcoal">{m.uploadedBy || 'Siswa'}</strong>
                  </span>
                  <button
                    onClick={(e) => handleLike(e, m.id)}
                    className="flex items-center space-x-1 text-gold-dark hover:scale-110 transition-transform"
                    title="Suka foto ini"
                  >
                    <Heart className="w-3.5 h-3.5 fill-gold-dark" />
                    <span>{m.likesCount}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="Belum Ada Foto untuk Kategori Ini"
          description="Jadilah yang pertama mengunggah foto kenangan manis di kategori ini!"
          actionText="Tambah Foto Kenangan"
          onAction={() => setUploadModalOpen(true)}
        />
      )}

      {/* Lightbox Viewer */}
      {activePhoto && (
        <Lightbox
          isOpen={Boolean(activePhoto)}
          onClose={() => setActivePhoto(null)}
          imageUrl={activePhoto.imageUrl}
          title={activePhoto.title}
          caption={activePhoto.caption}
          category={activePhoto.category}
          date={activePhoto.eventDate}
          uploader={activePhoto.uploadedBy}
          onNext={nextPhoto}
          onPrev={prevPhoto}
        />
      )}

      {/* Upload Photo Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/70 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-navy-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
              <div className="flex items-center space-x-2 text-navy-950">
                <Camera className="w-5 h-5 text-gold-dark" />
                <h3 className="font-serif text-xl font-bold">Unggah Foto Kenangan</h3>
              </div>
              <button
                onClick={() => setUploadModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-navy-900 uppercase tracking-wider mb-1">
                  Judul Foto / Momen *
                </label>
                <input
                  type="text"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="Contoh: Study Tour ke Borobudur"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-gold focus:ring-2 focus:ring-gold/20 text-sm outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy-900 uppercase tracking-wider mb-1">
                  Kategori Kenangan
                </label>
                <select
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-gold focus:ring-2 focus:ring-gold/20 text-sm outline-none bg-white"
                >
                  {categories.filter((c) => c !== 'All').map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy-900 uppercase tracking-wider mb-1">
                  Pilih File Foto (JPG/PNG/WEBP, Maks 5 MB) *
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="w-full text-xs text-charcoal file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-navy-50 file:text-navy hover:file:bg-navy-100"
                />
              </div>

              {uploadPreview && (
                <div className="rounded-2xl overflow-hidden aspect-[16/9] bg-gray-100 border border-gray-200">
                  <img src={uploadPreview} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-navy-900 uppercase tracking-wider mb-1">
                  Kisah / Caption Singkat
                </label>
                <textarea
                  value={uploadCaption}
                  onChange={(e) => setUploadCaption(e.target.value)}
                  rows={3}
                  placeholder="Ceritakan momen seru di balik foto ini..."
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-gold focus:ring-2 focus:ring-gold/20 text-sm outline-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setUploadModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-charcoal hover:bg-gray-100 rounded-xl transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-gold hover:bg-gold-light text-navy-950 font-bold text-xs transition shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? 'Mengunggah...' : 'Kirim Foto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
