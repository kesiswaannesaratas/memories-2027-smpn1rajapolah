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

    const updated = await prisma.message.update({
      where: { id },
      data: {
        approvalStatus: body.approvalStatus,
        title: body.title,
        messageContent: body.messageContent,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Pesan berhasil diperbarui',
      msg: updated,
    });
  } catch (error) {
    return NextResponse.json({ message: 'Gagal memperbarui pesan' }, { status: 500 });
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
    await prisma.message.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: 'Pesan berhasil dihapus',
    });
  } catch (error) {
    return NextResponse.json({ message: 'Gagal menghapus pesan' }, { status: 500 });
  }
}
