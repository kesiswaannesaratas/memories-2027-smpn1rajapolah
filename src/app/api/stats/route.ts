import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [
      totalStudents,
      approvedStudents,
      totalClasses,
      totalMemories,
      totalMessages,
      totalQuotes,
      settings,
    ] = await Promise.all([
      prisma.student.count(),
      prisma.student.count({ where: { profileStatus: 'APPROVED', isPublished: true } }),
      prisma.class.count(),
      prisma.memory.count({ where: { approvalStatus: 'APPROVED' } }),
      prisma.message.count({ where: { approvalStatus: 'APPROVED' } }),
      prisma.quote.count({ where: { approvalStatus: 'APPROVED' } }),
      prisma.setting.findMany(),
    ]);

    const settingsMap = settings.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {} as Record<string, string>);

    return NextResponse.json({
      success: true,
      stats: {
        totalStudents,
        approvedStudents,
        totalClasses,
        totalMemories,
        totalMessages,
        totalQuotes,
      },
      settings: settingsMap,
    });
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json(
      { message: 'Gagal memuat statistik database' },
      { status: 500 }
    );
  }
}
