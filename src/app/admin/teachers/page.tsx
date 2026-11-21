'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  Plus,
  Edit,
  Trash2,
  X,
  Upload,
  FileSpreadsheet,
  Download,
  RefreshCw,
  CheckCircle2
} from 'lucide-react';
import AdminSidebar from '@/components/AdminSidebar';
import ConfirmModal from '@/components/ConfirmModal';
import { useToast } from '@/components/Toast';

export default function AdminTeachersPage() {
  const { toast } = useToast();
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal Add / Edit
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'ADD' | 'EDIT'>('ADD');
  const [modalTab, setModalTab] = useState<'import' | 'manual'>('import');
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null);

  // Manual Form State
  const [fullName, setFullName] = useState('');
  const [photo, setPhoto] = useState('');
  const [subject, setSubject] = useState('');
  const [position, setPosition] = useState('');
  const [quote, setQuote] = useState('');

  // Delete Modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState<any>(null);

  // Excel Import State
  const [importFile, setImportFile] = useState<File | null>(null);
  const [parsedTeachers, setParsedTeachers] = useState<any[]>([]);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = () => {
    setLoading(true);
    fetch('/api/teachers')
      .then((r) => r.json())
      .then((d) => {
        if (d.teachers) setTeachers(d.teachers);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  const handleOpenAdd = (tab: 'import' | 'manual' = 'import') => {
    setModalMode('ADD');
    setModalTab(tab);
    setSelectedTeacher(null);
    setFullName('');
    setPhoto('');
    setSubject('');
    setPosition('');
    setQuote('');
    setImportFile(null);
    setParsedTeachers([]);
    setModalOpen(true);
  };

  const handleOpenEdit = (t: any) => {
    setModalMode('EDIT');
    setModalTab('manual');
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
      toast(err.message, 'error');
    }
  };

  const handleDelete = async () => {
    if (!teacherToDelete) return;
    try {
      const res = await fetch(`/api/teachers/${teacherToDelete.id}`, {
        method: 'DELETE',
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.message);
      toast('Guru berhasil dihapus!', 'success');
      setDeleteModalOpen(false);
      loadTeachers();
    } catch (err: any) {
      toast(err.message, 'error');
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
        setParsedTeachers(json);
        toast(`Berhasil membaca ${json.length} baris guru dari file Excel`, 'success');
      } else {
        const text = await file.text();
        const json = parseCSV(text);
        setParsedTeachers(json);
        toast(`Berhasil membaca ${json.length} baris guru dari file CSV`, 'success');
      }
    } catch (err: any) {
      toast(err.message || 'Gagal membaca file Excel', 'error');
    }
  };

  // Execute Import
  const handleExecuteImport = async () => {
    if (parsedTeachers.length === 0) {
      toast('Silakan pilih file Excel (.xlsx) terlebih dahulu', 'warning');
      return;
    }

    setImporting(true);
    try {
      const res = await fetch('/api/import/teachers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teachers: parsedTeachers }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gagal mengimpor guru');

      toast(data.message, 'success');
      setModalOpen(false);
      setParsedTeachers([]);
      setImportFile(null);
      loadTeachers();
    } catch (err: any) {
      toast(err.message || 'Gagal memproses import', 'error');
    } finally {
      setImporting(false);
    }
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
                Data Guru & Staf
              </h1>
              <p className="text-xs text-charcoal-light mt-0.5">
                Total {teachers.length} guru terdaftar untuk apresiasi di yearbook.
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => handleOpenAdd('import')}
                className="px-4 py-2.5 rounded-xl bg-white border border-emerald-300 hover:bg-emerald-50 text-xs font-bold text-emerald-800 flex items-center space-x-2 transition shadow-sm"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Import Excel Guru (.xlsx)</span>
              </button>

              <button
                onClick={() => handleOpenAdd('import')}
                className="px-5 py-2.5 rounded-xl bg-gold hover:bg-gold-light text-navy-950 text-xs font-bold transition shadow-sm flex items-center space-x-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Guru</span>
              </button>
            </div>
          </div>

          {/* Teacher Grid / Empty State */}
          {loading ? (
            <div className="py-20 text-center text-charcoal-light text-sm flex items-center justify-center space-x-2">
              <RefreshCw className="w-4 h-4 animate-spin text-gold" />
              <span>Memuat data guru...</span>
            </div>
          ) : teachers.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white border border-navy-100 shadow-sm space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <FileSpreadsheet className="w-8 h-8" />
              </div>
              <h3 className="font-serif text-xl font-bold text-navy-950">Belum Ada Data Guru</h3>
              <p className="text-xs text-charcoal-light max-w-md mx-auto leading-relaxed">
                Database dewan guru saat ini bersih. Anda dapat memasukkan data seluruh dewan guru sekaligus melalui file Excel (.xlsx) atau input manual satu per satu.
              </p>
              <div className="flex items-center justify-center space-x-3 pt-2">
                <button
                  onClick={() => handleOpenAdd('import')}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center space-x-2 transition shadow"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Import File Excel Guru (.xlsx)</span>
                </button>
                <button
                  onClick={() => handleOpenAdd('manual')}
                  className="px-5 py-2.5 rounded-xl bg-gold hover:bg-gold-light text-navy-950 font-bold text-xs flex items-center space-x-2 transition shadow"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Guru Manual</span>
                </button>
              </div>
            </div>
          ) : (
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
                        {t.position && (
                          <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-navy/10 text-navy text-[10px] font-bold">
                            {t.position}
                          </span>
                        )}
                      </div>
                    </div>

                    {t.quote && (
                      <p className="text-xs text-charcoal italic line-clamp-3 mb-4 bg-cream/50 p-3 rounded-2xl border border-gold/20">
                        "{t.quote}"
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-end space-x-2 pt-4 border-t border-navy-100">
                    <button
                      onClick={() => handleOpenEdit(t)}
                      className="p-1.5 text-navy hover:bg-navy-50 rounded-lg transition"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4 text-gold-dark" />
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
          )}

        </div>
      </main>

      {/* Unified Add / Edit Teacher Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/70 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-navy-100 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
              <div>
                <h3 className="font-serif text-xl font-bold text-navy-950">
                  {modalMode === 'ADD' ? 'Tambah Data Guru' : 'Edit Data Guru'}
                </h3>
                <p className="text-[11px] text-charcoal-light">
                  {modalMode === 'ADD'
                    ? 'Pilih opsi Import Excel untuk memasukkan seluruh dewan guru sekaligus, atau Input Manual untuk 1 guru.'
                    : `Mengubah data guru untuk ${fullName || 'guru'}`
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
                  <span>Input Manual (1 Guru)</span>
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
                      Unduh file template resmi lengkap dengan contoh kolom Nama Lengkap, Mapel, Jabatan, & Wali Kelas.
                    </span>
                  </div>
                  <a
                    href="/templates/template-import-guru-smpn1rajapolah.xlsx"
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

                {/* Preview Table */}
                {parsedTeachers.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-navy-950">
                      <span>Pratinjau Data Guru Terdeteksi:</span>
                      <span className="text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full font-mono text-[10px]">
                        {parsedTeachers.length} guru siap diimpor
                      </span>
                    </div>
                    <div className="max-h-52 overflow-y-auto border border-navy-100 rounded-xl">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-cream-100 text-navy-900 border-b border-navy-200 sticky top-0">
                          <tr>
                            <th className="py-2 px-3 font-bold w-10 text-center">No</th>
                            <th className="py-2 px-3 font-bold">Nama Lengkap</th>
                            <th className="py-2 px-3 font-bold">Mata Pelajaran</th>
                            <th className="py-2 px-3 font-bold">Jabatan</th>
                            <th className="py-2 px-3 font-bold">Wali Kelas</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-navy-100">
                          {parsedTeachers.map((row, idx) => (
                            <tr key={idx} className="hover:bg-cream-50 transition">
                              <td className="py-1.5 px-3 text-center text-charcoal-light font-mono text-[11px]">{idx + 1}</td>
                              <td className="py-1.5 px-3 font-semibold text-navy-950">
                                {row['Nama Lengkap'] || row.fullName || row['Nama'] || '-'}
                              </td>
                              <td className="py-1.5 px-3 text-charcoal">
                                {row['Mata Pelajaran'] || row.subject || '-'}
                              </td>
                              <td className="py-1.5 px-3 text-charcoal text-[11px]">
                                {row['Jabatan'] || row.position || '-'}
                              </td>
                              <td className="py-1.5 px-3 font-bold text-gold-dark text-[11px]">
                                {row['Wali Kelas'] || row.homeroomClass || '-'}
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
                      disabled={parsedTeachers.length === 0 || importing}
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
                          <span>Mulai Import {parsedTeachers.length > 0 ? `(${parsedTeachers.length} Guru)` : ''}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* TAB 2: MANUAL INPUT FORM */
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
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-gold"
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
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-gold"
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
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-gold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-navy-900 uppercase mb-1">
                    URL Foto Guru (Opsional)
                  </label>
                  <input
                    type="text"
                    value={photo}
                    onChange={(e) => setPhoto(e.target.value)}
                    placeholder="https://... atau biarkan kosong untuk avatar default"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-gold"
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
                    placeholder="Kutipan nasihat atau pesan untuk angkatan 2026/2027..."
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
                    className="px-6 py-2.5 rounded-xl bg-gold hover:bg-gold-light text-navy-950 font-bold text-xs shadow-sm"
                  >
                    {modalMode === 'ADD' ? 'Simpan Guru Baru' : 'Perbarui Guru'}
                  </button>
                </div>
              </form>
            )}

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
