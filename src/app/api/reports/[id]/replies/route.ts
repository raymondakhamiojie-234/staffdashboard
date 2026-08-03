import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';
import { logActivity } from '@/lib/activity';

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const token = (await cookies()).get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const reportId = Number(params.id);
    const { content, fileUrl } = await req.json();

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    const report = await prisma.report.findUnique({
      where: { id: reportId },
      include: { task: true }
    });

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    const reply = await prisma.reportReply.create({
      data: {
        reportId,
        senderId: Number(payload.id),
        content,
        fileUrl: fileUrl || null
      },
      include: {
        sender: { select: { fullName: true, role: { select: { name: true } } } }
      }
    });

    // Notify the other party
    const notifyUserId = payload.isAdmin ? report.submittedById : report.task.assignedById;
    
    await prisma.notification.create({
      data: {
        userId: notifyUserId,
        type: 'message',
        message: `${payload.isAdmin ? 'Admin' : 'Staff'} replied to your report on task: ${report.task.title}`
      }
    });

    await logActivity('Posted Report Reply', `Replied to report ID ${reportId}`, Number(payload.id));

    return NextResponse.json({ message: 'Reply sent successfully', reply });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const token = (await cookies()).get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const reportId = Number(params.id);

    const replies = await prisma.reportReply.findMany({
      where: { reportId },
      include: {
        sender: { select: { fullName: true, role: { select: { name: true } } } }
      },
      orderBy: { createdAt: 'asc' }
    });

    return NextResponse.json(replies);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
