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

    if (!type || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (taskId) {
      // Verify task belongs to user
      const task = await prisma.task.findUnique({ where: { id: Number(taskId) } });
      if (!task || task.assignedToId !== payload.id) {
        return NextResponse.json({ error: 'Task not found or unauthorized' }, { status: 403 });
      }
      
      if (task.status === 'pending') {
        await prisma.task.update({
          where: { id: Number(taskId) },
          data: { status: 'in_progress' }
        });
      }
    }

    const report = await prisma.report.create({
      data: {
        taskId: taskId ? Number(taskId) : null,
        submittedById: payload.id as number,
        type,
        content
      }
    });

    return NextResponse.json({ message: 'Report submitted successfully', report });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
