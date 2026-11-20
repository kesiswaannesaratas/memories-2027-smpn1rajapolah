import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const updated = await prisma.message.update({
      where: { id },
      data: {
        likesCount: {
          increment: 1,
        },
      },
      select: {
        id: true,
        likesCount: true,
      },
    });

    return NextResponse.json({
      success: true,
      likesCount: updated.likesCount,
    });
  } catch (error) {
    return NextResponse.json({ message: 'Gagal memberi reaksi' }, { status: 500 });
  }
}
