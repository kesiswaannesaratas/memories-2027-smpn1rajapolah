import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser, hashPassword } from '@/lib/auth';
import { slugify } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const classId = searchParams.get('classId') || '';
    const status = searchParams.get('status') || '';
    const isPublic = searchParams.get('public') === 'true';

    const where: any = {};

    if (isPublic) {
      where.profileStatus = 'APPROVED';
      where.isPublished = true;
    } else if (status) {
      where.profileStatus = status;
    }

    if (classId) {
      where.classId = classId;
    }

    if (search) {
      where.OR = [
        { fullName: { contains: search } },
        { nickname: { contains: search } },
        { motto: { contains: search } },
        { dream: { contains: search } },
      ];
    }

    const students = await prisma.student.findMany({
      where,
      include: {
        class: { select: { id: true, className: true, classSlug: true } },
        user: { select: { id: true, username: true, isActive: true } },
        photos: { where: { approvalStatus: 'APPROVED' }, take: 2 },
      },
      orderBy: [
        { class: { className: 'asc' } },
        { fullName: 'asc' },
      ],
    });

    return NextResponse.json({
      success: true,
      students,
      total: students.length,
    });
  } catch (error) {
    console.error('Students GET error:', error);
    return NextResponse.json(
      { message: 'Gagal mengambil data siswa' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Akses ditolak. Khusus admin.' }, { status: 403 });
    }

    const body = await req.json();
    const { fullName, nickname, classId, nisn, username, password } = body;

    if (!fullName || !nickname || !classId) {
      return NextResponse.json(
        { message: 'Nama lengkap, nama panggilan, dan kelas wajib diisi.' },
        { status: 400 }
      );
    }

    // Generate unique slug
    const baseSlug = `${slugify(nickname)}-${Date.now().toString().slice(-4)}`;

    const newStudent = await prisma.student.create({
      data: {
        fullName,
        nickname,
        slug: baseSlug,
        classId,
        nisn: nisn || null,
        profileStatus: 'DRAFT',
        isPublished: false,
      },
    });

    // Create user account if credentials provided
    if (username && password) {
      const passwordHash = await hashPassword(password);
      const user = await prisma.user.create({
        data: {
          username: username.trim().toLowerCase(),
          passwordHash,
          role: 'STUDENT',
          studentId: newStudent.id,
          classId: classId,
          isActive: true,
        },
      });

      await prisma.student.update({
        where: { id: newStudent.id },
        data: { userId: user.id },
      });
    }

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.id,
        userName: session.username,
        activity: `Admin menambahkan siswa baru: ${fullName}`,
        entityType: 'STUDENT',
        entityId: newStudent.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Siswa berhasil ditambahkan',
      student: newStudent,
    });
  } catch (error: any) {
    console.error('Students POST error:', error);
    return NextResponse.json(
      { message: error.message || 'Gagal menambahkan siswa' },
      { status: 500 }
    );
  }
}
