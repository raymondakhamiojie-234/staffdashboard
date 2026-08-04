import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { logActivity } from '@/lib/activity';

export async function GET(req: Request) {
  try {
    const token = (await cookies()).get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const payload = await verifyToken(token);
    if (!payload || !payload.isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const templates = await prisma.contractTemplate.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ templates });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const token = (await cookies()).get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const payload = await verifyToken(token);
    if (!payload || !payload.isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { title, content } = body;

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    const template = await prisma.contractTemplate.create({
      data: {
        title,
        content
      }
    });

    await logActivity('Created Contract Template', JSON.stringify({ templateId: template.id, title }), payload.id as number);

    return NextResponse.json({ message: 'Template created', template });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
