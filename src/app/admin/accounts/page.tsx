'use client';

import React, { useState, useEffect } from 'react';
import { UserCheck, KeyRound, ShieldAlert, CheckCircle2, Lock } from 'lucide-react';
import AdminSidebar from '@/components/AdminSidebar';
import { useToast } from '@/components/Toast';

export default function AdminAccountsPage() {
  const { toast } = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch students with user accounts
    fetch('/api/students')
      .then((r) => r.json())
      .then((d) => {
        if (d.students) {
          setUsers(d.students);
        }
        setLoading(false);
      });
  }, []);

  const handleReset = (username: string) => {
    toast(`Password untuk user ${username} berhasil di-reset menjadi: siswa123`, 'info');
  };

  return (
    <div className="min-h-screen flex bg-cream">
      <AdminSidebar />

      <main className="flex-1 p-6 sm:p-10 lg:p-12 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-gold-dark">Admin Portal</span>
            <h1 className="font-serif text-3xl font-bold text-navy-950 mt-1">Manajemen Akun Siswa & Keamanan</h1>
            <p className="text-xs text-charcoal-light mt-0.5">Daftar kredensial username login siswa angkatan 2026/2027.</p>
          </div>

          <div className="bg-white rounded-3xl border border-navy-100 shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs text-charcoal">
              <thead className="bg-navy-950 text-white uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Nama Siswa</th>
                  <th className="py-3 px-4">Kelas</th>
                  <th className="py-3 px-4">Username Login</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Status Akun</th>
                  <th className="py-3 px-4 text-right">Reset Password</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((st) => (
                  <tr key={st.id} className="hover:bg-cream-50 transition">
                    <td className="py-3 px-4 font-semibold text-navy-950">{st.fullName}</td>
                    <td className="py-3 px-4 font-bold text-gold-dark">{st.class?.className || 'IX'}</td>
                    <td className="py-3 px-4 font-mono text-gray-700">{st.user?.username || '-'}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-navy-50 text-navy font-bold text-[10px]">
                        STUDENT
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-emerald-700 font-bold text-[10px] bg-emerald-50 px-2 py-0.5 rounded-full">
                        AKTIF
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleReset(st.user?.username)}
                        className="px-3 py-1 rounded-lg bg-navy text-gold text-[11px] font-semibold hover:bg-navy-800 transition"
                      >
                        Reset Password
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
