import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const session = await getSessionUser();
    const authHeader = req.headers.get('authorization');
    const isSecretAuthorized = authHeader && authHeader === `Bearer ${process.env.JWT_SECRET}`;
    const isAdminSession = session && session.role === 'ADMIN';

    if (!isAdminSession && !isSecretAuthorized) {
      return NextResponse.json({ message: 'Akses ditolak. Khusus admin.' }, { status: 403 });
    }

    const body = await req.json();
    const { teachers = [] } = body;

    if (!Array.isArray(teachers) || teachers.length === 0) {
      return NextResponse.json({ message: 'Data guru kosong atau format tidak sesuai.' }, { status: 400 });
    }

    const createdList: any[] = [];
    const errors: any[] = [];

    // Fetch classes for auto-linking homeroom teacher
    const classes = await prisma.class.findMany();
    const classMap = new Map<string, string>(); // className uppercase -> classId
    for (const c of classes) {
      classMap.set(c.className.trim().toUpperCase(), c.id);
    }

    for (let i = 0; i < teachers.length; i++) {
      const row = teachers[i];
      const rowNum = i + 1;

      try {
        const fullName = String(row.fullName || row['Nama Lengkap'] || row['Nama'] || '').trim();
        const subject = String(row.subject || row['Mata Pelajaran'] || row['Mapel'] || '').trim();
        const position = String(row.position || row['Jabatan'] || row['Posisi'] || '').trim() || null;
        const quote = String(row.quote || row['Pesan'] || row['Kata Mutiara'] || row['Quote'] || '').trim() || null;
        const description = String(row.description || row['Deskripsi'] || row['Profil'] || '').trim() || null;
        const photo = String(row.photo || row['Foto'] || row['Foto URL'] || '').trim() || null;
        let homeroomClass = String(row.homeroomClass || row['Wali Kelas'] || '').trim().toUpperCase();

        if (!fullName) {
          errors.push({ row: rowNum, error: 'Nama Lengkap wajib diisi' });
          continue;
        }

        if (!subject) {
          errors.push({ row: rowNum, error: `Mata Pelajaran untuk ${fullName} wajib diisi` });
          continue;
        }

        // Create teacher
        const teacher = await prisma.teacher.create({
          data: {
            fullName,
            subject,
            position,
            description,
            quote,
            photo,
            isPublished: true,
          },
        });

        // Detect homeroom class from explicit field or position string e.g. "Wali Kelas 9A"
        if (!homeroomClass && position) {
          const match = position.match(/Wali Kelas\s*(9[A-G]|IX[- ]?[A-G])/i);
          if (match && match[1]) {
            homeroomClass = match[1].replace(/IX[- ]?/i, '9').toUpperCase();
          }
        }

        let assignedClass = null;
        if (homeroomClass) {
          // Normalize e.g. "KELAS 9A" -> "9A"
          homeroomClass = homeroomClass.replace(/^KELAS\s*/i, '').replace(/[^0-9A-Z]/g, '');
          const targetClassId = classMap.get(homeroomClass);
          if (targetClassId) {
            await prisma.class.update({
              where: { id: targetClassId },
              data: { homeroomTeacherId: teacher.id },
            });
            assignedClass = homeroomClass;
          }
        }

        createdList.push({
          id: teacher.id,
          fullName: teacher.fullName,
          subject: teacher.subject,
          position: teacher.position,
          homeroomClass: assignedClass,
        });

      } catch (err: any) {
        errors.push({ row: rowNum, error: err.message || 'Gagal memproses baris' });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Berhasil mengimpor ${createdList.length} guru & staf.${errors.length > 0 ? ` (${errors.length} baris gagal)` : ''}`,
      totalProcessed: teachers.length,
      successCount: createdList.length,
      failedCount: errors.length,
      createdTeachers: createdList,
      errors,
    });
  } catch (error: any) {
    console.error('Import teachers error:', error);
    return NextResponse.json({ message: error.message || 'Gagal mengimpor data guru' }, { status: 500 });
  }
}
