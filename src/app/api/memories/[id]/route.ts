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

    const updated = await prisma.memory.update({
      where: { id },
      data: {
        title: body.title,
        caption: body.caption,
        category: body.category,
        approvalStatus: body.approvalStatus,
        isFeatured: body.isFeatured !== undefined ? body.isFeatured : undefined,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Foto kenangan berhasil diperbarui',
      memory: updated,
    });
  } catch (error) {
    return NextResponse.json({ message: 'Gagal memperbarui foto' }, { status: 500 });
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
    await prisma.memory.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: 'Foto berhasil dihapus',
    });
  } catch (error) {
    return NextResponse.json({ message: 'Gagal menghapus foto' }, { status: 500 });
  }
}
