import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const classData = await prisma.class.findFirst({
      where: {
        OR: [{ id }, { classSlug: id }],
      },
      include: {
        homeroomTeacher: true,
        students: {
          where: {
            // Include all or published
            profileStatus: 'APPROVED',
            isPublished: true,
          },
          orderBy: { fullName: 'asc' },
          select: {
            id: true,
            fullName: true,
            nickname: true,
            slug: true,
            profilePhoto: true,
            motto: true,
            dream: true,
            describeThreeWords: true,
          },
        },
        memories: {
          where: { approvalStatus: 'APPROVED' },
          take: 6,
        },
      },
    });

    if (!classData) {
      return NextResponse.json(
        { message: 'Kelas tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      class: classData,
    });
  } catch (error) {
    return NextResponse.json({ message: 'Gagal mengambil data kelas' }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Akses ditolak' }, { status: 403 });
    }

    const { id } = params;
    const body = await req.json();

    const updated = await prisma.class.update({
      where: { id },
      data: {
        className: body.className ? body.className.toUpperCase() : undefined,
        homeroomTeacherId: body.homeroomTeacherId !== undefined ? body.homeroomTeacherId : undefined,
        classPhoto: body.classPhoto !== undefined ? body.classPhoto : undefined,
        classMotto: body.classMotto !== undefined ? body.classMotto : undefined,
        classDescription: body.classDescription !== undefined ? body.classDescription : undefined,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Data kelas berhasil diperbarui',
      class: updated,
    });
  } catch (error: any) {
    return NextResponse.json({ message: error.message || 'Gagal mengubah kelas' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Akses ditolak' }, { status: 403 });
    }

    const { id } = params;
    await prisma.class.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: 'Kelas berhasil dihapus',
    });
  } catch (error) {
    return NextResponse.json({ message: 'Gagal menghapus kelas' }, { status: 500 });
  }
}
