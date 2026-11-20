'use client';

import React, { useState, useEffect } from 'react';
import { GraduationCap, Plus, Edit, Trash2, X } from 'lucide-react';
import AdminSidebar from '@/components/AdminSidebar';
import ConfirmModal from '@/components/ConfirmModal';
import { useToast } from '@/components/Toast';

export default function AdminTeachersPage() {
  const { toast } = useToast();
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'ADD' | 'EDIT'>('ADD');
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null);
  const [fullName, setFullName] = useState('');
  const [photo, setPhoto] = useState('');
  const [subject, setSubject] = useState('');
  const [position, setPosition] = useState('');
  const [quote, setQuote] = useState('');

  // Delete
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState<any>(null);

  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = () => {
    fetch('/api/teachers')
      .then((r) => r.json())
      .then((d) => {
        if (d.teachers) setTeachers(d.teachers);
        setLoading(false);
      });
  };

  const handleOpenAdd = () => {
    setModalMode('ADD');
    setSelectedTeacher(null);
    setFullName('');
    setPhoto('');
    setSubject('');
    setPosition('');
    setQuote('');
    setModalOpen(true);
  };

  const handleOpenEdit = (t: any) => {
    setModalMode('EDIT');
    setSelectedTeacher(t);
    setFullName(t.fullName);
    setPhoto(t.photo || '');
    setSubject(t.subject);
    setPosition(t.position || '');
    setQuote(t.quote || '');
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (modalMode === 'ADD') {
        const res = await fetch('/api/teachers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fullName, photo, subject, position, quote }),
        });
        const d = await res.json();
        if (!res.ok) throw new Error(d.message);
        toast('Guru berhasil ditambahkan!', 'success');
      } else {
        const res = await fetch(`/api/teachers/${selectedTeacher.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fullName, photo, subject, position, quote }),
        });
        const d = await res.json();
        if (!res.ok) throw new Error(d.message);
        toast('Data guru berhasil diperbarui!', 'success');
      }

      setModalOpen(false);
      loadTeachers();
    } catch (err: any) {
      toast(err.message || 'Gagal menyimpan', 'error');
    }
  };

  const handleDelete = async () => {
    if (!teacherToDelete) return;
    try {
      const res = await fetch(`/api/teachers/${teacherToDelete.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Gagal');
      toast('Guru berhasil dihapus!', 'success');
      setDeleteModalOpen(false);
      loadTeachers();
    } catch (err: any) {
      toast(err.message, 'error');
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
                Admin Portal
              </span>
              <h1 className="font-serif text-3xl font-bold text-navy-950 mt-1">
                Data Guru & Staf
              </h1>
              <p className="text-xs text-charcoal-light mt-0.5">
                Total {teachers.length} guru terdaftar untuk apresiasi di yearbook.
              </p>
            </div>

            <button
              onClick={handleOpenAdd}
              className="px-5 py-2.5 rounded-xl bg-gold hover:bg-gold-light text-navy-950 text-xs font-bold transition shadow-sm flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Guru</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teachers.map((t) => (
              <div
                key={t.id}
                className="p-6 rounded-3xl bg-white border border-navy-100 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center space-x-4 mb-4">
                    <img
                      src={t.photo || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&auto=format&fit=crop&q=80'}
                      alt={t.fullName}
                      className="w-14 h-14 rounded-full object-cover border-2 border-gold shrink-0"
                    />
                    <div>
                      <h4 className="font-serif font-bold text-navy-950 text-base">{t.fullName}</h4>
                      <p className="text-xs font-semibold text-gold-dark">{t.subject}</p>
                      {t.position && <span className="text-[11px] text-dusty-blue">{t.position}</span>}
                    </div>
                  </div>

                  {t.quote && (
                    <p className="text-xs text-charcoal-light italic font-serif border-t border-gray-100 pt-3">
                      “{t.quote}”
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-end space-x-2">
                  <button
                    onClick={() => handleOpenEdit(t)}
                    className="p-1.5 text-navy hover:bg-navy-50 rounded-lg transition"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setTeacherToDelete(t);
                      setDeleteModalOpen(true);
                    }}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition"
                    title="Hapus"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      </main>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/70 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-navy-100">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
              <h3 className="font-serif text-lg font-bold text-navy-950">
                {modalMode === 'ADD' ? 'Tambah Guru Baru' : 'Edit Guru'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-navy-900 uppercase mb-1">
                  Nama Lengkap & Gelar *
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  placeholder="Contoh: Drs. H. Dedi Kusnadi, M.Pd"
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy-900 uppercase mb-1">
                  Mata Pelajaran *
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  placeholder="Contoh: Matematika"
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy-900 uppercase mb-1">
                  Jabatan / Posisi
                </label>
                <input
                  type="text"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  placeholder="Contoh: Wali Kelas 9A / Pembina OSIS"
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy-900 uppercase mb-1">
                  URL Foto Guru
                </label>
                <input
                  type="text"
                  value={photo}
                  onChange={(e) => setPhoto(e.target.value)}
                  placeholder="https://... atau path upload"
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy-900 uppercase mb-1">
                  Pesan / Kutipan Mutiara
                </label>
                <textarea
                  rows={3}
                  value={quote}
                  onChange={(e) => setQuote(e.target.value)}
                  placeholder="Kutipan nasihat guru..."
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm outline-none focus:border-gold"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-charcoal hover:bg-gray-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gold hover:bg-gold-light text-navy-950 font-bold text-xs"
                >
                  Simpan Guru
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Hapus Guru"
        message={`Apakah Anda yakin ingin menghapus ${teacherToDelete?.fullName}?`}
        isDanger={true}
      />
    </div>
  );
}
