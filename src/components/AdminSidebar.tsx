'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  School,
  GraduationCap,
  Image as ImageIcon,
  MessageSquare,
  Quote,
  ShieldCheck,
  Settings,
  UserCheck,
  Download,
  LogOut,
  ChevronRight,
  BookOpen
} from 'lucide-react';

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  const menuItems = [
    { href: '/admin/dashboard', label: 'Overview', icon: LayoutDashboard },
    { href: '/admin/students', label: 'Data Siswa', icon: Users },
    { href: '/admin/classes', label: 'Data Kelas', icon: School },
    { href: '/admin/teachers', label: 'Data Guru', icon: GraduationCap },
    { href: '/admin/memories', label: 'Foto Kenangan', icon: ImageIcon },
    { href: '/admin/moderation', label: 'Moderasi Konten', icon: ShieldCheck },
    { href: '/admin/messages', label: 'Pesan Perpisahan', icon: MessageSquare },
    { href: '/admin/quotes', label: 'Quote Siswa', icon: Quote },
    { href: '/admin/accounts', label: 'Manajemen Akun', icon: UserCheck },
    { href: '/admin/settings', label: 'Pengaturan Website', icon: Settings },
    { href: '/admin/export', label: 'Export Data', icon: Download },
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
              ADMIN PORTAL
            </h2>
            <p className="text-[10px] text-dusty-blue uppercase tracking-wider">
              MEMORIES 2027 • SMPN 1
            </p>
          </div>
        </Link>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="px-3 py-2 text-[10px] font-semibold text-dusty-blue uppercase tracking-wider">
          Menu Utama
        </div>
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
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
          Lihat Website Publik &rarr;
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
