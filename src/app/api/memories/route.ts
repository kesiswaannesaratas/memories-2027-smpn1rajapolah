import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') || '';
    const classId = searchParams.get('classId') || '';
    const search = searchParams.get('search') || '';
    const isPublic = searchParams.get('public') === 'true';

    const where: any = {};

    if (isPublic) {
      where.approvalStatus = 'APPROVED';
    }

    if (category && category !== 'Semua' && category !== 'All') {
      where.category = category;
    }

    if (classId) {
      where.classId = classId;
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { caption: { contains: search } },
        { uploadedBy: { contains: search } },
      ];
    }

    const memories = await prisma.memory.findMany({
      where,
      include: {
        class: { select: { id: true, className: true } },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      memories,
      total: memories.length,
    });
  } catch (error) {
    return NextResponse.json({ message: 'Gagal memuat galeri foto' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSessionUser();
    const body = await req.json();
    const { title, imageUrl, caption, category, classId, eventDate } = body;

    if (!title || !imageUrl) {
      return NextResponse.json(
        { message: 'Judul foto dan URL foto wajib diisi' },
        { status: 400 }
      );
    }

    // Default status: Approved for admin, Pending for students
    const status = session?.role === 'ADMIN' ? 'APPROVED' : 'PENDING';

    const memory = await prisma.memory.create({
      data: {
        title,
        imageUrl,
        caption: caption || '',
        category: category || 'Classroom Moments',
        uploadedBy: session?.fullName || session?.username || 'Siswa SMPN 1 Rajapolah',
        classId: classId || session?.classId || null,
        eventDate: eventDate || new Date().toLocaleDateString('id-ID'),
        approvalStatus: status,
        isFeatured: false,
      },
    });

    return NextResponse.json({
      success: true,
      message: status === 'APPROVED' ? 'Foto berhasil diunggah' : 'Foto berhasil diunggah dan sedang menunggu persetujuan admin',
      memory,
    });
  } catch (error: any) {
    return NextResponse.json({ message: error.message || 'Gagal menyimpan foto' }, { status: 500 });
  }
}
