import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') || '';
    const featuredOnly = searchParams.get('featured') === 'true';

    const where: any = {
      approvalStatus: 'APPROVED',
    };

    if (category && category !== 'All' && category !== 'Semua') {
      where.category = category;
    }

    if (featuredOnly) {
      where.isFeatured = true;
    }

    const quotes = await prisma.quote.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      quotes,
    });
  } catch (error) {
    return NextResponse.json({ message: 'Gagal mengambil quotes' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSessionUser();
    const body = await req.json();
    const { authorName, authorClass, quoteText, category } = body;

    if (!quoteText) {
      return NextResponse.json({ message: 'Teks quote wajib diisi' }, { status: 400 });
    }

    const newQuote = await prisma.quote.create({
      data: {
        authorName: authorName || session?.fullName || 'Siswa SMPN 1',
        authorClass: authorClass || session?.className || 'IX',
        quoteText,
        category: category || 'Life',
        approvalStatus: session?.role === 'ADMIN' ? 'APPROVED' : 'APPROVED',
        isFeatured: session?.role === 'ADMIN' ? Boolean(body.isFeatured) : false,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Quote berhasil disimpan',
      quote: newQuote,
    });
  } catch (error: any) {
    return NextResponse.json({ message: error.message || 'Gagal menyimpan quote' }, { status: 500 });
  }
}
