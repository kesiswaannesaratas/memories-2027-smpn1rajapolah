'use client';

import React from 'react';
import { Download, FileText, Printer, CheckCircle2 } from 'lucide-react';
import AdminSidebar from '@/components/AdminSidebar';
import { useToast } from '@/components/Toast';

export default function AdminExportPage() {
  const { toast } = useToast();

  const handlePrintYearbook = () => {
    window.print();
  };

  return (
    <div className="min-h-screen flex bg-cream">
      <AdminSidebar />

      <main className="flex-1 p-6 sm:p-10 lg:p-12 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-gold-dark">Admin Portal</span>
            <h1 className="font-serif text-3xl font-bold text-navy-950 mt-1">Export Data & Unduhan Buku Kenangan</h1>
            <p className="text-xs text-charcoal-light mt-0.5">Unduh data siswa dalam format CSV atau cetak seluruh buku kenangan ke PDF.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* CSV Export Card */}
            <div className="p-8 rounded-3xl bg-white border border-navy-100 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-gold/15 text-gold-dark flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-xl font-bold text-navy-950 mb-2">Export Data Siswa (CSV/Excel)</h3>
                <p className="text-xs text-charcoal-light leading-relaxed mb-6">
                  Ekspor seluruh data siswa angkatan 2026/2027 lengkap dengan nama, kelas, NISN, status kelengkapan profil, dan kontak ke dalam format CSV spreadsheet.
                </p>
              </div>

              <a
                href="/api/export?type=students"
                download
                className="px-6 py-3 rounded-xl bg-navy hover:bg-navy-800 text-white font-semibold text-xs flex items-center justify-center space-x-2 transition shadow-md"
              >
                <Download className="w-4 h-4 text-gold" />
                <span>Unduh File CSV Siswa</span>
              </a>
            </div>

            {/* Print / PDF Yearbook Card */}
            <div className="p-8 rounded-3xl bg-white border border-navy-100 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-dusty-blue/20 text-navy flex items-center justify-center mb-4">
                  <Printer className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-xl font-bold text-navy-950 mb-2">Cetak / Simpan ke PDF Yearbook</h3>
                <p className="text-xs text-charcoal-light leading-relaxed mb-6">
                  Gunakan dialog cetak browser terintegrasi dengan layout editorial majalah untuk mencetak atau menyimpan dokumen digital yearbook angkatan ke format PDF.
                </p>
              </div>

              <button
                onClick={handlePrintYearbook}
                className="px-6 py-3 rounded-xl bg-gold hover:bg-gold-light text-navy-950 font-bold text-xs flex items-center justify-center space-x-2 transition shadow-md"
              >
                <Printer className="w-4 h-4" />
                <span>Buka Dialog Cetak / Simpan PDF</span>
              </button>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
