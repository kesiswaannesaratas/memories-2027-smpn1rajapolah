'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Heart, MapPin, School, Mail, Phone, ArrowUpRight } from 'lucide-react';

export default function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith('/admin') || pathname?.startsWith('/student')) {
    return null;
  }
  return (
    <footer className="bg-navy-950 text-cream-200 border-t border-navy-800 pt-16 pb-12 no-print relative overflow-hidden">
      {/* Background ambient pattern */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gold/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-dusty-blue/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-navy-800/80">
          
          {/* School Brand & Tagline */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center text-navy font-bold shadow-md">
                <BookOpen className="w-5 h-5 text-navy-950" />
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold text-white tracking-wide">
                  MEMORIES 2027
                </h3>
                <p className="text-[11px] text-dusty-blue uppercase tracking-wider">
                  Digital Yearbook SMPN 1 Rajapolah
                </p>
              </div>
            </div>
            
            <p className="text-sm text-cream-300 leading-relaxed italic font-serif">
              “One School, Many Stories, A Thousand Memories.”
            </p>
            
            <p className="text-xs text-dusty-blue leading-relaxed">
              Setiap perjalanan memiliki cerita. Setiap pertemuan meninggalkan kenangan. Setiap langkah di sekolah ini menjadi bagian dari cerita yang akan selalu kita simpan.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif text-base font-semibold text-white tracking-wider mb-4 border-l-2 border-gold pl-3">
              Jelajahi Kenangan
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/students" className="hover:text-gold transition flex items-center space-x-1.5">
                  <ArrowUpRight className="w-3.5 h-3.5 text-gold" />
                  <span>Direktori Siswa (Kelas IX)</span>
                </Link>
              </li>
              <li>
                <Link href="/classes" className="hover:text-gold transition flex items-center space-x-1.5">
                  <ArrowUpRight className="w-3.5 h-3.5 text-gold" />
                  <span>Galeri Kelas (9A — 9K)</span>
                </Link>
              </li>
              <li>
                <Link href="/memories" className="hover:text-gold transition flex items-center space-x-1.5">
                  <ArrowUpRight className="w-3.5 h-3.5 text-gold" />
                  <span>Memory Wall / Album Foto</span>
                </Link>
              </li>
              <li>
                <Link href="/teachers" className="hover:text-gold transition flex items-center space-x-1.5">
                  <ArrowUpRight className="w-3.5 h-3.5 text-gold" />
                  <span>Apresiasi Guru & Staf</span>
                </Link>
              </li>
              <li>
                <Link href="/messages" className="hover:text-gold transition flex items-center space-x-1.5">
                  <ArrowUpRight className="w-3.5 h-3.5 text-gold" />
                  <span>Wall of Messages</span>
                </Link>
              </li>
              <li>
                <Link href="/quotes" className="hover:text-gold transition flex items-center space-x-1.5">
                  <ArrowUpRight className="w-3.5 h-3.5 text-gold" />
                  <span>Quotes Siswa</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Kelas IX Links */}
          <div>
            <h4 className="font-serif text-base font-semibold text-white tracking-wider mb-4 border-l-2 border-gold pl-3">
              Angkatan Kelas IX
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              {['9A', '9B', '9C', '9D', '9E', '9F', '9G', '9H', '9I', '9J', '9K'].map((cls) => (
                <Link
                  key={cls}
                  href={`/classes/${cls.toLowerCase()}`}
                  className="px-2.5 py-1.5 rounded bg-navy-900 hover:bg-gold/15 hover:text-gold border border-navy-800 transition text-center font-medium"
                >
                  Kelas {cls}
                </Link>
              ))}
            </div>
            <p className="mt-4 text-xs text-dusty-blue">
              Tahun Pelajaran 2026/2027
            </p>
          </div>

          {/* School Contact Information */}
          <div>
            <h4 className="font-serif text-base font-semibold text-white tracking-wider mb-4 border-l-2 border-gold pl-3">
              SMP Negeri 1 Rajapolah
            </h4>
            <ul className="space-y-3 text-xs text-cream-300">
              <li className="flex items-start space-x-2.5">
                <MapPin className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                <span>Jln. Kebon Kalapa No. 48 Desa Manggungjaya Kec. Rajapolah, Kab. Tasikmalaya 46155</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <School className="w-4 h-4 text-gold shrink-0" />
                <span>NPSN: 20210846 • Terakreditasi A</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <Mail className="w-4 h-4 text-gold shrink-0" />
                <span>info@smpn1rajapolah.sch.id</span>
              </li>
            </ul>

            <div className="mt-5 pt-4 border-t border-navy-800/60">
              <Link 
                href="/login" 
                className="text-xs inline-flex items-center space-x-1.5 text-gold hover:underline"
              >
                <span>Portal Siswa & Admin &rarr;</span>
              </Link>
            </div>
          </div>

        </div>

        {/* Bottom Credits & Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-dusty-blue space-y-3 sm:space-y-0">
          <p>
            © 2027 Digital Yearbook SMPN 1 Rajapolah. All rights reserved.
          </p>
          <p className="flex items-center space-x-1.5 text-cream-200">
            <span>Made with memories, made with</span>
            <Heart className="w-3.5 h-3.5 text-red-400 fill-red-400" />
          </p>
        </div>
      </div>
    </footer>
  );
}
