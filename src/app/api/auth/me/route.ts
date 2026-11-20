import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    // Get additional student details if student
    let studentData = null;
    if (session.studentId) {
      studentData = await prisma.student.findUnique({
        where: { id: session.studentId },
        include: {
          class: true,
        },
      });
    }

    return NextResponse.json({
      user: {
        ...session,
        student: studentData,
      },
    });
  } catch (error) {
    return NextResponse.json({ user: null }, { status: 500 });
  }
}
