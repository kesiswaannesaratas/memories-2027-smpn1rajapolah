import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Akses ditolak' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'students';

    if (type === 'students') {
      const students = await prisma.student.findMany({
        include: {
          class: { select: { className: true } },
          user: { select: { username: true, email: true } },
        },
        orderBy: [{ class: { className: 'asc' } }, { fullName: 'asc' }],
      });

      // Generate CSV content
      const headers = ['No', 'Nama Lengkap', 'Nama Panggilan', 'Kelas', 'NISN', 'Motto', 'Cita-cita', 'Status Profil', 'Username'];
      const rows = students.map((s, idx) => [
        idx + 1,
        `"${(s.fullName || '').replace(/"/g, '""')}"`,
        `"${(s.nickname || '').replace(/"/g, '""')}"`,
        `"${s.class?.className || ''}"`,
        `"${s.nisn || ''}"`,
        `"${(s.motto || '').replace(/"/g, '""')}"`,
        `"${(s.dream || '').replace(/"/g, '""')}"`,
        `"${s.profileStatus}"`,
        `"${s.user?.username || ''}"`,
      ]);

      const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="data-siswa-smpn1rajapolah-2027.csv"`,
        },
      });
    }

    return NextResponse.json({ message: 'Tipe export tidak valid' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ message: 'Gagal mengekspor data' }, { status: 500 });
  }
}
