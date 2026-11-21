'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Upload,
  FileSpreadsheet,
  Download,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Users,
  GraduationCap,
  Trash2,
  RefreshCw,
  Info,
  ChevronRight,
  ArrowRight,
  FileText
} from 'lucide-react';
import AdminSidebar from '@/components/AdminSidebar';
import ConfirmModal from '@/components/ConfirmModal';
import { useToast } from '@/components/Toast';

export default function AdminImportPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'students' | 'teachers' | 'reset'>('students');

  // Students state
  const [studentFile, setStudentFile] = useState<File | null>(null);
  const [parsedStudents, setParsedStudents] = useState<any[]>([]);
  const [createAccounts, setCreateAccounts] = useState(true);
  const [defaultPassword, setDefaultPassword] = useState('siswa123');
  const [importingStudents, setImportingStudents] = useState(false);
  const [studentResult, setStudentResult] = useState<any>(null);

  // Teachers state
  const [teacherFile, setTeacherFile] = useState<File | null>(null);
  const [parsedTeachers, setParsedTeachers] = useState<any[]>([]);
  const [importingTeachers, setImportingTeachers] = useState(false);
  const [teacherResult, setTeacherResult] = useState<any>(null);

  // Reset dummy state
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resetResult, setResetResult] = useState<any>(null);

  // CSV Fallback Parser
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

  // Universal File Parser (Supports XLSX, XLS, and CSV)
  const parseSpreadsheet = async (file: File): Promise<any[]> => {
    const fileName = file.name.toLowerCase();
    if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      try {
        const XLSX = await import('xlsx');
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: 'array' });
        // Prefer first sheet or sheet named 'data'
        const sheetName = workbook.SheetNames.find(n => !n.toLowerCase().includes('petunjuk')) || workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        return XLSX.utils.sheet_to_json(sheet, { defval: '' });
      } catch (err) {
        console.warn('XLSX local import failed, attempting fallback...', err);
        throw new Error('Gagal membaca file Excel. Pastikan file berformat .xlsx yang valid.');
      }
    } else {
      const text = await file.text();
      return parseCSV(text);
    }
  };

  // File Upload Handlers
  const handleStudentFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setStudentFile(file);
    try {
      const parsed = await parseSpreadsheet(file);
      setParsedStudents(parsed);
      setStudentResult(null);
      if (parsed.length > 0) {
        toast(`Berhasil memuat ${parsed.length} baris data siswa dari ${file.name}`, 'success');
      } else {
        toast('File Excel/CSV kosong atau kolom tidak sesuai', 'warning');
      }
    } catch (err: any) {
      toast(err.message || 'Gagal membaca file', 'error');
    }
  };

  const handleTeacherFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setTeacherFile(file);
    try {
      const parsed = await parseSpreadsheet(file);
      setParsedTeachers(parsed);
      setTeacherResult(null);
      if (parsed.length > 0) {
        toast(`Berhasil memuat ${parsed.length} baris data guru dari ${file.name}`, 'success');
      } else {
        toast('File Excel/CSV kosong atau kolom tidak sesuai', 'warning');
      }
    } catch (err: any) {
      toast(err.message || 'Gagal membaca file', 'error');
    }
  };

  // Submit Student Import
  const handleImportStudents = async () => {
    if (parsedStudents.length === 0) {
      toast('Silakan pilih file Excel (.xlsx) siswa terlebih dahulu', 'warning');
      return;
    }

    setImportingStudents(true);
    try {
      const res = await fetch('/api/import/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          students: parsedStudents,
          createAccounts,
          defaultPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gagal mengimpor siswa');

      setStudentResult(data);
      toast(data.message, 'success');
    } catch (err: any) {
      toast(err.message, 'error');
    } finally {
      setImportingStudents(false);
    }
  };

  // Submit Teacher Import
  const handleImportTeachers = async () => {
    if (parsedTeachers.length === 0) {
      toast('Silakan pilih file Excel (.xlsx) guru terlebih dahulu', 'warning');
      return;
    }

    setImportingTeachers(true);
    try {
      const res = await fetch('/api/import/teachers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teachers: parsedTeachers,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gagal mengimpor guru');

      setTeacherResult(data);
      toast(data.message, 'success');
    } catch (err: any) {
      toast(err.message, 'error');
    } finally {
      setImportingTeachers(false);
    }
  };

  // Reset Dummy Action
  const handleResetDummy = async () => {
    setResetting(true);
    try {
      const res = await fetch('/api/admin/reset-dummy', {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gagal mereset data');

      setResetResult(data);
      toast(data.message, 'success');
      setResetModalOpen(false);
    } catch (err: any) {
      toast(err.message, 'error');
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-cream">
      <AdminSidebar />

      <main className="flex-1 p-6 sm:p-10 lg:p-12 overflow-y-auto">
        <div className="max-w-5xl mx-auto space-y-8">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-gold-dark">Admin Portal</span>
              <h1 className="font-serif text-3xl font-bold text-navy-950 mt-1">Import Data Excel (.xlsx)</h1>
              <p className="text-xs text-charcoal-light mt-0.5">
                Masukkan seluruh data siswa dan dewan guru secara massal menggunakan file spreadsheet Excel (.xlsx).
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Link
                href="/admin/students"
                className="px-4 py-2 rounded-xl bg-white border border-navy-200 hover:bg-cream-100 text-xs font-semibold text-navy flex items-center space-x-1.5 transition shadow-sm"
              >
                <Users className="w-3.5 h-3.5 text-gold-dark" />
                <span>Lihat Data Siswa</span>
              </Link>
              <Link
                href="/admin/teachers"
                className="px-4 py-2 rounded-xl bg-white border border-navy-200 hover:bg-cream-100 text-xs font-semibold text-navy flex items-center space-x-1.5 transition shadow-sm"
              >
                <GraduationCap className="w-3.5 h-3.5 text-gold-dark" />
                <span>Lihat Data Guru</span>
              </Link>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-navy-200 space-x-2">
            <button
              onClick={() => setActiveTab('students')}
              className={`px-5 py-3 text-xs font-bold tracking-wider uppercase transition border-b-2 flex items-center space-x-2 ${
                activeTab === 'students'
                  ? 'border-gold text-navy-950 bg-white/70 rounded-t-xl shadow-sm'
                  : 'border-transparent text-charcoal-light hover:text-navy hover:bg-cream-100/50 rounded-t-xl'
              }`}
            >
              <Users className="w-4 h-4 text-gold-dark" />
              <span>Import Siswa (Excel)</span>
            </button>

            <button
              onClick={() => setActiveTab('teachers')}
              className={`px-5 py-3 text-xs font-bold tracking-wider uppercase transition border-b-2 flex items-center space-x-2 ${
                activeTab === 'teachers'
                  ? 'border-gold text-navy-950 bg-white/70 rounded-t-xl shadow-sm'
                  : 'border-transparent text-charcoal-light hover:text-navy hover:bg-cream-100/50 rounded-t-xl'
              }`}
            >
              <GraduationCap className="w-4 h-4 text-gold-dark" />
              <span>Import Guru (Excel)</span>
            </button>

            <button
              onClick={() => setActiveTab('reset')}
              className={`px-5 py-3 text-xs font-bold tracking-wider uppercase transition border-b-2 flex items-center space-x-2 ${
                activeTab === 'reset'
                  ? 'border-red-500 text-red-600 bg-white/70 rounded-t-xl shadow-sm'
                  : 'border-transparent text-charcoal-light hover:text-red-500 hover:bg-red-50/50 rounded-t-xl'
              }`}
            >
              <Trash2 className="w-4 h-4 text-red-500" />
              <span>Bersihkan Data Dummy</span>
            </button>
          </div>

          {/* TAB 1: IMPORT SISWA */}
          {activeTab === 'students' && (
            <div className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Step 1: Download Template */}
                <div className="p-6 rounded-2xl bg-white border border-navy-100 shadow-sm flex flex-col justify-between">
                  <div>
                    <span className="w-7 h-7 rounded-full bg-gold/20 text-gold-dark font-bold text-xs flex items-center justify-center mb-3">
                      1
                    </span>
                    <h3 className="font-serif text-lg font-bold text-navy-950 mb-1">Unduh Template Excel</h3>
                    <p className="text-xs text-charcoal-light leading-relaxed mb-4">
                      Gunakan format Excel (.xlsx) resmi lengkap dengan contoh isian dan petunjuk kolom kelas 9A–9G.
                    </p>
                  </div>
                  <a
                    href="/templates/template-import-siswa-smpn1rajapolah.xlsx"
                    download
                    className="w-full py-2.5 px-4 rounded-xl bg-gold/15 hover:bg-gold/25 text-gold-dark font-bold text-xs flex items-center justify-center space-x-2 transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Template Siswa (.xlsx)</span>
                  </a>
                </div>

                {/* Step 2: Upload File */}
                <div className="p-6 rounded-2xl bg-white border border-navy-100 shadow-sm flex flex-col justify-between">
                  <div>
                    <span className="w-7 h-7 rounded-full bg-navy/10 text-navy font-bold text-xs flex items-center justify-center mb-3">
                      2
                    </span>
                    <h3 className="font-serif text-lg font-bold text-navy-950 mb-1">Pilih File Excel (.xlsx)</h3>
                    <p className="text-xs text-charcoal-light leading-relaxed mb-4">
                      Upload file .xlsx yang telah diisi data seluruh siswa angkatan 2026/2027.
                    </p>
                  </div>
                  <label className="w-full py-2.5 px-4 rounded-xl bg-navy hover:bg-navy-800 text-white font-semibold text-xs flex items-center justify-center space-x-2 cursor-pointer transition shadow">
                    <Upload className="w-3.5 h-3.5 text-gold" />
                    <span>{studentFile ? 'Ganti File Excel' : 'Pilih File Excel (.xlsx)'}</span>
                    <input
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      onChange={handleStudentFileChange}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Step 3: Pengaturan Akun */}
                <div className="p-6 rounded-2xl bg-white border border-navy-100 shadow-sm flex flex-col justify-between">
                  <div>
                    <span className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center mb-3">
                      3
                    </span>
                    <h3 className="font-serif text-lg font-bold text-navy-950 mb-1">Opsi Pembuatan Akun</h3>
                    <div className="space-y-3 mt-3 text-xs">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={createAccounts}
                          onChange={(e) => setCreateAccounts(e.target.checked)}
                          className="rounded text-gold focus:ring-gold"
                        />
                        <span className="font-semibold text-navy-950">Buat akun login siswa</span>
                      </label>
                      {createAccounts && (
                        <div>
                          <label className="text-[11px] text-charcoal-light block mb-1">Password Default:</label>
                          <input
                            type="text"
                            value={defaultPassword}
                            onChange={(e) => setDefaultPassword(e.target.value)}
                            className="w-full py-1.5 px-3 border border-navy-200 rounded-lg text-xs font-mono"
                            placeholder="siswa123"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

              </div>

              {/* Preview Table */}
              {parsedStudents.length > 0 && (
                <div className="p-6 rounded-2xl bg-white border border-navy-100 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="font-serif text-lg font-bold text-navy-950 flex items-center space-x-2">
                        <FileSpreadsheet className="w-5 h-5 text-gold-dark" />
                        <span>Pratinjau Data Siswa ({parsedStudents.length} baris terdeteksi)</span>
                      </h3>
                      <p className="text-xs text-charcoal-light mt-0.5">
                        File: <span className="font-mono text-navy font-semibold">{studentFile?.name}</span>
                      </p>
                    </div>

                    <button
                      onClick={handleImportStudents}
                      disabled={importingStudents}
                      className="px-6 py-3 rounded-xl bg-gold hover:bg-gold-light text-navy-950 font-bold text-xs flex items-center justify-center space-x-2 transition shadow-md disabled:opacity-50"
                    >
                      {importingStudents ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Sedang Mengimpor ({parsedStudents.length} siswa)...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          <span>Mulai Import {parsedStudents.length} Siswa</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="overflow-x-auto border border-navy-100 rounded-xl max-h-96">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-cream-100 text-navy-900 border-b border-navy-200 sticky top-0">
                        <tr>
                          <th className="py-2.5 px-3 font-bold w-12 text-center">No</th>
                          <th className="py-2.5 px-4 font-bold">Nama Lengkap</th>
                          <th className="py-2.5 px-3 font-bold">Panggilan</th>
                          <th className="py-2.5 px-3 font-bold">Kelas</th>
                          <th className="py-2.5 px-3 font-bold">NISN</th>
                          <th className="py-2.5 px-4 font-bold">Motto</th>
                          <th className="py-2.5 px-4 font-bold">Cita-cita</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-navy-100">
                        {parsedStudents.map((row, idx) => (
                          <tr key={idx} className="hover:bg-cream-50 transition">
                            <td className="py-2 px-3 text-center text-charcoal-light font-mono">{idx + 1}</td>
                            <td className="py-2 px-4 font-semibold text-navy-950">
                              {row['Nama Lengkap'] || row.fullName || '-'}
                            </td>
                            <td className="py-2 px-3 text-charcoal">
                              {row['Nama Panggilan'] || row.nickname || '-'}
                            </td>
                            <td className="py-2 px-3">
                              <span className="px-2 py-0.5 rounded-full bg-navy/10 text-navy font-bold text-[10px]">
                                {row['Kelas'] || row.className || row.class || '9A'}
                              </span>
                            </td>
                            <td className="py-2 px-3 font-mono text-charcoal-light">
                              {row['NISN'] || row.nisn || '-'}
                            </td>
                            <td className="py-2 px-4 italic text-charcoal max-w-xs truncate">
                              {row['Motto'] || row.motto || '-'}
                            </td>
                            <td className="py-2 px-4 text-charcoal">
                              {row['Cita-cita'] || row.dream || '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Student Result Card */}
              {studentResult && (
                <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-sm space-y-3">
                  <div className="flex items-center space-x-2 text-emerald-800 font-bold">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="text-sm">Proses Import Siswa Selesai!</span>
                  </div>
                  <p className="text-xs text-emerald-700">{studentResult.message}</p>
                  <div className="flex items-center space-x-4 text-xs font-semibold text-emerald-900 pt-1">
                    <span>Total Baris: {studentResult.totalProcessed}</span>
                    <span>•</span>
                    <span>Berhasil: {studentResult.successCount}</span>
                    <span>•</span>
                    <span>Gagal: {studentResult.failedCount}</span>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 2: IMPORT GURU */}
          {activeTab === 'teachers' && (
            <div className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Step 1: Download Template */}
                <div className="p-6 rounded-2xl bg-white border border-navy-100 shadow-sm flex flex-col justify-between">
                  <div>
                    <span className="w-7 h-7 rounded-full bg-gold/20 text-gold-dark font-bold text-xs flex items-center justify-center mb-3">
                      1
                    </span>
                    <h3 className="font-serif text-lg font-bold text-navy-950 mb-1">Unduh Template Guru Excel</h3>
                    <p className="text-xs text-charcoal-light leading-relaxed mb-4">
                      Format Excel (.xlsx) untuk Kepala Sekolah, dewan guru pengajar, staf, serta penugasan wali kelas (9A–9G).
                    </p>
                  </div>
                  <a
                    href="/templates/template-import-guru-smpn1rajapolah.xlsx"
                    download
                    className="w-full py-2.5 px-4 rounded-xl bg-gold/15 hover:bg-gold/25 text-gold-dark font-bold text-xs flex items-center justify-center space-x-2 transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Template Guru (.xlsx)</span>
                  </a>
                </div>

                {/* Step 2: Upload File */}
                <div className="p-6 rounded-2xl bg-white border border-navy-100 shadow-sm flex flex-col justify-between">
                  <div>
                    <span className="w-7 h-7 rounded-full bg-navy/10 text-navy font-bold text-xs flex items-center justify-center mb-3">
                      2
                    </span>
                    <h3 className="font-serif text-lg font-bold text-navy-950 mb-1">Pilih File Excel (.xlsx) Guru</h3>
                    <p className="text-xs text-charcoal-light leading-relaxed mb-4">
                      Upload file .xlsx data guru yang sudah Anda lengkapi.
                    </p>
                  </div>
                  <label className="w-full py-2.5 px-4 rounded-xl bg-navy hover:bg-navy-800 text-white font-semibold text-xs flex items-center justify-center space-x-2 cursor-pointer transition shadow">
                    <Upload className="w-3.5 h-3.5 text-gold" />
                    <span>{teacherFile ? 'Ganti File Excel' : 'Pilih File Excel (.xlsx) Guru'}</span>
                    <input
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      onChange={handleTeacherFileChange}
                      className="hidden"
                    />
                  </label>
                </div>

              </div>

              {/* Teacher Preview Table */}
              {parsedTeachers.length > 0 && (
                <div className="p-6 rounded-2xl bg-white border border-navy-100 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="font-serif text-lg font-bold text-navy-950 flex items-center space-x-2">
                        <FileSpreadsheet className="w-5 h-5 text-gold-dark" />
                        <span>Pratinjau Data Guru ({parsedTeachers.length} baris terdeteksi)</span>
                      </h3>
                      <p className="text-xs text-charcoal-light mt-0.5">
                        File: <span className="font-mono text-navy font-semibold">{teacherFile?.name}</span>
                      </p>
                    </div>

                    <button
                      onClick={handleImportTeachers}
                      disabled={importingTeachers}
                      className="px-6 py-3 rounded-xl bg-gold hover:bg-gold-light text-navy-950 font-bold text-xs flex items-center justify-center space-x-2 transition shadow-md disabled:opacity-50"
                    >
                      {importingTeachers ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Sedang Mengimpor ({parsedTeachers.length} guru)...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          <span>Mulai Import {parsedTeachers.length} Guru</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="overflow-x-auto border border-navy-100 rounded-xl max-h-96">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-cream-100 text-navy-900 border-b border-navy-200 sticky top-0">
                        <tr>
                          <th className="py-2.5 px-3 font-bold w-12 text-center">No</th>
                          <th className="py-2.5 px-4 font-bold">Nama Lengkap</th>
                          <th className="py-2.5 px-4 font-bold">Mata Pelajaran</th>
                          <th className="py-2.5 px-3 font-bold">Jabatan</th>
                          <th className="py-2.5 px-3 font-bold">Wali Kelas</th>
                          <th className="py-2.5 px-4 font-bold">Kata Mutiara / Pesan</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-navy-100">
                        {parsedTeachers.map((row, idx) => (
                          <tr key={idx} className="hover:bg-cream-50 transition">
                            <td className="py-2 px-3 text-center text-charcoal-light font-mono">{idx + 1}</td>
                            <td className="py-2 px-4 font-semibold text-navy-950">
                              {row['Nama Lengkap'] || row.fullName || row['Nama'] || '-'}
                            </td>
                            <td className="py-2 px-4 text-charcoal">
                              {row['Mata Pelajaran'] || row.subject || row['Mapel'] || '-'}
                            </td>
                            <td className="py-2 px-3 text-charcoal">
                              {row['Jabatan'] || row.position || '-'}
                            </td>
                            <td className="py-2 px-3">
                              {(row['Wali Kelas'] || row.homeroomClass) ? (
                                <span className="px-2 py-0.5 rounded-full bg-gold/20 text-gold-dark font-bold text-[10px]">
                                  {row['Wali Kelas'] || row.homeroomClass}
                                </span>
                              ) : '-'}
                            </td>
                            <td className="py-2 px-4 italic text-charcoal max-w-xs truncate">
                              {row['Kata Mutiara'] || row.quote || row['Pesan'] || '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Teacher Result Card */}
              {teacherResult && (
                <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-sm space-y-3">
                  <div className="flex items-center space-x-2 text-emerald-800 font-bold">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="text-sm">Proses Import Guru Selesai!</span>
                  </div>
                  <p className="text-xs text-emerald-700">{teacherResult.message}</p>
                </div>
              )}

            </div>
          )}

          {/* TAB 3: BERSIHKAN DATA DUMMY */}
          {activeTab === 'reset' && (
            <div className="space-y-6">
              <div className="p-8 rounded-3xl bg-white border border-red-200 shadow-sm space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-serif text-xl font-bold text-navy-950">
                      Pembersihan Total Data Dummy / Contoh
                    </h3>
                    <p className="text-xs text-charcoal-light leading-relaxed mt-1">
                      Fitur ini akan mengosongkan seluruh data contoh/dummy dari buku kenangan agar database bersih dan siap diisi dengan data resmi siswa dan guru SMPN 1 Rajapolah.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-2xl bg-red-50 border border-red-100 space-y-2">
                    <h4 className="font-bold text-red-800 flex items-center space-x-1.5">
                      <Trash2 className="w-4 h-4 text-red-600" />
                      <span>Data yang Akan Dihapus:</span>
                    </h4>
                    <ul className="space-y-1 text-red-700 list-disc list-inside">
                      <li>Seluruh data siswa dummy</li>
                      <li>Seluruh akun login siswa contoh</li>
                      <li>Seluruh guru & staf contoh</li>
                      <li>Seluruh foto kenangan dummy (Memory Wall)</li>
                      <li>Seluruh surat & pesan perpisahan dummy</li>
                      <li>Seluruh quotes contoh</li>
                    </ul>
                  </div>

                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 space-y-2">
                    <h4 className="font-bold text-emerald-800 flex items-center space-x-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Data yang Tetap Tersimpan:</span>
                    </h4>
                    <ul className="space-y-1 text-emerald-700 list-disc list-inside">
                      <li>Akun Administrator (<span className="font-mono font-bold">admin</span> / <span className="font-mono font-bold">admin123</span>)</li>
                      <li>Struktur 7 Kelas (9A, 9B, 9C, 9D, 9E, 9F, 9G)</li>
                      <li>Pengaturan Nama Sekolah & Tahun Pelajaran</li>
                    </ul>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => setResetModalOpen(true)}
                    className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center space-x-2 transition shadow-md"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Kosongkan Seluruh Data Dummy Sekarang</span>
                  </button>
                </div>
              </div>

              {resetResult && (
                <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-sm space-y-2">
                  <div className="flex items-center space-x-2 text-emerald-800 font-bold">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="text-sm">Data Dummy Berhasil Dikosongkan!</span>
                  </div>
                  <p className="text-xs text-emerald-700">{resetResult.message}</p>
                </div>
              )}
            </div>
          )}

        </div>
      </main>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={resetModalOpen}
        title="Konfirmasi Pengosongan Data Dummy"
        message="Apakah Anda yakin ingin menghapus seluruh data siswa, guru, foto kenangan, pesan, dan quotes contoh? Tindakan ini tidak dapat dibatalkan. Akun admin dan struktur kelas akan tetap aman."
        confirmText={resetting ? "Sedang Menghapus..." : "Ya, Hapus Data Dummy"}
        cancelText="Batal"
        danger
        onConfirm={handleResetDummy}
        onCancel={() => setResetModalOpen(false)}
      />
    </div>
  );
}
