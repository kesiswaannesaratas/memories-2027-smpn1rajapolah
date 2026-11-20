'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { School, Plus, Edit, Trash2, Users, X, Eye } from 'lucide-react';
import AdminSidebar from '@/components/AdminSidebar';
import ConfirmModal from '@/components/ConfirmModal';
import { useToast } from '@/components/Toast';

export default function AdminClassesPage() {
  const { toast } = useToast();
  const [classes, setClasses] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'ADD' | 'EDIT'>('ADD');
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [className, setClassName] = useState('');
  const [homeroomTeacherId, setHomeroomTeacherId] = useState('');
  const [classMotto, setClassMotto] = useState('');
  const [classDescription, setClassDescription] = useState('');

  // Delete modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [classToDelete, setClassToDelete] = useState<any>(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/classes').then((r) => r.json()),
      fetch('/api/teachers').then((r) => r.json()),
    ]).then(([cData, tData]) => {
      if (cData.classes) setClasses(cData.classes);
      if (tData.teachers) setTeachers(tData.teachers);
      setLoading(false);
    });
  }, []);

  const loadClasses = () => {
    fetch('/api/classes')
      .then((r) => r.json())
      .then((d) => {
        if (d.classes) setClasses(d.classes);
      });
  };

  const handleOpenAdd = () => {
    setModalMode('ADD');
    setSelectedClass(null);
    setClassName('');
    setHomeroomTeacherId('');
    setClassMotto('');
    setClassDescription('');
    setModalOpen(true);
  };

  const handleOpenEdit = (cls: any) => {
    setModalMode('EDIT');
    setSelectedClass(cls);
    setClassName(cls.className);
    setHomeroomTeacherId(cls.homeroomTeacherId || '');
    setClassMotto(cls.classMotto || '');
    setClassDescription(cls.classDescription || '');
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (modalMode === 'ADD') {
        const res = await fetch('/api/classes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            className,
            homeroomTeacherId,
            classMotto,
            classDescription,
          }),
        });
        const d = await res.json();
        if (!res.ok) throw new Error(d.message);
        toast('Kelas berhasil dibuat!', 'success');
      } else {
        const res = await fetch(`/api/classes/${selectedClass.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            className,
            homeroomTeacherId,
            classMotto,
            classDescription,
          }),
        });
        const d = await res.json();
        if (!res.ok) throw new Error(d.message);
        toast('Kelas berhasil diperbarui!', 'success');
      }

      setModalOpen(false);
      loadClasses();
    } catch (err: any) {
      toast(err.message || 'Gagal menyimpan kelas', 'error');
    }
  };

  const handleDelete = async () => {
    if (!classToDelete) return;
    try {
      const res = await fetch(`/api/classes/${classToDelete.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Gagal');
      toast('Kelas berhasil dihapus!', 'success');
      setDeleteModalOpen(false);
      loadClasses();
    } catch (err: any) {
      toast(err.message, 'error');
    }
  };

  return (
    <div className="min-h-screen flex bg-cream">
      <AdminSidebar />

      <main className="flex-1 p-6 sm:p-10 lg:p-12 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-8">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-gold-dark">
                Admin Portal
              </span>
              <h1 className="font-serif text-3xl font-bold text-navy-950 mt-1">
                Manajemen Kelas (9A — 9G)
              </h1>
              <p className="text-xs text-charcoal-light mt-0.5">
                Kelola nama kelas, wali kelas, motto, dan deskripsi kelas.
              </p>
            </div>

            <button
              onClick={handleOpenAdd}
              className="px-5 py-2.5 rounded-xl bg-gold hover:bg-gold-light text-navy-950 text-xs font-bold transition shadow-sm flex items-center space-x-1.5 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Kelas Baru</span>
            </button>
          </div>

          {/* Classes Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map((cls) => (
              <div
                key={cls.id}
                className="p-6 rounded-3xl bg-white border border-navy-100 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="w-12 h-12 rounded-2xl bg-gold text-navy-950 font-serif font-black text-xl flex items-center justify-center shadow">
                      {cls.className}
                    </span>
                    <span className="text-xs text-dusty-blue font-semibold">
                      {cls._count?.students || 0} Siswa
                    </span>
                  </div>

                  <h3 className="font-serif text-xl font-bold text-navy-950 mb-1">
                    Kelas {cls.className}
                  </h3>
                  {cls.homeroomTeacher && (
                    <p className="text-xs text-charcoal">
                      Wali Kelas: <strong className="text-navy">{cls.homeroomTeacher.fullName}</strong>
                    </p>
                  )}
                  {cls.classMotto && (
                    <p className="text-xs text-charcoal-light italic mt-2">
                      “{cls.classMotto}”
                    </p>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <Link
                    href={`/classes/${cls.classSlug}`}
                    target="_blank"
                    className="text-xs font-semibold text-gold-dark hover:underline flex items-center space-x-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Halaman Publik</span>
                  </Link>

                  <div className="space-x-1">
                    <button
                      onClick={() => handleOpenEdit(cls)}
                      className="p-1.5 text-navy hover:bg-navy-50 rounded-lg transition"
                      title="Edit Kelas"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setClassToDelete(cls);
                        setDeleteModalOpen(true);
                      }}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition"
                      title="Hapus Kelas"
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

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/70 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-navy-100">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
              <h3 className="font-serif text-lg font-bold text-navy-950">
                {modalMode === 'ADD' ? 'Tambah Kelas Baru' : 'Edit Kelas'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-navy-900 uppercase mb-1">
                  Nama Kelas * (Contoh: 9A)
                </label>
                <input
                  type="text"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  required
                  placeholder="9A"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy-900 uppercase mb-1">
                  Wali Kelas
                </label>
                <select
                  value={homeroomTeacherId}
                  onChange={(e) => setHomeroomTeacherId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none bg-white focus:border-gold"
                >
                  <option value="">Pilih Wali Kelas</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>{t.fullName} ({t.subject})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy-900 uppercase mb-1">
                  Motto Kelas
                </label>
                <input
                  type="text"
                  value={classMotto}
                  onChange={(e) => setClassMotto(e.target.value)}
                  placeholder="Cerdas Bersama, Berprestasi Tanpa Batas"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy-900 uppercase mb-1">
                  Deskripsi Singkat Kelas
                </label>
                <textarea
                  rows={3}
                  value={classDescription}
                  onChange={(e) => setClassDescription(e.target.value)}
                  placeholder="Ceritakan kepribadian atau keunggulan kelas..."
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-gold"
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
                  Simpan Kelas
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
        title="Hapus Kelas"
        message={`Apakah Anda yakin ingin menghapus kelas ${classToDelete?.className}?`}
        isDanger={true}
      />
    </div>
  );
}
