import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

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

    // Validate size (max 5MB)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { message: 'Ukuran file terlalu besar. Maksimal 5 MB.' },
        { status: 400 }
      );
    }

    // Validate mime type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { message: 'Format file tidak didukung. Harap gunakan JPG, PNG, atau WEBP.' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Clean unique filename
    const ext = path.extname(file.name) || '.jpg';
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const cleanName = `${timestamp}-${randomStr}${ext}`;
    const filePath = path.join(uploadsDir, cleanName);

    await writeFile(filePath, buffer);

    const fileUrl = `/uploads/${cleanName}`;

    return NextResponse.json({
      success: true,
      url: fileUrl,
      fileName: cleanName,
    });
  } catch (error: any) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { message: 'Gagal mengunggah foto. Terjadi kesalahan server.' },
      { status: 500 }
    );
  }
}
