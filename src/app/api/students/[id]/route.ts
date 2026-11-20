import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Search by ID or slug
    const student = await prisma.student.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        class: {
          include: {
            homeroomTeacher: true,
          },
        },
        photos: {
          orderBy: { sortOrder: 'asc' },
        },
        quotes: true,
        user: {
          select: { id: true, username: true, email: true, isActive: true },
        },
      },
    });

    if (!student) {
      return NextResponse.json(
        { message: 'Data profil siswa tidak ditemukan' },
        { status: 404 }
      );
    }

    // Also get previous and next student in the same cohort for navigation
    const [prevStudent, nextStudent] = await Promise.all([
      prisma.student.findFirst({
        where: {
          isPublished: true,
          profileStatus: 'APPROVED',
          fullName: { lt: student.fullName },
        },
        orderBy: { fullName: 'desc' },
        select: { slug: true, fullName: true, nickname: true, profilePhoto: true },
      }),
      prisma.student.findFirst({
        where: {
          isPublished: true,
          profileStatus: 'APPROVED',
          fullName: { gt: student.fullName },
        },
        orderBy: { fullName: 'asc' },
        select: { slug: true, fullName: true, nickname: true, profilePhoto: true },
      }),
    ]);

    return NextResponse.json({
      success: true,
      student,
      nav: {
        prev: prevStudent,
        next: nextStudent,
      },
    });
  } catch (error) {
    console.error('Student GET error:', error);
    return NextResponse.json(
      { message: 'Gagal mengambil detail profil siswa' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ message: 'Harap login terlebih dahulu' }, { status: 401 });
    }

    const { id } = params;
    const body = await req.json();

    // Check student existence
    const existing = await prisma.student.findFirst({
      where: { OR: [{ id }, { slug: id }] },
    });

    if (!existing) {
      return NextResponse.json({ message: 'Siswa tidak ditemukan' }, { status: 404 });
    }

    // Permission check: Admin or own student profile
    const isAdmin = session.role === 'ADMIN';
    const isOwner = session.studentId === existing.id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { message: 'Anda tidak memiliki hak akses mengubah profil ini.' },
        { status: 403 }
      );
    }

    // Prepare fields to update
    const updateData: any = {};
    const allowedFields = [
      'fullName',
      'nickname',
      'classId',
      'nisn',
      'profilePhoto',
      'hobbies',
      'personality',
      'motto',
      'favoriteSubject',
      'favoriteFood',
      'favoriteSong',
      'favoriteMovie',
      'favoritePlace',
      'favoriteThingAboutSchool',
      'describeThreeWords',
      'funniestMoment',
      'unforgettableMemory',
      'schoolStory',
      'favoriteTeacher',
      'favoriteActivity',
      'dream',
      'futureSchool',
      'futureMessage',
      'favoriteQuote',
      'socialMedia',
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    // Status management
    if (isAdmin) {
      if (body.profileStatus !== undefined) updateData.profileStatus = body.profileStatus;
      if (body.isPublished !== undefined) updateData.isPublished = body.isPublished;
      if (body.rejectionReason !== undefined) updateData.rejectionReason = body.rejectionReason;
    } else {
      // Student can submit or save draft
      if (body.action === 'SUBMIT') {
        updateData.profileStatus = 'SUBMITTED';
      } else if (body.action === 'DRAFT') {
        updateData.profileStatus = 'DRAFT';
      }
    }

    const updated = await prisma.student.update({
      where: { id: existing.id },
      data: updateData,
    });

    // Handle student personal memory photos if provided
    if (Array.isArray(body.photos)) {
      await prisma.studentPhoto.deleteMany({ where: { studentId: existing.id } });
      if (body.photos.length > 0) {
        await prisma.studentPhoto.createMany({
          data: body.photos.slice(0, 5).map((p: any, idx: number) => ({
            studentId: existing.id,
            imageUrl: p.imageUrl,
            caption: p.caption || '',
            sortOrder: idx + 1,
            approvalStatus: 'APPROVED',
          })),
        });
      }
    }

    // Log Activity
    await prisma.activityLog.create({
      data: {
        userId: session.id,
        userName: session.username,
        activity: `${isAdmin ? 'Admin' : 'Siswa'} memperbarui profil: ${updated.fullName}`,
        entityType: 'STUDENT',
        entityId: updated.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Profil berhasil diperbarui',
      student: updated,
    });
  } catch (error: any) {
    console.error('Student PUT error:', error);
    return NextResponse.json(
      { message: error.message || 'Gagal memperbarui profil siswa' },
      { status: 500 }
    );
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

    const student = await prisma.student.findUnique({ where: { id } });
    if (!student) {
      return NextResponse.json({ message: 'Siswa tidak ditemukan' }, { status: 404 });
    }

    await prisma.student.delete({ where: { id } });

    await prisma.activityLog.create({
      data: {
        userId: session.id,
        userName: session.username,
        activity: `Admin menghapus data siswa: ${student.fullName}`,
        entityType: 'STUDENT',
        entityId: id,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Siswa berhasil dihapus',
    });
  } catch (error) {
    return NextResponse.json({ message: 'Gagal menghapus siswa' }, { status: 500 });
  }
}
