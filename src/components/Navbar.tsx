'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  BookOpen, 
  Users, 
  GraduationCap, 
  Image as ImageIcon, 
  MessageSquare, 
  Quote, 
  Search, 
  Menu, 
  X, 
  User, 
  LogOut, 
  LayoutDashboard,
  ShieldAlert
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sessionUser, setSessionUser] = useState<any>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    // Check session
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setSessionUser(data.user);
      })
      .catch(() => {});

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setSessionUser(null);
      router.push('/login');
      router.refresh();
    } catch (err) {
      console.error(err);
    }
  };

  const navLinks = [
    { href: '/', label: 'Beranda' },
    { href: '/students', label: 'Siswa' },
    { href: '/classes', label: 'Kelas' },
    { href: '/memories', label: 'Galeri' },
    { href: '/teachers', label: 'Guru & Staf' },
    { href: '/messages', label: 'Pesan' },
    { href: '/quotes', label: 'Quotes' },
  ];

  // Don't show public navbar on dedicated admin/student dashboard pages
  const isDashboard = pathname?.startsWith('/admin') || pathname?.startsWith('/student');

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 no-print ${
        scrolled ? 'glass-nav py-3 shadow-lg border-b border-navy-800' : 'bg-navy py-4 border-b border-navy-800'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center text-navy font-bold shadow-md transform transition group-hover:scale-105">
              <BookOpen className="w-5 h-5 text-navy-950" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-serif text-xl sm:text-2xl font-bold tracking-wider text-warm-white text-white group-hover:text-gold transition">
                  MEMORIES 2027
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-gold/20 text-gold border border-gold/30 font-medium">
                  IX
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-dusty-blue tracking-wide uppercase">
                SMPN 1 Rajapolah • Angkatan 2026/2027
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== '/' && pathname?.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-gold/20 text-gold border border-gold/30'
                      : 'text-cream-200 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center space-x-3">
            {/* Search Icon Link */}
            <Link 
              href="/search" 
              className="p-2 rounded-full text-cream-200 hover:text-gold hover:bg-white/10 transition"
              title="Cari Siswa, Kelas, Foto..."
            >
              <Search className="w-5 h-5" />
            </Link>

            {/* Auth Button or User Menu */}
            {sessionUser ? (
              <div className="flex items-center space-x-2">
                <Link
                  href={sessionUser.role === 'ADMIN' ? '/admin/dashboard' : '/student/dashboard'}
                  className="flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-gold/15 text-gold border border-gold/40 hover:bg-gold/25 transition text-sm font-medium"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>
                    {sessionUser.role === 'ADMIN' ? 'Dashboard Admin' : 'Dashboard Siswa'}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 text-dusty-blue hover:text-red-400 hover:bg-white/10 rounded-full transition"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center space-x-2 px-4 py-2 rounded-full bg-gold hover:bg-gold-light text-navy-950 font-semibold text-sm transition shadow-sm hover:shadow"
              >
                <User className="w-4 h-4" />
                <span>Masuk Akun</span>
              </Link>
            )}
          </div>

          {/* Mobile Menu Hamburger Button */}
          <div className="flex items-center space-x-2 lg:hidden">
            <Link 
              href="/search" 
              className="p-2 text-cream-200 hover:text-gold rounded-full"
            >
              <Search className="w-5 h-5" />
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-cream-200 hover:text-white rounded-lg focus:outline-none"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-navy-950/95 border-b border-navy-800 px-4 pt-3 pb-6 space-y-2 animate-fadeIn">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== '/' && pathname?.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-2.5 rounded-lg text-base font-medium transition ${
                  isActive
                    ? 'bg-gold/20 text-gold border border-gold/30'
                    : 'text-cream-200 hover:bg-white/5 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          
          <div className="pt-3 border-t border-navy-800/80">
            {sessionUser ? (
              <div className="space-y-2">
                <Link
                  href={sessionUser.role === 'ADMIN' ? '/admin/dashboard' : '/student/dashboard'}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center space-x-2 w-full py-2.5 px-4 rounded-lg bg-gold/20 text-gold border border-gold/40 text-sm font-medium"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>
                    {sessionUser.role === 'ADMIN' ? 'Dashboard Admin' : 'Dashboard Siswa'}
                  </span>
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center justify-center space-x-2 w-full py-2 px-4 rounded-lg text-red-300 hover:bg-red-500/10 text-sm"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Keluar</span>
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center space-x-2 w-full py-2.5 px-4 rounded-lg bg-gold text-navy-950 font-semibold text-sm"
              >
                <User className="w-4 h-4" />
                <span>Masuk Akun</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
