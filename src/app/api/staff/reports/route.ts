import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';

export async function POST(req: Request) {
  try {
    const token = (await cookies()).get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload || !payload.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { taskId, type, content } = await req.json();

    if (!taskId || !type || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify task belongs to user
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task || task.assignedToId !== payload.id) {
      return NextResponse.json({ error: 'Task not found or unauthorized' }, { status: 403 });
    }

    const report = await prisma.report.create({
      data: {
        taskId,
        submittedById: payload.id as number,
        type,
        content
      }
    });

    // Optionally update task status to 'completed' if it's a final report
    // For now, let's leave status management manual or to admins, but we can set it in progress.
    if (task.status === 'pending') {
      await prisma.task.update({
        where: { id: taskId },
        data: { status: 'in_progress' }
      });
    }

    return NextResponse.json({ message: 'Report submitted successfully', report });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
