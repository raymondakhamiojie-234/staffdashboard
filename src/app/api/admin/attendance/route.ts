import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';
import { cookies } from 'next/headers';

export async function GET(req: Request) {
  try {
    const token = (await cookies()).get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload || !payload.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date'); // YYYY-MM-DD

    if (!date) {
      return NextResponse.json({ error: 'Date parameter is required' }, { status: 400 });
    }

    // Get all users
    const allUsers = await prisma.user.findMany({
      where: { isActive: true },
      select: { id: true, fullName: true, role: { select: { isAdmin: true } } }
    });

    // Get attendance for this date
    const attendances = await prisma.attendance.findMany({
      where: { date }
    });

    const attendanceMap = new Map(attendances.map(a => [a.userId, a]));

    const report = allUsers.filter(u => !u.role.isAdmin).map(user => ({
      userId: user.id,
      fullName: user.fullName,
      status: attendanceMap.has(user.id) ? 'present' : 'absent',
      checkInTime: attendanceMap.get(user.id)?.checkInTime || null
    }));

    return NextResponse.json(report);
  } catch (error) {
    console.error('Admin attendance error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
