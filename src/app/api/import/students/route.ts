import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser, hashPassword } from '@/lib/auth';
import { slugify } from '@/lib/utils';

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
    const { students = [], createAccounts = true, defaultPassword = 'siswa123' } = body;

    if (!Array.isArray(students) || students.length === 0) {
      return NextResponse.json({ message: 'Data siswa kosong atau format tidak sesuai.' }, { status: 400 });
    }

    // Cache existing classes
    const existingClasses = await prisma.class.findMany();
    const classMap = new Map<string, string>(); // className uppercase -> classId
    for (const c of existingClasses) {
      classMap.set(c.className.trim().toUpperCase(), c.id);
      classMap.set(c.classSlug.trim().toLowerCase(), c.id);
    }

    const createdList: any[] = [];
    const errors: any[] = [];

    for (let i = 0; i < students.length; i++) {
      const row = students[i];
      const rowNum = i + 1;

      try {
        const rawName = String(row.fullName || row['Nama Lengkap'] || '').trim();
        let rawClass = String(row.className || row['Kelas'] || row.class || '').trim().toUpperCase();

        if (!rawName) {
          errors.push({ row: rowNum, error: 'Nama Lengkap wajib diisi' });
          continue;
        }

        // Clean class name e.g. "KELAS 9A" -> "9A", "IX-A" -> "9A"
        rawClass = rawClass.replace(/^KELAS\s*/i, '').replace(/IX[- ]?/i, '9').replace(/[^0-9A-Z]/g, '');
        if (!rawClass) {
          rawClass = '9A'; // fallback default
        }

        let classId = classMap.get(rawClass);
        if (!classId) {
          // Auto create class if it doesn't exist yet
          const newClass = await prisma.class.create({
            data: {
              className: rawClass,
              classSlug: rawClass.toLowerCase(),
              classMotto: `Kebersamaan dan Prestasi Kelas ${rawClass}`,
            },
          });
          classId = newClass.id;
          classMap.set(rawClass, classId);
          classMap.set(rawClass.toLowerCase(), classId);
        }

        const rawNickname = String(row.nickname || row['Nama Panggilan'] || '').trim();
        const nickname = rawNickname || rawName.split(' ')[0] || 'Siswa';
        const nisn = String(row.nisn || row['NISN'] || '').trim() || null;
        const motto = String(row.motto || row['Motto'] || row['Motto Hidup'] || '').trim() || null;
        const dream = String(row.dream || row['Cita-cita'] || row['Cita Cita'] || '').trim() || null;
        const hobbies = String(row.hobbies || row['Hobi'] || '').trim() || null;
        const favoriteSubject = String(row.favoriteSubject || row['Mapel Favorit'] || '').trim() || null;

        // Generate clean unique slug
        const cleanSlugBase = slugify(nickname) || 'siswa';
        const randomCode = Math.floor(1000 + Math.random() * 9000);
        const slug = `${cleanSlugBase}-${randomCode}`;

        // Create student in DB
        const student = await prisma.student.create({
          data: {
            fullName: rawName,
            nickname,
            slug,
            classId,
            nisn,
            motto,
            dream,
            hobbies,
            favoriteSubject,
            profileStatus: 'APPROVED',
            isPublished: true,
          },
        });

        let generatedUsername = '';
        if (createAccounts) {
          const customUser = String(row.username || row['Username'] || '').trim().toLowerCase();
          const customPass = String(row.password || row['Password'] || '').trim() || defaultPassword;
          
          let candidateUser = customUser || (nisn ? `siswa_${nisn}` : `${slugify(nickname)}_${randomCode}`);
          candidateUser = candidateUser.replace(/[^a-z0-9_]/g, '');

          // Check if username taken
          const existingUser = await prisma.user.findUnique({ where: { username: candidateUser } });
          if (existingUser) {
            candidateUser = `${candidateUser}_${Math.floor(100 + Math.random() * 900)}`;
          }

          const passwordHash = await hashPassword(customPass);

          await prisma.user.create({
            data: {
              username: candidateUser,
              passwordHash,
              role: 'STUDENT',
              isActive: true,
              studentId: student.id,
              classId,
            },
          });

          generatedUsername = candidateUser;
        }

        createdList.push({
          id: student.id,
          fullName: student.fullName,
          nickname: student.nickname,
          className: rawClass,
          nisn,
          username: generatedUsername,
        });

      } catch (err: any) {
        errors.push({ row: rowNum, error: err.message || 'Gagal memproses baris' });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Berhasil mengimpor ${createdList.length} siswa.${errors.length > 0 ? ` (${errors.length} baris gagal)` : ''}`,
      totalProcessed: students.length,
      successCount: createdList.length,
      failedCount: errors.length,
      createdStudents: createdList,
      errors,
    });
  } catch (error: any) {
    console.error('Import students error:', error);
    return NextResponse.json({ message: error.message || 'Gagal mengimpor data siswa' }, { status: 500 });
  }
}
