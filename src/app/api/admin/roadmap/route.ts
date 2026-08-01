import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';

export async function POST(req: Request) {
  try {
    const token = cookies().get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload || !payload.isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { title, description, targetDate, status } = await req.json();

    const roadmap = await prisma.roadmap.create({
      data: {
        title,
        description,
        targetDate: targetDate ? new Date(targetDate) : null,
        status: status || 'planning'
      }
    });

    return NextResponse.json({ message: 'Roadmap item created', roadmap });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const token = cookies().get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload || !payload.isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id, status } = await req.json();

    const roadmap = await prisma.roadmap.update({
      where: { id: Number(id) },
      data: { status }
    });

    return NextResponse.json({ message: 'Roadmap status updated', roadmap });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
