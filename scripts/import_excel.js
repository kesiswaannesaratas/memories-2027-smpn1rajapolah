const XLSX = require('xlsx');
const { Client } = require('pg');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

const connectionString = "postgresql://postgres.ifhkqaybjicrtakvfekp:Nesaratas420212@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres";

function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function runImport() {
  console.log('=================================================================');
  console.log('   IMPORT DATA EXCEL (.XLSX) KE DATABASE SMPN 1 RAJAPOLAH');
  console.log('=================================================================\n');

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Terhubung ke database Supabase PostgreSQL!\n');

    // Fetch classes
    const classRes = await client.query('SELECT "id", "className" FROM "Class"');
    const classMap = new Map();
    classRes.rows.forEach(r => {
      classMap.set(r.className.trim().toUpperCase(), r.id);
    });

    const defaultPasswordHash = await bcrypt.hash('siswa123', 10);

    // 1. IMPORT SISWA
    const studentFile = path.join(__dirname, '..', 'template-import-siswa-smpn1rajapolah.xlsx');
    if (fs.existsSync(studentFile)) {
      console.log(`📂 Membaca file Siswa: ${path.basename(studentFile)}...`);
      const wb = XLSX.readFile(studentFile);
      const sheetName = wb.SheetNames.find(n => !n.toLowerCase().includes('petunjuk')) || wb.SheetNames[0];
      const students = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { defval: '' });

      console.log(`   Ditemukan ${students.length} baris data siswa.`);

      let successCount = 0;
      for (let i = 0; i < students.length; i++) {
        const row = students[i];
        const rawName = String(row['Nama Lengkap'] || row.fullName || '').trim();
        let rawClass = String(row['Kelas'] || row.className || '').trim().toUpperCase();

        if (!rawName) continue;

        rawClass = rawClass.replace(/^KELAS\s*/i, '').replace(/IX[- ]?/i, '9').replace(/[^0-9A-Z]/g, '');
        if (!rawClass) rawClass = '9A';

        let classId = classMap.get(rawClass);
        if (!classId) {
          // create class
          const insertClass = await client.query(
            `INSERT INTO "Class" ("id", "className", "classSlug", "classMotto", "createdAt", "updatedAt") 
             VALUES (gen_random_uuid(), $1, $2, $3, NOW(), NOW()) RETURNING "id"`,
            [rawClass, rawClass.toLowerCase(), `Kebersamaan Kelas ${rawClass}`]
          );
          classId = insertClass.rows[0].id;
          classMap.set(rawClass, classId);
        }

        const rawNick = String(row['Nama Panggilan'] || row.nickname || '').trim();
        const nickname = rawNick || rawName.split(' ')[0] || 'Siswa';
        const nisn = String(row['NISN'] || row.nisn || '').trim() || null;
        const motto = String(row['Motto'] || row.motto || '').trim() || null;
        const dream = String(row['Cita-cita'] || row.dream || '').trim() || null;
        const hobbies = String(row['Hobi'] || row.hobbies || '').trim() || null;
        const favoriteSubject = String(row['Mapel Favorit'] || row.favoriteSubject || '').trim() || null;

        const randomCode = Math.floor(1000 + Math.random() * 9000);
        const slug = `${slugify(nickname)}-${randomCode}`;

        // Insert student
        const insertStudent = await client.query(
          `INSERT INTO "Student" 
           ("id", "fullName", "nickname", "slug", "classId", "nisn", "motto", "dream", "hobbies", "favoriteSubject", "profileStatus", "isPublished", "createdAt", "updatedAt")
           VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, 'APPROVED', true, NOW(), NOW())
           RETURNING "id"`,
          [rawName, nickname, slug, classId, nisn, motto, dream, hobbies, favoriteSubject]
        );

        const studentId = insertStudent.rows[0].id;

        // Create student account
        let username = nisn ? `siswa_${nisn}` : `${slugify(nickname)}_${randomCode}`;
        username = username.replace(/[^a-z0-9_]/g, '');

        await client.query(
          `INSERT INTO "User"
           ("id", "username", "passwordHash", "role", "isActive", "studentId", "classId", "createdAt", "updatedAt")
           VALUES (gen_random_uuid(), $1, $2, 'STUDENT', true, $3, $4, NOW(), NOW())`,
          [username, defaultPasswordHash, studentId, classId]
        );

        successCount++;
      }
      console.log(`   ✅ Berhasil memasukkan ${successCount} siswa beserta akun login ke database!\n`);
    }

    // 2. IMPORT GURU
    const teacherFile = path.join(__dirname, '..', 'template-import-guru-smpn1rajapolah.xlsx');
    if (fs.existsSync(teacherFile)) {
      console.log(`📂 Membaca file Guru: ${path.basename(teacherFile)}...`);
      const wb = XLSX.readFile(teacherFile);
      const sheetName = wb.SheetNames.find(n => !n.toLowerCase().includes('petunjuk')) || wb.SheetNames[0];
      const teachers = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { defval: '' });

      console.log(`   Ditemukan ${teachers.length} baris data guru.`);

      let teacherSuccess = 0;
      for (let i = 0; i < teachers.length; i++) {
        const row = teachers[i];
        const fullName = String(row['Nama Lengkap'] || row.fullName || '').trim();
        const subject = String(row['Mata Pelajaran'] || row.subject || '').trim();
        const position = String(row['Jabatan'] || row.position || '').trim() || null;
        let homeroom = String(row['Wali Kelas'] || row.homeroomClass || '').trim().toUpperCase();
        const quote = String(row['Kata Mutiara'] || row.quote || '').trim() || null;
        const description = String(row['Deskripsi Singkat'] || row.description || '').trim() || null;

        if (!fullName || !subject) continue;

        const insertTeacher = await client.query(
          `INSERT INTO "Teacher"
           ("id", "fullName", "subject", "position", "quote", "description", "isPublished", "createdAt", "updatedAt")
           VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, true, NOW(), NOW())
           RETURNING "id"`,
          [fullName, subject, position, quote, description]
        );

        const teacherId = insertTeacher.rows[0].id;

        if (!homeroom && position) {
          const match = position.match(/Wali Kelas\s*(9[A-G]|IX[- ]?[A-G])/i);
          if (match && match[1]) {
            homeroom = match[1].replace(/IX[- ]?/i, '9').toUpperCase();
          }
        }

        if (homeroom) {
          homeroom = homeroom.replace(/^KELAS\s*/i, '').replace(/[^0-9A-Z]/g, '');
          const targetClassId = classMap.get(homeroom);
          if (targetClassId) {
            await client.query(
              `UPDATE "Class" SET "homeroomTeacherId" = $1 WHERE "id" = $2`,
              [teacherId, targetClassId]
            );
          }
        }

        teacherSuccess++;
      }
      console.log(`   ✅ Berhasil memasukkan ${teacherSuccess} dewan guru & staf ke database!\n`);
    }

    console.log('🎉 SEMUA DATA EXCEL BERHASIL DIMASUKKAN KE DATABASE!');
  } catch (err) {
    console.error('❌ Terjadi kesalahan saat import:', err);
  } finally {
    await client.end();
  }
}

runImport();
