import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const memory = await prisma.memory.update({
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
      likesCount: memory.likesCount,
    });
  } catch (error) {
    return NextResponse.json({ message: 'Gagal menyukai foto' }, { status: 500 });
  }
}
