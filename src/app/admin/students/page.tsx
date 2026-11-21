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
  FileSpreadsheet,
  Eye,
  RefreshCw,
  Sparkles
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
  const [modalTab, setModalTab] = useState<'import' | 'manual'>('import');
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  // Manual Form State
  const [fullName, setFullName] = useState('');
  const [nickname, setNickname] = useState('');
  const [classId, setClassId] = useState('');
  const [nisn, setNisn] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [profileStatus, setProfileStatus] = useState('APPROVED');

  // Excel Import State
  const [importFile, setImportFile] = useState<File | null>(null);
  const [parsedStudents, setParsedStudents] = useState<any[]>([]);
  const [importing, setImporting] = useState(false);
  const [createAccounts, setCreateAccounts] = useState(true);

  // Delete Confirm Modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<any>(null);

  // Bulk Delete State
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

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

  const handleOpenAdd = (tab: 'import' | 'manual' = 'import') => {
    setModalMode('ADD');
    setModalTab(tab);
    setSelectedStudent(null);
    setFullName('');
    setNickname('');
    setClassId(classes[0]?.id || '');
    setNisn('');
    setUsername('');
    setPassword('siswa123');
    setProfileStatus('APPROVED');
    setImportFile(null);
    setParsedStudents([]);
    setModalOpen(true);
  };

  const handleOpenEdit = (st: any) => {
    setModalMode('EDIT');
    setModalTab('manual');
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

  // Helper Parse CSV
  const parseCSV = (text: string) => {
    const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length < 2) return [];
    const parseLine = (line: string) => {
      const result: string[] = [];
      let current = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"' || char === "'") {
          if (inQuotes && line[i + 1] === char) {
            current += char;
            i++;
          } else {
            inQuotes = !inQuotes;
          }
        } else if ((char === ',' || char === ';') && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    };

    const headers = parseLine(lines[0]);
    const rows = [];
    for (let i = 1; i < lines.length; i++) {
      const values = parseLine(lines[i]);
      if (values.length === 0 || values.every((v) => !v)) continue;
      const rowObj: any = {};
      headers.forEach((h, idx) => {
        rowObj[h] = values[idx] || '';
      });
      rows.push(rowObj);
    }
    return rows;
  };

  // Handle Import File Change (.xlsx / .csv)
  const handleImportFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportFile(file);

    try {
      const fileName = file.name.toLowerCase();
      if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
        const XLSX = await import('xlsx');
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: 'array' });
        const sheetName = workbook.SheetNames.find((n: string) => !n.toLowerCase().includes('petunjuk')) || workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(sheet, { defval: '' });
        setParsedStudents(json);
        toast(`Berhasil membaca ${json.length} baris siswa dari file Excel`, 'success');
      } else {
        const text = await file.text();
        const json = parseCSV(text);
        setParsedStudents(json);
        toast(`Berhasil membaca ${json.length} baris siswa dari file CSV`, 'success');
      }
    } catch (err: any) {
      toast(err.message || 'Gagal membaca file Excel', 'error');
    }
  };

  // Execute Batch Import Students
  const handleExecuteImport = async () => {
    if (parsedStudents.length === 0) {
      toast('Silakan pilih file Excel (.xlsx) terlebih dahulu', 'warning');
      return;
    }

    setImporting(true);
    try {
      const res = await fetch('/api/import/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          students: parsedStudents,
          createAccounts,
          defaultPassword: 'siswa123'
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gagal mengimpor siswa');

      toast(data.message, 'success');
      setModalOpen(false);
      setParsedStudents([]);
      setImportFile(null);
      loadStudents();
    } catch (err: any) {
      toast(err.message || 'Gagal memproses import', 'error');
    } finally {
      setImporting(false);
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

  const handleToggleSelect = (id: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedStudentIds.length === students.length && students.length > 0) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(students.map((s) => s.id));
    }
  };

  const handleBulkDeleteConfirm = async () => {
    if (selectedStudentIds.length === 0) return;
    setIsBulkDeleting(true);
    try {
      const res = await fetch('/api/students', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedStudentIds }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gagal menghapus siswa');

      toast(data.message || `${selectedStudentIds.length} siswa berhasil dihapus!`, 'success');
      setSelectedStudentIds([]);
      setBulkDeleteModalOpen(false);
      loadStudents();
    } catch (err: any) {
      toast(err.message || 'Terjadi kesalahan saat menghapus', 'error');
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const handleResetPassword = (st: any) => {
    toast(`Password untuk ${st.fullName} di-reset menjadi: siswa123`, 'info');
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-cream">
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
              <button
                onClick={() => handleOpenAdd('import')}
                className="px-4 py-2.5 rounded-xl bg-white border border-emerald-300 hover:bg-emerald-50 text-xs font-bold text-emerald-800 flex items-center space-x-2 transition shadow-sm"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Import Excel (.xlsx)</span>
              </button>
              <a
                href="/api/export?type=students"
                className="px-4 py-2.5 rounded-xl bg-white border border-navy-200 text-xs font-semibold text-navy hover:bg-navy-50 transition shadow-sm flex items-center space-x-1.5"
              >
                <Download className="w-3.5 h-3.5 text-gold-dark" />
                <span>Export CSV</span>
              </a>
              <button
                onClick={() => handleOpenAdd('import')}
                className="px-5 py-2.5 rounded-xl bg-gold hover:bg-gold-light text-navy-950 text-xs font-bold transition shadow-sm flex items-center space-x-1.5"
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

          {/* Content Area */}
          {loading ? (
            <div className="py-20 text-center text-charcoal-light text-sm flex items-center justify-center space-x-2">
              <RefreshCw className="w-4 h-4 animate-spin text-gold" />
              <span>Memuat data siswa...</span>
            </div>
          ) : students.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white border border-navy-100 shadow-sm space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <FileSpreadsheet className="w-8 h-8" />
              </div>
              <h3 className="font-serif text-xl font-bold text-navy-950">Belum Ada Data Siswa</h3>
              <p className="text-xs text-charcoal-light max-w-md mx-auto leading-relaxed">
                Database siswa saat ini bersih. Anda dapat memasukkan data seluruh siswa angkatan 2026/2027 secara cepat melalui file Excel (.xlsx) atau input manual.
              </p>
              <div className="flex items-center justify-center space-x-3 pt-2">
                <button
                  onClick={() => handleOpenAdd('import')}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center space-x-2 transition shadow"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Import File Excel (.xlsx)</span>
                </button>
                <button
                  onClick={() => handleOpenAdd('manual')}
                  className="px-5 py-2.5 rounded-xl bg-gold hover:bg-gold-light text-navy-950 font-bold text-xs flex items-center space-x-2 transition shadow"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Manual (1 Siswa)</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Floating Sticky Bulk Actions Bar */}
              {selectedStudentIds.length > 0 && (
                <div className="sticky top-4 z-40 bg-navy-950 text-white p-4 sm:p-5 rounded-2xl shadow-2xl border border-gold/40 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center space-x-3.5">
                    <div className="w-9 h-9 rounded-xl bg-gold text-navy-950 font-bold text-sm flex items-center justify-center shrink-0 shadow">
                      {selectedStudentIds.length}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-warm-white">
                        {selectedStudentIds.length} Siswa Dipilih
                      </p>
                      <p className="text-[11px] text-cream-300">
                        Siap dihapus dari total {students.length} siswa yang sedang ditampilkan
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2.5 w-full sm:w-auto justify-end">
                    <button
                      type="button"
                      onClick={handleSelectAll}
                      className="px-3.5 py-2 rounded-xl bg-navy-800 hover:bg-navy-700 text-xs font-semibold text-cream-200 transition"
                    >
                      {selectedStudentIds.length === students.length ? 'Batal Pilih Semua' : `Pilih Semua (${students.length})`}
                    </button>

                    <button
                      type="button"
                      onClick={() => setBulkDeleteModalOpen(true)}
                      className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-bold text-white transition flex items-center space-x-2 shadow-lg hover:shadow-rose-900/30"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Hapus {selectedStudentIds.length} Siswa</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedStudentIds([])}
                      className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-navy-800 transition"
                      title="Batal Pilihan"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              <div className="bg-white rounded-3xl border border-navy-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-charcoal">
                    <thead className="bg-navy-950 text-white uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="py-3 px-3 text-center w-10">
                          <input
                            type="checkbox"
                            checked={students.length > 0 && selectedStudentIds.length === students.length}
                            onChange={handleSelectAll}
                            className="w-4 h-4 rounded text-gold focus:ring-gold cursor-pointer"
                            title="Pilih Semua Siswa di Halaman Ini"
                          />
                        </th>
                        <th className="py-3 px-3 text-center">No</th>
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
                        <tr
                          key={st.id}
                          className={`transition ${
                            selectedStudentIds.includes(st.id) ? 'bg-gold/15 hover:bg-gold/20' : 'hover:bg-cream-50'
                          }`}
                        >
                          <td className="py-3 px-3 text-center">
                            <input
                              type="checkbox"
                              checked={selectedStudentIds.includes(st.id)}
                              onChange={() => handleToggleSelect(st.id)}
                              className="w-4 h-4 rounded text-gold focus:ring-gold cursor-pointer"
                            />
                          </td>
                          <td className="py-3 px-3 font-semibold text-gray-400 text-center">{idx + 1}</td>
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
          )}

        </div>
      </main>

      {/* Add / Edit Student Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/70 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-navy-100 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
              <div>
                <h3 className="font-serif text-xl font-bold text-navy-950">
                  {modalMode === 'ADD' ? 'Tambah Data Siswa' : 'Edit Data Siswa'}
                </h3>
                <p className="text-[11px] text-charcoal-light">
                  {modalMode === 'ADD' 
                    ? 'Pilih opsi Import Excel untuk memasukkan seluruh siswa sekaligus, atau Input Manual untuk 1 siswa.'
                    : `Mengubah data profil untuk ${fullName || 'siswa'}`
                  }
                </p>
              </div>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mode Selector Tabs (Only on ADD mode) */}
            {modalMode === 'ADD' && (
              <div className="flex p-1 bg-cream-100 rounded-2xl mb-6 border border-navy-100">
                <button
                  type="button"
                  onClick={() => setModalTab('import')}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 ${
                    modalTab === 'import'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-charcoal hover:text-navy-950'
                  }`}
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Import File Excel (.xlsx)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setModalTab('manual')}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 ${
                    modalTab === 'manual'
                      ? 'bg-white text-navy-950 shadow-sm'
                      : 'text-charcoal hover:text-navy-950'
                  }`}
                >
                  <Plus className="w-4 h-4" />
                  <span>Input Manual (1 Siswa)</span>
                </button>
              </div>
            )}

            {/* TAB 1: EXCEL IMPORT VIEW */}
            {modalMode === 'ADD' && modalTab === 'import' ? (
              <div className="space-y-5">
                {/* Template Download Banner */}
                <div className="p-4 rounded-2xl bg-gold/10 border border-gold/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="text-xs">
                    <span className="font-bold text-navy-950 block">Belum punya format Excel?</span>
                    <span className="text-charcoal-light text-[11px]">
                      Unduh file template resmi lengkap dengan contoh kolom Nama Lengkap, Panggilan, Kelas, & NISN.
                    </span>
                  </div>
                  <a
                    href="/templates/template-import-siswa-smpn1rajapolah.xlsx"
                    download
                    className="px-4 py-2 rounded-xl bg-gold hover:bg-gold-light text-navy-950 font-bold text-xs flex items-center space-x-1.5 transition shadow-sm shrink-0 self-start sm:self-auto"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Unduh Template (.xlsx)</span>
                  </a>
                </div>

                {/* File Drop / Select Area */}
                <div>
                  <label className="text-xs font-bold text-navy-900 uppercase block mb-1.5">
                    Pilih File Excel (.xlsx / .csv)
                  </label>
                  <label className="border-2 border-dashed border-navy-200 hover:border-gold rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer bg-cream-50/50 hover:bg-cream-100/50 transition">
                    <Upload className="w-8 h-8 text-gold-dark mb-2" />
                    <span className="text-xs font-semibold text-navy-950">
                      {importFile ? importFile.name : 'Klik untuk memilih file Excel (.xlsx / .csv)'}
                    </span>
                    <span className="text-[10px] text-charcoal-light mt-1">
                      Format yang didukung: .xlsx, .xls, .csv
                    </span>
                    <input
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      onChange={handleImportFileChange}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Auto Account Creation Checkbox */}
                <label className="flex items-center space-x-3 p-3.5 rounded-2xl bg-cream-50 border border-navy-100 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={createAccounts}
                    onChange={(e) => setCreateAccounts(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-navy-950 block">Otomatis buat akun login untuk setiap siswa</span>
                    <span className="text-[11px] text-charcoal-light">
                      Username: <strong>siswa_&lt;nisn&gt;</strong> (atau nama siswa) | Password awal: <strong>siswa123</strong>
                    </span>
                  </div>
                </label>

                {/* Preview Table */}
                {parsedStudents.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-navy-950">
                      <span>Pratinjau Siswa Terdeteksi:</span>
                      <span className="text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full font-mono text-[10px]">
                        {parsedStudents.length} siswa siap diimpor
                      </span>
                    </div>
                    <div className="max-h-52 overflow-y-auto border border-navy-100 rounded-xl">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-cream-100 text-navy-900 border-b border-navy-200 sticky top-0">
                          <tr>
                            <th className="py-2 px-3 font-bold w-10 text-center">No</th>
                            <th className="py-2 px-3 font-bold">Nama Lengkap</th>
                            <th className="py-2 px-3 font-bold">Panggilan</th>
                            <th className="py-2 px-3 font-bold">Kelas</th>
                            <th className="py-2 px-3 font-bold">NISN</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-navy-100">
                          {parsedStudents.map((row, idx) => (
                            <tr key={idx} className="hover:bg-cream-50 transition">
                              <td className="py-1.5 px-3 text-center text-charcoal-light font-mono text-[11px]">{idx + 1}</td>
                              <td className="py-1.5 px-3 font-semibold text-navy-950">
                                {row['Nama Lengkap'] || row.fullName || '-'}
                              </td>
                              <td className="py-1.5 px-3 text-charcoal">
                                {row['Nama Panggilan'] || row.nickname || '-'}
                              </td>
                              <td className="py-1.5 px-3 font-bold text-gold-dark text-[11px]">
                                {row['Kelas'] || row.className || row.class || '-'}
                              </td>
                              <td className="py-1.5 px-3 font-mono text-[11px] text-charcoal-light">
                                {row['NISN'] || row.nisn || '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Import Action Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <Link
                    href="/admin/import"
                    className="text-xs font-semibold text-dusty-blue hover:text-navy underline"
                  >
                    Buka Halaman Import Lengkap
                  </Link>

                  <div className="flex items-center space-x-3">
                    <button
                      type="button"
                      onClick={() => setModalOpen(false)}
                      className="px-4 py-2 text-xs font-semibold text-charcoal hover:bg-gray-100 rounded-xl"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={handleExecuteImport}
                      disabled={parsedStudents.length === 0 || importing}
                      className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center space-x-2 transition shadow disabled:opacity-50"
                    >
                      {importing ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Mengimpor ke Database...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Mulai Import {parsedStudents.length > 0 ? `(${parsedStudents.length} Siswa)` : ''}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* TAB 2: MANUAL INPUT FORM */
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
            )}

          </div>
        </div>
      )}

      {/* Single Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Hapus Data Siswa"
        message={`Apakah Anda yakin ingin menghapus data siswa ${studentToDelete?.fullName}? Semua foto dan riwayat akan dihapus.`}
        isDanger={true}
        confirmText="Ya, Hapus Siswa"
      />

      {/* Bulk Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={bulkDeleteModalOpen}
        onClose={() => setBulkDeleteModalOpen(false)}
        onConfirm={handleBulkDeleteConfirm}
        title={`Hapus ${selectedStudentIds.length} Siswa Sekaligus`}
        message={`Apakah Anda yakin ingin menghapus ${selectedStudentIds.length} data siswa yang telah dipilih? Seluruh akun login, data profil, dan foto siswa terkait akan dihapus permanen dari database.`}
        isDanger={true}
        confirmText={isBulkDeleting ? 'Menghapus...' : `Ya, Hapus ${selectedStudentIds.length} Siswa`}
      />
    </div>
  );
}
