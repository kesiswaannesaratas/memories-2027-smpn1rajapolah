import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

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

    const updated = await prisma.teacher.update({
      where: { id },
      data: {
        fullName: body.fullName,
        photo: body.photo,
        subject: body.subject,
        position: body.position,
        description: body.description,
        quote: body.quote,
        isPublished: body.isPublished !== undefined ? body.isPublished : true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Data guru berhasil diperbarui',
      teacher: updated,
    });
  } catch (error: any) {
    return NextResponse.json({ message: error.message || 'Gagal memperbarui guru' }, { status: 500 });
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
    await prisma.teacher.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: 'Data guru berhasil dihapus',
    });
  } catch (error) {
    return NextResponse.json({ message: 'Gagal menghapus guru' }, { status: 500 });
  }
}
