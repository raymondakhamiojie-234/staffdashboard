import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';

export async function GET() {
  try {
    const token = cookies().get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const notifications = await prisma.notification.findMany({
      where: { userId: payload.userId },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    return NextResponse.json({ notifications });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const token = cookies().get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { notificationId } = await req.json();

    if (notificationId) {
      await prisma.notification.update({
        where: { id: Number(notificationId), userId: payload.userId },
        data: { isRead: true }
      });
    } else {
      // Mark all as read
      await prisma.notification.updateMany({
        where: { userId: payload.userId, isRead: false },
        data: { isRead: true }
      });
    }

    return NextResponse.json({ message: 'Notifications updated' });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
