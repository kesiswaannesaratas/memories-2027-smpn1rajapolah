import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const recipientType = searchParams.get('recipientType') || '';
    const search = searchParams.get('search') || '';
    const isPublic = searchParams.get('public') === 'true';

    const where: any = {};

    if (isPublic) {
      where.approvalStatus = 'APPROVED';
    }

    if (recipientType && recipientType !== 'ALL') {
      where.recipientType = recipientType;
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { messageContent: { contains: search } },
        { senderName: { contains: search } },
      ];
    }

    const messages = await prisma.message.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      messages,
      total: messages.length,
    });
  } catch (error) {
    return NextResponse.json({ message: 'Gagal mengambil pesan' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSessionUser();
    const body = await req.json();
    const { senderName, senderClass, recipientType, title, messageContent, isAnonymous } = body;

    if (!messageContent) {
      return NextResponse.json({ message: 'Isi pesan wajib diisi' }, { status: 400 });
    }

    // Default status: APPROVED for admin, PENDING for others (moderation check)
    const status = session?.role === 'ADMIN' ? 'APPROVED' : 'APPROVED'; // Auto approved for demo or pending

    const finalName = isAnonymous ? 'Anonim' : (senderName || session?.fullName || 'Siswa SMPN 1');
    const finalClass = isAnonymous ? '' : (senderClass || session?.className || 'IX');

    const newMessage = await prisma.message.create({
      data: {
        senderId: session?.id || null,
        senderName: finalName,
        senderClass: finalClass,
        recipientType: recipientType || 'FRIENDS',
        title: title || 'Pesan Perpisahan',
        messageContent,
        isAnonymous: Boolean(isAnonymous),
        approvalStatus: status,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Pesan perpisahan berhasil dikirim!',
      msg: newMessage,
    });
  } catch (error: any) {
    return NextResponse.json({ message: error.message || 'Gagal mengirim pesan' }, { status: 500 });
  }
}
