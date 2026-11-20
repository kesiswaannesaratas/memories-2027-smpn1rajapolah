'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  User,
  School,
  Image as ImageIcon,
  MessageSquare,
  Eye,
  Settings,
  LogOut,
  ChevronRight,
  BookOpen,
  Sparkles
} from 'lucide-react';

interface StudentSidebarProps {
  studentName?: string;
  studentClass?: string;
  studentSlug?: string;
  profileStatus?: string;
}

export default function StudentSidebar({
  studentName = 'Siswa',
  studentClass = 'IX',
  studentSlug,
  profileStatus = 'DRAFT',
}: StudentSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  const menuItems = [
    { href: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/student/profile/edit', label: 'Edit Profil Kenangan', icon: User },
    { href: '/student/my-class', label: 'Kelas Saya', icon: School },
    { href: '/student/my-memories', label: 'Kenangan Saya', icon: ImageIcon },
    { href: '/student/my-messages', label: 'Pesan Perpisahan', icon: MessageSquare },
    { 
      href: studentSlug ? `/students/${studentSlug}` : '/students', 
      label: 'Preview Yearbook', 
      icon: Eye, 
      target: '_blank' 
    },
    { href: '/student/settings', label: 'Pengaturan Akun', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-navy-950 text-cream-200 border-r border-navy-800 flex flex-col shrink-0 min-h-screen">
      {/* Brand Header */}
      <div className="p-5 border-b border-navy-800">
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center text-navy font-bold shadow">
            <BookOpen className="w-4 h-4 text-navy-950" />
          </div>
          <div>
            <h2 className="font-serif text-lg font-bold text-white group-hover:text-gold transition">
              STUDENT PORTAL
            </h2>
            <p className="text-[10px] text-dusty-blue uppercase tracking-wider">
              MEMORIES 2027 • SMPN 1
            </p>
          </div>
        </Link>
      </div>

      {/* Student Badge Card */}
      <div className="p-4 mx-3 my-3 rounded-2xl bg-gradient-to-br from-navy-900 to-navy-900/60 border border-navy-800/80">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-gold/20 border border-gold/40 flex items-center justify-center text-gold font-bold">
            {studentName.charAt(0)}
          </div>
          <div className="overflow-hidden">
            <h3 className="font-semibold text-sm text-white truncate">{studentName}</h3>
            <span className="text-xs text-dusty-blue">Kelas {studentClass}</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] pt-2 border-t border-navy-800">
          <span className="text-dusty-blue">Status Profil:</span>
          <span
            className={`font-semibold px-2 py-0.5 rounded-full ${
              profileStatus === 'APPROVED'
                ? 'bg-emerald-500/20 text-emerald-300'
                : profileStatus === 'SUBMITTED'
                ? 'bg-amber-500/20 text-amber-300'
                : profileStatus === 'REJECTED'
                ? 'bg-rose-500/20 text-rose-300'
                : 'bg-dusty-blue/20 text-dusty-blue'
            }`}
          >
            {profileStatus}
          </span>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="px-3 py-2 text-[10px] font-semibold text-dusty-blue uppercase tracking-wider">
          Navigasi Siswa
        </div>
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              target={item.target}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                isActive
                  ? 'bg-gold text-navy-950 font-semibold shadow-md'
                  : 'text-cream-300 hover:text-white hover:bg-navy-900'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-navy-950' : 'text-gold'}`} />
                <span>{item.label}</span>
              </div>
              {isActive && <ChevronRight className="w-4 h-4" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer & Logout */}
      <div className="p-4 border-t border-navy-800 space-y-2">
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-center w-full py-2 px-3 rounded-lg bg-navy-900 hover:bg-navy-800 text-xs text-cream-200 transition"
        >
          Lihat Halaman Buku Kenangan &rarr;
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center justify-center space-x-2 w-full py-2.5 px-3 rounded-lg text-red-300 hover:bg-red-950/40 hover:text-red-200 text-sm transition"
        >
          <LogOut className="w-4 h-4" />
          <span>Keluar Akun</span>
        </button>
      </div>
    </aside>
  );
}
