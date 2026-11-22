import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { message: 'Tidak ada file yang diunggah' },
        { status: 400 }
      );
    }

    // Validate size (max 10MB)
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { message: 'Ukuran file terlalu besar. Maksimal 10 MB.' },
        { status: 400 }
      );
    }

    // Validate mime type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/gif'];
    const mimeType = (file.type || 'image/jpeg').toLowerCase();
    if (!validTypes.includes(mimeType)) {
      return NextResponse.json(
        { message: 'Format file tidak didukung. Harap gunakan format JPG, PNG, atau WEBP.' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Clean unique filename
    const ext = path.extname(file.name) || '.jpg';
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const cleanName = `${timestamp}-${randomStr}${ext}`;

    let fileUrl = '';

    // In Serverless / Vercel environments (read-only filesystem):
    // Use Base64 Data URL so images are safely stored in PostgreSQL and accessible from everywhere!
    if (process.env.VERCEL) {
      fileUrl = `data:${mimeType};base64,${buffer.toString('base64')}`;
    } else {
      // Local development: attempt to save to /public/uploads, fallback to Base64 Data URL if read-only
      try {
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
        if (!existsSync(uploadsDir)) {
          await mkdir(uploadsDir, { recursive: true });
        }
        const filePath = path.join(uploadsDir, cleanName);
        await writeFile(filePath, buffer);
        fileUrl = `/uploads/${cleanName}`;
      } catch (fsErr) {
        console.warn('Filesystem write not available, using Base64 Data URL fallback:', fsErr);
        fileUrl = `data:${mimeType};base64,${buffer.toString('base64')}`;
      }
    }

    return NextResponse.json({
      success: true,
      url: fileUrl,
      fileName: cleanName,
    });
  } catch (error: any) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { message: error?.message || 'Gagal mengunggah foto. Terjadi kesalahan server.' },
      { status: 500 }
    );
  }
}
