import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const teachers = await prisma.teacher.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({
      success: true,
      teachers,
    });
  } catch (error) {
    return NextResponse.json({ message: 'Gagal mengambil data guru' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Akses ditolak' }, { status: 403 });
    }

    const body = await req.json();
    const { fullName, photo, subject, position, description, quote } = body;

    if (!fullName || !subject) {
      return NextResponse.json({ message: 'Nama lengkap dan mata pelajaran wajib diisi' }, { status: 400 });
    }

    const teacher = await prisma.teacher.create({
      data: {
        fullName,
        photo: photo || null,
        subject,
        position: position || null,
        description: description || null,
        quote: quote || null,
        isPublished: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Data guru berhasil ditambahkan',
      teacher,
    });
  } catch (error: any) {
    return NextResponse.json({ message: error.message || 'Gagal menambahkan guru' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Akses ditolak' }, { status: 403 });
    }

    const body = await req.json();
    const { ids = [] } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ message: 'Pilih minimal 1 guru untuk dihapus' }, { status: 400 });
    }

    // Disconnect homeroom teacher relations
    await prisma.class.updateMany({
      where: { homeroomTeacherId: { in: ids } },
      data: { homeroomTeacherId: null },
    });

    const deleteResult = await prisma.teacher.deleteMany({
      where: { id: { in: ids } },
    });

    return NextResponse.json({
      success: true,
      message: `${deleteResult.count} guru berhasil dihapus!`,
      count: deleteResult.count,
    });
  } catch (error: any) {
    return NextResponse.json({ message: error.message || 'Gagal menghapus guru' }, { status: 500 });
  }
}
