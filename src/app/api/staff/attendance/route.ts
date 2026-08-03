import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const token = (await cookies()).get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload || payload.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized or invalid role' }, { status: 401 });
    }

    // Get current date string in YYYY-MM-DD
    const today = new Date();
    const dateString = today.toISOString().split('T')[0];

    // Check if already marked
    const existing = await prisma.attendance.findUnique({
      where: {
        userId_date: {
          userId: Number(payload.id),
          date: dateString
        }
      }
    });

    if (existing) {
      return NextResponse.json({ error: 'Attendance already marked for today' }, { status: 400 });
    }

    const attendance = await prisma.attendance.create({
      data: {
        userId: Number(payload.id),
        date: dateString,
        status: 'present'
      }
    });

    return NextResponse.json({ message: 'Attendance marked successfully', attendance });
  } catch (error: any) {
    console.error('Attendance error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const token = (await cookies()).get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const records = await prisma.attendance.findMany({
      where: { userId: Number(payload.id) },
      orderBy: { date: 'desc' },
      take: 30
    });
    
    return NextResponse.json(records);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
