import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';

export async function GET() {
  try {
    const token = (await cookies()).get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Fetch all active users except the current user
    const users = await prisma.user.findMany({
      where: { 
        isActive: true,
        id: { not: Number(payload.userId) }
      },
      select: {
        id: true,
        fullName: true,
        role: { select: { name: true } },
        profileImageUrl: true
      },
      orderBy: { fullName: 'asc' }
    });

    return NextResponse.json({ users });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
