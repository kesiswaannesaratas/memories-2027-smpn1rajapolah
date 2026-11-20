import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Akses ditolak' }, { status: 403 });
    }

    // Retrieve pending students, memories, messages, quotes
    const [pendingStudents, pendingMemories, pendingMessages] = await Promise.all([
      prisma.student.findMany({
        where: { profileStatus: 'SUBMITTED' },
        include: { class: { select: { className: true } } },
      }),
      prisma.memory.findMany({
        where: { approvalStatus: 'PENDING' },
        include: { class: { select: { className: true } } },
      }),
      prisma.message.findMany({
        where: { approvalStatus: 'PENDING' },
      }),
    ]);

    return NextResponse.json({
      success: true,
      counts: {
        students: pendingStudents.length,
        memories: pendingMemories.length,
        messages: pendingMessages.length,
        total: pendingStudents.length + pendingMemories.length + pendingMessages.length,
      },
      pending: {
        students: pendingStudents,
        memories: pendingMemories,
        messages: pendingMessages,
      },
    });
  } catch (error) {
    return NextResponse.json({ message: 'Gagal mengambil data moderasi' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Akses ditolak' }, { status: 403 });
    }

    const { type, id, action, rejectionReason } = await req.json();

    if (type === 'STUDENT') {
      const isApprove = action === 'APPROVE';
      await prisma.student.update({
        where: { id },
        data: {
          profileStatus: isApprove ? 'APPROVED' : 'REJECTED',
          isPublished: isApprove,
          rejectionReason: isApprove ? null : (rejectionReason || 'Perlu perbaikan kelengkapan profil.'),
        },
      });
    } else if (type === 'MEMORY') {
      await prisma.memory.update({
        where: { id },
        data: {
          approvalStatus: action === 'APPROVE' ? 'APPROVED' : 'REJECTED',
        },
      });
    } else if (type === 'MESSAGE') {
      await prisma.message.update({
        where: { id },
        data: {
          approvalStatus: action === 'APPROVE' ? 'APPROVED' : 'REJECTED',
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: `Item berhasil di-${action === 'APPROVE' ? 'setujui' : 'tolak'}`,
    });
  } catch (error: any) {
    return NextResponse.json({ message: error.message || 'Gagal memproses moderasi' }, { status: 500 });
  }
}
