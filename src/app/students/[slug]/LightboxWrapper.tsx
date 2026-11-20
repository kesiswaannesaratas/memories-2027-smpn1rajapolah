'use client';

import React from 'react';
import { Printer, Share2 } from 'lucide-react';
import { useToast } from '@/components/Toast';

interface Props {
  studentName: string;
  photos: any[];
}

export default function LightboxWrapper({ studentName, photos }: Props) {
  const { toast } = useToast();

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: `Kenangan ${studentName} — SMPN 1 Rajapolah 2027`,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast('Tautan profil berhasil disalin ke clipboard!', 'success');
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={handlePrint}
        className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white border border-navy-200 text-xs font-semibold text-navy hover:bg-navy-50 transition shadow-sm"
        title="Cetak Halaman / Simpan ke PDF"
      >
        <Printer className="w-3.5 h-3.5 text-gold-dark" />
        <span>Cetak / PDF</span>
      </button>

      <button
        onClick={handleShare}
        className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white border border-navy-200 text-xs font-semibold text-navy hover:bg-navy-50 transition shadow-sm"
        title="Bagikan Tautan Profil"
      >
        <Share2 className="w-3.5 h-3.5 text-gold-dark" />
        <span>Bagikan</span>
      </button>
    </div>
  );
}
