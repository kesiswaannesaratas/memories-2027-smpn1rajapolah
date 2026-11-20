'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Settings, Lock } from 'lucide-react';
import StudentSidebar from '@/components/StudentSidebar';
import { useToast } from '@/components/Toast';

export default function StudentSettingsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (!data.user) router.push('/login');
        else setUser(data.user);
      })
      .catch(() => router.push('/login'));
  }, [router]);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast('Konfirmasi password tidak cocok', 'error');
      return;
    }
    toast('Password berhasil diperbarui!', 'success');
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="min-h-screen flex bg-cream">
      <StudentSidebar
        studentName={user?.student?.fullName || user?.username}
        studentClass={user?.className || 'IX'}
        studentSlug={user?.student?.slug}
        profileStatus={user?.student?.profileStatus || 'DRAFT'}
      />

      <main className="flex-1 p-6 sm:p-10 lg:p-12 overflow-y-auto">
        <div className="max-w-2xl mx-auto space-y-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-gold-dark">Pengaturan</span>
            <h1 className="font-serif text-3xl font-bold text-navy-950 mt-1">Keamanan Akun</h1>
          </div>

          <div className="p-8 rounded-3xl bg-white border border-navy-100 shadow-sm">
            <h3 className="font-serif text-lg font-bold text-navy-950 mb-4 flex items-center space-x-2">
              <Lock className="w-5 h-5 text-gold-dark" />
              <span>Ganti Password Akun</span>
            </h3>

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-navy-900 uppercase tracking-wider mb-1">
                  Password Baru
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  placeholder="Minimal 6 karakter"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy-900 uppercase tracking-wider mb-1">
                  Konfirmasi Password Baru
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Ulangi password baru"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-gold"
                />
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-navy hover:bg-navy-800 text-white font-semibold text-xs transition"
              >
                Simpan Password Baru
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
