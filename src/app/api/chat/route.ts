import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';

export async function GET(req: Request) {
  try {
    const token = cookies().get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const contactId = searchParams.get('contactId');
    if (!contactId) return NextResponse.json({ error: 'Missing contactId' }, { status: 400 });

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: payload.userId, receiverId: Number(contactId) },
          { senderId: Number(contactId), receiverId: payload.userId }
        ]
      },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: { select: { id: true, fullName: true, role: { select: { name: true } } } },
        receiver: { select: { id: true, fullName: true, role: { select: { name: true } } } }
      }
    });

    // Mark received messages as read
    await prisma.message.updateMany({
      where: { senderId: Number(contactId), receiverId: payload.userId, isRead: false },
      data: { isRead: true }
    });

    return NextResponse.json({ messages });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const token = cookies().get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { receiverId, content } = await req.json();

    const message = await prisma.message.create({
      data: {
        senderId: payload.userId,
        receiverId: Number(receiverId),
        content
      }
    });

    // Trigger a notification for the receiver
    const sender = await prisma.user.findUnique({ where: { id: payload.userId } });
    await prisma.notification.create({
      data: {
        userId: Number(receiverId),
        type: 'message',
        message: `New message from ${sender?.fullName}`
      }
    });

    return NextResponse.json({ message: 'Message sent', data: message });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
