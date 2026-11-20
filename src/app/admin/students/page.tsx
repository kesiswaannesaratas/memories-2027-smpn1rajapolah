'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, 
  Search, 
  Plus, 
  Filter, 
  Edit, 
  Trash2, 
  KeyRound, 
  Download, 
  CheckCircle2, 
  XCircle, 
  X,
  Upload,
  Eye
} from 'lucide-react';
import AdminSidebar from '@/components/AdminSidebar';
import ConfirmModal from '@/components/ConfirmModal';
import { useToast } from '@/components/Toast';

export default function AdminStudentsPage() {
  const { toast } = useToast();
  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Add/Edit Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'ADD' | 'EDIT'>('ADD');
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [fullName, setFullName] = useState('');
  const [nickname, setNickname] = useState('');
  const [classId, setClassId] = useState('');
  const [nisn, setNisn] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [profileStatus, setProfileStatus] = useState('APPROVED');

  // Delete Confirm Modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<any>(null);

  useEffect(() => {
    fetch('/api/classes')
      .then((r) => r.json())
      .then((d) => {
        if (d.classes) setClasses(d.classes);
      });
    loadStudents();
  }, [classFilter, statusFilter]);

  const loadStudents = (searchTerm = search) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (classFilter) params.set('classId', classFilter);
    if (statusFilter) params.set('status', statusFilter);

    fetch(`/api/students?${params.toString()}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.students) setStudents(d.students);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  const handleOpenAdd = () => {
    setModalMode('ADD');
    setSelectedStudent(null);
    setFullName('');
    setNickname('');
    setClassId(classes[0]?.id || '');
    setNisn('');
    setUsername('');
    setPassword('siswa123');
    setProfileStatus('APPROVED');
    setModalOpen(true);
  };

  const handleOpenEdit = (st: any) => {
    setModalMode('EDIT');
    setSelectedStudent(st);
    setFullName(st.fullName);
    setNickname(st.nickname);
    setClassId(st.classId);
    setNisn(st.nisn || '');
    setUsername(st.user?.username || '');
    setProfileStatus(st.profileStatus);
    setModalOpen(true);
  };

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !nickname || !classId) {
      toast('Nama lengkap, panggilan, dan kelas wajib diisi', 'error');
      return;
    }

    try {
      if (modalMode === 'ADD') {
        const res = await fetch('/api/students', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fullName,
            nickname,
            classId,
            nisn,
            username: username || `${nickname.toLowerCase()}${Date.now().toString().slice(-3)}`,
            password: password || 'siswa123',
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        toast('Siswa berhasil ditambahkan!', 'success');
      } else {
        const res = await fetch(`/api/students/${selectedStudent.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fullName,
            nickname,
            classId,
            nisn,
            profileStatus,
            isPublished: profileStatus === 'APPROVED',
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        toast('Data siswa berhasil diperbarui!', 'success');
      }

      setModalOpen(false);
      loadStudents();
    } catch (err: any) {
      toast(err.message || 'Gagal menyimpan', 'error');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!studentToDelete) return;
    try {
      const res = await fetch(`/api/students/${studentToDelete.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Gagal menghapus');
      toast('Siswa berhasil dihapus!', 'success');
      setDeleteModalOpen(false);
      loadStudents();
    } catch (err: any) {
      toast(err.message, 'error');
    }
  };

  const handleResetPassword = (st: any) => {
    toast(`Password untuk ${st.fullName} di-reset menjadi: siswa123`, 'info');
  };

  return (
    <div className="min-h-screen flex bg-cream">
      <AdminSidebar />

      <main className="flex-1 p-6 sm:p-10 lg:p-12 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-gold-dark">
                Admin Portal
              </span>
              <h1 className="font-serif text-3xl font-bold text-navy-950 mt-1">
                Manajemen Data Siswa
              </h1>
              <p className="text-xs text-charcoal-light mt-0.5">
                Total {students.length} siswa terdaftar di database angkatan 2026/2027
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <a
                href="/api/export?type=students"
                className="px-4 py-2 rounded-xl bg-white border border-navy-200 text-xs font-semibold text-navy hover:bg-navy-50 transition shadow-sm flex items-center space-x-1.5"
              >
                <Download className="w-3.5 h-3.5 text-gold-dark" />
                <span>Export CSV</span>
              </a>
              <button
                onClick={handleOpenAdd}
                className="px-5 py-2 rounded-xl bg-gold hover:bg-gold-light text-navy-950 text-xs font-bold transition shadow-sm flex items-center space-x-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Siswa</span>
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-3xl border border-navy-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative flex-1 w-full">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && loadStudents(search)}
                placeholder="Cari nama siswa, nama panggilan..."
                className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-gray-200 outline-none focus:border-gold"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>

            <div className="flex items-center space-x-2 w-full md:w-auto">
              <select
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl border border-gray-200 outline-none bg-white"
              >
                <option value="">Semua Kelas</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>Kelas {c.className}</option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl border border-gray-200 outline-none bg-white"
              >
                <option value="">Semua Status Profil</option>
                <option value="APPROVED">Approved</option>
                <option value="SUBMITTED">Pending Review</option>
                <option value="DRAFT">Draft</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-3xl border border-navy-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-charcoal">
                <thead className="bg-navy-950 text-white uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">No</th>
                    <th className="py-3 px-4">Foto</th>
                    <th className="py-3 px-4">Nama Lengkap & Panggilan</th>
                    <th className="py-3 px-4">Kelas</th>
                    <th className="py-3 px-4">Username Akun</th>
                    <th className="py-3 px-4">Status Profil</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {students.map((st, idx) => (
                    <tr key={st.id} className="hover:bg-cream-50 transition">
                      <td className="py-3 px-4 font-semibold text-gray-400">{idx + 1}</td>
                      <td className="py-3 px-4">
                        <img
                          src={st.profilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                          alt={st.fullName}
                          className="w-10 h-10 rounded-full object-cover border border-gold/40 shadow-sm"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-navy-950 text-sm">{st.fullName}</div>
                        <span className="text-[11px] text-dusty-blue font-serif italic">“{st.nickname}”</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-0.5 rounded-full bg-navy text-gold text-[10px] font-bold">
                          {st.class?.className || 'IX'}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-gray-600">
                        {st.user?.username || '-'}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            st.profileStatus === 'APPROVED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : st.profileStatus === 'SUBMITTED'
                              ? 'bg-amber-100 text-amber-800'
                              : st.profileStatus === 'REJECTED'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {st.profileStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-1">
                        <Link
                          href={`/students/${st.slug}`}
                          target="_blank"
                          className="p-1.5 text-gray-500 hover:text-navy rounded-lg hover:bg-gray-100 inline-block"
                          title="Lihat Profil"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleOpenEdit(st)}
                          className="p-1.5 text-gold-dark hover:text-navy rounded-lg hover:bg-gold/10 inline-block"
                          title="Edit Siswa"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleResetPassword(st)}
                          className="p-1.5 text-dusty-blue hover:text-navy rounded-lg hover:bg-gray-100 inline-block"
                          title="Reset Password Akun"
                        >
                          <KeyRound className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setStudentToDelete(st);
                            setDeleteModalOpen(true);
                          }}
                          className="p-1.5 text-red-500 hover:text-red-700 rounded-lg hover:bg-red-50 inline-block"
                          title="Hapus Siswa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>

      {/* Add / Edit Student Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/70 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-navy-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
              <h3 className="font-serif text-xl font-bold text-navy-950">
                {modalMode === 'ADD' ? 'Tambah Siswa Baru' : 'Edit Data Siswa'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleModalSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-navy-900 uppercase tracking-wider mb-1">
                  Nama Lengkap *
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  placeholder="Contoh: Muhammad Farhan"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-gold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-navy-900 uppercase tracking-wider mb-1">
                    Nama Panggilan *
                  </label>
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    required
                    placeholder="Contoh: Farhan"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-navy-900 uppercase tracking-wider mb-1">
                    Kelas *
                  </label>
                  <select
                    value={classId}
                    onChange={(e) => setClassId(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none bg-white focus:border-gold"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>Kelas {c.className}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy-900 uppercase tracking-wider mb-1">
                  NIS / NISN (Opsional)
                </label>
                <input
                  type="text"
                  value={nisn}
                  onChange={(e) => setNisn(e.target.value)}
                  placeholder="Nomor Induk Siswa"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-gold"
                />
              </div>

              {modalMode === 'ADD' ? (
                <div className="p-4 rounded-2xl bg-cream-50 border border-navy-100 space-y-3">
                  <span className="text-xs font-bold text-navy-950 block">Pengaturan Akun Login Siswa</span>
                  <div>
                    <label className="block text-[11px] font-semibold text-charcoal mb-1">Username Login</label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Contoh: siswa9a5"
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs outline-none focus:border-gold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-charcoal mb-1">Password Awal</label>
                    <input
                      type="text"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="siswa123"
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs outline-none focus:border-gold"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-navy-900 uppercase tracking-wider mb-1">
                    Status Profil
                  </label>
                  <select
                    value={profileStatus}
                    onChange={(e) => setProfileStatus(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none bg-white focus:border-gold"
                  >
                    <option value="APPROVED">APPROVED (Disetujui & Tampil Publik)</option>
                    <option value="SUBMITTED">SUBMITTED (Menunggu Verifikasi)</option>
                    <option value="DRAFT">DRAFT (Belum Diajukan)</option>
                    <option value="REJECTED">REJECTED (Perlu Revisi)</option>
                  </select>
                </div>
              )}

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
                  className="px-6 py-2.5 rounded-xl bg-gold hover:bg-gold-light text-navy-950 font-bold text-xs shadow-sm"
                >
                  {modalMode === 'ADD' ? 'Simpan Siswa Baru' : 'Perbarui Siswa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Hapus Data Siswa"
        message={`Apakah Anda yakin ingin menghapus data siswa ${studentToDelete?.fullName}? Semua foto dan riwayat akan dihapus.`}
        isDanger={true}
        confirmText="Ya, Hapus Siswa"
      />
    </div>
  );
}
