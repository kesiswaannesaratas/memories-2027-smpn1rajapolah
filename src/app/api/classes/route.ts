import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { slugify } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const classes = await prisma.class.findMany({
      include: {
        homeroomTeacher: {
          select: { id: true, fullName: true, photo: true, subject: true },
        },
        _count: {
          select: {
            students: true,
          },
        },
      },
      orderBy: {
        className: 'asc',
      },
    });

    return NextResponse.json({
      success: true,
      classes,
    });
  } catch (error) {
    console.error('Classes GET error:', error);
    return NextResponse.json(
      { message: 'Gagal mengambil data kelas' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Akses ditolak' }, { status: 403 });
    }

    const body = await req.json();
    const { className, homeroomTeacherId, classPhoto, classMotto, classDescription } = body;

    if (!className) {
      return NextResponse.json(
        { message: 'Nama kelas wajib diisi (contoh: 9A)' },
        { status: 400 }
      );
    }

    const classSlug = slugify(className);

    // Check duplicate
    const existing = await prisma.class.findFirst({
      where: {
        OR: [{ className }, { classSlug }],
      },
    });

    if (existing) {
      return NextResponse.json(
        { message: `Kelas ${className} sudah ada sebelumnya.` },
        { status: 400 }
      );
    }

    const newClass = await prisma.class.create({
      data: {
        className: className.toUpperCase(),
        classSlug,
        homeroomTeacherId: homeroomTeacherId || null,
        classPhoto: classPhoto || null,
        classMotto: classMotto || null,
        classDescription: classDescription || null,
      },
    });

    await prisma.activityLog.create({
      data: {
        userId: session.id,
        userName: session.username,
        activity: `Admin membuat kelas baru: ${newClass.className}`,
        entityType: 'CLASS',
        entityId: newClass.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Kelas berhasil dibuat',
      class: newClass,
    });
  } catch (error: any) {
    console.error('Classes POST error:', error);
    return NextResponse.json(
      { message: error.message || 'Gagal membuat kelas' },
      { status: 500 }
    );
  }
}
