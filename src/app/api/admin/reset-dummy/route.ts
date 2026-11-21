import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser, hashPassword } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const session = await getSessionUser();
    const authHeader = req.headers.get('authorization');
    const isSecretAuthorized = authHeader && authHeader === `Bearer ${process.env.JWT_SECRET}`;
    const isAdminSession = session && session.role === 'ADMIN';

    if (!isAdminSession && !isSecretAuthorized) {
      return NextResponse.json({ message: 'Akses ditolak. Khusus admin.' }, { status: 403 });
    }

    console.log('Clearing all dummy data from database...');

    // 1. Delete dependent relations first
    await prisma.activityLog.deleteMany({});
    await prisma.notification.deleteMany({});
    await prisma.studentPhoto.deleteMany({});
    await prisma.quote.deleteMany({});
    await prisma.message.deleteMany({});
    await prisma.memory.deleteMany({});

    // 2. Disconnect homeroom teachers from classes before deleting teachers
    await prisma.class.updateMany({
      data: {
        homeroomTeacherId: null,
      },
    });

    // 3. Delete all students
    await prisma.student.deleteMany({});

    // 4. Delete all non-admin users (preserve admin account)
    await prisma.user.deleteMany({
      where: {
        role: {
          not: 'ADMIN',
        },
      },
    });

    // 5. Delete all teachers
    await prisma.teacher.deleteMany({});

    // 6. Ensure default admin user exists
    const adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
    });

    if (!adminUser) {
      const adminPasswordHash = await hashPassword('admin123');
      await prisma.user.create({
        data: {
          username: 'admin',
          email: 'admin@smpn1rajapolah.sch.id',
          passwordHash: adminPasswordHash,
          role: 'ADMIN',
          isActive: true,
        },
      });
    }

    // 7. Ensure standard 11 classes exist (9A - 9K)
    const standardClasses = [
      { className: '9A', classSlug: '9a', classMotto: 'Bersatu, Berprestasi, Menginspirasi.' },
      { className: '9B', classSlug: '9b', classMotto: 'Solidaritas Tanpa Batas, Cerdas dan Berkualitas.' },
      { className: '9C', classSlug: '9c', classMotto: 'Kreatif, Inovatif, Siap Menggapai Cita-Cita.' },
      { className: '9D', classSlug: '9d', classMotto: 'Berani Bermimpi, Berjuang Sepenuh Hati.' },
      { className: '9E', classSlug: '9e', classMotto: 'Harmoni dalam Keberagaman, Hebat dalam Kebersamaan.' },
      { className: '9F', classSlug: '9f', classMotto: 'Semangat Pantang Menyerah, Menuju Masa Depan Cerah.' },
      { className: '9G', classSlug: '9g', classMotto: 'Kompak, Santun, dan Selalu Berprestasi.' },
      { className: '9H', classSlug: '9h', classMotto: 'Solidaritas Tinggi, Berprestasi Tiada Henti.' },
      { className: '9I', classSlug: '9i', classMotto: 'Kreatif, Mandiri, dan Berakhlak Mulia.' },
      { className: '9J', classSlug: '9j', classMotto: 'Kompak Menuju Cita-Cita Bersama.' },
      { className: '9K', classSlug: '9k', classMotto: 'Satu Semangat, Selangkah Menggapai Impian.' },
    ];

    for (const c of standardClasses) {
      await prisma.class.upsert({
        where: { className: c.className },
        update: {
          classMotto: c.classMotto,
          homeroomTeacherId: null,
        },
        create: {
          className: c.className,
          classSlug: c.classSlug,
          classMotto: c.classMotto,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Seluruh data dummy berhasil dihapus! Akun admin dan struktur kelas 9A-9K siap untuk import data riil.',
      summary: {
        studentsCleared: true,
        teachersCleared: true,
        memoriesCleared: true,
        messagesCleared: true,
        quotesCleared: true,
        adminPreserved: true,
      },
    });
  } catch (error: any) {
    console.error('Reset dummy error:', error);
    return NextResponse.json(
      { message: error.message || 'Gagal mereset data dummy' },
      { status: 500 }
    );
  }
}
