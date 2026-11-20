import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { comparePassword, signToken, COOKIE_NAME } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { identifier, password } = await req.json();

    if (!identifier || !password) {
      return NextResponse.json(
        { message: 'Username/Email dan Password wajib diisi' },
        { status: 400 }
      );
    }

    // Find by username or email
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: identifier.trim() },
          { email: identifier.trim().toLowerCase() },
        ],
      },
      include: {
        student: { select: { id: true, fullName: true, slug: true } },
        class: { select: { id: true, className: true } },
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: 'Akun tidak ditemukan. Pastikan username/email sudah terdaftar.' },
        { status: 401 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { message: 'Akun ini dinonaktifkan oleh admin sekolah. Silakan hubungi admin.' },
        { status: 403 }
      );
    }

    const isValid = await comparePassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { message: 'Password salah. Periksa kembali password Anda.' },
        { status: 401 }
      );
    }

    const sessionPayload = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role as 'ADMIN' | 'STUDENT',
      studentId: user.studentId,
      classId: user.classId,
      fullName: user.student?.fullName || user.username,
      className: user.class?.className || undefined,
    };

    const token = signToken(sessionPayload);

    const response = NextResponse.json({
      success: true,
      message: 'Login berhasil',
      user: {
        ...sessionPayload,
        studentSlug: user.student?.slug,
      },
    });

    // Set HTTP-Only Cookie
    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan server saat login' },
      { status: 500 }
    );
  }
}
