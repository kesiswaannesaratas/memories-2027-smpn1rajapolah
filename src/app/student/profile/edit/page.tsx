'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  User, 
  Sparkles, 
  BookOpen, 
  GraduationCap, 
  Camera, 
  MessageSquare, 
  Eye, 
  Save, 
  CheckCircle2, 
  ArrowLeft, 
  ArrowRight,
  Upload,
  Trash2,
  AlertCircle
} from 'lucide-react';
import StudentSidebar from '@/components/StudentSidebar';
import { useToast } from '@/components/Toast';
import { compressImage } from '@/lib/imageCompression';

export default function StudentProfileEditPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [classes, setClasses] = useState<any[]>([]);

  // Wizard Form State
  const [formData, setFormData] = useState<any>({
    fullName: '',
    nickname: '',
    classId: '',
    nisn: '',
    profilePhoto: '',
    hobbies: '',
    personality: '',
    motto: '',
    instagram: '',
    email: '',
    // Step 2 About Me
    describeThreeWords: '',
    favoriteThingAboutSchool: '',
    favoriteSubject: '',
    favoriteFood: '',
    favoriteSong: '',
    favoriteMovie: '',
    favoritePlace: '',
    funniestMoment: '',
    unforgettableMemory: '',
    // Step 3 Memories
    schoolStory: '',
    favoriteTeacher: '',
    favoriteActivity: '',
    // Step 4 Dreams
    dream: '',
    futureSchool: '',
    futureMessage: '',
    favoriteQuote: '',
    // Step 5 Photos
    photos: [] as { imageUrl: string; caption: string }[],
    // Step 6 Messages
    farewellMessage: '',
  });

  useEffect(() => {
    Promise.all([
      fetch('/api/auth/me').then((r) => r.json()),
      fetch('/api/classes').then((r) => r.json()),
    ])
      .then(([userData, classData]) => {
        if (!userData.user) {
          router.push('/login');
          return;
        }
        setUser(userData.user);
        if (classData.classes) setClasses(classData.classes);

        const st = userData.user.student;
        if (st) {
          let ig = '';
          try {
            if (st.socialMedia) {
              const parsed = JSON.parse(st.socialMedia);
              ig = parsed.instagram || '';
            }
          } catch (e) {}

          setFormData({
            fullName: st.fullName || '',
            nickname: st.nickname || '',
            classId: st.classId || userData.user.classId || '',
            nisn: st.nisn || '',
            profilePhoto: st.profilePhoto || '',
            hobbies: st.hobbies || '',
            personality: st.personality || '',
            motto: st.motto || '',
            instagram: ig,
            email: userData.user.email || '',
            describeThreeWords: st.describeThreeWords || '',
            favoriteThingAboutSchool: st.favoriteThingAboutSchool || '',
            favoriteSubject: st.favoriteSubject || '',
            favoriteFood: st.favoriteFood || '',
            favoriteSong: st.favoriteSong || '',
            favoriteMovie: st.favoriteMovie || '',
            favoritePlace: st.favoritePlace || '',
            funniestMoment: st.funniestMoment || '',
            unforgettableMemory: st.unforgettableMemory || '',
            schoolStory: st.schoolStory || '',
            favoriteTeacher: st.favoriteTeacher || '',
            favoriteActivity: st.favoriteActivity || '',
            dream: st.dream || '',
            futureSchool: st.futureSchool || '',
            futureMessage: st.futureMessage || '',
            favoriteQuote: st.favoriteQuote || '',
            photos: st.photos || [],
            farewellMessage: st.futureMessage || '',
          });
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleProfilePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    toast('Mengompres dan mengunggah foto profil...', 'info');

    try {
      const compressed = await compressImage(file, 1000, 1000, 0.85);
      const fd = new FormData();
      fd.append('file', compressed);

      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gagal upload');
      setFormData((prev: any) => ({ ...prev, profilePhoto: data.url }));
      toast('Foto profil berhasil diunggah!', 'success');
    } catch (err: any) {
      toast(err.message || 'Gagal upload foto', 'error');
    }
  };

  const handlePersonalPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (formData.photos.length >= 5) {
      toast('Maksimal 5 foto kenangan pribadi.', 'error');
      return;
    }

    toast('Mengompres dan mengunggah foto...', 'info');

    try {
      const compressed = await compressImage(file, 1400, 1400, 0.82);
      const fd = new FormData();
      fd.append('file', compressed);

      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gagal upload');
      setFormData((prev: any) => ({
        ...prev,
        photos: [...prev.photos, { imageUrl: data.url, caption: '' }],
      }));
      toast('Foto berhasil ditambahkan!', 'success');
    } catch (err: any) {
      toast(err.message || 'Gagal upload foto', 'error');
    }
  };

  const removePersonalPhoto = (idx: number) => {
    setFormData((prev: any) => ({
      ...prev,
      photos: prev.photos.filter((_: any, i: number) => i !== idx),
    }));
  };

  const handlePhotoCaptionChange = (idx: number, text: string) => {
    setFormData((prev: any) => {
      const updated = [...prev.photos];
      updated[idx].caption = text;
      return { ...prev, photos: updated };
    });
  };

  const saveProfile = async (action: 'DRAFT' | 'SUBMIT') => {
    if (!user?.studentId) return;

    setSaving(true);
    try {
      const payload = {
        ...formData,
        socialMedia: JSON.stringify({ instagram: formData.instagram }),
        action,
      };

      const res = await fetch(`/api/students/${user.studentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gagal menyimpan');

      if (action === 'SUBMIT') {
        toast('🎉 Profil berhasil diajukan untuk ditinjau oleh Admin!', 'success');
        router.push('/student/dashboard');
      } else {
        toast('Draft profil berhasil disimpan!', 'success');
      }
    } catch (err: any) {
      toast(err.message || 'Gagal menyimpan', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="w-8 h-8 border-4 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const steps = [
    { num: 1, label: 'Identitas', icon: User },
    { num: 2, label: 'Tentang Saya', icon: Sparkles },
    { num: 3, label: 'Kenangan', icon: BookOpen },
    { num: 4, label: 'Cita-Cita', icon: GraduationCap },
    { num: 5, label: 'Foto Pribadi', icon: Camera },
    { num: 6, label: 'Pesan', icon: MessageSquare },
    { num: 7, label: 'Pratinjau', icon: Eye },
  ];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-cream">
      {/* Sidebar */}
      <StudentSidebar
        studentName={formData.fullName || user.username}
        studentClass={user.className || 'IX'}
        studentSlug={user?.student?.slug}
        profileStatus={user?.student?.profileStatus || 'DRAFT'}
      />

      {/* Main Wizard Area */}
      <main className="flex-1 p-6 sm:p-10 lg:p-12 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Top Title & Quick Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="font-serif text-3xl font-bold text-navy-950">
                Lengkapi Profil Buku Kenangan
              </h1>
              <p className="text-xs sm:text-sm text-charcoal-light mt-1">
                Ikuti langkah-langkah di bawah ini untuk mengisi halaman yearbook-mu.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => saveProfile('DRAFT')}
                disabled={saving}
                className="px-4 py-2 rounded-xl bg-white border border-navy-200 text-xs font-semibold text-navy hover:bg-navy-50 transition shadow-sm flex items-center space-x-1.5"
              >
                <Save className="w-3.5 h-3.5 text-gold-dark" />
                <span>{saving ? 'Menyimpan...' : 'Simpan Draft'}</span>
              </button>
            </div>
          </div>

          {/* Stepper Progress Bar */}
          <div className="bg-white p-4 rounded-3xl border border-navy-100 shadow-sm overflow-x-auto">
            <div className="flex items-center justify-between min-w-[500px]">
              {steps.map((s, idx) => {
                const Icon = s.icon;
                const isActive = currentStep === s.num;
                const isPassed = currentStep > s.num;
                return (
                  <div key={s.num} className="flex items-center flex-1 last:flex-none">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(s.num)}
                      className="flex flex-col items-center group cursor-pointer"
                    >
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-bold transition ${
                          isActive
                            ? 'bg-navy text-gold shadow-md ring-4 ring-gold/20'
                            : isPassed
                            ? 'bg-gold text-navy-950 font-bold'
                            : 'bg-gray-100 text-gray-400'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className={`text-[10px] mt-1.5 font-medium whitespace-nowrap ${isActive ? 'text-navy font-bold' : 'text-gray-500'}`}>
                        {s.label}
                      </span>
                    </button>
                    {idx < steps.length - 1 && (
                      <div className={`flex-1 h-0.5 mx-2 ${isPassed ? 'bg-gold' : 'bg-gray-200'}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form Content Card */}
          <div className="bg-white p-6 sm:p-10 rounded-3xl border border-navy-100 shadow-md">
            
            {/* STEP 1: PERSONAL IDENTITY */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="border-b border-gray-100 pb-4 mb-6">
                  <h3 className="font-serif text-xl font-bold text-navy-950">Langkah 1: Identitas Pribadi</h3>
                  <p className="text-xs text-charcoal-light mt-1">Data dasar untuk profil yearbook-mu.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-navy-900 uppercase tracking-wider mb-1.5">
                      Nama Lengkap *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                      placeholder="Nama lengkap sesuai ijazah"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-gold focus:ring-2 focus:ring-gold/20 text-sm outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-navy-900 uppercase tracking-wider mb-1.5">
                      Nama Panggilan (Nickname) *
                    </label>
                    <input
                      type="text"
                      name="nickname"
                      value={formData.nickname}
                      onChange={handleChange}
                      required
                      placeholder="Contoh: Faiz"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-gold focus:ring-2 focus:ring-gold/20 text-sm outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-navy-900 uppercase tracking-wider mb-1.5">
                      Kelas
                    </label>
                    <select
                      name="classId"
                      value={formData.classId}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-gold focus:ring-2 focus:ring-gold/20 text-sm outline-none bg-white"
                    >
                      <option value="">Pilih Kelas</option>
                      {classes.map((c) => (
                        <option key={c.id} value={c.id}>Kelas {c.className}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-navy-900 uppercase tracking-wider mb-1.5">
                      Akun Instagram (Opsional)
                    </label>
                    <input
                      type="text"
                      name="instagram"
                      value={formData.instagram}
                      onChange={handleChange}
                      placeholder="@username_kamu"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-gold focus:ring-2 focus:ring-gold/20 text-sm outline-none"
                    />
                  </div>
                </div>

                {/* Profile Photo Upload */}
                <div className="pt-4 border-t border-gray-100">
                  <label className="block text-xs font-semibold text-navy-900 uppercase tracking-wider mb-2">
                    Foto Profil Utama (Portrait) *
                  </label>
                  <div className="flex items-center space-x-6">
                    <div className="w-24 h-28 rounded-2xl overflow-hidden bg-navy-900 border-2 border-gold/40 shadow-inner shrink-0">
                      {formData.profilePhoto ? (
                        <img src={formData.profilePhoto} alt="Profil" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gold">
                          <User className="w-8 h-8" />
                        </div>
                      )}
                    </div>
                    <div>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleProfilePhotoUpload}
                        className="text-xs text-charcoal file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-navy-50 file:text-navy hover:file:bg-navy-100"
                      />
                      <p className="text-[11px] text-charcoal-light mt-1.5">
                        Format JPG, PNG, atau WEBP. Maksimal 5 MB. Disarankan foto portrait berlatar rapi / seragam resmi.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-navy-900 uppercase tracking-wider mb-1.5">
                    Hobi
                  </label>
                  <input
                    type="text"
                    name="hobbies"
                    value={formData.hobbies}
                    onChange={handleChange}
                    placeholder="Contoh: Bermain gitar, membaca novel, fotografi"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-gold focus:ring-2 focus:ring-gold/20 text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-navy-900 uppercase tracking-wider mb-1.5">
                    Motto Hidup *
                  </label>
                  <input
                    type="text"
                    name="motto"
                    value={formData.motto}
                    onChange={handleChange}
                    placeholder="Contoh: Belajar dari masa lalu, hidup untuk hari ini, berharap untuk hari esok."
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-gold focus:ring-2 focus:ring-gold/20 text-sm outline-none"
                  />
                </div>
              </div>
            )}

            {/* STEP 2: ABOUT ME */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="border-b border-gray-100 pb-4 mb-6">
                  <h3 className="font-serif text-xl font-bold text-navy-950">Langkah 2: Tentang Saya (Fun Q&A)</h3>
                  <p className="text-xs text-charcoal-light mt-1">Jawab pertanyaan-pertanyaan seru berikut ini.</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-navy-900 uppercase tracking-wider mb-1.5">
                    Gambarkan dirimu dalam 3 kata * (Pisahkan dengan koma)
                  </label>
                  <input
                    type="text"
                    name="describeThreeWords"
                    value={formData.describeThreeWords}
                    onChange={handleChange}
                    placeholder="Contoh: Ceria, Setia Kawan, Pemimpi"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-gold focus:ring-2 focus:ring-gold/20 text-sm outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-navy-900 uppercase tracking-wider mb-1.5">
                      Mata Pelajaran Favorit
                    </label>
                    <input
                      type="text"
                      name="favoriteSubject"
                      value={formData.favoriteSubject}
                      onChange={handleChange}
                      placeholder="Contoh: Matematika & IPA"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-gold focus:ring-2 focus:ring-gold/20 text-sm outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-navy-900 uppercase tracking-wider mb-1.5">
                      Makanan Favorit di Sekolah / Sekitarnya
                    </label>
                    <input
                      type="text"
                      name="favoriteFood"
                      value={formData.favoriteFood}
                      onChange={handleChange}
                      placeholder="Contoh: Nasi Liwet & Tahu Bulat Rajapolah"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-gold focus:ring-2 focus:ring-gold/20 text-sm outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-navy-900 uppercase tracking-wider mb-1.5">
                      Lagu Favorit
                    </label>
                    <input
                      type="text"
                      name="favoriteSong"
                      value={formData.favoriteSong}
                      onChange={handleChange}
                      placeholder="Contoh: Sheila on 7 — Sahabat Sejati"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-gold focus:ring-2 focus:ring-gold/20 text-sm outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-navy-900 uppercase tracking-wider mb-1.5">
                      Film / Serial Favorit
                    </label>
                    <input
                      type="text"
                      name="favoriteMovie"
                      value={formData.favoriteMovie}
                      onChange={handleChange}
                      placeholder="Contoh: Laskar Pelangi"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-gold focus:ring-2 focus:ring-gold/20 text-sm outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-navy-900 uppercase tracking-wider mb-1.5">
                      Tempat Paling Favorit di SMPN 1 Rajapolah
                    </label>
                    <input
                      type="text"
                      name="favoritePlace"
                      value={formData.favoritePlace}
                      onChange={handleChange}
                      placeholder="Contoh: Pojok perpustakaan & bawah pohon beringin"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-gold focus:ring-2 focus:ring-gold/20 text-sm outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: SCHOOL MEMORIES */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="border-b border-gray-100 pb-4 mb-6">
                  <h3 className="font-serif text-xl font-bold text-navy-950">Langkah 3: Kenangan di Sekolah</h3>
                  <p className="text-xs text-charcoal-light mt-1">Ceritakan momen berharga selama 3 tahun menimba ilmu.</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-navy-900 uppercase tracking-wider mb-1.5">
                    Cerita Paling Berkesan Selama SMP
                  </label>
                  <textarea
                    rows={4}
                    name="schoolStory"
                    value={formData.schoolStory}
                    onChange={handleChange}
                    placeholder="Ceritakan pengalaman tak terlupakan bersama teman atau di kegiatan sekolah..."
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-gold focus:ring-2 focus:ring-gold/20 text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-navy-900 uppercase tracking-wider mb-1.5">
                    Momen Paling Lucu / Konyol di Sekolah
                  </label>
                  <textarea
                    rows={3}
                    name="funniestMoment"
                    value={formData.funniestMoment}
                    onChange={handleChange}
                    placeholder="Kejadian lucu yang bikin kalian ketawa terbahak-bahak..."
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-gold focus:ring-2 focus:ring-gold/20 text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-navy-900 uppercase tracking-wider mb-1.5">
                    Momen yang Tidak Pernah Akan Kamu Lupakan
                  </label>
                  <textarea
                    rows={3}
                    name="unforgettableMemory"
                    value={formData.unforgettableMemory}
                    onChange={handleChange}
                    placeholder="Momen haru, bangga, atau saat kelulusan..."
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-gold focus:ring-2 focus:ring-gold/20 text-sm outline-none"
                  />
                </div>
              </div>
            )}

            {/* STEP 4: FUTURE DREAMS */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="border-b border-gray-100 pb-4 mb-6">
                  <h3 className="font-serif text-xl font-bold text-navy-950">Langkah 4: Cita-Cita & Masa Depan</h3>
                  <p className="text-xs text-charcoal-light mt-1">Bagikan impian besar yang ingin kamu raih kelak.</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-navy-900 uppercase tracking-wider mb-1.5">
                    Cita-Cita / Profesi Impian *
                  </label>
                  <input
                    type="text"
                    name="dream"
                    value={formData.dream}
                    onChange={handleChange}
                    placeholder="Contoh: Dokter, Arsitek, Software Engineer, Pengusaha"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-gold focus:ring-2 focus:ring-gold/20 text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-navy-900 uppercase tracking-wider mb-1.5">
                    Sekolah Lanjutan Tujuan (SMA/SMK/MA)
                  </label>
                  <input
                    type="text"
                    name="futureSchool"
                    value={formData.futureSchool}
                    onChange={handleChange}
                    placeholder="Contoh: SMAN 1 Tasikmalaya / SMKN 1 Rajapolah"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-gold focus:ring-2 focus:ring-gold/20 text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-navy-900 uppercase tracking-wider mb-1.5">
                    Pesan untuk Dirimu Sendiri di Masa Depan (10 Tahun Lagi)
                  </label>
                  <textarea
                    rows={3}
                    name="futureMessage"
                    value={formData.futureMessage}
                    onChange={handleChange}
                    placeholder="Tetaplah rendah hati dan jangan pernah melupakan sahabat masa remajamu..."
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-gold focus:ring-2 focus:ring-gold/20 text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-navy-900 uppercase tracking-wider mb-1.5">
                    Quote Favorit Kamu
                  </label>
                  <input
                    type="text"
                    name="favoriteQuote"
                    value={formData.favoriteQuote}
                    onChange={handleChange}
                    placeholder="Kutipan yang paling memotivasi atau berkesan bagimu..."
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-gold focus:ring-2 focus:ring-gold/20 text-sm outline-none"
                  />
                </div>
              </div>
            )}

            {/* STEP 5: FAVORITE PHOTOS */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div className="border-b border-gray-100 pb-4 mb-6">
                  <h3 className="font-serif text-xl font-bold text-navy-950">Langkah 5: Foto Kenangan Pribadi</h3>
                  <p className="text-xs text-charcoal-light mt-1">
                    Unggah maksimal 5 foto kenangan bersama sahabat atau kegiatan di SMPN 1 Rajapolah.
                  </p>
                </div>

                {formData.photos.length < 5 && (
                  <div className="p-6 border-2 border-dashed border-navy-200 rounded-2xl text-center bg-cream-50">
                    <Camera className="w-8 h-8 text-gold-dark mx-auto mb-2" />
                    <p className="text-xs font-semibold text-navy mb-1">Tambah Foto Kenangan Baru</p>
                    <p className="text-[11px] text-charcoal-light mb-4">Maksimal 5 foto, ukuran maksimal 5 MB/foto.</p>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handlePersonalPhotoUpload}
                      className="text-xs text-charcoal file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-navy file:text-gold hover:file:bg-navy-800"
                    />
                  </div>
                )}

                {/* Photos List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {formData.photos.map((p: any, idx: number) => (
                    <div key={idx} className="p-4 rounded-2xl bg-cream-50 border border-navy-100 flex flex-col justify-between">
                      <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-navy-900 mb-3">
                        <img src={p.imageUrl} alt="Foto" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removePersonalPhoto(idx)}
                          className="absolute top-2 right-2 p-1.5 rounded-full bg-red-600 text-white hover:bg-red-700 transition"
                          title="Hapus Foto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-navy mb-1">
                          Keterangan / Caption Foto #{idx + 1}
                        </label>
                        <input
                          type="text"
                          value={p.caption || ''}
                          onChange={(e) => handlePhotoCaptionChange(idx, e.target.value)}
                          placeholder="Momen seru apa ini?"
                          className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs outline-none focus:border-gold"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 6: MY MESSAGE */}
            {currentStep === 6 && (
              <div className="space-y-6">
                <div className="border-b border-gray-100 pb-4 mb-6">
                  <h3 className="font-serif text-xl font-bold text-navy-950">Langkah 6: Pesan Perpisahan</h3>
                  <p className="text-xs text-charcoal-light mt-1">Untaian kata perpisahan untuk keluarga besar SMPN 1 Rajapolah.</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-navy-900 uppercase tracking-wider mb-1.5">
                    Pesan untuk Sahabat & Teman Seangkatan 2027
                  </label>
                  <textarea
                    rows={4}
                    name="farewellMessage"
                    value={formData.farewellMessage}
                    onChange={handleChange}
                    placeholder="Tuliskan ucapan terima kasih, doa, dan harapan untuk seluruh sahabat seangkatanmu..."
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-gold focus:ring-2 focus:ring-gold/20 text-sm outline-none"
                  />
                </div>
              </div>
            )}

            {/* STEP 7: PREVIEW & SUBMISSION */}
            {currentStep === 7 && (
              <div className="space-y-6">
                <div className="border-b border-gray-100 pb-4 mb-6">
                  <h3 className="font-serif text-xl font-bold text-navy-950">Langkah 7: Ringkasan & Pengajuan</h3>
                  <p className="text-xs text-charcoal-light mt-1">Periksa kembali data profil sebelum diajukan ke admin.</p>
                </div>

                {/* Summary Card */}
                <div className="p-6 rounded-2xl bg-cream-50 border border-navy-100 flex items-start space-x-6">
                  <div className="w-24 h-28 rounded-2xl overflow-hidden bg-navy-900 shrink-0">
                    <img
                      src={formData.profilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'}
                      alt="Profil"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-serif text-xl font-bold text-navy-950">{formData.fullName || 'Nama Siswa'}</h4>
                    <p className="text-xs text-dusty-blue font-semibold">“{formData.nickname || 'Nickname'}”</p>
                    <p className="text-xs text-charcoal italic mt-2">“{formData.motto || 'Motto hidup'}”</p>
                    <p className="text-xs text-navy font-semibold mt-3">
                      Cita-Cita: <span className="text-gold-dark">{formData.dream || '-'}</span>
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    Setelah diajukan (Submit), profil akan ditinjau oleh Admin Sekolah. Jika disetujui, halaman kenanganmu akan resmi dipublikasikan di buku kenangan digital!
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => saveProfile('DRAFT')}
                    disabled={saving}
                    className="px-6 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-charcoal font-semibold text-xs transition"
                  >
                    Simpan Sebagai Draft
                  </button>

                  <button
                    type="button"
                    onClick={() => saveProfile('SUBMIT')}
                    disabled={saving}
                    className="px-8 py-2.5 rounded-xl bg-gold hover:bg-gold-light text-navy-950 font-bold text-xs transition shadow-md"
                  >
                    {saving ? 'Mengajukan...' : 'Ajukan Profil (Submit for Review) 🚀'}
                  </button>
                </div>
              </div>
            )}

            {/* Stepper Navigation Buttons */}
            <div className="flex items-center justify-between pt-8 border-t border-gray-100 mt-8">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep((prev) => prev - 1)}
                  className="px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-navy font-semibold text-xs transition flex items-center space-x-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Langkah Sebelumnya</span>
                </button>
              ) : <div />}

              {currentStep < 7 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep((prev) => prev + 1)}
                  className="px-6 py-2.5 rounded-xl bg-navy hover:bg-navy-800 text-white font-semibold text-xs transition flex items-center space-x-1.5"
                >
                  <span>Langkah Berikutnya</span>
                  <ArrowRight className="w-3.5 h-3.5 text-gold" />
                </button>
              ) : null}
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}
